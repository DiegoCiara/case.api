// import Workspace from '@entities/Workspace';
// import Deal from '@entities/Deal';
// import { calculateCommission, sumQuantity, sumSaleValues, sumValueSales } from './format';
// import Customer from '@entities/Customer';
// import Group from '@entities/Group';
// import Access from '@entities/Access';
// import { Between, getRepository } from 'typeorm';
// import Sale from '@entities/Sale';
// import User from '@entities/User';
// import Goal from '@entities/Goal';

// function getMonth(date: Date) {
//   const inputDate = new Date(date);

//   // Extrai o mês e o ano da data passada
//   const year = inputDate.getFullYear();
//   const month = inputDate.getMonth() + 1; // getMonth() retorna de 0 a 11, então somamos 1

//   // Define a data de início e de fim do mês desejado
//   const startDate = new Date(year, month - 1, 1); // Primeiro dia do mês
//   const endDate = new Date(year, month, 0, 23, 59, 59); // Último dia do mês

//   return {
//     startDate: startDate,
//     endDate: endDate,
//   };
// }
// export async function dealValues(workspace: Workspace, statusDeal: string, date: Date) {
//   try {
//     const { startDate, endDate } = await getMonth(date);

//     const inprogressStatus = statusDeal === 'INPROGRESS' || statusDeal === 'PENDING';

//     // Repositório para a entidade Sale
//     const saleRepository = getRepository(Sale);

//     // Realiza a consulta diretamente no banco com agregação
//     const result = await saleRepository
//       .createQueryBuilder('sale')
//       .select('SUM(sale.value)', 'total')
//       .where('sale.workspace = :workspace', { workspace: workspace.id })
//       .andWhere('sale.status = :status', { status: statusDeal })
//       .andWhere(inprogressStatus ? 'sale.createdAt BETWEEN :start AND :end' : 'sale.deadline BETWEEN :start AND :end', {
//         start: startDate,
//         end: endDate,
//       })
//       .getRawOne();

//     // Retorna o total calculado
//     return result.total ? parseFloat(result.total) : 0;
//   } catch (error) {
//     console.error(error);
//     throw new Error('Erro ao calcular os valores das vendas.');
//   }
// }

// export async function dealUserValues(workspace: Workspace, statusDeal: string, date: Date, user: User) {
//   try {
//     const { startDate, endDate } = await getMonth(date);

//     // Repositório para a entidade Deal
//     const inprogressStatus = statusDeal === 'INPROGRESS' || statusDeal === 'PENDING';

//     const dealRepository = getRepository(Deal);

//     // Realiza a consulta diretamente no banco com agregação
//     const result = await dealRepository
//       .createQueryBuilder('deal')
//       .select('SUM(sale.value)', 'total')
//       .innerJoin('deal.sales', 'sale')
//       .where('deal.user = :userId', { userId: user.id })
//       .andWhere('sale.status = :status', { status: statusDeal })
//       .andWhere('deal.workspace = :workspaceId', { workspaceId: workspace.id })
//       .andWhere(inprogressStatus ? 'sale.createdAt BETWEEN :start AND :end' : 'sale.deadline BETWEEN :start AND :end', {
//         start: startDate,
//         end: endDate,
//       })
//       .getRawOne();

//     // Retorna o total calculado
//     return result.total ? parseFloat(result.total) : 0;
//   } catch (error) {
//     console.error(error);
//     throw new Error('Erro ao calcular os valores das vendas.');
//   }
// }
// export async function dealQuantity(workspace: Workspace, statusDeal: string, date: Date,) {
//   try {
//     const { startDate, endDate } = await getMonth(date);
//     // Busca todas as negociações (deals) do assistente, incluindo suas vendas (sales)
//     const dealCount = await getRepository(Deal).count({
//       where: {
//         workspace: workspace,
//         status: statusDeal,
//         createdAt: Between(startDate, endDate),
//       },
//     });

//     return dealCount;
//   } catch (error) {
//     console.error(error);
//   }
// }
// export async function dealQuantityUser(workspace: Workspace, statusDeal: string, date: Date, user: User) {
//   try {
//     const { startDate, endDate } = await getMonth(date);
//     // Busca todas as negociações (deals) do assistente, incluindo suas vendas (sales)
//     const dealCount = await getRepository(Deal).count({
//       where: {
//         workspace: workspace,
//         status: statusDeal,
//         createdAt: Between(startDate, endDate),
//         user,
//       },
//     });

//     return dealCount;
//   } catch (error) {
//     console.error(error);
//   }
// }

// export async function salesQuantity(workspace: Workspace, statusDeal: string, date: Date) {
//   try {
//     const { startDate, endDate } = await getMonth(date);
//     // Busca todas as negociações (deals) do assistente, incluindo suas vendas (sales)
//     const dealCount = await getRepository(Sale).count({
//       where: {
//         workspace: workspace,
//         status: statusDeal,
//         deadline: Between(startDate, endDate),
//       },
//     });
//     return dealCount;
//   } catch (error) {
//     console.error(error);
//   }
// }

// export async function salesQuantityUser(workspace: Workspace, statusDeal: string, date: Date, user: User) {
//   try {
//     const { startDate, endDate } = await getMonth(date);

//     // Conta as vendas diretamente no banco de dados
//     const salesCount = await getRepository(Sale)
//       .createQueryBuilder('sale')
//       .innerJoin('sale.deal', 'deal')
//       .where('deal.workspace = :workspaceId', { workspaceId: workspace.id })
//       .andWhere('deal.status = :status', { status: statusDeal })
//       .andWhere('deal.user = :userId', { userId: user.id })
//       .andWhere('deal.deadline BETWEEN :start AND :end', { start: startDate, end: endDate })
//       .getCount();

//     return salesCount;
//   } catch (error) {
//     console.error(error);
//     throw new Error('Erro ao contar as vendas do usuário.');
//   }
// }

// export async function conversionRateCalc(workspace: Workspace, date: Date) {
//   try {
//     const { startDate, endDate } = await getMonth(date);
//     // Busca todas as negociações (deals) do assistente, incluindo suas vendas (sales)
//     const dealWon = await getRepository(Deal).count({
//       where: {
//         workspace: workspace,
//         createdAt: Between(startDate, endDate),
//       },
//     });
//      const deals = await getRepository(Deal).count({
//       where: {
//         workspace: workspace,
//         status: 'WON',
//         deadline: Between(startDate, endDate),
//       },
//     });

//     // Calcula a taxa de conversão (porcentagem de 'WON')
//     const conversionRate = (deals / dealWon) * 100;

//     return conversionRate;
//   } catch (error) {
//     console.error(error);
//   }
// }

// export async function conversionRateCalcUser(workspace: Workspace, date: Date, user: User) {
//   try {
//     const { startDate, endDate } = await getMonth(date);
//     // Busca todas as negociações (deals) do assistente, incluindo suas vendas (sales)
//     const dealWon = await getRepository(Deal).count({
//       where: {
//         workspace: workspace,
//         status: 'WON',
//         createdAt: Between(startDate, endDate),
//         user,
//       },
//     });
//      const deals = await getRepository(Deal).count({
//       where: {
//         workspace: workspace,
//         status: 'WON',
//         createdAt: Between(startDate, endDate),
//         user,
//       },
//     });

//     // Calcula a taxa de conversão (porcentagem de 'WON')
//     const conversionRate = (dealWon / deals) * 100;

//     return conversionRate;
//   } catch (error) {
//     console.error(error);
//   }
// }

// export async function mediumTicket(workspace: Workspace, date: Date) {
//   try {
//     const values = await dealValues(workspace, 'WON', date);
//     const quantity: any = await salesQuantity(workspace, 'WON', date);
//     const averageTicket = values / quantity;

//     return averageTicket;
//   } catch (error) {
//     console.error(error);
//   }
// }

// export async function mediumTicketUser(workspace: Workspace, date: Date, user: User) {
//   try {
//     const values = await dealUserValues(workspace, 'WON', date, user);
//     const quantity: any = await salesQuantityUser(workspace, 'WON', date, user);
//     const averageTicket = values / quantity;

//     return averageTicket;
//   } catch (error) {
//     console.error(error);
//   }
// }

// export async function allSales(workspace: Workspace, date: Date) {
//   try {
//     const { startDate, endDate } = await getMonth(date);
//     // Busca todas as negociações (deals) do assistente, incluindo suas vendas (sales)
//     // Busca todas as negociações (deals) do assistente, incluindo suas vendas (sales)
//     const sales = await getRepository(Sale).count({
//       where: {
//         workspace: workspace,
//         status: 'WON',
//         deadline: Between(startDate, endDate),
//       },
//     });

//     // Calcula a taxa de conversão (porcentagem de 'WON')
//     // Extrai e concatena todas as vendas em um único array usando flatMap

//     // Calcula os valores somados das vendas

//     const values = sales;

//     return values;
//   } catch (error) {
//     console.error(error);
//   }
// }

// export async function allSalesUser(workspace: Workspace, date: Date, user: User) {
//   try {
//     const { startDate, endDate } = await getMonth(date);

//     const salesCount = await getRepository(Sale)
//       .createQueryBuilder('sale')
//       .innerJoin('sale.deal', 'deal')
//       .where('deal.user = :userId', { userId: user.id })
//       .andWhere('deal.workspace = :workspaceId', { workspaceId: workspace.id })
//       .andWhere('deal.deadline BETWEEN :start AND :end', { start: startDate, end: endDate })
//       .andWhere('sale.status = :status', { status: 'WON' })
//       .getCount();

//     return salesCount;
//   } catch (error) {
//     console.error(error);
//   }
// }

// export async function leadsLength(workspace: Workspace, date: Date) {
//   try {
//     const { startDate, endDate } = await getMonth(date);
//     // Busca todas as negociações (deals) do assistente, incluindo suas vendas (sales)
//     // const leads = await Customer.find({ where: { workspace: workspace, active: true, createdAt: Between(startDate, endDate) } });
//     // return leads.length;

//     const sales = await getRepository(Customer).count({
//       where: {
//         workspace: workspace,
//         active: true,
//         createdAt: Between(startDate, endDate),
//       },
//     });
//     return sales
//   } catch (error) {
//     console.error(error);
//   }
// }

// export async function commissionCalculate(workspace: Workspace, date: Date) {
//   try {
//     const { startDate, endDate } = await getMonth(date);
//     // Busca todas as negociações (deals) do assistente, incluindo suas vendas (sales)
//     const deals = await Deal.find({
//       where: { workspace: workspace, status: 'WON', createdAt: Between(startDate, endDate) },
//       relations: ['sales', 'sales.commission'],
//     });

//     // Extrai e concatena todas as vendas em um único array usando flatMap
//     const sales = deals.flatMap((deal) => deal?.sales || []);

//     // Calcula os valores somados das vendas

//     const wonSales = await sales.filter((e) => e.status === 'WON');

//     const values = await calculateCommission(wonSales);

//     // console.log(values);
//     return values;
//   } catch (error) {
//     console.error(error);
//   }
// }
// export async function commissionCalculateUser(workspace: Workspace, date: Date, user: User) {
//   try {
//     const { startDate, endDate } = await getMonth(date);

//     // Busca todas as negociações (deals) do assistente, incluindo suas vendas (sales)
//     const deals = await Deal.find({
//       where: { workspace: workspace, status: 'WON', user, createdAt: Between(startDate, endDate) },
//       relations: ['sales', 'sales.commission', 'sales.commission.product'],
//     });

//     // Extrai e concatena todas as vendas em um único array
//     const sales = deals.flatMap((deal) => deal?.sales || []);

//     // Filtra as vendas com status WON
//     const wonSales = sales.filter((sale: any) => sale.status === 'WON');

//     // Agrupa o total de vendas por produto
//     const salesByProduct: any = wonSales.reduce((acc: any, sale) => {
//       const productId: string = sale.commission?.product?.id; // Pode não haver produto atrelado
//       const saleAmount = sale.value;

//       // Se o produto existir, agrupa por produto
//       if (productId) {
//         if (!acc[productId]) {
//           acc[productId] = { product: sale.commission.product, totalSales: 0 };
//         }
//         acc[productId].totalSales += saleAmount;
//       }

//       return acc;
//     }, {});

//     const access = await Access.findOne({ where: { user, workspace }, relations: ['goals', 'goals.product']})



//     const goals = access?.goals || []

//     if(goals.length === 0) return

//     // Busca as metas (goals) cadastradas no workspace, relacionando com o produto (ou sem produto)
//     // const goals = await Goal.find({ where: { workspace }, relations: ['product'] });

//     // Variável para armazenar o total a ser recebido pelo usuário
//     let totalCommissions = 0;

//     // 1. Itera sobre cada grupo de vendas por produto (metas que possuem produtos)
//     for (const productId in salesByProduct) {
//       const productSales = salesByProduct[productId];
//       const totalSales = productSales.totalSales;
//       const product = productSales.product;

//       // Filtra as metas (goals) aplicáveis a este produto
//       const productGoals = goals.filter(goal => goal?.product?.id === productId);

//       // Ordena as metas pelo valor, para garantir que as maiores metas sejam verificadas primeiro
//       const sortedGoals = productGoals.sort((a, b) => b.goal - a.goal);

//       // Verifica qual meta o total de vendas alcançou ou excedeu
//       for (const goal of sortedGoals) {
//         if (totalSales >= goal.goal) {
//           // Se atingiu a meta, calcula a comissão
//           const commissionForProduct = goal.type === 'percent' ? (goal.value / 100) * totalSales : goal.value;
//           totalCommissions += commissionForProduct;
//           break; // Sai do loop após encontrar a meta atingida
//         }
//       }
//     }

//     // 2. Metas que NÃO possuem produtos atrelados
//     const noProductGoals = goals.filter(goal => !goal.product); // Filtra metas sem produto

//     // Calcula o total de vendas (independente de produto)
//     const totalSalesValue = wonSales.reduce((acc, sale) => acc + sale.value, 0);

//     // Itera sobre as metas sem produto
//     for (const goal of noProductGoals) {
//       if (totalSalesValue >= goal.goal) {
//         // Se atingiu a meta, calcula a comissão
//         const commissionForNoProduct = goal.type === 'percent' ? (goal.value / 100) * totalSalesValue : goal.value;
//         totalCommissions += commissionForNoProduct;
//         // Se a meta for atingida, não precisa continuar verificando as outras
//         break;
//       }
//     }

//     // Retorna o total de comissão calculada para o usuário
//     return totalCommissions;

//   } catch (error) {
//     console.error(error);
//     throw new Error('Erro ao calcular comissões.');
//   }
// }
// export async function quantityCustomersByGroups(workspace: Workspace, date: Date) {
//   try {
//     const { startDate, endDate } = await getMonth(date);
//     // Busca todos os customers associados ao assistente, incluindo os grupos
//     const customers = await Customer.find({
//       where: { workspace: workspace, createdAt: Between(startDate, endDate) },
//       relations: ['profiles'], // Carrega os grupos relacionados
//     });

//     if (!customers || customers.length === 0) {
//       return [];
//     }

//     // Função para formatar a data em "YYYY-MM-DD"
//     const formatDate = (date: Date) => {
//       const year = date.getFullYear();
//       const month = (date.getMonth() + 1).toString().padStart(2, '0');
//       const day = date.getDate().toString().padStart(2, '0');
//       return `${year}-${month}-${day}`;
//     };

//     // Tipando explicitamente o objeto groupData
//     const groupData: {
//       [groupId: string]: {
//         groupId: string;
//         groupName: string;
//         color: string;
//         customersByDate: { [date: string]: number };
//       };
//     } = {};

//     // Itera sobre todos os customers
//     customers.forEach((customer) => {
//       customer.profiles.forEach((group) => {
//         if (!groupData[group.id]) {
//           groupData[group.id] = {
//             groupId: group.id,
//             groupName: group.name,
//             color: group.color,
//             customersByDate: {},
//           };
//         }

//         // Formatar a data de criação do customer
//         const createdAtDay = formatDate(customer.createdAt);

//         // Se a data já existe no grupo, somar; se não, inicializar com 1
//         if (!groupData[group.id].customersByDate[createdAtDay]) {
//           groupData[group.id].customersByDate[createdAtDay] = 0;
//         }

//         groupData[group.id].customersByDate[createdAtDay] += 1; // Incrementa o contador
//       });
//     });

//     // Transforma o objeto em um array para facilitar o uso no gráfico
//     const customersByGroup = Object.values(groupData);

//     // console.log('CUSTOMERBY GROUP', customersByGroup)

//     return customersByGroup; // Retorna o resultado
//   } catch (error) {
//     console.error('Erro ao buscar a quantidade de customers por grupo:', error);
//   }
// }

// export async function rankingSaleers(workspace: Workspace, date: Date) {
//   try {
//     const { startDate, endDate } = await getMonth(date);

//     // Consulta para obter os 5 melhores vendedores
//     const topSellers = await getRepository(Sale)
//       .createQueryBuilder('sale')
//       .select('user.id', 'userId')
//       .addSelect('user.name', 'userName')
//       .addSelect('user.picture', 'userPicture')
//       .addSelect('SUM(sale.value)', 'totalValue')
//       .innerJoin('sale.deal', 'deal')
//       .innerJoin('deal.user', 'user')
//       .where('deal.workspace = :workspaceId', { workspaceId: workspace.id })
//       .andWhere('sale.status = :status', { status: 'WON' })
//       .andWhere('sale.createdAt BETWEEN :start AND :end', { start: startDate, end: endDate })
//       .groupBy('user.id')
//       .orderBy('SUM(sale.value)', 'DESC') // Alteração aqui para usar diretamente a função agregada
//       .limit(5)
//       .getRawMany();

//     // Mapeia os resultados para o formato esperado
//     return topSellers.map((seller) => ({
//       picture: seller.userPicture,
//       name: seller.userName,
//       value: parseFloat(seller.totalValue),
//     }));
//   } catch (error) {
//     console.error(error);
//     throw new Error('Erro ao calcular o ranking de vendedores.');
//   }
// }