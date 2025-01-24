import Workspace from '@entities/Workspace';
import { mainOpenAI } from '@utils/openai/chat/openai';
import amqp from 'amqplib';
import { ioSocket } from '@src/socket';

export async function processQueue(queue: string, type: string) {
  // Precisa passar o nome da fila como parametro
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    await channel.assertQueue(queue, { durable: true });

    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const payload = JSON.parse(msg.content.toString());
        const object = JSON.parse(payload)
        console.log('payload object parsed', object, typeof object);
        const { workspaceId, messages, threadId } = object;
        const workspace = await Workspace.findOne(workspaceId, { relations: ['integrations']});

        if(!workspace){
          channel.ack(msg);
          return
        }

        await mainOpenAI(workspace, threadId, messages, type);

        (await ioSocket).emit(`${type}:${threadId}`, 'assistant');

        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error(error);
  }
}

