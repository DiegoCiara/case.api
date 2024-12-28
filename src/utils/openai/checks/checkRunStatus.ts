import Thread from '@entities/Thread';
import Workspace from '@entities/Workspace';
import OpenAI from 'openai';
import Log from '@entities/Log';

// Função para verificar se existe um run ativo
export async function getActiveRun(openai: OpenAI, threadId: string) {
  try {
    const runs = await openai.beta.threads.runs.list(threadId);
    return runs.data.find((run: any) => run.status === 'active');
  } catch (error) {
    console.error(error);
  }
}

export async function checkRun(openai: OpenAI, threadId: string, runId: string): Promise<any> {
  return await new Promise((resolve, reject) => {
    let timeoutId: any;

    const verify = async (): Promise<void> => {
      const runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
      console.log(runStatus.required_action);
      console.log(runStatus.required_action?.submit_tool_outputs)
      console.log(runStatus.required_action?.submit_tool_outputs.tool_calls)
      console.log('---------------------------------------------------------------------')
      if (runStatus.status === 'completed') {
        clearTimeout(timeoutId); // Limpa o timeout se o status for 'completed'
        const messages = await openai.beta.threads.messages.list(threadId);
        resolve(messages);
      } else if (runStatus.status === 'failed') {
        resolve(null);
      } else if (runStatus.status === 'requires_action') {
        const toolCalls = runStatus.required_action?.submit_tool_outputs?.tool_calls || [];
        try {
          const toolOutputs = await Promise.all(
            toolCalls.map(async (tool: any) => {

              if (tool.function.name === 'getCustomer') {

              }
              return null;
            })
          );

          if (toolOutputs.length > 0) {
            console.log('toolOutputs', toolOutputs);
            const run = await openai.beta.threads.runs.submitToolOutputsAndPoll(threadId, runStatus.id, {
              tool_outputs: toolOutputs as any[],
            });
            console.log('Tool outputs submitted successfully.');
            verify();
          } else {
            console.log('No tool outputs to submit.');
          }
        } catch (error) {
          console.error(error);

          await Log.create({
            table: 'actions',
            operation: 'runAction',
            // user,
            status: 'failed',
            data: JSON.stringify(error),
          }).save()
          resolve(null);
        }
      } else {
        console.log('Aguardando resposta da OpenAI... Status ==>', runStatus?.status);
        setTimeout(verify, 3000);
      }
    };

    // Define um temporizador de 10 segundos para rejeitar a promessa
    // timeoutId = setTimeout(() => {
    //   resolve(null);
    // }, 15000);

    verify();
  });
}

export async function checkRunStatus({ openai, threadId, runId }: { openai: OpenAI; threadId: string; runId: string }): Promise<any> {
  return await new Promise((resolve, reject) => {
    let timeoutId: NodeJS.Timeout;

    const verify = async (): Promise<void> => {
      const runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
      console.log(runStatus.required_action);
      if (runStatus.status === 'completed') {
        clearTimeout(timeoutId); // Limpa o timeout se o status for 'completed'
        const messages = await openai.beta.threads.messages.list(threadId);
        resolve(messages);
      } else if (runStatus.status === 'failed') {
        resolve(null);
      } else {
        console.log('Aguardando resposta da OpenAI... Status ==>', runStatus?.status);
        setTimeout(verify, 3000);
      }
    };

    timeoutId = setTimeout(() => {
      resolve(null);
    }, 15000);

    verify();
  });
}

