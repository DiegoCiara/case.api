import OpenAI from 'openai';
import dotenv from 'dotenv';
import Thread from '@entities/Thread';
import Workspace from '@entities/Workspace';
import Token from '@entities/Token';
import { decrypt } from './encrypt';
import Assistant from '@entities/Assistant';

dotenv.config();


let assistant: OpenAI.Beta.Assistants.Assistant;
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_KEY,
// });

// Buffer para armazenar mensagens por chatId
const messageBuffer: { [chatId: string]: { messages: string[]; timeout: NodeJS.Timeout | any } } = {};

// Função para verificar se existe um run ativo
async function getActiveRun(threadId: string, openai: OpenAI) {
  try {
    const runs = await openai.beta.threads.runs.list(threadId);
    return runs.data.find((run: any) => run.status === 'active');
  } catch (error) {
    console.error(error);
  }
}

async function checkThread(thread: Thread, message: string, workspace: Workspace, usage: string, openai: OpenAI): Promise<any> {
  try {
    if (!thread) {
      const newThread = await openai.beta.threads.create({
        messages: [
          {
            role: 'user',
            content: message,
          },
        ],
      });

      await Thread.create({
        name: message,
        threadId: newThread.id,
        workspace: workspace,
        usage: usage,
        chatActive: true,
      }).save();

      return newThread.id;
    } else {
      return thread.threadId;
    }
  } catch (error) {
    console.error(error);
  }
}
export async function mainOpenAI({
  workspaceId,
  thread,
  assistantIf,
  usage,
  message,
}: // User é o identificador do usuário que iniciou a mensagem
{
  message: string;
  workspaceId: string;
  thread: any;
  usage: string;
  assistantIf: Assistant;
}): Promise<any> {
  try {
    const id = workspaceId;

    const assistantFind = assistantIf
    const workspace = await Workspace.findOne(id, { relations: ['plan'] });

    const apiKey = await decrypt(workspace!.openaiApiKey);
    const openai = new OpenAI({ apiKey });

    // const passLimit = await checkCredits(assistantFind!);

    // if (passLimit) {
    //   return;
    // }

    const threadId = await checkThread(thread, message, workspace!, usage, openai);

    console.log('Thread Retornada', threadId);

    if (!threadId) return;

    assistant = await openai.beta.assistants.retrieve(assistantFind?.openaiAssistantId!);

    let activeRun = await getActiveRun(threadId, openai);

    if (activeRun) {
      const messages = await checkRunStatus({ threadId: threadId, runId: activeRun.id, openai });
      return {
        threadId: threadId,
        text: messages.data[0].content[0].text.value.replace(/【\d+:\d+†[^\]]+】/g, ''),
      };
    }

    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: message,
    });


    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistant.id,
      instructions: assistant.instructions,
    });
    const messages = await checkRunStatus({ threadId: threadId, runId: run.id, openai });

    if (!messages)
      return {
        threadId: threadId,
        text: 'Tive um problema em processar sua mensagem, poderia tentar novamente mais tarde?',
      };

    const runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);

    const threadThisChat = await Thread.findOne({ where: { threadId: threadId } });

    const token = await Token.create({
      workspace: assistantFind,
      total_tokens: runStatus!.usage!.total_tokens,
      completion_tokens: runStatus!.usage!.completion_tokens,
      prompt_tokens: runStatus!.usage!.prompt_tokens,
      thread: threadThisChat,
      model: assistant.model,
      input: message,
      output: messages.data[0].content[0].text.value,
    }).save();

    return {
      threadId: threadId,
      text: messages.data[0].content[0].text.value.replace(/【\d+:\d+†[^\]]+】/g, ''),
    };
  } catch (error) {
    console.error('Error processing user message:', error);
  }
}
async function checkRunStatus({ threadId, runId, openai }: { threadId: string; runId: string; openai: OpenAI }): Promise<any> {
  return await new Promise((resolve, reject) => {
    let timeoutId: NodeJS.Timeout;

    const verify = async (): Promise<void> => {
      const runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
      if (runStatus.status === 'completed') {
        clearTimeout(timeoutId); // Limpa o timeout se o status for 'completed'
        const messages = await openai.beta.threads.messages.list(threadId);
        resolve(messages);
      } else if (runStatus.status === 'failed') {
        resolve(null);
      } else {
        console.log('Aguardando resposta da OpenAI... Status ==>', runStatus?.status);
        setTimeout(verify, 3000);
      }
    };

    // Define um temporizador de 10 segundos para rejeitar a promessa
    timeoutId = setTimeout(() => {
      resolve(null);
    }, 15000);

    verify();
  });
}

