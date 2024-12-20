import Customer from "@entities/Customer";
import Deal from "@entities/Deal";
import Sale from "@entities/Sale";
import Workspace from "@entities/Workspace";
import { formatCurrency, formatDate, statusFormat } from "@utils/format";
import { In } from "typeorm";
import { createAction } from "../../functions/createAction";
import Log from "@entities/Log";
import Contact from "@entities/Contact";
import Task from "@entities/Task";



export async function getTime(): Promise<{ status: string; message: string; object: any | null }>{
  console.log('Entrou na action: getTime')
  try {

    const date = new Date()

    return {
      status: 'completed',
      message: `A data de hoje é ${date}`,
      object: date
    }

  } catch (error) {
    // await createAction(call)
    console.error(error)

    await Log.create({
      table: 'actions',
      operation: 'runAction:getTime',
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