import Group from '@entities/Group';
import Origin from '@entities/Origin';
import Profile from '@entities/Profile';
import { log } from 'console';
import Customer from '@entities/Customer';
import Funnel from '@entities/Funnel';
import Pipeline from '@entities/Pipeline';
import Deal from '@entities/Deal';
import Thread from '@entities/Thread';
import { notify } from '@utils/createNotifications';
import Notification from '@entities/Notification';
// import { reRun } from "../checks/reRun";
import { sendMessage } from '@utils/whatsapp/whatsapp';
import { formatToWhatsAppNumber } from '@utils/format';
import Message from '@entities/Message';
import Workspace from '@entities/Workspace';
import { In } from 'typeorm';
import { getAllWorkspace } from '../instructions';
import Log from '@entities/Log';
import Assistant from '@entities/Assistant';

export async function getCustomer(contact: any, workspace: Workspace, assistant: Assistant): Promise<{ status: string; message: string; object: any | null }> {
  log('Entrou na Action: getCustomer', contact);

  try {
    const workspaceData = await getAllWorkspace(workspace, assistant);

    const customer = contact.customer;

    if (!customer) {
      const msg = `Este cliente ainda NÃO está cadastrado!

Dados do Workspace:
${workspaceData}
  `;

      return {
        status: 'failed',
        message: msg,
        object: null,
      };
    } else {
      const customerMessage = `Cliente Já cadastrado!
Dados do cliente:
  - Nome do Cliente: ${customer.name}
  - CPF/CNPJ do cliente: ${customer.cpfCnpj}
  - Telefone: ${contact.phone || 'Não cadastrado'}
  - E-mail: ${contact.email || 'Não cadastrado'}

Dados do Workspace:
${workspaceData}
  `;

      return {
        status: 'completed',
        message: customerMessage,
        object: contact?.customer,
      };
    }
  } catch (error) {
    console.error(error);

    await Log.create({
      table: 'actions',
      operation: 'runAction:getCustomer',
      // user,
      status: 'failed',
      data: JSON.stringify(error),
    }).save()
    return {
      status: 'failed',
      message: 'Ouve um erro ao executar a função, tente novamente',
      object: contact?.customer,
    };
  }
}

