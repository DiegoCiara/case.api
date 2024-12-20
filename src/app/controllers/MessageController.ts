import axios from 'axios';
import { Request, Response } from 'express';
import Messages from '@entities/Message';
import queryBuilder from '@utils/queryBuilder';
import Pipeline from '@entities/Pipeline';
import Deal from '@entities/Deal';
import Contact from '@entities/Contact';
import Workspace from '@entities/Workspace';
import User from '@entities/User';
import Thread from '@entities/Thread';
import { sendMessage } from '@utils/whatsapp/whatsapp';
import { log } from '@utils/createLog';

interface MessageInterface {
  id?: string;
  name?: string;
  contactId: string;
  threadId: string;
  workspaceId: string;
  userId: string;
  content: string;
}

class MessageController {
  public async findByThread(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      if (!id) return res.status(400).json({ message: 'Please send a contact id' });

      const thread = await Thread.findOne(id, { relations: ['messages', 'workspace', 'contact'] });

      if (!thread) return res.status(404).json({ message: 'Cannot find threads for this chat, try again' });

      await log('messages', req, 'findByThread', 'success', JSON.stringify({ id: id }), id);
      return res.status(200).json(thread!.messages);
    } catch (error) {
      await log('messages', req, 'findByThread', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Cannot find threads, try again' });
    }
  }

  public async sendMessageWidget(req: Request, res: Response): Promise<Response> {
    try {
      const { contactId, workspaceId, threadId, content, userId }: MessageInterface = req.body;

      if (!content || !contactId || !workspaceId || !userId) return res.status(400).json({ message: 'Invalid message values' });

      const thread = await Thread.findOne(threadId);

      const workspace = await Workspace.findOne(workspaceId);

      const contact = await Contact.findOne(contactId);

      const user = await User.findOne(userId);

      const message = await Messages.create({
        workspace,
        contact,
        thread,
        user,
        content,
        from: 'USER',
      }).save();

      if (!message) return res.status(400).json({ message: 'Cannot create message, try again' });
      await log('messages', req, 'sendMessageWidget', 'success', JSON.stringify(req.body), message);
      return res.status(201).json({ id: message.id, message: 'Messages created successfully' });
    } catch (error) {
      await log('messages', req, 'sendMessageWidget', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Create failed, try again' });
    }
  }
  public async sendMessageWhatsApp(req: Request, res: Response): Promise<Response> {
    try {
      const { contactId, workspaceId, threadId, content, userId }: MessageInterface = req.body;

      if (!content || !contactId || !workspaceId || !userId) return res.status(400).json({ message: 'Invalid message values' });
      // Implementar validação de id

      const thread = await Thread.findOne(threadId);

      const workspace = await Workspace.findOne(workspaceId);

      const contact = await Contact.findOne(contactId);

      const user = await User.findOne(userId);

      const message = await Messages.create({
        workspace,
        contact,
        thread,
        user,
        content,
        from: 'USER',
      }).save();

      await sendMessage(workspace!.id, thread!.assistant?.session?.token, contact!.phone, content);

      if (!message) return res.status(400).json({ message: 'Cannot create message, try again' });

      await log('messages', req, 'sendMessageWhatsApp', 'success', JSON.stringify(req.body), message);
      return res.status(201).json({ id: message.id, message: 'Messages created successfully' });
    } catch (error) {
      await log('messages', req, 'sendMessageWhatsApp', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Create failed, try again' });
    }
  }
}

export default new MessageController();

