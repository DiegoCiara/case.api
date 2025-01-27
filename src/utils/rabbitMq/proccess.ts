import Workspace from '@entities/Workspace';
import { mainOpenAI } from '@utils/openai/chat/openai';
import amqp from 'amqplib';
import { checkThread } from '@utils/openai/chat/functions/checkThread';
import Thread from '@entities/Thread';
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
        const object = JSON.parse(payload);

        const { workspaceId, messages, threadId } = object;
        const workspace = await Workspace.findOne(workspaceId, { relations: ['integrations'] });

        if(!workspace) {
          channel.ack(msg);
          return;
        }

        const message = await mainOpenAI(workspace, threadId, messages, type);

        (await ioSocket).emit(`${type}:${threadId}`, 'assistant'); //Afrmando que o type pode ser apenas ou playground, ou thread
        // Confirma o processamento da mensagem
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error(error);
  }
}
