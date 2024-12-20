// import OpenAI from 'openai';
// import dotenv from 'dotenv';
// import Thread from '@entities/Thread';
// import Workspace from '@entities/Workspace';
// import Token from '@entities/Token';
// import Message from '@entities/Message';
// import { actions } from '../actions';
// import { checkRunStatus, getActiveRun } from './checkRunStatus';
// import Contact from '@entities/Contact';
// import { decrypt } from '@utils/encrypt';
// import Assistant from '@entities/Assistant';

// dotenv.config();

// // const openai = new OpenAI({
// //   apiKey: process.env.OPENAI_KEY,
// // });

// export async function reRun(contact: Contact, workspace: Workspace, thread: Thread, assistant: Assistant, openAIThreadId: string): Promise<any> {
//   const apiKey = await decrypt(workspace!.openaiApiKey);
//   const openai = new OpenAI({ apiKey });

//   try {
//     const openAIAssistant = await openai.beta.assistants.retrieve(assistant.openaiAssistantId!);

//     // let activeRun = await getActiveRun(openai, openAIThreadId);

//     // if (activeRun) {
//     //   const messages = await checkRunStatus({ openai, threadId: openAIThreadId, runId: activeRun.id });
//     //   return {
//     //     openAIThreadId: openAIThreadId,
//     //     text: messages.data[0].content[0].text.value.replace(/【\d+:\d+†[^\]]+】/g, ''),
//     //   };
//     // }

//     await openai.beta.threads.messages.create(openAIThreadId, {
//       role: 'assistant',
//       content:
//         'ACTION executada com sucesso, apenas continue a conversa com o cliente e forneça apenas as orientações que estão nos documentos',
//     });

//     const run = await openai.beta.threads.runs.create(openAIThreadId, {
//       assistant_id: openAIAssistant.id,
//       instructions: instructions,
//     });

//     const messages = await checkRunStatus({ openai, threadId: openAIThreadId, runId: run.id });
//     if (!messages) {
//       return {
//         openAIThreadId: openAIThreadId,
//         text: 'Tive um problema em processar sua mensagem, poderia tentar novamente mais tarde?',
//       };
//     }

//     const runStatus = await openai.beta.threads.runs.retrieve(openAIThreadId, run.id);

//     const workspaceMessage = messages.data[0].content[0].text.value.replace(/【\d+:\d+†[^\]]+】/g, '');

//     const response = await Message.create({
//       workspace: workspace,
//       thread: thread,
//       type: 'text',
//       contact: contact,
//       content: workspaceMessage,
//       from: 'ASSISTANT',
//     }).save();

//     await actions(workspace!, contact, thread!, workspaceMessage, response);

//     const token = await Token.create({
//       workspace: workspace,
//       total_tokens: runStatus!.usage!.total_tokens,
//       completion_tokens: runStatus!.usage!.completion_tokens,
//       thread: thread,
//       model: openAIAssistant.model,
//       prompt_tokens: runStatus!.usage!.prompt_tokens,
//       input: '',
//       output: messages.data[0].content[0].text.value,
//     }).save();

//     return {
//       text: response,
//     };
//   } catch (error) {
//     console.error('Error processing user message:', error);
//   }
// }

