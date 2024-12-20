import OpenAI from 'openai';
import dotenv from 'dotenv';
import Thread from '@entities/Thread';
import Workspace from '@entities/Workspace';
import Token from '@entities/Token';
import Message from '@entities/Message';
import { checkRun, getActiveRun } from './checks/checkRunStatus';
import { decrypt } from '@utils/encrypt/encrypt';
import Assistant from '@entities/Assistant';

dotenv.config();

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_KEY,
// });

// Buffer para armazenar mensagens por chatId, agora capaz de armazenar objetos de mensagem
export async function openai(workspace: Workspace, assistant: Assistant, thread: Thread): Promise<any> {
  try {
    const openAIThreadId = thread.threadId;
    console.log('openAIThreadId', openAIThreadId);
    const apiKey = await decrypt(workspace!.openaiApiKey);
    const openai = new OpenAI({ apiKey });

    if (!openAIThreadId) return;

    const openAIAssistant = await openai.beta.assistants.retrieve(assistant.openaiAssistantId!);

    let activeRun = await getActiveRun(openai, openAIThreadId);

    if (activeRun) {
      const messages = await checkRun(openai, thread, activeRun.id, workspace, assistant);
      return {
        openAIThreadId: openAIThreadId,
        text: messages.data[0].content[0].text.value.replace(/【\d+:\d+†[^\]]+】/g, ''),
      };
    }

    return new Promise(async (resolve, reject) => {
      try {
        // Combina as mensagens em um único array
        const run = await openai.beta.threads.runs.create(openAIThreadId, {
          assistant_id: openAIAssistant.id,
          instructions: openAIAssistant.instructions,
        });

        const messages = await checkRun(openai, thread, run.id, workspace, assistant);
        if (!messages) {
          resolve({
            openAIThreadId: openAIThreadId,
            text: 'Tive um problema em processar sua mensagem, poderia tentar novamente mais tarde?',
          });
          return;
        }

        const runStatus = await openai.beta.threads.runs.retrieve(openAIThreadId, run.id);

        const workspaceMessage = messages.data[0].content[0].text.value.replace(/【\d+:\d+†[^\]]+】/g, '');

        const response = await Message.create({
          workspace: workspace,
          assistant,
          thread: thread,
          type: 'text',
          content: workspaceMessage,
          viewed: true,
          from: 'ASSISTANT',
        }).save();

        const token = await Token.create({
          workspace: workspace,
          total_tokens: runStatus!.usage!.total_tokens,
          completion_tokens: runStatus!.usage!.completion_tokens,
          thread: thread,
          model: openAIAssistant.model,
          prompt_tokens: runStatus!.usage!.prompt_tokens,
          assistant,
          input: workspaceMessage,
          output: messages.data[0].content[0].text.value,
        }).save();

        console.log('Aguardando mais mensagens...');
        resolve({
          text: response,
        });
      } catch (error) {
        reject(error);
      }
      console.log('Enviando mensagens...');
    });
  } catch (error) {
    console.error('Error processing user message:', error);
  }
}

