import { Between, getRepository } from 'typeorm';
import Workspace from '@entities/Workspace';
import Notification from '@entities/Notification';
import eventEmitter from '../emitter';

export async function notify(workspace: Workspace, notification: Notification) {
  try {
    const accesses = workspace.accesses;

    for (const access of accesses) {
      if (access.role === 'SELLER' && notification.role === access.role) {
        const notify = await Notification.create({ ...notification, user: access.user }).save();
        await eventEmitter.emit('newNotification', notify);
      } else if (access.role === 'ADMIN' || access.role === 'OWNER' || access.role === 'SUPPORT') {
        const notify = await Notification.create({ ...notification, user: access.user }).save();
        await eventEmitter.emit('newNotification', notify);
      }
    }
  } catch (error) {
    console.error(error);
  }
}

