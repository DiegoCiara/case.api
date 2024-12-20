import Customer from "@entities/Customer";
import Deal from "@entities/Deal";
import Sale from "@entities/Sale";
import Workspace from "@entities/Workspace";
import { formatCurrency, formatDate, statusFormat } from "@utils/format";
import { In } from "typeorm";
import { createAction } from "../functions/createAction";
import Log from "@entities/Log";
import Contact from "@entities/Contact";



export async function getDeal( contact:Contact, workspace: Workspace, arg: any
): Promise<{ status: string; message: string; object: any | null }>{
  const args = JSON.parse(arg)
  console.log('Entrou na action: getDeal', args)
  try {

    const customer = await Customer.findOne({ where: { contact, workspace: workspace }})
    if(!customer){
      return {
        status: 'failed',
        message: 'Não há nenhum cliente cadastrado com este CPF',
        object: null
      }
    }

    const deal = await Deal.findOne({ where: { customer, workspace},
      relations: ['pipeline', 'sales', 'sales.commission', 'sales.commission.product', 'user',  ],
      order: { createdAt: 'DESC' }  // Ordenar pela data de criação de forma decrescente
    })


    if(!deal){
      return {
        status: 'failed',
        message: 'Não há nenhuma negociação em andamento',
        object: null
      }
    }

    const funnelDetails = deal?.sales?.map((sale: Sale, index) => {
      return `${index + 1}: ${sale.commission?.product?.name}\nValor: ${formatCurrency(sale?.value)}\n\n`;
    }).join(', ') || 'Esta negociação ainda não possui produtos';


    const dealMessage = `Dados da negociação deste cliente:
- A negociação se encontra com o status ${statusFormat(deal?.status)}
- Nome do Cliente: ${customer?.name}
- CPF/CNPJ do cliente: ${customer.cpfCnpj || 'Não informado'}
- E-mail: ${customer.cpfCnpj || 'Não informado'}
- Etapa: ${deal?.pipeline?.name || 'Não encontrado'}
- Produtos da negociacão: ${funnelDetails || 'Não encontrado'}
- Responsável: ${deal?.user?.name || 'Não possui'}
- Observações: ${deal?.observations || 'Não possui'}`

    return {
      status: 'completed',
      message: dealMessage,
      object: deal
    }

  } catch (error) {
    // await createAction(call)
    console.error(error)

    await Log.create({
      table: 'actions',
      operation: 'runAction:getDeal',
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