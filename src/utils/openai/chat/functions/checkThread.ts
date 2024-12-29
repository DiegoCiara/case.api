import Workspace from '@entities/Workspace';
import Thread from '@entities/Thread';
import { decrypt } from '@utils/encrypt/encrypt';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

export async function checkThread(threadId: string, workspace: Workspace): Promise<any> {

  try {
    const thread = await Thread.findOne({ where: threadId });
    if (!thread) {
      try {
        const newThread = await openai.beta.threads.create();

        const threadCreated = await Thread.create({
          threadId: newThread.id,
          workspace: workspace,
        }).save();

        return threadCreated;
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
            threadId: newThread.id,
            workspace: workspace,
          }).save();

          return threadCreated
        } catch (error) {
          console.log(error);
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
}

