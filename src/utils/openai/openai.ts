import OpenAI from 'openai';
import dotenv from 'dotenv';
import Thread from '@entities/Thread';
import Workspace from '@entities/Workspace';
import Token from '@entities/Token';
import Message from '@entities/Message';
import { checkRun, checkRunStatus, getActiveRun } from './checks/checkRunStatus';
import Contact from '@entities/Contact';
import { MessageContentPartParam, MessageCreateParams } from 'openai/resources/beta/threads/messages';
import { decrypt } from '@utils/encrypt';
import Assistant from '@entities/Assistant';

dotenv.config();

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_KEY,
// });

// Buffer para armazenar mensagens por chatId, agora capaz de armazenar objetos de mensagem
const messageBuffer: { [chatId: string]: { messages: any; timeout: NodeJS.Timeout | any } } = {};

export async function openAI(
  contact: Contact,
  workspace: Workspace,
  assistant: Assistant,
  thread: Thread,
  openAIThreadId: string,
  message: any,
  side: any
): Promise<any> {
  try {
    console.log('Thread Retornada', openAIThreadId);

    const apiKey = await decrypt(workspace!.openaiApiKey);
    const openai = new OpenAI({ apiKey });

    if (!openAIThreadId) return;

    const openAIAssistant = await openai.beta.assistants.retrieve(assistant.openaiAssistantId!);

    const hasLandingPageInstructions = thread?.landingpage?.assistantInstructions

    const instruction = hasLandingPageInstructions ? thread.landingpage.assistantInstructions : openAIAssistant.instructions || ''

    let activeRun = await getActiveRun(openai, openAIThreadId);

    if (activeRun) {
      const messages = await checkRun(openai, thread, activeRun.id, workspace, assistant);
      return {
        openAIThreadId: openAIThreadId,
        text: messages.data[0].content[0].text.value.replace(/【\d+:\d+†[^\]]+】/g, ''),
      };
    }

    if (!messageBuffer[openAIThreadId]) {
      messageBuffer[openAIThreadId] = { messages: [], timeout: null };
    }

    if (Array.isArray(message)) {
      message.forEach((msg) => {
        messageBuffer[openAIThreadId].messages.push(msg);
      });
    } else {
      messageBuffer[openAIThreadId].messages.push(message);
    }

    if (messageBuffer[openAIThreadId].timeout) {
      clearTimeout(messageBuffer[openAIThreadId].timeout);
    }

    const timeToRespnose = assistant.wppDelayResponse * 1000;
    return new Promise((resolve, reject) => {
      messageBuffer[openAIThreadId].timeout = setTimeout(async () => {
        try {
          // Combina as mensagens em um único array
          const combinedMessages = messageBuffer[openAIThreadId].messages;

          messageBuffer[openAIThreadId] = { messages: [], timeout: null };

          console.log('combinedMessages', combinedMessages);
          // Envia as mensagens para o OpenAI

          await openai.beta.threads.messages.create(openAIThreadId, {
            role: side,
            content: combinedMessages,
          });
          const run = await openai.beta.threads.runs.create(openAIThreadId, {
            assistant_id: openAIAssistant.id,
            instructions: instruction,
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
            contact: contact,
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
            input: message,
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
      }, timeToRespnose);
    });
  } catch (error) {
    console.error('Error processing user message:', error);
  }
}

