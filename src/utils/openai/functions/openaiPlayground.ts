import OpenAI from 'openai';
import dotenv from 'dotenv';
import Thread from '@entities/Thread';
import Workspace from '@entities/Workspace';
import Token from '@entities/Token';
import Message from '@entities/Message';
import { checkRun, checkRunStatus, getActiveRun } from '../checks/checkRunStatus';
import Contact from '@entities/Contact';
import { MessageContentPartParam, MessageCreateParams } from 'openai/resources/beta/threads/messages';
import { decrypt } from '@utils/encrypt';
import Assistant from '@entities/Assistant';
import { checkRunPlayground } from '../checks/checkRunPlayground';
import PlaygroundMessage from '@entities/PlaygroundMessage';
import Playground from '@entities/Playground';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Buffer para armazenar mensagens por chatId, agora capaz de armazenar objetos de mensagem
export async function   openaiPlayground(
  workspace: Workspace,
  playground: Playground,
  assistantId: string,
  message: any,
): Promise<any> {
  try {
    const openAIThreadId = playground.threadId

    // const apiKey = await decrypt(workspace!.openaiApiKey);

    // const openai = new OpenAI({ apiKey });

    if (!openAIThreadId) return;

    console.log(message)

    const openAIAssistant = await openai.beta.assistants.retrieve(assistantId!);

    let activeRun = await getActiveRun(openai, openAIThreadId);

    if (activeRun) {
      const messages = await checkRunPlayground(openai, playground, activeRun.id);
      return {
        openAIThreadId: openAIThreadId,
        text: messages.data[0].content[0].text.value.replace(/【\d+:\d+†[^\]]+】/g, ''),
      };
    }

    return new Promise(async(resolve, reject) => {
        try {
          // Combina as mensagens em um único array
          await openai.beta.threads.messages.create(openAIThreadId, {
            role: 'user',
            content: message,
          });

          const run = await openai.beta.threads.runs.create(openAIThreadId, {
            assistant_id: openAIAssistant.id,
            instructions: openAIAssistant.instructions,
          });


          const messages = await checkRunPlayground(openai, playground, run.id);
          if (!messages) {
            resolve({
              openAIThreadId: openAIThreadId,
              text: 'Tive um problema em processar sua mensagem, poderia tentar novamente mais tarde?',
            });
            return;
          }

          const runStatus = await openai.beta.threads.runs.retrieve(openAIThreadId, run.id);

          const workspaceMessage = messages.data[0].content[0].text.value.replace(/【\d+:\d+†[^\]]+】/g, '');

          const response = await PlaygroundMessage.create({
            workspace: workspace,
            playground: playground,
            type: 'text',
            content: workspaceMessage,
            from: 'ASSISTANT',
          }).save();

          const tokens = {
            total_tokens: playground.total_tokens +  runStatus!.usage!.total_tokens,
            completion_tokens: playground.completion_tokens +  runStatus!.usage!.completion_tokens,
            prompt_tokens: playground.prompt_tokens +  runStatus!.usage!.prompt_tokens,
          }

          await Playground.update(playground.id, tokens)

          console.log(response.content)
          console.log('Aguardando mais mensagens...');
          resolve({
            text: response,
          });

        } catch (error) {
          console.error(error)
          reject(error);
        }
        console.log('Enviando mensagens...');
    });
  } catch (error) {
    console.error('Error processing user message:', error);
  }
}

