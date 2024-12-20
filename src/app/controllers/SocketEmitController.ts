import { Server } from 'socket.io';
import { io } from 'socket.io-client';
import dotenv from 'dotenv';
import Workspace from '@entities/Workspace';
import Thread from '@entities/Thread';
import eventEmitter from '@utils/emitter';
import Notification from '@entities/Notification';
import { In, getRepository } from 'typeorm';
import Message from '@entities/Message';
import User from '@entities/User';
import Access from '@entities/Access';
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

dotenv.config();

const SOCKET_SERVER_URL = process.env.SOCKET_SERVER_URL as string;

export async function SocketEmitController(socketPlatform: Server) {
  const wppconnect = io(SOCKET_SERVER_URL);
  // await startPeriodicProcessing();
  wppconnect.on('connect', () => {
    console.log('Socket WPP Conectado');
  });

  socketPlatform.on('connect', async (socket) => {
    console.log('Usuário conectado');

    async function permission(userId: string, workspaceId: string) {
      if (!userId || !workspaceId || !uuidValidate(workspaceId)) return;
      const user = await User.findOne(userId, {
        select: ['id', 'email', 'name', 'passwordResetToken', 'passwordHash', 'picture'],
      });
      const workspace = await Workspace.findOne(workspaceId);
      const access = await Access.findOne({ where: { user, workspace } });
      const result = {
        role: access?.role,
        hasOpenaiApiKey: workspace?.openaiApiKey ? true : false,
      };
      socket.emit(`permission:${userId}`, result);
    }
    socket.off('permission', permission);
    socket.on('permission', permission);

    const notify = async (userId: string, workspaceId: string) => {
      if (!userId || !workspaceId || !uuidValidate(workspaceId)) return;
      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) return;
      const user = await User.findOne(userId);
      const notifications = getRepository(Notification);

      const notificationNotViewed = await notifications.find({
        where: {
          workspace,
          user,
          viewed: false,
        },
      });

      socket.emit(`notifications:${workspace.id}`, notificationNotViewed);
    };
    socket.off('notify', notify);
    socket.on('notify', notify);

    // const newNotification = async (notification: Notification) => {
    //   const workspace = notification.workspace;
    //   const user = notification.user;

    //   const notifications = getRepository(Notification);

    //   const notificationNotViewed = await notifications.find({
    //     where: {
    //       workspace,
    //       user,
    //       viewed: false,
    //     },
    //   });

    //   socket.emit(`notifications:${workspace.id}`, notificationNotViewed);
    //   socket.emit(`newNotification:${workspace.id}`, notification);
    // };
    // eventEmitter.off('newNotification', newNotification);
    // eventEmitter.on('newNotification', newNotification);

    // const notifyEmmitter = async (userId: string, workspaceId: string) => {
    //   try {
    //     if (!userId || !workspaceId || !uuidValidate(workspaceId)) return;

    //     const workspace = await Workspace.findOne(workspaceId);

    //     if (!workspace) return;

    //     const user = await User.findOne(userId);

    //     if (!user) return;

    //     const notifications = Notification.find({ where: { user, workspace, viewed: false } });

    //     socket.emit(`notifications:${workspace.id}`, notifications);
    //   } catch (error) {
    //     console.error(error);
    //   }
    // };
    // eventEmitter.off('notify', notifyEmmitter);
    // eventEmitter.on('notify', notifyEmmitter);

    const viewMessages = async (threadId: string) => {
      const thread = await Thread.findOne(threadId, { relations: ['messages', 'workspace'] });
      if (!thread) {
        console.log('Thread não encontrada');
        return;
      }

      for (const message of thread.messages) {
        if (!message.viewed) {
          // Atualizar a mensagem com a propriedade 'viewed' para 'true'
          const messageIn = { viewed: true };
          await Message.update(message.id, messageIn as QueryDeepPartialEntity<Message>);
        }
      }

      eventEmitter.emit('threads', thread.workspace);
    };
    socket.off('viewMessages', viewMessages);
    socket.on('viewMessages', viewMessages);

    const disconnect = () => {
      console.log('Usuário desconectado');
      socket.removeAllListeners('permission');
      socket.removeAllListeners('notify');
      socket.removeAllListeners('viewMessages');
    };
    socket.off('disconnect', disconnect);
    socket.on('disconnect', disconnect);
  });

  return socketPlatform;
}

