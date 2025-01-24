import Workspace from '@entities/Workspace';
import OpenAI from 'openai';

export async function listMessages(openai: OpenAI, threadId: string) {
  try {

    const messages = await openai.beta.threads.messages.list(threadId)

    // Processa cada arquivo para obter o conteúdo adicional
    return messages
  } catch (error) {
    return;
  }
}

