import { Server } from 'socket.io';
import dotenv from 'dotenv';
import Workspace from '@entities/Workspace';
import User from '@entities/User';
import { validate as uuidValidate } from 'uuid';
import OpenAI from 'openai';
import { formatMessage } from '@utils/openai/management/threads/formatMessage';
import { sendToQueue } from '@utils/rabbitMq/send';
import { processQueue } from '@utils/rabbitMq/proccess';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

export async function SocketEmitController(socketPlatform: Server) {
  socketPlatform.on('connect', async (socket) => {
    console.log('Usuário conectado');

    function returnChatError(threadId: string) {
      if (threadId) {
        socket.emit(`runError-thread:${threadId}`);
      }
      return;
    }

    async function sendMessage(workspaceId: string, threadId: string, userId: string, message: any) {
      try {
        if (!threadId || !threadId || !workspaceId || !uuidValidate(workspaceId) || !userId || !uuidValidate(userId) || !message) {
          if (threadId) {
            returnChatError(threadId);
          }
          return;
        }

        const { text, files } = message;

        const workspace = await Workspace.findOne(workspaceId);

        if (!workspace || !workspace.id) {
          await returnChatError(threadId);
          return;
        }

        const user = await User.findOne(userId);

        if (!user) {
          returnChatError(threadId);
          return;
        }

        const thread = await openai.beta.threads.retrieve(threadId);

        if (!thread.id) {
          returnChatError(threadId);
          return;
        }

        const messageOpenai: any = await formatMessage(openai, files, text,);

        await openai.beta.threads.messages.create(thread.id, messageOpenai);

        socket.emit(`thread:${thread.id}`); //Afrmando que o type pode ser apenas ou thread, ou thread

        const data = JSON.stringify({
          workspaceId: workspace.id,
          threadId: thread.id,
        });

        const queue = `thread:${workspace.id}`;

        await sendToQueue(queue, data);

        await processQueue(queue, 'thread');
        console.log('foi');
      } catch (error) {
        console.log(error);
      }
      // socket.emit(`thread:sendMessage:${userId}`, result);
    }

    socket.off('thread:sendMessage', sendMessage);
    socket.on('thread:sendMessage', sendMessage);

    const disconnect = () => {
      console.log('Usuário desconectado');
      socket.removeAllListeners('thread:sendMessage');
      socket.removeAllListeners('viewMessages');
    };
    socket.off('disconnect', disconnect);
    socket.on('disconnect', disconnect);
  });

  return socketPlatform;
}
