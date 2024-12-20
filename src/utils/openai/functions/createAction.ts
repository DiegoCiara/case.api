import Action from "@entities/Action";
import Assistant from "@entities/Assistant";
import Thread from "@entities/Thread";
import Workspace from "@entities/Workspace";

export async function createAction(callId: string, workspace: Workspace, thread: Thread, assistant: Assistant, command: string, args: any, output: any, status: string){
  try {
    const action = await Action.create({ callId, workspace, command, thread, assistant, arguments: args, output, status }).save()
    return action;
  } catch (error) {
    console.log(error)
  }
}