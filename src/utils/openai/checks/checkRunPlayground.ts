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
import Playground from '@entities/Playground';
import { ioSocket } from '@src/socket';
import { dealQuantity, dealQuantityByUser } from '../actions/playground/dealQuantity';
import { dealValues, dealValuesByUser } from '../actions/playground/dealValues';
import { salesQuantity, salesQuantityByUser } from '../actions/playground/salesQuantity';
import { usersWorkspace } from '../actions/playground/getUsers';
import { salesQuantityUser } from '@utils/dashboard';

// Função para verificar se existe um run ativo
export async function getActiveRun(openai: OpenAI, threadId: string) {
  try {
    const runs = await openai.beta.threads.runs.list(threadId);
    return runs.data.find((run: any) => run.status === 'active');
  } catch (error) {
    console.error(error);
  }
}

export async function checkRunPlayground(openai: OpenAI, playground: Playground, runId: string): Promise<any> {
  return await new Promise((resolve, reject) => {
    let timeoutId: NodeJS.Timeout;

    const verify = async (): Promise<void> => {
      const runStatus = await openai.beta.threads.runs.retrieve(playground.threadId, runId);
      console.log(runStatus.required_action);
      console.log(runStatus.required_action?.submit_tool_outputs)
      console.log(runStatus.required_action?.submit_tool_outputs.tool_calls)
      console.log('---------------------------------------------------------------------')
      if (runStatus.status === 'completed') {
        clearTimeout(timeoutId); // Limpa o timeout se o status for 'completed'
        const messages = await openai.beta.threads.messages.list(playground.threadId);
        resolve(messages);
      } else if (runStatus.status === 'failed') {
        resolve(null);
      } else if (runStatus.status === 'requires_action') {
        const toolCalls = runStatus.required_action?.submit_tool_outputs?.tool_calls || [];
        try {
          const toolOutputs = await Promise.all(
            toolCalls.map(async (tool: any) => {
              if (tool.function.name === 'getTime') {
                const args = tool.function.arguments;
                try {
                  const action = await getTime();
                  console.log(tool?.submit_tool_outputs?.tool_calls);
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
              if (tool.function.name === 'dealValues') {
                const args = tool.function.arguments;
                try {
                  const { startDate, endDate, status } = JSON.parse(args)
                  const action = await dealValues(playground.workspace, status, startDate, endDate);
                  console.log(tool?.submit_tool_outputs?.tool_calls);
                  let message = action.toString();
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
              if (tool.function.name === 'dealValuesByUser') {
                const args = tool.function.arguments;
                try {
                  const { startDate, userId, endDate, status } = JSON.parse(args)
                  const action = await dealValuesByUser(playground.workspace, userId, status, startDate, endDate);
                  console.log(tool?.submit_tool_outputs?.tool_calls);
                  let message = action.toString();
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
              if (tool.function.name === 'dealQuantity') {
                const args = tool.function.arguments;
                try {
                  const { startDate, endDate, status } = JSON.parse(args)
                  const action = await dealQuantity(playground.workspace, status,  startDate, endDate);
                  console.log(tool?.submit_tool_outputs?.tool_calls);
                  let message = action?.toString() || '0';
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
              if (tool.function.name === 'dealQuantityByUser') {
                const args = tool.function.arguments;
                try {
                  const { startDate, userId, endDate, status } = JSON.parse(args)
                  const action = await dealQuantityByUser(playground.workspace, userId, status,  startDate, endDate);
                  console.log(tool?.submit_tool_outputs?.tool_calls);
                  let message = action?.toString() || '0';
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
              if (tool.function.name === 'salesQuantity') {
                const args = tool.function.arguments;
                try {
                  const { startDate, endDate, status } = JSON.parse(args)
                  const action = await salesQuantity(playground.workspace, status,  startDate, endDate);
                  console.log(tool?.submit_tool_outputs?.tool_calls);
                  let message = action?.toString() || '0';
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
              if (tool.function.name === 'salesQuantityByUser') {
                const args = tool.function.arguments;
                try {
                  const { startDate, userId, endDate, status } = JSON.parse(args)
                  const action = await salesQuantityByUser(playground.workspace, userId, status, startDate, endDate);
                  console.log(tool?.submit_tool_outputs?.tool_calls);
                  let message = action?.toString() || '0';
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
              if (tool.function.name === 'usersWorkspace') {
                try {
                  const action = await usersWorkspace(playground.workspace);
                  console.log(tool?.submit_tool_outputs?.tool_calls);
                  let message = action?.toString() || '0';
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
            const run = await openai.beta.threads.runs.submitToolOutputsAndPoll(playground.threadId, runStatus.id, {
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
        (await ioSocket).emit(`proccessing:${playground.id}`, '')
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
