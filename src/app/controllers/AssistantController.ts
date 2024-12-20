import Workspace from '@entities/Workspace';
import { Request, Response } from 'express';
import Assistant from '@entities/Assistant';
import { getRepository } from 'typeorm';
import { generateColor } from '@utils/generateColor';
import { log } from '@utils/createLog';
import { decrypt } from '@utils/encrypt';
import OpenAI from 'openai';
import Vector from '@entities/Vector';
import { assistants } from '@utils/dataMock';
import { FunctionTool } from 'openai/resources/beta/assistants';
import { openAI } from '@utils/openai/openai';
import Deal from '@entities/Deal';
import { sendMessage } from '@utils/whatsapp/whatsapp';

import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import Funnel from '@entities/Funnel';
import Thread from '@entities/Thread';
import eventEmitter from '@utils/emitter';

interface FunctionInterface{
  type: string,
  functions: any
}

interface AssistantInterface {
  name: string;
  instructions?: string;
  temperature?: number,
  workspace?: Workspace;
  model: string;
  vector?: Vector;
  purpose: string;
  wppEnabled?: boolean;
  openaiAssistantId?: string;
  wppDelayResponse?: any
  funnels: Funnel[];
  functions: any
}

class AssistantController {
  public async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      const workspace = await Workspace.findOne(id);

      if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

      const assistants = await Assistant.find({ where: { workspace: workspace }, order: { createdAt: 'ASC' }, relations: ['vector'] });

      await log('assistants', req, 'findAll', 'success', JSON.stringify({ id: id }), assistants);

      return res.status(200).json(assistants);
    } catch (error) {
      console.error(error);
      await log('assistants', req, 'findAll', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Cannot find customers, try again' });
    }
  }
  public async findById(req: Request, res: Response): Promise<Response> {
    try {
      const {id, assistantId} = req.params;

      if (!id) return res.status(400).json({ message: 'Please send a assistant id' });

      const workspaceFind = await Workspace.findOne(id);

      if(!workspaceFind) return res.status(404).json({ message: 'Cannot find workspace, try again' });

      const apiKey = await decrypt(workspaceFind.openaiApiKey);

      const openai = new OpenAI({ apiKey: apiKey });

      const assistant = await Assistant.findOne(assistantId, { relations: ['vector', 'vector.files', 'session', 'funnels']});

      if(!assistant) return res.status(404).json({ message: 'Cannot find assistant, try again' });

      const openaiAssistant = await openai.beta.assistants.retrieve(assistant.openaiAssistantId);

      await log('assistants', req, 'findById', 'success', JSON.stringify({ id: id }), {...assistant, ...openaiAssistant});

      const functions = openaiAssistant.tools.filter(e => e.type === 'function')

      return res.status(200).json({...assistant, instructions: openaiAssistant.instructions, functions: functions, temperature: openaiAssistant.temperature});

    } catch (error) {
      await log('assistants', req, 'findById', 'failed', JSON.stringify(error), null);
      return res.status(500).json({ message: 'Something went wrong, try again' });
    }
  }

  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      const { name, instructions, temperature, vector, model, functions, purpose, funnels }: AssistantInterface = req.body;

      const workspaceFind = await Workspace.findOne(id);

      if(!workspaceFind) return res.status(404).json({ message: 'Cannot find workspace, try again' });

      const apiKey = await decrypt(workspaceFind.openaiApiKey);
      const openai = new OpenAI({ apiKey: apiKey });
      const tools: FunctionTool[] = [
        { type: 'file_search' },
        ...(functions ? functions : []) // Adiciona as funções caso elas existam
      ];

      const assistant = await openai.beta.assistants.create({
        name,
        instructions,
        description: null,
        model,
        tools,
        top_p: 1,
        temperature,
        tool_resources: {
          file_search: { vector_store_ids: [vector!.vectorId] },
        },
        metadata: {},
        response_format: 'auto',
      });

      const group = await Assistant.create({
        name,
        model,
        purpose,
        vector,
        funnels,
        openaiAssistantId: assistant.id,
        workspace: workspaceFind,
      }).save();
      await log('assistants', req, 'create', 'success', JSON.stringify({ id: id }), group);

      return res.status(201).json(group);
    } catch (error) {
      console.error(error);
      await log('assistants', req, 'create', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Create failed, try again' });
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const { name, instructions, temperature, vector, model, wppDelayResponse, wppEnabled, functions, purpose, funnels }: AssistantInterface = req.body;
      const {id, assistantId} = req.params;

      if (!id || !assistantId) return res.status(404).json({ message: 'Send id' });

      const assistant = await Assistant.findOne(assistantId, { relations: ['workspace'] });

      if (!assistant) return res.status(404).json({ message: 'Assistant does not exist' });

      const workspace = await Workspace.findOne(id);

      if (!workspace) return res.status(404).json({ message: 'Workspace does not exist' });

      const apiKey = await decrypt(workspace.openaiApiKey);
      const openai = new OpenAI({ apiKey: apiKey });
      const tools: FunctionTool[] = [
        { type: 'file_search' },
        ...(functions ? functions : []) // Adiciona as funções caso elas existam
      ];
      const openaiAssistant = await openai.beta.assistants.update(assistant.openaiAssistantId, {
        name,
        instructions,
        model: model!,
        temperature,
        tools,
        tool_resources: {
          file_search: {
            vector_store_ids: [vector?.vectorId!]
          },
        },
      });
        assistant.name = name || assistant.name;
        assistant.model = model || assistant.model;
        assistant.vector = vector || assistant.vector;
        assistant.wppDelayResponse = wppDelayResponse;
        assistant.wppEnabled = wppEnabled!;
        assistant.purpose = purpose,
        assistant.funnels = funnels,

      await assistant.save()
      // await Assistant.update(id, { ...valuesToUpdateAssistant });

      await log('assistants', req, 'update', 'success', JSON.stringify({ id: id }), {...assistant, openaiAssistant});

      await assistant.save();

      return res.status(200).json({ message: 'Assistant updated successfully' });
    } catch (error) {
      console.error(error);
      await log('assistants', req, 'update', 'failed', JSON.stringify(error), null);

      return res.status(404).json({ error: 'Update failed, try again' });
    }
  }
  public async sendDealDetails(req: Request, res: Response): Promise<Response> {
    try {
      const { dealId, threadId, prompt } = req.body;
      const id = req.params.id

      if (!id || !uuidValidate(id)) return res.status(404).json({ message: 'id not provided' });

      const workspace = await Workspace.findOne(id)

      if (!workspace) return res.status(404).json({ message: 'Workspace does not exist' });

      const thread = await Thread.findOne(threadId, { relations: ['assistant', 'assistant.session', 'contact']});

      if (!workspace) return res.status(404).json({ message: 'Deal does not exist' });

      const message = { type: 'text', text: prompt || 'A negociação do cliente foi atualizada, consulte a negociação e informe ao cliente a nova atualização da negociação dele' }
      const openai = await openAI(thread.contact, workspace, thread.assistant, thread, thread.threadId, message, 'assistant')
      await sendMessage(thread.assistant.session.id, thread.assistant.session.token, thread.contact.phone, openai.text.content);

      eventEmitter.emit(`thread`, thread, workspace);
      await log('assistants', req, 'sendDetails', 'success', JSON.stringify({ thread: thread }), { openai: openai });


      return res.status(200).json({ message: 'Assistant sendDetailsd successfully' });
    } catch (error) {
      console.error(error);
      await log('assistants', req, 'sendDetails', 'failed', JSON.stringify(error), null);

      return res.status(404).json({ error: 'Update failed, try again' });
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      if (!id) return res.status(400).json({ message: 'Please send a customer id' });

      const customer = await Assistant.findOne(id);

      if (!customer) return res.status(404).json({ message: 'Cannot find customer' });

      await Assistant.update(customer.id, { active: !customer.active });

      await log('assistants', req, 'archive', 'success', JSON.stringify({ id: id }), customer);

      return res.status(200).json({ message: 'Customer archived successfully' });
    } catch (error) {
      console.error(error);
      await log('assistants', req, 'archive', 'failed', JSON.stringify(error), null);
      return res.status(500).json({ error: 'Remove failed, try again' });
    }
  }
}

export default new AssistantController();

