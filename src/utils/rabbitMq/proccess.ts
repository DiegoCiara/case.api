import Assistant from '@entities/Assistant';
import Workspace from '@entities/Workspace';
import { openai } from '@utils/openai/openai';
import amqp from 'amqplib';
import { checkThread } from '@utils/openai/checks/checkThread';
import Thread from '@entities/Thread';

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
        const { workspaceId, assistantId, threadId } = payload;

        const assistant = await Assistant.findOne(assistantId, { relations: ['session'] });
        const workspace = await Workspace.findOne(workspaceId);
        const threadFind = await Thread.findOne(threadId);
        if (!assistant) {
          console.log('Sem assistente');
          return;
        }
        // Executa openaiText e sendMessage usando os dados da fila
        const thread = await checkThread(threadFind, workspace, assistant);

        const message = await openai(workspace, assistant, thread);

        // Confirma o processamento da mensagem
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error(error);
  }
}

