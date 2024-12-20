import Group from "@entities/Group";
import Origin from "@entities/Origin";
import Profile from "@entities/Profile";
import { log } from "console";
import Customer from "@entities/Customer";
import Funnel from "@entities/Funnel";
import Pipeline from "@entities/Pipeline";
import Deal from "@entities/Deal";
import Thread from "@entities/Thread";
import { notify } from "@utils/createNotifications";
import Notification from "@entities/Notification";
// import { reRun } from "../checks/reRun";
import { sendMessage } from "@utils/whatsapp/whatsapp";
import { formatToWhatsAppNumber } from "@utils/format";
import Message from "@entities/Message";
import Workspace from "@entities/Workspace";
import { In } from "typeorm";
import { createAction } from "../functions/createAction";
import Log from "@entities/Log";

export async function createCustomer(
  contact: any,
  workspace: Workspace,
  arg: any

  ): Promise<{ status: string; message: string; object: any | null }>{
  // modelo de código "CREATEDEAL:name=Funil Padrão;phone=Não Iniciado;"
  const args = JSON.parse(arg)

  log('Entrou na Action: createCustomer', args);
  const {
  name,
  cpfCnpj,
  groupName,
  profileName,
  } = args
  try {
    const groups = await Group.find({ where: { name: groupName, workspace: workspace } });

    let customer = contact.customer;

    const origin = await Origin.findOne({ where: { name: 'WhatsApp', workspace: workspace } });

    const profile = await Profile.findOne({ where: { name: profileName, workspace: workspace }})
    let profiles = []

    profiles.push(profile)

    // console.log(profileName, profiles)

    if (!contact.customer) {
      customer = await Customer.create({
        name,
        cpfCnpj,
        contact,
        origin,
        profiles,
        groups,
        workspace,
      }).save();
    } else {
      return {
        status: 'failed',
        message: 'Este cliente já está cadastrado',
        object: null
      }
    }

    // console.log(customer);

    const successMessage = `O contato ${customer.name} foi criado junto com uma negociação pela assistente.`;

    notify(workspace, {
      workspace,
      name: 'Cliente e negociação criado pela assistente',
      description: successMessage,
      role: 'SELLER',
    } as Notification);

    const result = {
      status: 'success',
      message: 'Cliente cadastrado com sucesso!',
      object: customer
    }

    return result
  } catch (error) {
    console.error(error);
    await Log.create({
      table: 'actions',
      operation: 'runAction:createCustomer',
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