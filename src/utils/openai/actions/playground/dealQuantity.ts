import Deal from "@entities/Deal";
import User from "@entities/User";
import Workspace from "@entities/Workspace";
import { Between, getRepository } from "typeorm";

export async function dealQuantity(workspace: Workspace, status: string, startDate: Date, endDate: Date,) {
  try {
    const inprogressStatus = status === 'INPROGRESS' || status === 'PENDING';
    // Busca todas as negociações (deals) do assistente, incluindo suas vendas (sales)
    const dealCount = await getRepository(Deal).count(inprogressStatus ? {
      where: {
        workspace: workspace,
        status: status,
        createdAt: Between(startDate, endDate),
      },
    } : {
      where: {
        workspace: workspace,
        status: status,
        deadline: Between(startDate, endDate),
      },
    });

    return dealCount;
  } catch (error) {
    console.error(error);
    return 'Não foi possível consultar as infomrações'
  }
}
export async function dealQuantityByUser(workspace: Workspace, userId: string, status: string, startDate: Date, endDate: Date,) {
  try {
    const inprogressStatus = status === 'INPROGRESS' || status === 'PENDING';
    const user = await User.findOne(userId)
    // Busca todas as negociações (deals) do assistente, incluindo suas vendas (sales)
    const dealCount = await getRepository(Deal).count(inprogressStatus ? {
      where: {
        workspace: workspace,
        status: status,
        createdAt: Between(startDate, endDate),
        user: userId,
      },
    } : {
      where: {
        workspace: workspace,
        status: status,
        deadline: Between(startDate, endDate),
        user: userId,
      },
    });

    console.log(`SAAAAALESSCOUNT OF ${user?.name} ==================================================>`, dealCount)
    return dealCount;
  } catch (error) {
    console.error(error);
    return 'Não foi possível consultar as infomrações'
  }
}