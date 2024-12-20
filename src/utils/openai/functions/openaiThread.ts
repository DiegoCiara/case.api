import Workspace from '@entities/Workspace';
import Contact from '@entities/Contact';
import Deal from '@entities/Deal';
import Thread from '@entities/Thread';
import { decrypt } from '@utils/encrypt';
import OpenAI from 'openai';
import Assistant from '@entities/Assistant';
import LandingPage from '@entities/LandingPage';

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_KEY,
// });

interface ThreadOpenAI {
  openAIThreadId: string | undefined;
  thread: Thread;
}

export async function openaiThread(workspace: Workspace, assistant: Assistant, usage: string, contact: Contact, data: string, landingpage: LandingPage): Promise<any> {
  const apiKey = await decrypt(workspace!.openaiApiKey);
  const openai = new OpenAI({ apiKey });


  try {
        const newThread = await openai.beta.threads.create({
            messages: [
              {
                role: 'assistant', // Alterado de 'user' para 'system'
                content: data, // Mensagem do sistema que pode ser personalizada
              },
            ],
          }
        );

        const threadCreated = await Thread.create({
          name: '',
          threadId: newThread.id,
          contact: contact,
          assistant,
          workspace: workspace,
          usage: usage,
          landingpage,
          chatActive: true,
        }).save();

        return threadCreated
  } catch (error) {
    console.error('error ao criar a trhead', error);
  }
}
