import Workspace from '@entities/Workspace';
import Contact from '@entities/Contact';
import Deal from '@entities/Deal';
import Message from '@entities/Message';
import Thread from '@entities/Thread';
import User from '@entities/User';
import Assistant from '@entities/Assistant';

export async function createMessage(message: string, dealId: string, userId: string, workspaceId: string, assistantId: string, threadId: string) {
  const deal = await Deal.findOne(dealId, { relations: ['thread', 'contact'] });

  const contact = deal!.customer.contact;

  // const dealThread = deal!.thread;

  const thread = await Thread.findOne(threadId);

  const user = await User.findOne(userId);

  const assistant = await Assistant.findOne(assistantId);

  const workspace = await Workspace.findOne(workspaceId);

  const messageCreated = await Message.create({
    thread,
    contact,
    user,
    assistant,
    from: 'USER',
    content: message,
  }).save();

  return {
    content: messageCreated.content,
    wppToken: assistant!.session.token,
    contactPhone: contact.phone,
    user: user,
    thread: thread!,
  };
}

export async function createMessageByContact(message: string, threadId: string, contactPhone: any, contactEmail: any, workspaceId: string) {
  let contact = null;

  if (!contactEmail) {
    contact = await Contact.findOne({ where: { phone: contactPhone } });
  } else {
    contact = await Contact.findOne({ where: { email: contactEmail } });
  }

  const thread = await Thread.findOne(threadId);

  const workspace = await Workspace.findOne(workspaceId);

  const messageCreated = await Message.create({
    thread,
    contact,
    from: 'CONTACT',
    content: message,
    workspace,
  }).save();

  return {
    contactPhone: contact!.phone,
    thread: thread!,
  };
}

