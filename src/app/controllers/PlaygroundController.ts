import { Request, Response } from 'express';
import Workspace from '@entities/Workspace';
import OpenAI from 'openai';
import User from '@entities/User';
import { formatMessage, transformMessages } from '@utils/openai/management/threads/formatMessage';
import { listMessages } from '@utils/openai/management/threads/listMessages';
import { sendToQueue } from '@utils/rabbitMq/send';
import { processQueue } from '@utils/rabbitMq/proccess';
import Playground from '@entities/Playground';
import { retrieveFile } from '@utils/openai/management/threads/fileRetrivie';
import { ioSocket } from '@src/socket';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

class PlaygroundController {
  public async findPlaygrounds(req: Request, res: Response): Promise<Response> {
    try {
      const workspaceId = req.header('workspaceId');

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) return res.status(404).json({ message: 'Workspace não encontrado' });

      const user = await User.findOne(req.userId);

      if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

      const threads = await Playground.find({ where: { workspace, user } });
      console.log(threads);
      return res.status(200).json(threads?.reverse());
    } catch (error) {
      return res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }
  public async findPlayground(req: Request, res: Response): Promise<Response> {
    try {

      const { id } = req.params

      if(!id) return res.status(400).json({ message: 'Id da thread não informado' });

      const workspaceId = req.header('workspaceId');

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) return res.status(404).json({ message: 'Workspace não encontrado' });

      const user = await User.findOne(req.userId);

      if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

      const threads = await Playground.find({ where: { workspace, user } });
      console.log(threads);
      return res.status(200).json(threads);
    } catch (error) {
      return res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }

  public async listPlaygroundMessages(req: Request, res: Response): Promise<Response> {
    try {
      const workspaceId = req.header('workspaceId');

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) return res.status(404).json({ message: 'Workspace não encontrado' });

      const { threadId } = req.params;

      if (!threadId) return res.status(400).json({ message: 'Id da thread não informado' });

      const { data }: any = await listMessages(openai, threadId);

      const messages = transformMessages(data);

      return res.status(200).json(messages);
    } catch (error) {
      console.log(error);
      return res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }

  public async retrieveFile(req: Request, res: Response): Promise<Response> {
    try {
      const workspaceId = req.header('workspaceId');

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) return res.status(404).json({ message: 'Workspace não encontrado' });

      const { fileId } = req.params;

      if (!fileId) return res.status(400).json({ message: 'Id da thread não informado' });

      const data = await retrieveFile(openai, fileId);

      console.log(data);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }

  public async createPlayground(req: Request, res: Response): Promise<Response> {
    try {
      const { text, media } = req.body;

      const workspaceId = req.header('workspaceId');

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) return res.status(404).json({ message: 'Workspace não encontrado' });

      const user = await User.findOne(req.userId);

      if (!user) return res.status(404).json({ message: 'user não encontrado' });

      const thread = await openai.beta.threads.create();

      const messageOpenai: any = await formatMessage(openai, media, text, thread.id, workspace, 'playground');

      console.log();

      const name = messageOpenai.find((e: any) => e.type === 'text')?.text || 'Imagem';

      const threadCreated = await Playground.create({
        threadId: thread.id,
        name,
        workspace,
        user,
      }).save();

      if (!threadCreated.id) return res.status(400).json({ message: 'Não foi possível criar a thread, tente novamente.' });

      await openai.beta.threads.messages.create(thread.id, {
        role: 'user',
        content: messageOpenai, //Array de mensagens comoo o openaiMessage
      });

      const data = JSON.stringify({
        workspaceId: workspace.id,
        threadId: thread.id,
        messages: messageOpenai,
      });

      const queue = `playground:${workspace.id}`;

      await sendToQueue(queue, data);

      await processQueue(queue, 'playground');

      return res.status(200).json(thread.id);
    } catch (error) {
      console.log(error);
      return res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }

  public async sendMessage(req: Request, res: Response): Promise<Response> {
    try {
      const { threadId } = req.params;
      const { text, media } = req.body;

      const workspaceId = req.header('workspaceId');

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) return res.status(404).json({ message: 'Workspace não encontrado' });

      const user = await User.findOne(req.userId);

      if (!user) return res.status(404).json({ message: 'user não encontrado' });

      const thread = await openai.beta.threads.retrieve(threadId);

      if (!thread.id) return res.status(400).json({ message: 'Não foi possível verificar a thread, tente novamente.' });

      const messageOpenai: any = formatMessage(openai, media, text, thread.id, workspace, 'playground');

      console.log(messageOpenai);

      await openai.beta.threads.messages.create(thread.id, {
        role: 'user',
        content: messageOpenai, //Array de mensagens comoo o openaiMessage
      });
      (await ioSocket).emit(`playground:${thread.id}`); //Afrmando que o type pode ser apenas ou playground, ou thread

      const data = JSON.stringify({
        workspaceId: workspace.id,
        threadId: thread.id,
        messages: messageOpenai,
      });

      const queue = `playground:${workspace.id}`;

      await sendToQueue(queue, data);

      await processQueue(queue, 'playground');

      return res.status(200).json(thread.id);
    } catch (error) {
      console.log(error);
      return res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }
  public async deleteThread(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id) return res.status(404).json({ message: 'Forneça um id de uma thread' });
      const workspaceId = req.header('workspaceId');

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) return res.status(404).json({ message: 'Workspace não encontrado' });

      const user = await User.findOne(req.userId);

      if (!user) return res.status(404).json({ message: 'user não encontrado' });

      console.log(id);
      const thread = await Playground.findOne(id, { where: { workspace } });

      if (!thread) return res.status(400).json({ message: 'Não foi possível encontrar a thread, tente novamente.' });

      const openaiThread = await openai.beta.threads.retrieve(thread.threadId);

      if (!openaiThread) return res.status(400).json({ message: 'Não foi possível verificar a thread, tente novamente.' });

      const deletedThread = await openai.beta.threads.del(openaiThread.id);

      if (deletedThread.id) {
        await Playground.softRemove(thread);
      }

      return res.status(200).json(thread.id);
    } catch (error) {
      console.log(error);
      return res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }
  public async updateThread(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const { name } = req.body;

      if (!id) return res.status(404).json({ message: 'Forneça um id de uma thread' });

      if (!name) return res.status(404).json({ message: 'Forneça um nome para a thread' });

      const workspaceId = req.header('workspaceId');

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) return res.status(404).json({ message: 'Workspace não encontrado' });

      const user = await User.findOne(req.userId);

      if (!user) return res.status(404).json({ message: 'user não encontrado' });

      console.log(id);
      const thread = await Playground.findOne(id, { where: { workspace } });

      if (!thread) return res.status(400).json({ message: 'Não foi possível encontrar a thread, tente novamente.' });

      await Playground.update(thread.id, { name });

      return res.status(200).json(thread.id);
    } catch (error) {
      console.log(error);
      return res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }
}

export default new PlaygroundController();

