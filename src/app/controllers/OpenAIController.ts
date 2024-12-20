import Workspace from '@entities/Workspace';
import Message from '@entities/Message';
import Plan from '@entities/Plan';
import Thread from '@entities/Thread';
import User from '@entities/User';
import Access from '@entities/Access';
import { createConversationChannel, sendMessagePlatform } from '@utils/createConversation';
import { convertOpenAIDate } from '@utils/format';
import { generateColor } from '@utils/generateColor';
import { mainOpenAI } from '@utils/openai';
import { generateToken } from '@utils/whatsapp/whatsapp';
import AWS from 'aws-sdk';

import { Request, Response } from 'express';
import fs from 'fs';
import moment from 'moment';
import OpenAI from 'openai';
import { AssistantStream } from 'openai/lib/AssistantStream';
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import { AssistantCreateParams, AssistantUpdateParams } from 'openai/resources/beta/assistants';
import eventEmitter from '@utils/emitter';
import Document from '@entities/File';
import File from '@entities/File';
import { accesses } from '@utils/dataMock';
import Funnel from '@entities/Funnel';
import Product from '@entities/Product';
import Bank from '@entities/Bank';
import Group from '@entities/Group';
import Pipeline from '@entities/Pipeline';
import { log } from '@utils/createLog';
import { decrypt, encrypt } from '@utils/encrypt';
import createWorkspace from '@utils/createWorspace';
import Assistant from '@entities/Assistant';
import Softspacer from '@entities/Softspacer';
import { createAsaasClient, createAsaasSubscriptionPix, updateAsaasSoftspaceId } from '@utils/asaas';
import { getRepository } from 'typeorm';
require('dotenv').config();

interface AssistantOpenAI {
  name: string;
  instructions: string;
  temperature: any;
  cnpj?: string;
  color: string;
  enterpriseName: string;
  model?: string;
  owner?: any;
  wppEnabled?: boolean;
  creditCard: any;
  companyType?: string;
  wppDelayResponse?: number;
  plan: Plan;
  apiKey: string;
  picture: string;
}

interface CardCredit {
  number: string;
  expiryMonth: string;
  expiryYear: string;
  cpfCnpj: string;
  ccv: string;
  holderName: string;
  phone: string;
  postalCode: string;
  ip: string;
}

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-2',
});

const bucketName = process.env.AWS_BUCKET_NAME;

const s3 = new AWS.S3();

class OpenAIController {
  public async findAll(req: Request, res: Response): Promise<Response> {
    const id = req.params.id;
    try {
      const workspaceFind = await Workspace.findOne(id, { relations: ['assistants'] });

      if (!workspaceFind) return res.status(404).json({ message: 'Cannot find data for AI, try again' });

      const threads = await Thread.find({ where: { workspace: workspaceFind, usage: 'platform' } });

      const threadsThisMonth = threads.filter((token) => moment(token?.createdAt).isSame(moment(), 'month'));

      // Calcular total de threads, completion threads e prompt threads

      const data = {
        threads: threads,
        access: {
          picture: workspaceFind?.picture,
          name: workspaceFind?.name,
          apiKey: workspaceFind?.apiKey,
          color: workspaceFind?.color,
          threadsInit: threadsThisMonth.length,
        },
      };

      await log('openai', req, 'findAll', 'success', JSON.stringify({ id: id }), id);
      return res.status(200).json(data);
    } catch (error) {
      console.error(error);
      await log('openai', req, 'findAll', 'failed', JSON.stringify(error), null);
      return res.status(500).json({ message: 'Cannot find data for AI, try again' });
    }
  }
  public async findWidgetAssistant(req: Request, res: Response): Promise<Response> {
    const id = req.params.id;
    try {
      const workspaceFind = await Workspace.findOne(id);

      const data = {
        logo: workspaceFind?.picture,
        color: workspaceFind?.color,
        picture: workspaceFind?.picture,
        workspace: workspaceFind?.name,
      };

      await log('openai', req, 'findAllWidgetAssistant', 'success', JSON.stringify({ id: id }), id);
      return res.status(200).json(data);
    } catch (error) {
      console.error(error);
      await log('openai', req, 'findAllWidgetAssistant', 'failed', JSON.stringify(error), null);

      return res.status(404).json({ message: 'Cannot find data for AI, try again' });
    }
  }

  public async findAllThreads(req: Request, res: Response): Promise<Response> {
    const id = req.params.id;
    try {
      const workspaceFind = await Workspace.findOne(id);

      const apiKey = await decrypt(workspaceFind!.openaiApiKey);
      const openai = new OpenAI({ apiKey });

      const threads = await Thread.find({ where: { workspace: workspaceFind }, relations: ['contact'] });

      const data = {
        threads: threads,
      };
      await log('openai', req, 'findAllThreads', 'success', JSON.stringify({ id: id }), id);
      return res.status(200).json(data);
    } catch (error) {
      console.error(error);
      await log('openai', req, 'findAll', 'failed', JSON.stringify(error), null);

      return res.status(404).json({ message: 'Cannot find data for AI, try again' });
    }
  }

  public async findAllConversations(req: Request, res: Response): Promise<Response> {
    const id = req.params.id;
    try {
      const workspaceFind = await Workspace.findOne(id);

      // Adiciona a opção de ordenação à consulta
      const threads = await Thread.find({
        where: { workspace: workspaceFind },
        relations: ['contact', 'contact.customer', 'contact.customer.groups', 'user', 'messages'],
        order: { createdAt: 'DESC' }, // Ordena pela data de criação, mais recente primeiro
      });

      const threadOfContacts = threads.filter((thread) => thread.usage !== 'platform').map((e: any) => {
        let thread = e
        if(!e.contact.customer){
          const contactCustomer = {...e?.contact, customer: { name: '', cpfCnpj: ''}}
          thread = {...e, contact: contactCustomer}
        }
        return thread
      });



      const data = {
        threads: threadOfContacts,
      };

      await log('openai', req, 'findAllConversations', 'success', JSON.stringify({ id: id }), id);
      return res.status(200).json(data);
    } catch (error) {
      console.error(error);
      await log('openai', req, 'findAllConversations', 'failed', JSON.stringify(error), null);

      return res.status(404).json({ message: 'Cannot find data for AI, try again' });
    }
  }
  public async findNotifications(req: Request, res: Response): Promise<Response> {
    const id = req.params.id;
    try {
      const user = User.findOne(id);

      if (!user) res.status(404).json({ message: 'User not found' });

      await log('openai', req, 'findNotifications', 'success', JSON.stringify({ id: id }), 'ok');
      return res.status(200).json('ok');
    } catch (error) {
      console.error(error);
      return res.status(404).json({ message: 'Cannot find data for AI, try again' });
    }
  }
  public async findConversation(req: Request, res: Response): Promise<Response> {
    const id = req.params.id;
    try {
      const thread = await getRepository(Thread)
        .createQueryBuilder('thread')
        .leftJoinAndSelect('thread.contact', 'contact')
        .leftJoinAndSelect('contact.customer', 'customer')
        .leftJoinAndSelect('thread.messages', 'messages')
        .leftJoinAndSelect('messages.user', 'messageUser') // Adiciona o join para o user de cada message
        .leftJoinAndSelect('thread.user', 'user')
        .leftJoinAndSelect('thread.deal', 'deal')
        .where('thread.id = :id', { id })
        .orderBy('messages.createdAt', 'DESC')
        .take(50) // Limite de mensagens paginadas
        .getOne();


      await log('openai', req, 'findConversation', 'success', JSON.stringify({ id: id }), id);
      return res.status(200).json(thread);
    } catch (error) {
      console.error(error);
      await log('openai', req, 'findConversation', 'failed', JSON.stringify(error), null);

      return res.status(404).json({ message: 'Cannot find data for AI, try again' });
    }
  }
  public async createConversation(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const { content, customer, usage, userId, assistant } = req.body;

      const user = await User.findOne(userId);

      const workspace = await Workspace.findOne(id);

      if (!workspace) return res.status(404).json({ message: 'Cannot find workspace, try again' });

      const thread = await createConversationChannel(customer.contact, workspace, assistant, usage, content, user);

      await log('openai', req, 'createConversation', 'success', JSON.stringify({ id: id }), thread);
      return res.status(200).json({ thread: thread });
    } catch (error) {
      console.error(error);
      await log('openai', req, 'createConversation', 'failed', JSON.stringify(error), null);

      return res.status(404).json({ message: 'Cannot find data for AI, try again' });
    }
  }
  public async toAssumeConversation(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const { threadId, userId } = req.body;

      if (!uuidValidate(id) || !uuidValidate(threadId) || !threadId || !id) return res.status(400).json({ message: 'Inválid Values' });

      const workspace = await Workspace.findOne(id);

      if (!workspace) return res.status(404).json({ message: 'Cannot find workspace, try again' });

      const user = await User.findOne(userId);

      if (!user) return res.status(404).json({ message: 'Cannot find workspace, try again' });

      const thread = await Thread.findOne(threadId, {
        where: {
          workspace,
        },
        relations: [
          'contact',
          'contact.customer',
          'contact.customer.groups',
          'deal',
          'messages',
          'messages.contact',
          'messages.contact.customer',
          'messages.workspace',
          'messages.user',
          'user',
        ],
      });

      if (!thread) return res.status(404).json({ message: 'Cannot find thread, try again' });

      thread.user = user;
      thread.responsible = 'USER'

      thread.save()

      eventEmitter.emit('thread', thread, workspace);

      await log('openai', req, 'toAssumeConversation', 'success', JSON.stringify({ id: id }), thread.id);
      // Paramos de colocar logs aqui
      return res.status(200).json({ thread: thread });
    } catch (error) {
      console.error(error);
      await log('openai', req, 'toAssumeConversation', 'failed', JSON.stringify(error), null);

      return res.status(404).json({ message: 'Cannot find data for AI, try again' });
    }
  }

  public async sendMessage(req: Request, res: Response): Promise<Response> {
    try {
      const { workspaceId } = req.params;

      const { content, customer, usage, userId, threadId, assistant } = req.body;

      const user = await User.findOne(userId);

      const workspace = await Workspace.findOne(workspaceId, { relations: ['assistants'] });

      if (!workspace) return res.status(404).json({ message: 'Cannot find workspace, try again' });

      const thread = await Thread.findOne(threadId);

      await sendMessagePlatform(customer.contact, workspace, assistant, thread, usage, content, user);

      await log('openai', req, 'sendMessage', 'success', JSON.stringify({ id: workspaceId }), content);

      return res.status(200).json({ thread: thread });
    } catch (error) {
      console.error(error);
      await log('openai', req, 'sendMessage', 'failed', JSON.stringify(error), null);

      return res.status(404).json({ message: 'Cannot find data for AI, try again' });
    }
  }

  public async findByAssistant(req: Request, res: Response): Promise<Response> {
    const { id, assistantId } = req.params;

    if (!uuidValidate(id)) return res.status(400).json({ message: 'Id not provided or invalid' });

    try {
      const workspace = await Workspace.findOne(id, { relations: ['tokens', 'threads', 'threads.workspace'] });

      if (!workspace) return res.status(404).json({ message: 'Cannot find data for AI, try again' });

      const assistant = await Workspace.findOne(id, { relations: ['tokens', 'threads', 'threads.assistant'] });

      if (!assistant) return res.status(404).json({ message: 'Cannot find data for AI, try again' });

      const apiKey = await decrypt(workspace!.openaiApiKey);
      const openai = new OpenAI({ apiKey });


      // Calcular a quantidade total de bytes

      const threadsThisMonth = workspace.threads.filter((token) => moment(token.createdAt).isSame(moment(), 'month'));
      const tokensThisMonth = workspace.tokens.filter((token) => moment(token.createdAt).isSame(moment(), 'month'));
      const totalTokens = tokensThisMonth.reduce((acc, token) => acc + token.total_tokens, 0);
      const completionTokens = tokensThisMonth.reduce((acc, token) => acc + token.completion_tokens, 0);
      const promptTokens = tokensThisMonth.reduce((acc, token) => acc + token.prompt_tokens, 0);
      const firstToken = tokensThisMonth[0];
      const lastToken = tokensThisMonth[tokensThisMonth?.length - 1];
      const isLessThanOneDay = moment(lastToken?.createdAt).diff(moment(firstToken?.createdAt), 'days') < 1;

      let dataGrouped: any = {};

      let timeInterval: string;

      if (isLessThanOneDay) {
        timeInterval = 'hour';
        dataGrouped = tokensThisMonth.reduce((acc: any, token) => {
          const hour = moment(token?.createdAt).startOf('hour').format('YYYY-MM-DD HH:00');
          if (!acc[hour]) acc[hour] = { total: 0, completion: 0, prompt: 0 };
          acc[hour].total += token.total_tokens;
          acc[hour].completion += token.completion_tokens;
          acc[hour].prompt += token.prompt_tokens;
          return acc;
        }, {});
      } else {
        timeInterval = 'day';
        dataGrouped = tokensThisMonth.reduce((acc: any, token) => {
          const day = moment(token?.createdAt).startOf('day').format('YYYY-MM-DD');
          if (!acc[day]) acc[day] = { total: 0, completion: 0, prompt: 0 };
          acc[day].total += token.total_tokens;
          acc[day].completion += token.completion_tokens;
          acc[day].prompt += token.prompt_tokens;
          return acc;
        }, {});
      }

      const data = {
        id: workspace.id,
        tokensThisMonth: tokensThisMonth.length,
        threadsThisMonth: threadsThisMonth.length,
        totalTokens: totalTokens / tokensThisMonth.length,
        completionTokens,
        promptTokens,
        dataGrouped,
        timeInterval,
      };

      await log('openai', req, 'findByAssistant', 'success', JSON.stringify({ id: id }), id);

      return res.json();
    } catch (error) {
      console.error(error);
      await log('openai', req, 'findByAssistant', 'failed', JSON.stringify(error), null);
      return res.status(500).json({ message: 'Cannot find data for AI, try again' });
    }
  }
  public async findByIdUser(req: Request, res: Response): Promise<Response> {
    try {
      const id: string = req.params.id;

      if (!id) return res.status(400).json({ message: 'Invalid values for User' });

      const user = await User.findOne(id, {
        relations: [ 'accesses'],
        select: ['id', 'email', 'name', 'passwordResetToken', 'passwordHash', 'picture', 'accesses'],
      });

      if (!user) return res.status(404).json({ message: 'Usuário inválido!' });

      const accesses = await Access.find({ where: { user: user }, relations: ['workspace', 'workspace.tokens'] });

      const workspacesWorkspace = await Promise.all(
        accesses.map(async (access) => {
          const workspace = access.workspace;
          // Filtrar tokens do mês atual
          const tokensThisMonth = workspace.tokens.filter((token) => moment(token.createdAt).isSame(moment(), 'month'));

          // Calcular total de tokens, completion tokens e prompt tokens
          const totalTokens = tokensThisMonth.reduce((acc, token) => acc + token.total_tokens, 0);
          const completionTokens = tokensThisMonth.reduce((acc, token) => acc + token.completion_tokens, 0);
          const promptTokens = tokensThisMonth.reduce((acc, token) => acc + token.prompt_tokens, 0);


          return {
            id: workspace.id,
            name: workspace.name,
            color: workspace.color,
            workspaceName: workspace.name,
            totalTokens,
            completionTokens,
            promptTokens,
            role: access.role,
          };
        })
      );

      const flattenedAssistants = workspacesWorkspace.flat();

      await log('openai', req, 'findByIdUser', 'success', JSON.stringify({ id: id }), id);
      return res.json({
        id: user.id,
        workspaces: flattenedAssistants,
      });
    } catch (error) {
      console.error(error);
      await log('openai', req, 'findByIdUser', 'failed', JSON.stringify(error), null);
      return res.status(400).json({ error: 'Authenticate failed, try again' });
    }
  }

  public async createAssistant(req: Request, res: Response): Promise<Response> {
    const id = req.params.id; // customerId

    const { name, companyType, cnpj, enterpriseName, plan, apiKey, owner, cep, responsibleName, responsibleCpf,  responsibleEmail,  responsiblePhone,} = req.body; // customerId


    try {

      const customer = await User.findOne(id);

      // const asaasCustomer = await createAsaasSubscription({ customer, creditCard });

      // Verifica se a assinatura foi criada com sucesso
      // if (!asaasCustomer?.asaasCustomerId || !asaasCustomer?.subscriptionId || !asaasCustomer?.creditCardCreated?.id) {
      //   return res.status(400).json({ message: 'Não foi possível criar o plano para este cliente' });
      // }

      const asaasCustomer = await createAsaasClient(
        responsibleName,
        responsibleCpf.replace(/\D/g, ''),
        responsiblePhone,
        responsibleEmail,
        enterpriseName,
        cep,
      );

      if(!asaasCustomer?.id) return res.status(400).json({ message: 'Não foi possível criar cliente no Asaas' });

      const softspacer = await Softspacer.create({
        name: enterpriseName,
        cnpj: cnpj.replace(/\D/g, ''),
        cep,
        responsibleName,
        responsibleCpf,
        responsibleEmail,
        responsiblePhone,
        asaasCustomerId: asaasCustomer?.id,
        picture: 'https://wave.softspace.com.br/logo-a.svg',
      }).save();

      if(!softspacer) return res.status(400).json({ message: 'Não foi possível criar cliente no softspace' });

      await updateAsaasSoftspaceId(softspacer.asaasCustomerId, softspacer.id)

      let hashApiKey = null

      if(apiKey){
       hashApiKey = await encrypt(apiKey! as string);
    }
      const color = generateColor();

      const subscription: any = await createAsaasSubscriptionPix(softspacer.asaasCustomerId, plan)

      const newAssistant = await Workspace.create({
        name: name,
        picture: 'https://wave.softspace.com.br/logo-a.svg',
        companyType,
        openaiApiKey: hashApiKey,
        subscriptionAsaasId: subscription.subscriptionId,
        softspacer,
        plan,
        color,
      }).save();

      const access = await Access.create({
        user: customer,
        role: 'SUPPORT',
        workspace: newAssistant,
      }).save();

      await createWorkspace(companyType!, newAssistant);

      await log('openai', req, 'createAssistant', 'success', JSON.stringify({ id: id }), { ...newAssistant, role: access.role });
      return res.status(200).json({ ...newAssistant, role: access.role });
    } catch (error) {
      console.error(error);
      return res.status(404).json({ message: 'Cannot find data for AI, try again' });
    }
  }
  // public async createThread(req: Request, res: Response): Promise<Response> {
  //   const { workspaceId } = req.params; // customerId

  //   const { content, chatId } = req.body;

  //   const message = content;

  //   try {
  //     const answer = await mainOpenAI({
  //       message,
  //       workspaceId,
  //       usage: 'api',
  //       thread: null,
  //     });
  //     await log('openai', req, 'createThread', 'success', JSON.stringify({ content }), answer);

  //     return res.status(200).json(answer);
  //   } catch (error) {
  //     console.error(error);
  //     await log('openai', req, 'createThread', 'failed', JSON.stringify(error), null);

  //     return res.status(404).json({ message: 'Cannot find data for AI, try again' });
  //   }
  // }
  // public async continueThread(req: Request, res: Response): Promise<Response> {
  //   const { workspaceId, id } = req.params; // customerId

  //   const { content } = req.body;

  //   const message = content;
  //   const chatId = id;

  //   const thread = Thread.findOne(chatId);

  //   try {
  //     const answer = await mainOpenAI({
  //       message,
  //       workspaceId,
  //       usage: 'api',
  //       thread,
  //     });

  //     await log('openai', req, 'continueThread', 'success', JSON.stringify({ content }), answer);
  //     return res.status(200).json(answer);
  //   } catch (error) {
  //     console.error(error);
  //     await log('openai', req, 'continueThread', 'failed', JSON.stringify(error), null);
  //     return res.status(404).json({ message: 'Cannot find data for AI, try again' });
  //   }
  // }

  public async apiKeyGenerate(req: Request, res: Response): Promise<Response> {
    const { id } = req.params; // customerId

    try {

      const workspace = await Workspace.findOne(id);

      if (!workspace) return res.status(404).json({ message: 'Assistente não encontrado' });

      const api = {
        id: uuidv4(),
        workspaceId: workspace.id,
      };

      const stringApi = await JSON.stringify(api);

      const apiKey = await encrypt(stringApi);


      await Workspace.update(workspace.id, { apiKey });

      await log('openai', req, 'apiGenerate', 'success', JSON.stringify({ id: id }), id);
      return res.status(200).json(apiKey);
    } catch (error) {
      console.error(error);
      await log('openai', req, 'apiGenerate', 'failed', JSON.stringify(error), null);
      return res.status(500).json({ message: 'Cannot find data for AI, try again' });
    }
  }

  public async getMessagesOfThread(req: Request, res: Response): Promise<Response> {
    try {
      const threadId = req.params.id;

      if (!threadId || threadId === 'undefined') return res.status(400).json({ message: 'Cannot find data for AI, try again' });

      const thread = await Thread.findOne({ where: { threadId: threadId }, relations: ['messages', 'contact', 'deal', 'workspace'] });

      const message = await Message.find({ where: { thread: thread } });

      const formattedMessages = message
        .reverse()
        .slice(1)
        .map((message: any) => ({
          user: message.from === 'CONTACT' ? true : false,
          content: message.content,
        }));

      await log('openai', req, 'getMessagesOfThread', 'success', JSON.stringify({ threadId }), threadId);
      return res.status(200).json(formattedMessages);
    } catch (error) {
      console.error(error);
      await log('openai', req, 'getMessagesOfThread', 'failed', JSON.stringify(error), null);

      return res.status(500).json({ message: 'Cannot find data for AI, try again' });
    }
  }

  public async getMessagesOfThreadPlatform(req: Request, res: Response): Promise<Response> {
    try {
      const threadId = req.params.id;

      if (!threadId || threadId === 'undefined') return res.status(400).json({ message: 'Cannot find data for AI, try again' });

      const thread = await Thread.findOne({ where: { threadId: threadId }, relations: ['messages', 'contact', 'deal', 'workspace'] });

      const apiKey = await decrypt(thread!.workspace?.openaiApiKey);
      const openai = new OpenAI({ apiKey });

      const messages = await openai.beta.threads.messages.list(threadId);

      const formattedMessages = messages.data.map((message: any) => ({
        user: message.role === 'user' ? true : false,
        content: message.content[0].text.value?.replace(/【\d+:\d+†[^\]]+】/g, ''),
      }));

      await log('openai', req, 'getMessagesOfThreadPlatform', 'success', JSON.stringify({ threadId }), threadId);

      return res.status(200).json(formattedMessages.reverse().splice(1));
    } catch (error) {
      console.error(error);
      await log('openai', req, 'getMessagesOfThreadPlatform', 'failed', JSON.stringify(error), null);
      return res.status(500).json({ message: 'Cannot find data for AI, try again' });
    }
  }

  public async getMessagesChatOfWidget(req: Request, res: Response): Promise<Response> {
    try {
      const threadId = req.params.threadId;

      if (!threadId) return res.status(400).json({ message: 'Cannot find data for AI, try again' });

      const thread = await Thread.findOne({ where: { threadId: threadId }, relations: ['workspace'] });

      if (!thread) return res.status(404).json({ message: 'Cannot find data for AI, try again' });

      const apiKey = await decrypt(thread?.workspace?.openaiApiKey);
      const openai = new OpenAI({ apiKey });

      const messages = await openai.beta.threads.messages.list(threadId);

      const formattedMessages = messages.data
        .reverse()
        .slice(1)
        .map((message: any) => ({
          user: message.role === 'user' ? true : false,
          content: message.content[0].text.value?.replace(/【\d+:\d+†[^\]]+】/g, ''),
        }));

      await log('openai', req, 'getMessagesChatOfWidget', 'success', JSON.stringify({ threadId }), threadId);

      return res.status(200).json(formattedMessages);
    } catch (error) {
      console.error(error);
      await log('openai', req, 'getMessagesChatOfWidget', 'failed', JSON.stringify(error), null);
      return res.status(500).json({ message: 'Cannot find data for AI, try again' });
    }
  }

  public async findThreadsOfWidget(req: Request, res: Response): Promise<Response> {
    const email = req.params.email;

    try {
      const threads = await Thread.find({ where: { clientId: email } });

      const threadsWithLastMessage = await Promise.all(
        threads.map(async (thread: any) => {
          const apiKey = await decrypt(thread?.workspace?.openaiApiKey);
          const openai = new OpenAI({ apiKey });

          const messages = await openai.beta.threads.messages.list(thread.threadId);
          const lastMessage = messages.data.slice(0, 1).map((message: any) => ({
            createdAt: convertOpenAIDate(message?.created_at),
            content: message.content[0].text.value?.replace(/【\d+:\d+†[^\]]+】/g, ''),
          }))[0];
          return {
            ...thread,
            lastMessage,
          };
        })
      );
      await log('openai', req, 'findThreadsOfWidget', 'success', JSON.stringify({ email }), email);

      return res.status(200).json(threadsWithLastMessage);
    } catch (error) {
      await log('openai', req, 'findThreadsOfWidget', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }
  // public async uploadFile(req: Request, res: Response): Promise<Response> {
  //   const id = req.params.id;
  //   try {
  //     const file = req.file; // 'file' deve ser a chave usada no multer ou middleware equivalente
  //     if (!file) {
  //       return res.status(400).json({ message: 'No file uploaded' });
  //     }
  //     const workspaceFind = await Workspace.findOne(id);

  //     if (!workspaceFind) {
  //       return res.status(400).json({ message: 'No Workspace Found' });
  //     }

  //     const documents = await openai.beta.vectorStores.files.list(workspaceFind.vectorId!);

  //     const workspaceDetails = await Promise.all(
  //       documents?.data.map(async (workspace) => {
  //         // Supondo que cada item em documents.data tem um atributo usage_bytes
  //         return workspace.usage_bytes; // Retorna o valor de usage_bytes para cada item
  //       })
  //     );

  //     // Calcular a quantidade total de bytes
  //     const totalBytes = workspaceDetails.reduce((total, usageBytes) => total + usageBytes, 0);

  //     const limitInBytes = 30 * 1024 * 1024; // 30 MB em bytes

  //     if (totalBytes >= limitInBytes)
  //       return res.status(405).json({ message: 'Já atingiu o limite de 10GB no total de uso de armazenamento' });

  //     const openaiFile = await openai.files.create({
  //       file: fs.createReadStream(file.path),
  //       purpose: 'workspaces',
  //     });

  //     const batch = await openai.beta.vectorStores.fileBatches.createAndPoll(workspaceFind.vectorId, {
  //       file_ids: [openaiFile.id],
  //     });

  //     return res.status(200).json(batch);
  //   } catch (error) {
  //     console.error(error);
  //     return res.status(404).json({ message: 'Cannot find data for AI, try again' });
  //   }
  // }

  public async archiveThread(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      const thread = await Thread.findOne(id);

      if (!thread) return res.status(404).json({ message: 'Cannot find thread' });

      await Thread.update(id, { chatActive: !thread.chatActive });
      await log('openai', req, 'archiveThread', 'success', JSON.stringify({ id: id }), id);

      return res.status(200).json({ message: 'Thread archived successfully' });
    } catch (error) {
      console.error(error);
      await log('openai', req, 'archiveThread', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Cannot find data for Thread, try again' });
    }
  }
  public async deleteFile(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      const file = req.body; // 'file' deve ser a chave usada no multer ou middleware equivalente
      if (!file) {
        return res.status(400).json({ message: 'No file for delete' });
      }
      const workspaceFind = await Workspace.findOne(id);

      if (!workspaceFind) {
        return res.status(400).json({ message: 'No file for delete' });
      }

      const apiKey = await decrypt(workspaceFind!.openaiApiKey);
      const openai = new OpenAI({ apiKey });

      const deleteFile = await openai.files.del(file.id!);

      const deleteDocument = await File.findOne({ fileId: file.id });
      await log('openai', req, 'deleteFile', 'success', JSON.stringify({ id: id }), { deleteDocument });

      await File.softRemove(deleteDocument!);

      return res.status(200).json(deleteFile);
    } catch (error) {
      console.error(error);
      await log('openai', req, 'deleteFile', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Cannot find data for AI, try again' });
    }
  }
  public async editFile(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      const file = req.body; // 'file' deve ser a chave usada no multer ou middleware equivalente
      if (!file) {
        return res.status(400).json({ message: 'No file for change' });
      }
      const workspaceFind = await Workspace.findOne(id);

      if (!workspaceFind) {
        return res.status(400).json({ message: 'Workspace Found' });
      }

      const document = await File.findOne({ fileId: file.id });

      if (!document) {
        return res.status(400).json({ message: 'No document found' });
      }

      await File.update(document.id, { name: file.name });
      await log('openai', req, 'editFile', 'success', JSON.stringify({ id: id }), id);

      return res.status(200).json({ message: 'Update success' });
    } catch (error) {
      console.error(error);
      await log('openai', req, 'editFile', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Cannot find data for AI, try again' });
    }
  }
  public async deleteThread(req: Request, res: Response): Promise<Response> {
    try {
      const threadId = req.params.id;

      const thread = await Thread.findOne(threadId);

      if (!thread) return res.status(404).json({ message: 'Cannot find thread' });

      await Thread.softRemove(thread);

      await log('openai', req, 'deleteThread', 'success', JSON.stringify({ id: threadId }), threadId);

      return res.status(200).json({ message: 'Workspace deleted successfully' });
    } catch (error) {
      console.error(error);
      await log('openai', req, 'deleteThread', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Cannot find data for AI, try again' });
    }
  }

}

export default new OpenAIController();

