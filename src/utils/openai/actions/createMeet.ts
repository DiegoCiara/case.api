import Customer from "@entities/Customer";
import Deal from "@entities/Deal";
import Sale from "@entities/Sale";
import Workspace from "@entities/Workspace";
import { formatCurrency, formatDate, statusFormat } from "@utils/format";
import { In } from "typeorm";
import { createAction } from "../functions/createAction";
import Log from "@entities/Log";
import Contact from "@entities/Contact";
import Task from "@entities/Task";
import eventEmitter from "@utils/emitter";



export async function createMeet( contact:Contact, workspace: Workspace, arg: any
): Promise<{ status: string; message: string; object: any | null }>{
  const args = JSON.parse(arg)
  console.log('Entrou na action: createMeet', args)
  try {

    const { description, name, date } = args

    const customer = await Customer.findOne({ where: { contact, workspace: workspace }})
    if(!customer){
      return {
        status: 'failed',
        message: 'Não há nenhum cliente cadastrado com este CPF',
        object: null
      }
    }

    const deal = await Deal.findOne({ where: { customer, workspace},
      relations: ['pipeline', 'sales', 'sales.commission', 'sales.commission.product', 'user', 'pipeline', 'pipeline.funnel',  ],
      order: { createdAt: 'DESC' }  // Ordenar pela data de criação de forma decrescente
    })


    if(!deal){
      return {
        status: 'failed',
        message: 'Não há nenhuma negociação em andamento',
        object: null
      }
    }

    const task = await Task.create({ deal, workspace, name, description, deadline: date }).save()

    eventEmitter.emit(`pipelineDeals`, deal?.pipeline?.funnel?.id);
    
    return {
      status: 'completed',
      message: 'Reunião criada com sucesso!',
      object: task
    }

  } catch (error) {
    // await createAction(call)
    console.error(error)

    await Log.create({
      table: 'actions',
      operation: 'runAction:createMeet',
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