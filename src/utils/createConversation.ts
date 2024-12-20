import OpenAI from 'openai';
import dotenv from 'dotenv';
import Thread from '@entities/Thread';
import Workspace from '@entities/Workspace';
import Token from '@entities/Token';
import Contact from '@entities/Contact';
import Message from '@entities/Message';
import { sendMessage } from './whatsapp/whatsapp';
import User from '@entities/User';
import { formatMessageWhatsApp, formatToWhatsAppNumber } from './format';
import Assistant from '@entities/Assistant';

dotenv.config();

export async function updateActiveThreads(contact: Contact): Promise<void> {
  try {
    // Recupera todas as threads associadas ao contato
    const threads = await Thread.find({
      where: { contact: contact },
    });

    // Filtra as threads que possuem o atributo usage igual a "wpp" e chatActive igual a true
    const threadsToUpdate = threads.filter((thread) => thread.usage === 'wpp' && thread.chatActive);

    // Atualiza o atributo chatActive para false e a responsabilidade para o usuário.
    for (const thread of threadsToUpdate) {
      await Thread.update(thread.id, { chatActive: !thread.chatActive, responsible: 'USER' });
    }
  } catch (error) {
    console.error('Erro ao atualizar as threads:', error);
  }
}

export async function createConversationChannel(
  contact: Contact,
  workspace: Workspace,
  assistant: Assistant,
  usage: string,
  message: string,
  user: User
): Promise<any> {
  try {
    await updateActiveThreads(contact);

    const thread = await Thread.create({
      name: message,
      contact: contact,
      workspace: workspace,
      assistant,
      user,
      usage: usage,
      responsible: 'USER',
      chatActive: true,
    }).save();

    await Message.create({
      workspace,
      user,
      contact: contact,
      assistant,
      thread,
      content: message,
      from: 'USER',
    }).save();

    const onMessage = formatMessageWhatsApp(user.name, message);

    if (usage === 'wpp') {
      await sendMessage(workspace.id, assistant.session.token,  contact.phone, onMessage);
    }

    return thread;
  } catch (error) {
    console.error('Error processing user message:', error);
  }
}

export async function sendMessagePlatform(
  contact: Contact,
  workspace: Workspace,
  assistant: Assistant,
  thread: Thread,
  usage: string,
  message: string,
  user: User
): Promise<any> {
  try {
    if (usage === 'wpp') {
      await sendMessage(assistant.session.id, assistant.session.token, formatToWhatsAppNumber(contact.phone), message);
    }

    await Message.create({
      workspace,
      user,
      contact: contact,
      thread,
      content: message,
      from: 'USER',
    }).save();
  } catch (error) {
    console.error('Error processing user message:', error);
  }
}

