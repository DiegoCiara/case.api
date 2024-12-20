import Workspace from '@entities/Workspace';
import Contact from '@entities/Contact';
import { formatPhone } from '@utils/format';

export async function checkContact(usage: string, phone: any, email: any, workspace: Workspace): Promise<any> {
  try {
    if (usage === 'wpp') {
      // Quando o usuário vim pelo WhatsApp, vamos procura-lo pelo número de telefone;
      const contact = await Contact.findOne({ where: { phone: formatPhone(phone), workspace }, relations: ['customer', 'customer.groups'] });
      if (!contact) {
        const contactCreated = await Contact.create({
          phone: formatPhone(phone),
          email: email,
          workspace,
        }).save();
        return contactCreated;
      } else {
        return contact;
      }
    } else {
      // Quando o usuário vim qualquer outro canal de comunicação, vamos procura-lo pelo email;
      const contact = await Contact.findOne({ where: { email: email, workspace }, relations: ['customer', 'customer.groups'] });

      if (!contact) {
        const contactCreated = await Contact.create({
          phone: phone,
          email: email,
          workspace
        }).save();

        return contactCreated;
      } else {
        return contact;
      }
    }
  } catch (error) {
    console.error(error);
  }
}

export async function hasContact(phone: any, email: any, workspace: Workspace) {
  try {
    if (phone && email) {
      const contact = await Contact.findOne({ where: { phone: phone, email: email, workspace } });
      if (!contact) {
        const contactWithPhone = await Contact.findOne({ where: { phone: phone, workspace } });
        if (!contactWithPhone) {
          const contactWithEmail = await Contact.findOne({ where: { email: email, workspace } });
          if (!contactWithEmail) {
            return null;
          } else {
            return contactWithEmail;
          }
        } else {
          return contactWithPhone;
        }
      } else {
        return contact;
      }
    } else if (phone && !email) {
      const contact = await Contact.findOne({ where: { phone: phone, workspace } });
      if (!contact) {
        return null;
      } else {
        return contact;
      }
    } else if (!phone && email) {
      const contact = await Contact.findOne({ where: { email: email, workspace } });
      if (!contact) {
        return null;
      } else {
        return contact;
      }
    }
  } catch (error) {
    console.error;
  }
}

