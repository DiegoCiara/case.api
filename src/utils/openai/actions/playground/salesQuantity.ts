import Sale from "@entities/Sale";
import User from "@entities/User";
import Workspace from "@entities/Workspace";
import { Between, getRepository } from "typeorm";

export async function salesQuantity(workspace: Workspace, status: string, startDate: Date, endDate: Date) {
  try {
    const inprogressStatus = status === 'INPROGRESS' || status === 'PENDING';
    const sales = await getRepository(Sale).count(inprogressStatus ? {
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

    const values = sales;

    return values;
  } catch (error) {
    console.error(error);
    return 'Não foi possível consultar as infomrações'
  }
}

export async function salesQuantityByUser(workspace: Workspace, userId: string, statusDeal: string, startDate: Date, endDate: Date) {
  try {

    const inprogressStatus = statusDeal === 'INPROGRESS' || statusDeal === 'PENDING';
    // Conta as vendas diretamente no banco de dados

    // const user = await User.findOne(userId)
    const salesCount = await getRepository(Sale)
      .createQueryBuilder('sale')
      .innerJoin('sale.deal', 'deal')
      .where('deal.workspace = :workspaceId', { workspaceId: workspace.id })
      .andWhere('deal.status = :status', { status: statusDeal })
      .andWhere('deal.user = :userId', { userId: userId })
      // .andWhere('deal.deadline BETWEEN :start AND :end', { start: startDate, end: endDate })
      .andWhere(inprogressStatus ? 'deal.createdAt BETWEEN :start AND :end' : 'deal.deadline BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .getCount();

    return salesCount;
  } catch (error) {
    console.error(error);
    return 'Não foi possível consultar as infomrações'
  }
}