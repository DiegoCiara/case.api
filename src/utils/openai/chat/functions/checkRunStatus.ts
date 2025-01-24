import Thread from '@entities/Thread';
import Workspace from '@entities/Workspace';
import OpenAI from 'openai';
import Log from '@entities/Log';
import { ioSocket } from '@src/socket';
import { runIntegration } from './runIntegration';
import { getTime } from './actions/getTime';
import { createDocument } from './actions/createDocument';

// Função para verificar se existe um run ativo
export async function getActiveRun(openai: OpenAI, threadId: string) {
  try {
    const runs = await openai.beta.threads.runs.list(threadId);
    return runs.data.find((run: any) => run.status === 'active');
  } catch (error) {
    console.error(error);
  }
}

export async function checkRun(openai: OpenAI, workspace: Workspace, threadId: string, runId: string, type: string): Promise<any> {
  return await new Promise((resolve, reject) => {
    let timeoutId: any;

    const verify = async (): Promise<void> => {
      const runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
      // (await ioSocket).emit(`processing-${type}:${threadId}`);
      console.log('---------------------------------------------------------------------');
      if (runStatus.status === 'completed') {
        clearTimeout(timeoutId); // Limpa o timeout se o status for 'completed'
        const messages = await openai.beta.threads.messages.list(threadId);
        resolve(messages);
      } else if (runStatus.status === 'failed') {
        (await ioSocket).emit(`runError-${type}:${threadId}`);
        resolve(null);
      } else if (runStatus.status === 'requires_action') {
        (await ioSocket).emit(`requireAction-${type}:${threadId}`);
        const toolCalls = runStatus.required_action?.submit_tool_outputs?.tool_calls || [];
        try {
          const integrations = workspace.integrations.map((e) => {
            return e;
          });
          const toolOutputs = await Promise.all(
            toolCalls.map(async (tool: any) => {
              const integrationFinded = integrations.find((e) => e.functionName === tool.function.name);
              if (integrationFinded) {
                const args = tool.function.arguments;
                try {
                  const action: any = await runIntegration(integrationFinded, args);
                  let message = action?.message;
                  return {
                    tool_call_id: tool.id,
                    output: message || 'Ocorreu um erro ao tentar executar a função, tente novamente',
                  };
                } catch (error) {
                  return {
                    tool_call_id: tool.id,
                    output: 'Ocorreu um erro ao tentar executar a função, tente novamente',
                  };
                }
              }

              if (tool.function.name === 'getTime') {
                const args = tool?.function?.arguments;
                try {
                  const action = await getTime();
                  let message = action?.message;
                  return {
                    tool_call_id: tool.id,
                    output: message,
                  };
                } catch (error) {
                  console.error('errorSS', error);
                  return {
                    tool_call_id: tool.id,
                    output: 'Ocorreu um erro ao tentar executar a função, tente novamente',
                  };
                }
              }
              if (tool.function.name === 'createDocument') {
                const args = tool?.function?.arguments;
                try {
                  const action = await createDocument(workspace, threadId, args);
                  let message = action?.message;
                  return {
                    tool_call_id: tool.id,
                    output: message,
                  };
                } catch (error) {
                  console.error('errorSS', error);
                  return {
                    tool_call_id: tool.id,
                    output: 'Ocorreu um erro ao tentar executar a função, tente novamente',
                  };
                }
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
            resolve(null);
          }
        } catch (error) {
          console.error(error);

          await Log.create({
            table: 'actions',
            operation: 'runAction',
            status: 'failed',
            data: JSON.stringify(error),
          }).save();

          resolve(null);
        }
      } else {
        console.log('Aguardando resposta da OpenAI... Status ==>', runStatus?.status);
        (await ioSocket).emit(`processing-${type}:${threadId}`);
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

