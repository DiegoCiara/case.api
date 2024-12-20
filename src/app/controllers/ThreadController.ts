

class ThreadController {
  // public async runThread(req: Request, res: Response): Promise<any> {
  //   try {
  //     const { messageBody, message, sessionClient, number, name, type, mimeType, caption, fromMe } = req.body;
  //     if (fromMe) return;
  //     let messageReceived = message;
  //     let mediaUrl: any = '';
  //     const id = uuidv4();
  //     const captionMessage = caption ? caption : '';
  //     const isImage = type === 'image';
  //     const isAudio = mimeType === 'audio/ogg; codecs=opus' && !isImage;
  //     const usage = 'wpp';
  //     const typeMessage = await typeWppMessage(req.body);
  //     const chatId = number;
  //     const session = await Session.findOne(sessionClient, { relations: ['workspace', 'assistant'] });
  //     console.log(chatId)

  //     const assistant = await Assistant.findOne(session?.assistant.id, {
  //       relations: [ 'workspace','workspace.accesses','workspace.accesses.user', 'session', 'funnels', 'funnels.pipelines'],
  //     });

  //     const workspace = assistant.workspace

  //     if (!session) {
  //       return res.status(200).json('ok');
  //     }

  //     if (!assistant) {
  //       return res.status(200).json('ok');
  //     }


  //     const contact = await checkContact(usage, number, null, workspace!);

  //     // console.log(contact)

  //     if (!contact) {
  //       return res.status(200).json('ok');
  //     }

  //     const threadFinded = await Thread.findOne({
  //       where: { contact: contact, chatActive: true, assistant },
  //       relations: ['assistant', 'assistant.session', 'contact','contact.customer', 'landingpage'],
  //     });

  //     const { thread } = await checkThread(threadFinded!, workspace!, assistant, usage, contact);


  //     const messageCreated = await Message.create({
  //       workspace,
  //       contact: contact,
  //       type: typeMessage,
  //       mediaUrl: mediaUrl!,
  //       assistant,
  //       thread,
  //       content: !isImage ? messageReceived : captionMessage,
  //       from: 'CONTACT',
  //     }).save();


  //     if(!thread) return res.status(200).json('ok');

  //     if (threadFinded && thread) {
  //       await Thread.update(threadFinded!.id, { name: `${new Date()}` });
  //     }
  //     if (isAudio) {
  //       mediaUrl = await convertDataAudio(messageBody, id, workspace, thread);

  //       messageReceived = await whisper(id, workspace, assistant, mediaUrl, thread);
  //     } else if (isImage) {
  //       mediaUrl = await convertDataImage(messageBody, id, workspace, thread);
  //       const imageDimensions = await saveDimensionsImage(mediaUrl, workspace, assistant, thread);
  //       console.log(imageDimensions);
  //     }
  //     if(threadFinded && threadFinded.contact.customer){
  //       const lastUpdatedDeal = await Deal.findOne({
  //           where: {
  //               customer: threadFinded.contact.customer, // Substitua `customer` pelo valor correto para o cliente
  //               status: In(['INPROGRESS', 'PENDING']) // Filtro pelo status desejado
  //           },
  //           relations:['pipeline', 'pipeline.funnel'],
  //           order: {
  //               updatedAt: 'DESC' // Ordena pela data de atualização mais recente
  //           }
  //       });
  //       if(lastUpdatedDeal){
  //         console.log('=============================================================>', lastUpdatedDeal?.pipeline?.funnel?.id)
  //         await Deal.update(lastUpdatedDeal.id, { observations: lastUpdatedDeal.observations})
  //         eventEmitter.emit(`pipelineDeals`, lastUpdatedDeal?.pipeline?.funnel?.id);
  //       }
  //     }

  //     eventEmitter.emit(`threads`, workspace);
  //     eventEmitter.emit(`thread`, thread, workspace);
  //     eventEmitter.emit(`newMessage`, thread, messageCreated);


  //     (await ioSocket).emit(thread.id, messageCreated);

  //     if (!assistant.wppEnabled) {
  //       // const waitTime = delaySeconds - differenceInSeconds(now, lastUpdated);
  //       console.log('Assistente Sem permissão');
  //       return;
  //     }

  //     if (thread && (!thread.chatActive || thread!.responsible === 'USER')) {
  //       console.log('Este chat está inativo ou não está atribuído à assistente', thread.id);
  //       eventEmitter.emit(`threads`, workspace);
  //       eventEmitter.emit(`newMessage`, thread, messageCreated);
  //       return;
  //     }

  //     function openaiMessage() {
  //       if (isImage) {
  //         return caption
  //           ? [
  //               { type: 'text', text: captionMessage },
  //               { type: 'image_url', image_url: { url: mediaUrl } },
  //             ]
  //           : [{ type: 'image_url', image_url: { url: mediaUrl } }];
  //       } else {
  //         return [{ type: 'text', text: messageReceived }];
  //       }
  //     }

  //     const msg = await openaiMessage();

  //     const answer = await openAI(contact, workspace, assistant, thread!, thread.threadId, msg, 'user');

  //     await sendMessage(session.id, session.token, chatId,(answer?.text.content));
  //     // Adaptar para novos canais de comunicações

  //     if (threadFinded && thread) {
  //       await Thread.update(threadFinded!.id, { name: `${new Date()}` });
  //     }

  //     eventEmitter.emit(`threads`, workspace);
  //     eventEmitter.emit(`newMessage`, thread, answer.text);
  //     eventEmitter.emit(`thread`, thread, workspace);

  //     // Validações para os dados da assinatura
  //     await log('openai', req, 'openAI', 'success', JSON.stringify(messageCreated.content), answer?.text.content);

  //     return res.status(200).json('ok');
  //   } catch (error) {
  //     await log('openai', req, 'openAI', 'success', JSON.stringify(error), null);
  //     console.log(error)
  //     return res.status(500).json({ error: 'Error creating subscription' });
  //   }
  // }
}

export default new ThreadController();

