import Thread from '@entities/Thread';
import Token from '@entities/Token';
import Workspace from '@entities/Workspace';

export async function token(workspace: Workspace, threadId: string, run: any, model: string, inputMessage: any, outputMessage: any) {
  try {
    const thread = await Thread.findOne({ where: threadId });


    const token = await Token.create({
      workspace: workspace,
      total_tokens: run!.usage!.total_tokens,
      completion_tokens: run!.usage!.completion_tokens,
      thread: thread,
      model: model,
      prompt_tokens: run!.usage!.prompt_tokens,
      input: inputMessage,
      output: outputMessage,
    }).save();
  } catch (error) {
    console.log(error);
  }
}

