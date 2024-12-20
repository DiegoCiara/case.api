import Sale from "@entities/Sale";
import User from "@entities/User";
import Workspace from "@entities/Workspace";
import { getRepository } from "typeorm";

export async function dealValues(workspace: Workspace, statusDeal: string, startDate: Date, endDate: Date) {
  try {

    const inprogressStatus = statusDeal === 'INPROGRESS' || statusDeal === 'PENDING';

    // Repositório para a entidade Sale
    const saleRepository = getRepository(Sale);

    // Realiza a consulta diretamente no banco com agregação
    const result = await saleRepository
      .createQueryBuilder('sale')
      .select('SUM(sale.value)', 'total')
      .where('sale.workspace = :workspace', { workspace: workspace.id })
      .andWhere('sale.status = :status', { status: statusDeal })
      .andWhere(inprogressStatus ? 'sale.createdAt BETWEEN :start AND :end' : 'sale.deadline BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .getRawOne();

    // Retorna o total calculado
    return result.total ? parseFloat(result.total) : 0;
  } catch (error) {
    console.error(error);
    return 'Não foi possível consultar as infomrações'
  }
}
export async function dealValuesByUser(workspace: Workspace, userId: string, statusDeal: string, startDate: Date, endDate: Date) {
  try {
    const inprogressStatus = statusDeal === 'INPROGRESS' || statusDeal === 'PENDING';
    const user = await User.findOne(userId);
    const saleRepository = getRepository(Sale);

    const queryBuilder = saleRepository.createQueryBuilder('sale')
      .leftJoin('sale.deal', 'deal')  // Garante o join com a tabela 'deal'
      .leftJoin('deal.user', 'user')  // Garante o join com a tabela 'user'
      .select('SUM(sale.value)', 'total')
      .where('user.id = :userId', { userId: userId })  // Corrige o filtro pelo usuário
      .andWhere('sale.workspace = :workspace', { workspace: workspace.id })
      .andWhere('sale.status = :status', { status: statusDeal });

    // Aplica filtro por data de acordo com o status da venda
    if (inprogressStatus) {
      queryBuilder.andWhere('sale.createdAt BETWEEN :start AND :end', {
        start: startDate,
        end: endDate
      });
    } else {
      queryBuilder.andWhere('sale.deadline BETWEEN :start AND :end', {
        start: startDate,
        end: endDate
      });
    }

    const result = await queryBuilder.getRawOne();
    console.log(`DEALVALUES BY USER ${user?.name} ===============================================>`, result.total, typeof result.total);

    return result.total ? parseFloat(result.total) : 0;
  } catch (error) {
    console.error(error);
    return 'Não foi possível consultar as informações';
  }
}