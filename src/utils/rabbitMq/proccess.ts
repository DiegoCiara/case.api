import Assistant from '@entities/Assistant';
import Contact from '@entities/Contact';
import Workspace from '@entities/Workspace';
import { openaiText } from '@utils/openai/functions/openaiText';
import { openaiThread } from '@utils/openai/functions/openaiThread';
import { sendMessage } from '@utils/whatsapp/whatsapp';
import amqp from 'amqplib';

export async function processQueue() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    await channel.assertQueue('followUpQueue', { durable: true });

    channel.consume('followUpQueue', async (msg) => {
      if (msg !== null) {
        const payload = JSON.parse(msg.content.toString());
        console.log('payload object parsed', payload.phone)
        const { workspaceId, assistantId, phone, data, contactId, pageId, followUpType } = payload;

        const assistant = await Assistant.findOne(assistantId, { relations: ['session'] });
        const workspace = await Workspace.findOne(workspaceId);
        const contact = await Contact.findOne(contactId, { relations: ['customer'] });
        const page = await Assistant.findOne(pageId);
        if (!assistant) {
          console.log('Sem assistente');
          return;
        }
        // Executa openaiText e sendMessage usando os dados da fila
        const thread = await openaiThread(workspace, assistant, 'wpp', contact, data, page);
        
        const message = await openaiText(contact, null, workspace, assistant, thread);

        if (followUpType === 'wpp') {
          await sendMessage(assistant.session.id, assistant.session.token, phone, message.text.content);
        }

        // Confirma o processamento da mensagem
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error(error)
  }
}

