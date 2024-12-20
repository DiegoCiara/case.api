import Workspace from '@entities/Workspace';
import Thread from '@entities/Thread';
import { decrypt } from '@utils/encrypt/encrypt';
import OpenAI from 'openai';
import Assistant from '@entities/Assistant';


export async function checkThread(
  thread: Thread,
  workspace: Workspace,
  assistant: Assistant,
): Promise<any> {
  const apiKey = await decrypt(workspace!.openaiApiKey);
  const openai = new OpenAI({ apiKey });

  try {
    if (!thread) {
      try {
        const newThread = await openai.beta.threads.create();

        const threadCreated = await Thread.create({
          name: '',
          threadId: newThread.id,
          assistant,
          workspace: workspace,
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
            assistant,
            workspace: workspace,
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