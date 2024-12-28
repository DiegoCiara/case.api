import Workspace from '@entities/Workspace';
import { mainOpenAI } from '@utils/openai/openai';
import amqp from 'amqplib';
import { checkThread } from '@utils/openai/checks/checkThread';
import Thread from '@entities/Thread';
import { ioSocket } from '@src/socket';

export async function processQueue(queue: string) {
  // Precisa passar o nome da fila como parametro
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    await channel.assertQueue(queue, { durable: true });

    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const payload = JSON.parse(msg.content.toString());
        console.log('payload object parsed', payload.phone);
        const { workspaceId, messages, threadId } = payload;
        const workspace = await Workspace.findOne(workspaceId);
        const threadFind = await Thread.findOne(threadId);

        const message = await mainOpenAI(workspace, threadId, messages);

        (await ioSocket).emit(`thread:${threadId}`)
        // Confirma o processamento da mensagem
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error(error);
  }
}

