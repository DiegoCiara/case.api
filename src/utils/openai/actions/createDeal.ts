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
import Log from '@entities/Log';
import eventEmitter from '@utils/emitter';

export async function createDeal(
  contact: any,
  workspace: Workspace,
  thread: Thread,
  args: any
): Promise<{ status: string; message: string; object: any | null }> {
  // modelo de código "CREATEDEAL:name=Funil Padrão;phone=Não Iniciado;"
  log('Entrou na Action: createDeal', JSON.parse(args));

  const { cpfCnpj, funnelName, pipelineName, observations } = JSON.parse(args);

  try {
    const customer = await Customer.findOne({ where: { cpfCnpj } });

    if (!customer) {
      return {
        status: 'failed',
        message: 'Este cliente não está cadastrado',
        object: null,
      };
    }

    const funnel = await Funnel.findOne({ where: { name: funnelName, workspace: workspace } });

    const pipeline = await Pipeline.findOne({ where: { name: pipelineName, funnel: funnel } });

    const deals = await Deal.find({ where: { customer, workspace: workspace, status: In(['INPROGRESS', 'PENDING']) } });

    let dealCreated = null;
    if (deals.length === 0) {
      dealCreated = await Deal.create({
        customer,
        pipeline,
        workspace,
        observations,
      }).save();

      await Thread.update(thread.id, { deal: dealCreated });
      // await createAction(workspace, thread, message, customer.id, 'CREATEDEALCUSTOMER', messageThread);
    } else {
      return {
        status: 'failed',
        message: 'Já existe uma negociação em andamento para este cliente',
        object: null,
      };
    }

    const successMessage = `Uma negociação para ${customer.name} foi criada pela assistente.`;

    notify(workspace, {
      workspace,
      name: 'Cliente e negociação criado pela assistente',
      description: successMessage,
      role: 'SELLER',
    } as Notification);

    eventEmitter.emit(`pipelineDeals`, funnel?.id);

    return {
      status: 'completed',
      message: 'Negociacão criada com sucesso!',
      object: dealCreated,
    };
  } catch (error) {
    console.error(error);

    await Log.create({
      table: 'actions',
      operation: 'runAction:createDeal',
      // user,
      status: 'failed',
      data: JSON.stringify(error),
    }).save()
    return {
      status: 'failed',
      message: 'Ouve um erro ao executar a função, tente novamente',
      object: null,
    };
  }
}
