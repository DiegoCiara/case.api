import { Server } from 'socket.io';
import { io } from 'socket.io-client';
import dotenv from 'dotenv';
import Workspace from '@entities/Workspace';
import Thread from '@entities/Thread';
import eventEmitter from '@utils/emitter';
import { In, getRepository } from 'typeorm';
import User from '@entities/User';
import Access from '@entities/Access';
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import OpenAI from 'openai';
import { formatMessage } from '@utils/openai/management/threads/formatMessage';
import { sendToQueue } from '@utils/rabbitMq/send';
import { processQueue } from '@utils/rabbitMq/proccess';

dotenv.config();

const SOCKET_SERVER_URL = process.env.SOCKET_SERVER_URL as string;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

export async function SocketEmitController(socketPlatform: Server) {
  const wppconnect = io(SOCKET_SERVER_URL);
  // await startPeriodicProcessing();
  wppconnect.on('connect', () => {
    console.log('Socket WPP Conectado');
  });

  socketPlatform.on('connect', async (socket) => {
    console.log('Usuário conectado');

    function returnChatError(threadId: string) {
      if (threadId) {
        socket.emit(`runError-playGround:${threadId}`);
      } return
    }

    async function sendMessage(workspaceId: string, threadId: string, userId: string, message: any) {
      console.log(workspaceId, threadId, userId, message)
      if (!threadId || !threadId || !workspaceId || !uuidValidate(workspaceId) || !userId || !uuidValidate(userId) || !message) {
        if (threadId) {
          returnChatError(threadId)
        }
        return;
      }

      const { text, media } = message

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace || !workspace.id){
        returnChatError(threadId)
      }

      const user = await User.findOne(userId);

      if (!user) {
        returnChatError(threadId)
      };

      const thread = await openai.beta.threads.retrieve(threadId);

      if (!thread.id) {
        returnChatError(threadId)
      };

      const messageOpenai: any = formatMessage(media, text);

      await openai.beta.threads.messages.create(thread.id, {
        role: 'user',
        content: messageOpenai, //Array de mensagens comoo o openaiMessage
      });

      socket.emit(`playground:${thread.id}`); //Afrmando que o type pode ser apenas ou playground, ou thread

      const data = JSON.stringify({
        workspaceId: workspace!.id,
        threadId: thread.id,
        messages: messageOpenai,
      });

      const queue = `playground:${workspace!.id}`;

      await sendToQueue(queue, data);

      await processQueue(queue, 'playground');
      console.log('foi')

      // socket.emit(`playground:sendMessage:${userId}`, result);
    }

    socket.off('playground:sendMessage', sendMessage);
    socket.on('playground:sendMessage', sendMessage);


    const disconnect = () => {
      console.log('Usuário desconectado');
      socket.removeAllListeners('playground:sendMessage');
      socket.removeAllListeners('viewMessages');
    };
    socket.off('disconnect', disconnect);
    socket.on('disconnect', disconnect);
  });

  return socketPlatform;
}

