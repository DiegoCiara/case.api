import Thread from '@entities/Thread';
import Workspace from '@entities/Workspace';
import OpenAI from 'openai';
import { RunSubmitToolOutputsParamsNonStreaming } from 'openai/resources/beta/threads/runs/runs';
import { createDealCustomer } from '../actions/createDealCustomer';
import Message from '@entities/Message';
import { createCustomer } from '../actions/createCustomer';
import { getDeal } from '../actions/getDeal';
import { getCustomer } from '../actions/getCustomer';
import { createAction } from '../functions/createAction';
import { log } from '@utils/createLog';
import Log from '@entities/Log';
import User from '@entities/User';
import Assistant from '@entities/Assistant';
import { createMeet } from '../actions/createMeet';
import { getTime } from '../actions/getTime';

// Função para verificar se existe um run ativo
export async function getActiveRun(openai: OpenAI, threadId: string) {
  try {
    const runs = await openai.beta.threads.runs.list(threadId);
    return runs.data.find((run: any) => run.status === 'active');
  } catch (error) {
    console.error(error);
  }
}

export async function checkRun(openai: OpenAI, thread: Thread, runId: string, workspace: Workspace, assistant: Assistant): Promise<any> {
  return await new Promise((resolve, reject) => {
    let timeoutId: NodeJS.Timeout;

    const verify = async (): Promise<void> => {
      const runStatus = await openai.beta.threads.runs.retrieve(thread.threadId, runId);
      console.log(runStatus.required_action);
      console.log(runStatus.required_action?.submit_tool_outputs)
      console.log(runStatus.required_action?.submit_tool_outputs.tool_calls)
      console.log('---------------------------------------------------------------------')
      if (runStatus.status === 'completed') {
        clearTimeout(timeoutId); // Limpa o timeout se o status for 'completed'
        const messages = await openai.beta.threads.messages.list(thread.threadId);
        resolve(messages);
      } else if (runStatus.status === 'failed') {
        resolve(null);
      } else if (runStatus.status === 'requires_action') {
        const toolCalls = runStatus.required_action?.submit_tool_outputs?.tool_calls || [];
        try {
          const toolOutputs = await Promise.all(
            toolCalls.map(async (tool: any) => {
              // console.log(tool);
              // console.log(tool?.submit_tool_outputs?.tool_calls);

              if (tool.function.name === 'getCustomer') {
                const args = tool?.function?.arguments;
                try {
                  const action = await getCustomer(thread.contact, workspace, assistant);
                  // console.log(tool);
                  console.log(tool?.submit_tool_outputs?.tool_calls);
                  // Esta Action Não pode ter criaçao de log de actions na falha, pois é essencial que falhe
                  let message = action?.message;
                  await createAction(tool.id, workspace, thread, thread.assistant, 'getCustomer', JSON.parse(args), action, 'COMPLETED');
                  return {
                    tool_call_id: tool.id,
                    output: message,
                  };
                } catch (error) {
                  console.error('errorSS', error);
                  await createAction(
                    tool.id,
                    workspace,
                    thread,
                    thread.assistant,
                    'getCustomer',
                    JSON.parse(args),
                    { error: error },
                    'FAILED'
                  );
                  return {
                    tool_call_id: tool.id,
                    output: 'Ocorreu um erro ao tentar executar a função, tente novamente',
                  };
                }
              }

              if (tool.function.name === 'createCustomer') {
                const args = tool.function.arguments;
                try {
                  const action = await createCustomer(thread.contact, workspace, args);
                  console.log(tool?.submit_tool_outputs?.tool_calls);
                  let message = action?.message;
                  await createAction(tool.id, workspace, thread, thread.assistant, 'createCustomer', JSON.parse(args), action, 'COMPLETED');
                  return {
                    tool_call_id: tool.id,
                    output: message,
                  };
                } catch (error) {
                  console.error('errorSS', error);
                  await createAction(
                    tool.id,
                    workspace,
                    thread,
                    thread.assistant,
                    'createCustomer',
                    JSON.parse(args),
                    { error: error },
                    'FAILED'
                  );
                  return {
                    tool_call_id: tool.id,
                    output: 'Ocorreu um erro ao tentar executar a função, tente novamente',
                  };
                }
              }
              if (tool.function.name === 'getTime') {
                const args = tool.function.arguments;
                try {
                  const action = await getTime();
                  console.log(tool?.submit_tool_outputs?.tool_calls);
                  let message = action?.message;
                  await createAction(tool.id, workspace, thread, thread.assistant, 'getTime', JSON.parse(args), action, 'COMPLETED');
                  return {
                    tool_call_id: tool.id,
                    output: message,
                  };
                } catch (error) {
                  console.error('errorSS', error);
                  await createAction(
                    tool.id,
                    workspace,
                    thread,
                    thread.assistant,
                    'getTime',
                    JSON.parse(args),
                    { error: error },
                    'FAILED'
                  );
                  return {
                    tool_call_id: tool.id,
                    output: 'Ocorreu um erro ao tentar executar a função, tente novamente',
                  };
                }
              }

              if (tool.function.name === 'createMeet') {
                const args = tool.function.arguments;
                try {
                  const action = await createMeet(thread.contact, workspace, args);
                  console.log(tool?.submit_tool_outputs?.tool_calls);
                  let message = action?.message;
                  await createAction(tool.id, workspace, thread, thread.assistant, 'createMeet', JSON.parse(args), action, 'COMPLETED');
                  return {
                    tool_call_id: tool.id,
                    output: message,
                  };
                } catch (error) {
                  console.error('errorSS', error);
                  await createAction(
                    tool.id,
                    workspace,
                    thread,
                    thread.assistant,
                    'createMeet',
                    JSON.parse(args),
                    { error: error },
                    'FAILED'
                  );
                  return {
                    tool_call_id: tool.id,
                    output: 'Ocorreu um erro ao tentar executar a função, tente novamente',
                  };
                }
              }

              if (tool.function.name === 'createDealCustomer') {
                const args = tool.function?.arguments;
                try {
                  const action = await createDealCustomer(thread.contact, workspace, thread, args);
                  console.log(tool?.submit_tool_outputs?.tool_calls);
                  let message = action?.message;
                  await createAction(
                    tool.id,
                    workspace,
                    thread,
                    thread.assistant,
                    'createDealCustomer',
                    JSON.parse(args),
                    action,
                    'COMPLETED'
                  );
                  return {
                    tool_call_id: tool.id,
                    output: message,
                  };
                } catch (error) {
                  console.error('errorSS', error);
                  await createAction(
                    tool.id,
                    workspace,
                    thread,
                    thread.assistant,
                    'createDealCustomer',
                    JSON.parse(args),
                    { error: error },
                    'FAILED'
                  );
                  return {
                    tool_call_id: tool.id,
                    output: 'Ocorreu um erro ao tentar executar a função, tente novamente',
                  };
                }
              }

              if (tool.function.name === 'createDeal') {
                const args = tool.function?.arguments;
                try {
                  const action = await createDealCustomer(thread.contact, workspace, thread, args);
                  console.log(tool?.submit_tool_outputs?.tool_calls);
                  let message = action?.message;
                  await createAction(
                    tool.id,
                    workspace,
                    thread,
                    thread.assistant,
                    'createDealCustomer',
                    JSON.parse(args),
                    action,
                    'COMPLETED'
                  );
                  return {
                    tool_call_id: tool.id,
                    output: message,
                  };
                } catch (error) {
                  console.error('errorSS', error);
                  await createAction(
                    tool.id,
                    workspace,
                    thread,
                    thread.assistant,
                    'createDealCustomer',
                    JSON.parse(args),
                    { error: error },
                    'FAILED'
                  );
                  return {
                    tool_call_id: tool.id,
                    output: 'Ocorreu um erro ao tentar executar a função, tente novamente',
                  };
                }
              }

              if (tool.function.name === 'getDeal') {
                const args = tool.function?.arguments;
                try {
                  const action = await getDeal(thread.contact, workspace, args);
                  console.log(tool?.submit_tool_outputs?.tool_calls);
                  let message = action?.message;
                  await createAction(tool.id, workspace, thread, thread.assistant, 'getDeal', JSON.parse(args), action, 'COMPLETED');
                  return {
                    tool_call_id: tool.id,
                    output: message || 'Ocorreu um erro ao consultar as informações da negociação, tente novamente',
                  };
                } catch (error) {
                  console.error('errorSS', error);
                  await createAction(tool.id, workspace, thread, thread.assistant, 'getDeal', JSON.parse(args), { error: error }, 'FAILED');
                  return {
                    tool_call_id: tool.id,
                    output: 'Ocorreu um erro ao tentar executar a função, tente novamente',
                  };
                }
              }
              // Colocar outras funções

              return null;
            })
          );

          if (toolOutputs.length > 0) {
            console.log('toolOutputs', toolOutputs);
            const run = await openai.beta.threads.runs.submitToolOutputsAndPoll(thread.threadId, runStatus.id, {
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

