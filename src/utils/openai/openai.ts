import OpenAI from 'openai';
import dotenv from 'dotenv';
import Workspace from '@entities/Workspace';
import { checkRun, getActiveRun } from './functions/checkRunStatus';
import { decrypt } from '@utils/encrypt/encrypt';
import { token } from '@utils/functions/createToken';
import { Message } from 'openai/resources/beta/threads/messages';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

// Buffer para armazenar mensagens por chatId, agora capaz de armazenar objetos de mensagem
export async function mainOpenAI(workspace: Workspace, threadId: string, messages: any): Promise<any> {
  try {
    if (!threadId) return;

    const assistant = await openai.beta.assistants.retrieve(workspace.assistantId!);

    let activeRun = await getActiveRun(openai, threadId);

    if (activeRun) {
      const messages = await checkRun(openai, threadId, activeRun.id);
      return {
        threadId: threadId,
        text: messages.data[0].content[0].text.value.replace(/【\d+:\d+†[^\]]+】/g, ''),
      };
    }

    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: messages, //Array de mensagens comoo o openaiMessage
    });

    return new Promise(async (resolve, reject) => {
      try {
        // Combina as mensagens em um único array
        const run = await openai.beta.threads.runs.create(threadId, {
          assistant_id: assistant.id,
          instructions: assistant.instructions,
        });

        const messages = await checkRun(openai, threadId, run.id);
        if (!messages) {
          resolve({
            threadId: threadId,
            text: 'Tive um problema em processar sua mensagem, poderia tentar novamente mais tarde?',
          });
          return;
        }

        const runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);

        const output = messages.data[0].content;

        await token(workspace, threadId, runStatus, assistant.model, messages, output);

        console.log('Aguardando mais mensagens...');
        resolve(output);
      } catch (error) {
        reject(error);
      }
      console.log('Enviando mensagens...');
    });
  } catch (error) {
    console.error('Error processing user message:', error);
  }
}

