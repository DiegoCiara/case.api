import { Server } from 'socket.io';
import Users from '@entities/User';
import { mainOpenAI } from '@utils/openai';
import {
  generateToken,
  getConnectionClient,
  logOffClient,
  sendAudio,
  sendAudio64,
  sendImage,
  sendMessage,
  startSession,
} from '@utils/whatsapp/whatsapp';
import { io } from 'socket.io-client';
import dotenv from 'dotenv';
import Workspace from '@entities/Workspace';
import amqp, { Channel } from 'amqplib/callback_api';
import Thread from '@entities/Thread';
import Contact from '@entities/Contact';
import { openAI } from '@utils/openai/openai';
import eventEmitter from '@utils/emitter';
import Notification from '@entities/Notification';
import { In, getRepository } from 'typeorm';
import Message from '@entities/Message';
import Deal from '@entities/Deal';
import User from '@entities/User';
import { createMessage, createMessageByContact } from '@utils/messages';
import { threadId } from 'worker_threads';
import Access from '@entities/Access';
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import { formatDateTime, formatMessageWhatsApp, formatPhone, formatToWhatsAppNumber } from '@utils/format';
import { checkThread, checkThreadPlatform } from '@utils/openai/checks/checkThread';
import { checkContact } from '@utils/openai/checks/checkContact';
// import { reRun } from '@utils/openai/checks/reRun';
import Session from '@entities/Session';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { convertDataImage, saveDataImage } from '@utils/openai/functions/convertImageData';
import { processQueue } from '@utils/rabbitMq/proccess';
import { convertDataAudio, getAwsBase64 } from '@utils/openai/functions/convertAudioData';
import Assistant from '@entities/Assistant';
import Funnel from '@entities/Funnel';
import { proccessPlayground } from '@utils/rabbitMq/chat/playground/playground';
import Playground from '@entities/Playground';
import { sendToQueue } from '@utils/rabbitMq/send';
import { processThreads } from '@utils/rabbitMq/chat/thread/thread';
import { convertWebmToOgg } from '@utils/convertOgg';

dotenv.config();

const SOCKET_SERVER_URL = process.env.SOCKET_SERVER_URL as string;

interface MessageInterface {
  viewed: boolean;
}

export async function SocketEmitController(socketPlatform: Server) {
  const wppconnect = io(SOCKET_SERVER_URL);
  // await startPeriodicProcessing();
  wppconnect.on('connect', () => {
    console.log('Socket WPP Conectado');
  });

  socketPlatform.on('connect', async (socket) => {
    console.log('Usuário conectado');

    async function permission(userId: string, workspaceId: string){
      if (!userId || !workspaceId || !uuidValidate(workspaceId)) return;
      const user = await User.findOne(userId, {
        select: ['id', 'email', 'name', 'passwordResetToken', 'passwordHash', 'picture',],
      });
      const workspace = await Workspace.findOne(workspaceId);
      const access = await Access.findOne({ where: { user, workspace } });
      const result = {
        role: access?.role,
        hasOpenaiApiKey: workspace?.openaiApiKey ? true : false
      }
      socket.emit(`permission:${userId}`, result);
    }
    socket.off('permission', permission)
    socket.on('permission', permission);


    const newMessage =  async (thread: Thread, message: Message) => {
      // console.log('mensagem emitida', thread.id, message.content);
      const sockt = `${thread.assistant.id}:${thread.id}:${thread.contact.id}`;
      // console.log(sockt);
      // const emmiter = `${thread.contact.phone}`;
      socket.emit(sockt, message);
    }
    eventEmitter.off('newMessage', newMessage);
    eventEmitter.on('newMessage', newMessage);


    const connectThread = async (threadId: string) => {
      const thread = await Thread.findOne(threadId, {
        relations: [
          'contact',
          'contact.customer',
          'contact.customer.contact',
          'contact.customer.deals',
          'contact.customer.deals.sales',
          'deal',
          'messages',
          'messages.contact',
          'messages.workspace',
          'messages.user',
          'user',
        ],
      });

      socket.emit('threadId', thread);
    }
    socket.off('connectThread', connectThread);
    socket.on('connectThread', connectThread);


    const notify =async (userId: string, workspaceId: string) => {
      if (!userId || !workspaceId || !uuidValidate(workspaceId)) return;
      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) return;
      const user = await User.findOne(userId);
      const notifications = getRepository(Notification);

      const notificationNotViewed = await notifications.find({
        where: {
          workspace,
          user,
          viewed: false,
        },
      });

      socket.emit(`notifications:${workspace.id}`, notificationNotViewed);
    }
    socket.off('notify', notify);
    socket.on('notify', notify);



    const newNotification = async (notification: Notification) => {
      const workspace = notification.workspace;
      const user = notification.user;

      const notifications = getRepository(Notification);

      const notificationNotViewed = await notifications.find({
        where: {
          workspace,
          user,
          viewed: false,
        },
      });

      socket.emit(`notifications:${workspace.id}`, notificationNotViewed);
      socket.emit(`newNotification:${workspace.id}`, notification);
    }
    eventEmitter.off('newNotification',newNotification);
    eventEmitter.on('newNotification',newNotification);


    const activeFunnels = async (workspaceId: Notification) => {
      socket.emit(`activeFunnels:${workspaceId}`, '');
    }
    eventEmitter.off('activeFunnels',activeFunnels );
    eventEmitter.on('activeFunnels',activeFunnels );

    const pipelineDeals = async (funnelId: string) => {
      const funnel = await Funnel.findOne(funnelId, { relations: ['workspace'] })
      if(!funnel)return;
      socket.emit(`pipelineDeals:${funnelId}`, '');
      socket.emit(`dashboard:${funnel.workspace.id}`, '');
    }
    eventEmitter.off('pipelineDeals', pipelineDeals);
    eventEmitter.on('pipelineDeals', pipelineDeals);


    const thread = async (thread: Thread, workspace: Workspace) => {
      const threadFinded = await Thread.findOne(thread.id, {
        where: {
          workspace,
        },
        relations: [
          'contact',
          'contact.customer',
          'contact.customer.groups',
          'deal',
          'messages',
          'messages.contact',
          'messages.contact.customer',
          'messages.workspace',
          'messages.user',
          'user',
        ],
      });
      socket.emit(`thread:${threadFinded!.id}`, threadFinded);
    }
    eventEmitter.off('thread', thread);
    eventEmitter.on('thread', thread);

    const threads =  async (workspace: Workspace) => {
      const threads = await Thread.find({
        where: {
          workspace: workspace,
          usage: In(['wpp']),
        },
        relations: ['contact', 'contact.customer', 'contact.customer.groups', 'workspace', 'user', 'messages'],
        order: { updatedAt: 'DESC' },
      });

      socket.emit(`threads:${workspace.id}`, threads);
    }
    eventEmitter.off('threads',threads);
    eventEmitter.on('threads',threads);


    const notifyEmmitter =  async (userId: string, workspaceId: string) => {
      try {
        if (!userId || !workspaceId || !uuidValidate(workspaceId)) return;

        const workspace = await Workspace.findOne(workspaceId);

        if(!workspace) return

        const user = await User.findOne(userId);

        if(!user) return

        const notifications = Notification.find({ where: { user, workspace, viewed: false } });

        socket.emit(`notifications:${workspace.id}`, notifications);
      } catch (error) {
        console.error(error);
      }
    }
    eventEmitter.off('notify',notifyEmmitter);
    eventEmitter.on('notify',notifyEmmitter);


    const viewMessages = async (threadId: string) => {
      const thread = await Thread.findOne(threadId, { relations: ['messages', 'workspace'] });
      if (!thread) {
        console.log('Thread não encontrada');
        return;
      }

      for (const message of thread.messages) {
        if (!message.viewed) {
          // Atualizar a mensagem com a propriedade 'viewed' para 'true'
          const messageIn = { viewed: true };
          await Message.update(message.id, messageIn as QueryDeepPartialEntity<Message>);
        }
      }

      eventEmitter.emit('threads', thread.workspace);
    }
    socket.off('viewMessages', viewMessages);
    socket.on('viewMessages', viewMessages);


    const playgroundMessages =async (playId: string) => {
      if(!playId) return;
      const playground = await Playground.findOne(playId, { relations: ['messages']});
      if(!playId || !playground) return;
      socket.emit(`playgroundMessages:${playId}`, playground.messages)
    }
    socket.off('playgroundMessages', playgroundMessages);
    socket.on('playgroundMessages', playgroundMessages);

    const sendPlaygroundMessage =  async (playId: string, content: string) => {

      if(!playId || !uuidValidate(playId)) {
        socket.emit('errorPlayground', '')
        return;
      }
      try {
        const playground = await Playground.findOne(playId, { relations: [ 'workspace', 'assistant', 'user']});

        if(!playground) return;

        const msg = [{ type: 'text', text: content }];
        const followUpPayload = {
          workspaceId: playground.workspace.id,
          assistantId: playground.assistant.openaiAssistantId,
          playgroundId: playground.id,
          accessId: playground.user.id,
          message: msg
        }
        await sendToQueue('playgrounds', (followUpPayload));
        await proccessPlayground()
        return;
      } catch (error) {
        console.log(error)
        return
      }
    }
    socket.off('sendPlaygroundMessage',sendPlaygroundMessage)
    socket.on('sendPlaygroundMessage',sendPlaygroundMessage)


    const sendChatMessage =  async (playId: string, content: string) => {
      console.log(playId, content)
      if(!playId || !uuidValidate(playId)) {
        socket.emit('errorChat', '')
        return;
      }
      try {
        const thread = await Thread.findOne(playId, { relations: [ 'workspace', 'assistant', 'contact']});

        if(!thread) return;

        const msg = [{ type: 'text', text: content }];


      const followUpPayload = {
        workspaceId: thread.workspace.id,
        assistantId: thread.assistant.id,
        threadId: thread.id,
        contactId: thread.contact.id,
        message: msg
      }

        await sendToQueue('chats', (followUpPayload));
        await processThreads()
        return;
      } catch (error) {
        console.log(error)
        return
      }
    }
    socket.off('sendChatMessage',sendChatMessage)
    socket.on('sendChatMessage',sendChatMessage)


    const toAssumeThread = async (threadId: string) => {
      if(!threadId) return;
      const thread = await Thread.findOne(threadId)
      if(!thread) return
      socket.emit(`onThreadActive:${thread.id}`, thread.responsible)
    }
    socket.off('toAssumeThread', toAssumeThread)
    socket.on('toAssumeThread', toAssumeThread)


    const userMessageThread =  async (message: any, threadId: string, workspaceId: string) => {
      if (!workspaceId || !uuidValidate(workspaceId)) return;
      try {
        let chatId = threadId;
        const usage = 'platform';
        const threadFind = await Thread.findOne({ where: { threadId: chatId, usage: 'platform' } });
        const workspace = await Workspace.findOne(workspaceId);
        if(!workspace) return
        const thread = await checkThreadPlatform(threadFind!, message, workspace, usage);
        if (thread && thread?.chatActive === false) {
          console.log('Este chat está inativo');
          return;
        }
        socket.emit('botMessage', 'answer');
      } catch (error) {
        console.error('Erro ao processar mensagem do usuário:', error);
        socket.emit('error', 'Erro ao processar mensagem');
      }
    }
    socket.off('userMessageThread',userMessageThread);
    socket.on('userMessageThread',userMessageThread);

    // const userWidgetMessage = async (message: any, threadId: , workspaceId, widgetContact) => {
    //   try {
    //     if (!threadId || !widgetContact || !workspaceId || !uuidValidate(workspaceId)) return;
    //     const usage = 'widget';

    //     const workspace = await Workspace.findOne(workspaceId);

    //     const { name, email } = widgetContact;

    //     const contact = await checkContact(usage, null, email, workspace);

    //     const thread = await Thread.findOne({ where: { threadId: threadId }, relations: ['workspace', 'contact', 'assistant'] });

    //     const assistant = thread?.assistant

    //     if (thread && thread?.chatActive === false) {
    //       console.log('Este chat está inativo');
    //       return;
    //     }

    //     const { openAIThreadId } = await checkThread(thread!, workspace!, assistant!, usage, contact);

    //     const answer = await openAI(contact, workspace, assistant!, thread!, openAIThreadId!, message, 'user');

    //     socket.emit('botWidgetMessage', answer);
    //   } catch (error) {
    //     console.error('Erro ao processar mensagem do usuário:', error);
    //     socket.emit('error', 'Erro ao processar mensagem');
    //   }
    // }
    // socket.on('userWidgetMessage', );

    const sendMessageSocket = async (messageReceived: any, image: any, threadId: string, userId: string, workspaceId: string) => {
      try {
        if (!uuidValidate(threadId) || !uuidValidate(userId) || !workspaceId || !uuidValidate(workspaceId)) return;

        const thread = await Thread.findOne(threadId, { relations: ['workspace', 'contact', 'assistant', 'assistant.session'] });

        if(!thread) return;

        const assistant = thread.assistant;

        const workspace = await Workspace.findOne(workspaceId);

        if(!workspace) return ;
        const user = await User.findOne(userId);
        if(!user) return ;

        console.log('MESSAGEEE RECEIVED', messageReceived)

        const message = formatMessageWhatsApp(user.name, messageReceived);

        const { phone } = thread.contact;
        let messageSend: any = '';
        let mediaUrl = '';
        const dataUuid = uuidv4();
        if (image) {
          if (image.type === 'image') {
            messageSend = await sendImage(
              assistant.session.id,
              assistant.session.token,
              formatToWhatsAppNumber(phone),
              message,
              image.data
            );
            mediaUrl = await saveDataImage(image.data, dataUuid, workspace, thread);
          } else {
            const base64Ogg = (image.data);
            console.log(base64Ogg)
            messageSend = await sendAudio(
              assistant.session.id,
              assistant.session.token,
              formatToWhatsAppNumber(phone),
              message,
              base64Ogg
            );
            // mediaUrl = await saveDataImage(image.data, dataUuid, workspace, thread);
          }
        } else {
          messageSend = await sendMessage(assistant.session.id, assistant.session.token, phone, message);
        }
        if(messageSend === 201 || messageSend?.status === 'success'){

          const messages = await Message.create({
            workspace,
            assistant,
            contact: thread!.contact,
            thread,
            mediaUrl,
            type: image ? (image.type === 'image' ? 'image' : 'audio') : 'text',
            viewed: true,
            content: messageReceived,
            from: 'USER',
            user,
          }).save();
          const sockt = `${thread.workspace.id}:${thread.id}:${thread.contact.id}`;

          socket.emit(sockt, messages);
        } else {
          socket.emit(`messageSendError:${thread.id}`, 'Não foi possível enviar a mensagem, tente novamente');
        }
        console.log('messageSend', messageSend)
        // if(messagesSend.status)
      } catch (error) {
        console.error('Erro ao processar mensagem do usuário:', error);
        socket.emit('error', 'Erro ao processar mensagem');
      }
    }
    socket.off('sendMessage', sendMessageSocket);
    socket.on('sendMessage', sendMessageSocket);

    const connectWhatsAppSocket = async (assistantId: string, workspaceId: string) => {
      // Agora a função de conectar fica dentro do cadastro de cada assistente
      if (!workspaceId || !uuidValidate(workspaceId)) return;
      if (!assistantId || !uuidValidate(assistantId)) return;
      try {
        console.log(assistantId, workspaceId)
        const workspace = await Workspace.findOne(workspaceId);
        const assistant = await Assistant.findOne(assistantId, { where: { workspace: workspace },  relations: ['session'] });

        if(!assistant) return;
        if (!assistant.session) {
          const session = await Session.create({ assistant, workspace }).save();

          const token = await generateToken(session.id);

          // await getConnectionClient(session, assistantId);
          await Session.update(session.id, { token });

          await startSession(token, session.id);
        } else {
          console.log('emitido erro')
          socket.emit(`sessionChecked:${assistantId}`, {
            status: 'Disconnected',
            session: assistant.session,
          });
          return;
        }
      } catch (error) {
        console.error('Erro ao buscar detalhes do assistente:', error);

        socket.emit('error', 'Erro ao buscar detalhes do assistente');
      }
    }
    socket.off('connectWhatsApp', connectWhatsAppSocket);
    socket.on('connectWhatsApp', connectWhatsAppSocket);


    const qrCode = async (data: any) => {
      const session = await Session.findOne(data.session, { relations: ['assistant'] });
      console.log('sessão emitida', session)
      if (!session) return;
      socket.emit(`qrCode:${session.assistant.id}`, data);
    }
    wppconnect.off('qrCode',qrCode);
    wppconnect.on('qrCode',qrCode);


    const sessionLogged = async (data: any) => {
      // const { session } = data
      const session = await Session.findOne(data.session, { relations: ['assistant'] });

      if (!session) return;
      const dataEmit = { session: session, status: data.status ? 'Connected' : 'Disconnected'}
      socket.emit(`sessionChecked:${session.assistant.id}`, dataEmit);
    }
    wppconnect.off('session-logged', sessionLogged);
    wppconnect.on('session-logged', sessionLogged);


    const checkWhatsAppConnection = async (assistantId: string) => {
      if (!assistantId || !uuidValidate(assistantId)) return;
      try {
        const assistant = await Assistant.findOne(assistantId, { relations: ['session'] });

        if(!assistant) return
        if (!assistant.session) {
          socket.emit(`sessionChecked:${assistantId}`, {
            status: 'Disconnected',
            session: null,
          });
          return;
        }

        const conection = await getConnectionClient(assistant.session.token, assistant.session.id);

        socket.emit(`sessionChecked:${assistantId}`, conection);
      } catch (error) {
        console.error('Erro ao buscar detalhes do assistente:', error);

        socket.emit('error', 'Erro ao buscar detalhes do assistente');
      }
    }
    socket.off('checkWhatsAppConnection',checkWhatsAppConnection);
    socket.on('checkWhatsAppConnection',checkWhatsAppConnection);



    // socket.on('info-client-deal', async (dealId) => {
    //   try {

    //   const deal = await Deal.findOne(dealId, { relations: ['customer', 'customer.contact', 'threads', 'threads.assistant',  'threads.assistant.session', 'workspace']})
    //   const thread = deal?.threads?.find((e: any) => e.chatActive === true )

    //   const message = { type: 'text', text: 'A negociação do cliente foi atualizada, consulte a negociação e informe ao cliente a nova atualização da negociação dele' }
    //   const openai = await openAI(deal.customer.contact, deal.workspace, thread.assistant, thread, thread.threadId, message, 'assistant')
    //   await sendMessage(thread.assistant.session.id, thread.assistant.session.token, deal?.customer?.contact.phone, openai.text.content);
    // } catch (error) {
    //   console.log(error)
    // }
    // })

    const removeConnection = async (assistantId: string) => {
      if (!assistantId || !uuidValidate(assistantId)) return;
      try {
        const assistant = await Assistant.findOne(assistantId, { relations: ['session'] });

        if (!assistant || !assistant.session) return;

        await logOffClient(assistant.session.token, assistant.session.id);

        const conection = await getConnectionClient(assistant.session.token, assistant.session.id);

        const session = await Session.delete(assistant.session.id);

        const response = {
          status: conection!.status,
          session: null,
        };
        socket.emit(`sessionChecked:${assistantId}`, response);
      } catch (error) {
        console.error('Erro ao buscar detalhes do assistente:', error);

        socket.emit('error', 'Erro ao buscar detalhes do assistente');
      }
    }
    socket.off('remove-connection', removeConnection);
    socket.on('remove-connection', removeConnection);



    const accessPlayground = async (userId: string) => {
      console.log('emitiu')
    socket.emit(`accessPlayground:${userId}`)
    }
    eventEmitter.off(`accessPlayground`, accessPlayground)
    eventEmitter.on(`accessPlayground`, accessPlayground)

    const disconnect = () => {
      console.log('Usuário desconectado');
      socket.removeAllListeners('permission');
      socket.removeAllListeners('connectThread');
      socket.removeAllListeners('sendChatMessage');
      socket.removeAllListeners('notify');
      eventEmitter.removeAllListeners('accessPlayground');
      eventEmitter.removeAllListeners('notify');
      eventEmitter.removeAllListeners('newMessage');
      eventEmitter.removeAllListeners('newNotification');
      eventEmitter.removeAllListeners('activeFunnels');
      eventEmitter.removeAllListeners('pipelineDeals');
      eventEmitter.removeAllListeners('thread');
      eventEmitter.removeAllListeners('threads');
      eventEmitter.removeAllListeners('threads');
      socket.removeAllListeners('viewMessages');
      socket.removeAllListeners('playgroundMessages');
      socket.removeAllListeners('sendPlaygroundMessage');
      socket.removeAllListeners('toAssumeThread');
      socket.removeAllListeners('userMessageThread');
      socket.removeAllListeners('sendMessage');
      socket.removeAllListeners('connectWhatsApp');
      wppconnect.removeAllListeners('qrCode');
      wppconnect.removeAllListeners('session-logged');
      socket.removeAllListeners('checkWhatsAppConnection');
      socket.removeAllListeners('remove-connection');
    }
    socket.off('disconnect', disconnect);
    socket.on('disconnect', disconnect);
  });

  return socketPlatform;
}

