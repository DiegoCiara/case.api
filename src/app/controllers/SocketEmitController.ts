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

    const disconnect = () => {
      console.log('Usuário desconectado');
      socket.removeAllListeners('permission');
      socket.removeAllListeners('sourceUsers');
      socket.removeAllListeners('notify');
      socket.removeAllListeners('viewMessages');
    };
    socket.off('disconnect', disconnect);
    socket.on('disconnect', disconnect);
  });

  return socketPlatform;
}

