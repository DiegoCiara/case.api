import Workspace from '@entities/Workspace';
import Contact from '@entities/Contact';
import Deal from '@entities/Deal';
import Playground from '@entities/Playground';
import { decrypt } from '@utils/encrypt';
import OpenAI from 'openai';
import Assistant from '@entities/Assistant';
import dotenv from 'dotenv'

dotenv.config()
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_KEY,
// });

interface PlaygroundOpenAI {
  openAIPlaygroundId: string | undefined;
  playground: Playground;
}

const apiKey = process.env.OPENAI_API_KEY

export async function checkPlayground(playground: Playground, workspace: Workspace): Promise<any> {

  const openai = new OpenAI({ apiKey });

  try {
    if (!playground) {
      try {
        const newPlayground = await openai.beta.threads.create();

        const playgroundCreated = await Playground.create({
          name: '',
          threadId: newPlayground.id,
          workspace: workspace,
        }).save();

        return {
          openAIPlaygroundId: newPlayground!.id,
          playground: playgroundCreated!,
        };
      } catch (error) {
        console.log(error);
      }
    } else {
      if (playground.active) {
        return {
          openAIPlaygroundId: playground!.threadId,
          playground: playground!,
        };
      } else {
        try {
          const newPlayground = await openai.beta.threads.create();

          const playgroundCreated = await Playground.create({
            name: '',
            threadId: newPlayground.id,
            workspace: workspace,
          }).save();

          // console.console.log(newPlayground.id);
          return {
            openAIPlaygroundId: newPlayground!.id,
            playground: playgroundCreated!,
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