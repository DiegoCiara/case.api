import Assistant from '@entities/Assistant';
import Contact from '@entities/Contact';
import Message from '@entities/Message';
import Thread from '@entities/Thread';
import Workspace from '@entities/Workspace';
import { ioSocket } from '@src/socket';
import { openaiResponse } from '@utils/openai/functions/openaiResponse';
import { openaiText } from '@utils/openai/functions/openaiText';
import { openaiThread } from '@utils/openai/functions/openaiThread';
import { sendMessage } from '@utils/whatsapp/whatsapp';
import amqp from 'amqplib';

export async function processThreads() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    await channel.assertQueue('chats', { durable: true });

    channel.consume('chats', async (msg) => {
      if (msg !== null) {
        const payload = JSON.parse(msg.content.toString());
        console.log('payload object parsed', payload)
        const { workspaceId, assistantId, threadId, contactId, message } = payload;

        console.log('THREADDDDDDD AIDI', threadId)
        const assistant = await Assistant.findOne(assistantId, { relations: ['session'] });
        const workspace = await Workspace.findOne(workspaceId);
        const contact = await Contact.findOne(contactId, { relations: ['customer'] });
        const thread = await Thread.findOne(threadId)
        if (!assistant) {
          console.log('Sem assistente');
          return;
        }
        const response = await Message.create({
          workspace: workspace,
          assistant,
          thread: thread,
          contact: contact,
          type: 'text',
          content: message[0].text,
          viewed: true,
          from: 'CONTACT',
        }).save();

        (await ioSocket).emit(`threadChat:${thread.id}`, 'USER')

        console.log(thread)

        const msgOpenai = await openaiResponse(contact, null, workspace, assistant, thread, message);

        (await ioSocket).emit(`threadChat:${thread.id}`, 'ASSISTANT')

        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error(error)
  }
}

