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
import { generateThreadName } from '@utils/openai/management/completions/generateThreadName';

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

      const threads = await Thread.find({ where: { workspace, user }, order: { updatedAt: 'ASC' } });
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

      const thread = await Thread.findOne({ where: { threadId, workspace } });

      if (!thread) {
        res.status(404).json({ message: 'Thread não encontrada' });
        return;
      }

      // Verifica se a thread foi criada há mais de 50 minutos
      const updatedAt = new Date(thread.updatedAt);
      const now = new Date();
      const diffInMinutes = (now.getTime() - updatedAt.getTime()) / (1000 * 60);
      console.log(diffInMinutes);
      if (diffInMinutes > 50) {
        // Atualiza a coluna `active` para false
        thread.active = false;
        await thread.save();
      }
      const { data }: any = await listMessages(openai, threadId);

      console.log(data);

      const messages = transformMessages(data);

      res.status(200).json({ messages: messages, status: thread.active, openai_messages: data });
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
      const { text, files } = req.body;

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

      const messageOpenai: any = await formatMessage(openai, files, text);

      console.log();

      const threadName: string = await generateThreadName(openai, messageOpenai);

      const threadCreated = await Thread.create({
        threadId: thread.id,
        name: threadName,
        workspace,
        user,
      }).save();

      if (!threadCreated.id) {
        res.status(400).json({ message: 'Não foi possível criar a thread, tente novamente.' });
        return;
      }

      await openai.beta.threads.messages.create(thread.id, messageOpenai);

      const data = JSON.stringify({
        workspaceId: workspace.id,
        threadId: thread.id,
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
  public async continueThread(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

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

      const threadFind = await Thread.findOne({ where: { threadId: id, workspace } });

      if (!threadFind) {
        res.status(404).json({ message: 'Thread não encontrado' });
        return;
      }

      const { data }: any = await listMessages(openai, id);

      const messages = data
        .map((e: any) => {
          console.log(e, e.content);

          return {
            role: e.role,
            content: e.content.map((e: any) => {
              return {
                type: 'text',
                text: e.text.value,
              };
            }),
            attachments: e.attachments,
          };
        })
        .reverse();

      const thread = await openai.beta.threads.create({ messages });

      console.log('DSEEEEEEEEE', data);

      const threadCreated = await Thread.create({
        threadId: thread.id,
        name: `${threadFind.name} (Cópia)`,
        workspace,
        user,
      }).save();

      if (!threadCreated.id) {
        res.status(400).json({ message: 'Não foi possível criar a thread, tente novamente.' });
        return;
      }

      // const dataQueue = JSON.stringify({
      //   workspaceId: workspace.id,
      //   threadId: thread.id,
      // });

      // const queue = `thread:${workspace.id}`;

      // await sendToQueue(queue, dataQueue);

      // await processQueue(queue, 'thread');

      res.status(200).json(thread.id);
    } catch (error) {
      console.log(error);
      res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }

  public async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { threadId } = req.params;
      const { text, files } = req.body;

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
        res.status(404).json({ message: 'Não foi possível verificar a thread, tente novamente.' });
        return;
      }
      const threadLocal = await Thread.findOne({ where: { threadId, workspace } });

      if (!threadLocal) {
        res.status(404).json({ message: 'Não foi possível verificar a thread, tente novamente.' });
        return;
      }

      if (!threadLocal.active) {
        res.status(400).json({ message: 'Esta thread não está mais ativa' });
        return;
      }

      const messageOpenai: any = formatMessage(openai, files, text);

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
  // public async deleteThread(req: Request, res: Response): Promise<void> {
  //   try {
  //     const { id } = req.params;

  //     if (!id) {
  //       res.status(404).json({ message: 'Forneça um id de uma thread' });
  //       return;
  //     }
  //     const workspaceId = req.header('workspaceId');

  //     const workspace = await Workspace.findOne(workspaceId);

  //     if (!workspace) {
  //       res.status(404).json({ message: 'Workspace não encontrado' });
  //       return;
  //     }

  //     const user = await User.findOne(req.userId);

  //     if (!user) {
  //       res.status(404).json({ message: 'user não encontrado' });
  //       return;
  //     }

  //     console.log(id);
  //     const thread = await Thread.findOne(id, { where: { workspace } });

  //     if (!thread) {
  //       res.status(400).json({ message: 'Não foi possível encontrar a thread, tente novamente.' });
  //       return;
  //     }

  //     const openaiThread = await openai.beta.threads.retrieve(thread.threadId);

  //     if (!openaiThread) {
  //       res.status(400).json({ message: 'Não foi possível verificar a thread, tente novamente.' });
  //       return;
  //     }

  //     const deletedThread = await openai.beta.threads.del(openaiThread.id);

  //     if (deletedThread.id) {
  //       await Thread.softRemove(thread);
  //     }

  //     res.status(200).json(thread.id);
  //   } catch (error) {
  //     console.log(error);
  //     res.status(404).json({ message: 'Cannot find workspaces, try again' });
  //   }
  // }
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
