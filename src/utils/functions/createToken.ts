import Thread from '@entities/Thread';
import Token from '@entities/Token';
import Workspace from '@entities/Workspace';
import { Run } from 'openai/resources/beta/threads/runs/runs';


export async function token(
  workspace: Workspace,
  threadId: string,
  run: Run,
  model: string,
  inputMessage: any,
  outputMessage: any,
  type: string
): Promise<void>{
  try {
    const thread = await Thread.findOne({ where: { threadId: threadId } });

    const token = await Token.create({
      workspace: workspace,
      total_tokens: run.usage!.total_tokens,
      completion_tokens: run.usage!.completion_tokens,
      thread: thread,
      model: model,
      prompt_tokens: run.usage!.prompt_tokens,
      input: inputMessage,
      output: outputMessage,
    }).save();

    return
  } catch (error) {
    console.log(error);
  }
}
