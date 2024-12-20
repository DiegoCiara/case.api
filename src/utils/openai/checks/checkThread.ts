import Workspace from '@entities/Workspace';
import Contact from '@entities/Contact';
import Deal from '@entities/Deal';
import Thread from '@entities/Thread';
import { decrypt } from '@utils/encrypt';
import OpenAI from 'openai';
import Assistant from '@entities/Assistant';

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_KEY,
// });

interface ThreadOpenAI {
  openAIThreadId: string | undefined;
  thread: Thread;
}

export async function checkThread(thread: Thread, workspace: Workspace, assistant: Assistant, usage: string, contact: Contact): Promise<any> {
  const apiKey = await decrypt(workspace!.openaiApiKey);
  const openai = new OpenAI({ apiKey });

  try {
    if (!thread) {
      try {
        const newThread = await openai.beta.threads.create();

        const threadCreated = await Thread.create({
          name: '',
          threadId: newThread.id,
          contact: contact,
          assistant,
          workspace: workspace,
          usage: usage,
          chatActive: true,
        }).save();

        return {
          openAIThreadId: newThread!.id,
          thread: threadCreated!,
        };
      } catch (error) {
        console.log(error);
      }
    } else {
      if (thread.chatActive) {
        return {
          openAIThreadId: thread!.threadId,
          thread: thread!,
        };
      } else {
        try {
          const newThread = await openai.beta.threads.create();

          const threadCreated = await Thread.create({
            name: '',
            threadId: newThread.id,
            contact: contact,
            assistant,
            workspace: workspace,
            usage: usage,
            chatActive: true,
          }).save();

          // console.console.log(newThread.id);
          return {
            openAIThreadId: newThread!.id,
            thread: threadCreated!,
          };
        } catch (error) {
          console.log(error);
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
}


export async function checkThreadPlatform(thread: Thread, message: string, workspace: Workspace, usage: string): Promise<any> {
  const apiKey = await decrypt(workspace!.openaiApiKey);
  const openai = new OpenAI({ apiKey });

  try {
    if (!thread) {
      try {
        const newThread = await openai.beta.threads.create({
          messages: [
            {
              role: 'user',
              content: message,
            },
          ],
        });

        const threadCreated = await Thread.create({
          name: message,
          threadId: newThread.id,
          workspace: workspace,
          usage: usage,
          chatActive: true,
        }).save();

        return threadCreated;
      } catch (error) {
        console.log(error);
      }
    } else {
      if (thread.chatActive) {
        return thread;
      } else {
        try {
          const newThread = await openai.beta.threads.create({
            messages: [
              {
                role: 'user',
                content: message,
              },
            ],
          });

          const threadCreated = await Thread.create({
            name: message,
            threadId: newThread.id,
            workspace: workspace,
            usage: usage,
            chatActive: true,
          }).save();

          return threadCreated;
        } catch (error) {
          console.log(error);
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
}

