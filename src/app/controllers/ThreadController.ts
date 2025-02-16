import { Request, Response } from 'express';
import Workspace from '@entities/Workspace';
import OpenAI from 'openai';
import User from '@entities/User';
import { formatMessage, transformMessages } from '@utils/openai/management/threads/formatMessage';
import { listMessages } from '@utils/openai/management/threads/listMessages';
import { sendToQueue } from '@utils/rabbitMq/send';
import { processQueue } from '@utils/rabbitMq/proccess';
import Thread from '@entities/Thread';
import { retrieveFile } from '@utils/openai/management/threads/fileRetrivie';
import { ioSocket } from '@src/socket';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

class ThreadController {
  public async findThreads(req: Request, res: Response): Promise<void> {
    try {
      const workspaceId = req.header('workspaceId');

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) {
        res.status(404).json({ message: 'Workspace não encontrado' });
        return;
      }
      const user = await User.findOne(req.userId);

      if (!user) {
        res.status(404).json({ message: 'Usuário não encontrado' });
        return;
      }

      const threads = await Thread.find({ where: { workspace, user } });
      console.log(threads);
      res.status(200).json(threads?.reverse());
    } catch (error) {
      res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }
  public async findThread(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ message: 'Id da thread não informado' });
        return;
      }
      const workspaceId = req.header('workspaceId');

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) {
        res.status(404).json({ message: 'Workspace não encontrado' });
        return;
      }

      const user = await User.findOne(req.userId);

      if (!user) {
        res.status(404).json({ message: 'Usuário não encontrado' });
        return;
      }

      const threads = await Thread.find({ where: { workspace, user } });
      console.log(threads);
      res.status(200).json(threads);
    } catch (error) {
      res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }

  public async listThreadMessages(req: Request, res: Response): Promise<void> {
    try {
      const workspaceId = req.header('workspaceId');

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) {
        res.status(404).json({ message: 'Workspace não encontrado' });
        return;
      }

      const { threadId } = req.params;

      if (!threadId) {
        res.status(400).json({ message: 'Id da thread não informado' });
        return;
      }

      const { data }: any = await listMessages(openai, threadId);

      const messages = transformMessages(data);

      res.status(200).json(messages);
    } catch (error) {
      console.log(error);
      res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }

  public async retrieveFile(req: Request, res: Response): Promise<void> {
    try {
      const workspaceId = req.header('workspaceId');

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) {
        res.status(404).json({ message: 'Workspace não encontrado' });
        return;
      }

      const { fileId } = req.params;

      if (!fileId) {
        res.status(400).json({ message: 'Id da thread não informado' });
        return;
      }

      const data = await retrieveFile(openai, fileId);

      console.log(data);
      res.status(200).json(data);
    } catch (error) {
      res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }

  public async createThread(req: Request, res: Response): Promise<void> {
    try {
      const { text, media } = req.body;

      const workspaceId = req.header('workspaceId');

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) {
        res.status(404).json({ message: 'Workspace não encontrado' });
        return;
      }

      const user = await User.findOne(req.userId);

      if (!user) {
        res.status(404).json({ message: 'user não encontrado' });
        return;
      }

      const thread = await openai.beta.threads.create();

      const messageOpenai: any = await formatMessage(openai, media, text, thread.id, workspace);

      console.log();

      const name = messageOpenai.find((e: any) => e.type === 'text')?.text || 'Imagem';

      const threadCreated = await Thread.create({
        threadId: thread.id,
        name,
        workspace,
        user,
      }).save();

      if (!threadCreated.id) {
        res.status(400).json({ message: 'Não foi possível criar a thread, tente novamente.' });
        return;
      }

      await openai.beta.threads.messages.create(thread.id, {
        role: 'user',
        content: messageOpenai, //Array de mensagens comoo o openaiMessage
      });

      const data = JSON.stringify({
        workspaceId: workspace.id,
        threadId: thread.id,
        messages: messageOpenai,
      });

      const queue = `thread:${workspace.id}`;

      await sendToQueue(queue, data);

      await processQueue(queue, 'thread');

      res.status(200).json(thread.id);
    } catch (error) {
      console.log(error);
      res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }

  public async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { threadId } = req.params;
      const { text, media } = req.body;

      const workspaceId = req.header('workspaceId');

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) {
        res.status(404).json({ message: 'Workspace não encontrado' });
        return;
      }

      const user = await User.findOne(req.userId);

      if (!user) {
        res.status(404).json({ message: 'user não encontrado' });
        return;
      }

      const thread = await openai.beta.threads.retrieve(threadId);

      if (!thread.id) {
        res.status(400).json({ message: 'Não foi possível verificar a thread, tente novamente.' });
        return;
      }

      const messageOpenai: any = formatMessage(openai, media, text, thread.id, workspace);

      console.log(messageOpenai);

      await openai.beta.threads.messages.create(thread.id, {
        role: 'user',
        content: messageOpenai, //Array de mensagens comoo o openaiMessage
      });
      (await ioSocket).emit(`thread:${thread.id}`); //Afrmando que o type pode ser apenas ou thread, ou thread

      const data = JSON.stringify({
        workspaceId: workspace.id,
        threadId: thread.id,
        messages: messageOpenai,
      });

      const queue = `thread:${workspace.id}`;

      await sendToQueue(queue, data);

      await processQueue(queue, 'thread');

      res.status(200).json(thread.id);
    } catch (error) {
      console.log(error);
      res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }
  public async deleteThread(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(404).json({ message: 'Forneça um id de uma thread' });
        return;
      }
      const workspaceId = req.header('workspaceId');

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) {
        res.status(404).json({ message: 'Workspace não encontrado' });
        return;
      }

      const user = await User.findOne(req.userId);

      if (!user) {
        res.status(404).json({ message: 'user não encontrado' });
        return;
      }

      console.log(id);
      const thread = await Thread.findOne(id, { where: { workspace } });

      if (!thread) {
        res.status(400).json({ message: 'Não foi possível encontrar a thread, tente novamente.' });
        return;
      }

      const openaiThread = await openai.beta.threads.retrieve(thread.threadId);

      if (!openaiThread) {
        res.status(400).json({ message: 'Não foi possível verificar a thread, tente novamente.' });
        return;
      }

      const deletedThread = await openai.beta.threads.del(openaiThread.id);

      if (deletedThread.id) {
        await Thread.softRemove(thread);
      }

      res.status(200).json(thread.id);
    } catch (error) {
      console.log(error);
      res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }
  public async updateThread(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const { name } = req.body;

      if (!id) {
        res.status(404).json({ message: 'Forneça um id de uma thread' });
        return;
      }

      if (!name) {
        res.status(404).json({ message: 'Forneça um nome para a thread' });
        return;
      }

      const workspaceId = req.header('workspaceId');

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) {
        res.status(404).json({ message: 'Workspace não encontrado' });
        return;
      }

      const user = await User.findOne(req.userId);

      if (!user) {
        res.status(404).json({ message: 'user não encontrado' });
        return;
      }

      console.log(id);
      const thread = await Thread.findOne(id, { where: { workspace } });

      if (!thread) {
        res.status(400).json({ message: 'Não foi possível encontrar a thread, tente novamente.' });
        return;
      }

      await Thread.update(thread.id, { name });

      res.status(200).json(thread.id);
    } catch (error) {
      console.log(error);
      res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }
}

export default new ThreadController();
