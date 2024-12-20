import axios from 'axios';
import { Request, Response } from 'express';
import Deals from '@entities/Deal';
import queryBuilder from '@utils/queryBuilder';
import Contact from '@entities/Contact';
import Pipeline from '@entities/Pipeline';
import Workspace from '@entities/Workspace';
import Deal from '@entities/Deal';
import Thread from '@entities/Thread';
import Message from '@entities/Message';
import OpenAI from 'openai';
import Product from '@entities/Product';
import User from '@entities/User';
import Task from '@entities/Task';
import { In, getRepository } from 'typeorm';
import Customer from '@entities/Customer';
import Commission from '@entities/Commission';
import Sale from '@entities/Sale';
import { statusFormat } from '@utils/format';
import { log } from '@utils/createLog';
import { decrypt } from '@utils/encrypt';
import Access from '@entities/Access';
import { threadId } from 'worker_threads';
import eventEmitter from '@utils/emitter';
import Funnel from '@entities/Funnel';
require('dotenv').config();
interface DealInterface {
  id?: string;
  customer: Customer;
  pipeline?: Pipeline;
  user?: User;
  value: number;
  sales: any;
  recurrence: number;
  status?: string;
  deadline?: Date | null;
  userId?: string;
  pipelineId?: string;
  pipelineOrigin?: string;
  observations?: string;
  date?: Date;
  statusReason?: string;
  activityDescription: string;
}

interface TaskInterface {
  id?: string;
  name?: string;
  description?: string;
  deadline?: Date;
  status?: string;
  userId?: string;
  dealId?: string;
}

interface UpdateStatus {
  status: string;
}

class DealController {

  public async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      const workspace = await Workspace.findOne(id);


      const user = await User.findOne(req.userId);
      if (!user) return res.status(404).json({ message: 'Funnel not found' });

      const access = await Access.findOne({ where: { user, workspace}})

      if(!access)return res.status(404).json({ message: 'Access not found' });

      let deals = []

      if(access.role === 'SELLER'){

         deals = await Deal.find({
          where: { workspace: workspace, user,},
          relations: ['workspace', 'customer', 'customer.groups','customer.profiles', 'pipeline', 'pipeline.funnel', 'sales', 'sales.commission', 'sales.commission.product', 'user'],
          order: { updatedAt: "DESC"},
        });

      } else {

       deals = await Deal.find({
        where: { workspace: workspace,},
        relations: ['workspace', 'customer', 'customer.groups','customer.profiles', 'pipeline', 'pipeline.funnel', 'sales', 'sales.commission', 'sales.commission.product', 'user'],
        order: { updatedAt: "DESC"}
      });

      }


      const responseDeals = deals.map((e) => {
        const groupNames = e.customer.groups.map((e) => {
          return e?.name;
        });
        const salesProductsNames = e.sales.map((e) => {
          return e?.commission?.product?.name;
        });
        const salesValue = e.sales.reduce((acc, curr) => {
          return acc + curr?.value;
        }, 0); // Inicia o acumulador com 0



        return {
          id: e.id,
          customerName: e?.customer?.name || '',
          customerCpfCnpj: e?.customer?.cpfCnpj || '',
          groupNames: groupNames || [],
          funelName: e?.pipeline?.funnel?.name || '',
          userName: e?.user?.name || '',
          productsNames: salesProductsNames,
          value: salesValue,
          status: e?.status,
          createdAt: e?.createdAt,
          updatedAt: e?.updatedAt,
          deadline: e?.deadline,
        }
      })


      await log('deals', req, 'findAll', 'success', JSON.stringify({ id: id }), id);
      return res.status(200).json(responseDeals);
    } catch (error) {
      console.log(error)
      await log('deals', req, 'findAll', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Cannot find customers, try again' });
    }
  }

  public async findById(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      if (!id) return res.status(400).json({ message: 'Please send a customer id' });

      const deal = await Deals.findOne(id, {
        relations: [
          'customer',
          'customer.contact',
          'customer.groups',
          'customer.profiles',
          'pipeline',
          'pipeline.funnel',
          'sales',
          'sales.commission',
          'sales.commission.bank',
          'sales.commission.partner',
          'sales.commission.product',
          'user',
          'workspace',
        ],
      });

      if(!deal) return res.status(404).json({ message: 'Deal not found' });

      const thread = await Thread.findOne({ where: { workspace: deal.workspace, contact: deal.customer.contact, chatActive: true }})

      await log('deals', req, 'findById', 'success', JSON.stringify({ id: id }), id);
      return res.status(200).json({...deal, threadId: thread?.id, threadResponsible: thread?.responsible });
    } catch (error) {
      console.log(error)
      await log('deals', req, 'findById', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Cannot find customers, try again' });
    }
  }

  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      const workspace = await Workspace.findOne(id);

      const { customer, userId, pipeline, observations, sales, activityDescription }: DealInterface = req.body;

      const user = await User.findOne(userId);

      const status = 'INPROGRESS';


      if (!customer || !userId || !pipeline) {
        return res.status(400).json({ message: 'Valores inválidos para criar a negociação.' });
      }
      const pipelineFunnel = await Pipeline.findOne(pipeline.id, { relations: ['funnel']})


      if (!pipelineFunnel) {
        return res.status(400).json({ message: 'Pipeline não encontrado.' });
      }
      const validationStatus = ['INPROGRESS', 'PENDING'];

      const findDeal = await Deal.find({
        where: {
          customer: customer,
          status: In(validationStatus), // Filtra por status se dealParams.status estiver definido
        },
      });

      if (findDeal.length > 0) return res.status(400).json({ message: 'Já existe uma negociação para este cliente.' });

      const deal = await Deal.create({
        customer,
        pipeline,
        status,
        user,
        observations,
        workspace,
      }).save();

      if (!deal) {
        return res.status(400).json({ message: 'Não foi possível criar a negociação' });
      }

      if (sales.length > 0) {
        for (const sale of sales) {
          await Sale.create({ commission: sale.commission, workspace, deal, value: sale.value, additional: sale.additional }).save();
        }
      }
      if (!deal.activity) {
        deal.activity = [];
      }

      const dataSave = {
        customer: customer!,
        pipeline,
        observations,
        status,
      };

      const {
        customer: { activity, ...customerWithoutActivity },
        ...dataChanged
      } = dataSave;

      // Agora você pode recriar o objeto sem a propriedade "activity"
      const newDataSave = {
        ...dataChanged,
        customer: customerWithoutActivity,
      };

      const activityCreated = {
        name: 'Negociação criada',
        description: `${activityDescription}`,
        createdBy: user!,
        json: JSON.stringify(newDataSave, null, 2),
        createdAt: new Date(),
      };

      deal.activity.push(activityCreated);

      await deal.save();

      eventEmitter.emit(`pipelineDeals`, pipelineFunnel?.funnel?.id);

      await log('deals', req, 'create', 'success', JSON.stringify(req.body), deal);
      return res.status(201).json({ deal, message: 'Negociação criada com sucesso' });
    } catch (error) {
      console.error(error);
      await log('deals', req, 'create', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Não foi possível criar a negociação, tente novamente' });
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const { customer, pipeline, observations, status, deadline, userId, user, activityDescription, statusReason, date }: Partial<DealInterface> = req.body;
      const id = req.params.id;

      const reqUser = await User.findOne(userId)

      if(!reqUser)return res.status(404).json({ message: 'User not found' })

      const dealRepository = getRepository(Deals);
      const deal = await dealRepository.findOne(id, { relations: ['pipeline', 'sales', 'user'] });

      if (!deal) return res.status(404).json({ message: 'Deal does not exist' });

      // const userRepository = getRepository(User);
      // const user = await userRepository.findOne(userId);

      if (!deal.activity) deal.activity = [];
      if (user?.id !== deal?.user?.id) {
        const activityCreated = {
          name: `Responsável alterado`,
          description: `${reqUser.name} alterou o responsável pela negociação de "${deal?.user?.name}" para "${user?.name}."`,
          createdBy: reqUser!,
          json: JSON.stringify({ user: user }, null, 2),
          createdAt: date!,
        };
        deal.activity.push(activityCreated);
      }

      // Dados originais
      if (status !== deal.status) {
        const activityCreated = {
          name: `Negociação ${statusFormat(status!)}`,
          description: statusReason!,
          createdBy: reqUser!,
          json: JSON.stringify({ status: status }, null, 2),
          createdAt: date!,
        };
        deal.activity.push(activityCreated);
      }

      // Atualizar campos simples
      deal.customer = customer || deal.customer;
      deal.status = status || deal.status;
      deal.pipeline = pipeline || deal.pipeline;
      deal.observations = observations || deal.observations;

      deal.deadline = deadline!;
      deal.user = user!;
      // Atualizar a lista de produtos

      if (status === 'WON' || status === 'LOST' || status === 'ARCHIVED') {
        for (const sale of deal.sales) {
          if (sale.status === 'INPROGRESS' || sale.status === 'PENDING') {
            if (status === 'ARCHIVED') {
              await Sale.update(sale.id, { status: 'LOST', deadline: deadline! });
            } else {
              await Sale.update(sale.id, { status: status, deadline: deadline! });
            }
          }
        }
      }

      // Inicializar o array de atividades se não estiver definido
      if (!deal.activity) {
        deal.activity = [];
      }

      // Identificar mudanças

      const dataSave = {
        customer: customer!,
        pipeline,
        observations,
        status,
        deadline,
      };
      // Cria uma cópia do objeto deal sem os campos activity e user
      const {
        customer: { activity, ...customerWithoutActivity },
        ...dataChanged
      } = dataSave;

      // Agora você pode recriar o objeto sem a propriedade "activity"
      const newDataSave = {
        ...dataChanged,
        customer: customerWithoutActivity,
      };


      await dealRepository.save(deal);

      eventEmitter.emit(`pipelineDeals`, pipeline?.funnel?.id);

      await log('deals', req, 'update', 'success', JSON.stringify(req.body), deal);
      return res.status(200).json({ message: 'Deal updated successfully' });
    } catch (error) {
      console.error(error);
      await log('deals', req, 'update', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ error: 'Update failed, try again' });
    }
  }

  public async updatePipeline(req: Request, res: Response): Promise<Response> {
    try {
      const { pipelineId, pipelineOrigin, userId }: DealInterface = req.body;

      const id = req.params.id;

      const dealRepository = getRepository(Deals);
      const deal = await dealRepository.findOne(id, { relations: ['pipeline', 'sales', 'user'] });

      if (!deal) return res.status(404).json({ message: 'Deal does not exist' });

      const user = await User.findOne(userId);

      const pipelineSource = await Pipeline.findOne(pipelineOrigin,);

      const pipeline = await Pipeline.findOne(pipelineId, { relations: ['funnel']});

      if (!deal) return res.status(404).json({ message: 'Deals does not exist' });

      deal.pipeline = pipeline || deal.pipeline;
      // const dealUpdated = await Deal.update(id, { pipeline: pipeline });

      const { activity, ...dealWithoutActivity } = deal;

      const activityDescription = `${user!.name} moveu a negociação de ${pipelineSource?.name} para ${pipeline?.name}`;
      // Identificar mudanças
      const dataChanged = dealWithoutActivity;
      const activityCreated = {
        name: 'Negociação movida',
        description: `${activityDescription}`,
        createdBy: user!,
        json: JSON.stringify(dataChanged, null, 2),
        createdAt: new Date(),
      };

      // Adicionar a nova atividade ao array de atividades
      deal?.activity?.push(activityCreated);

      await dealRepository.save(deal);


      eventEmitter.emit(`pipelineDeals`, pipeline?.funnel?.id);

      await log('deals', req, 'updatePipeline', 'success', JSON.stringify({ id: id }), deal);
      return res.status(200).json({ message: 'Deals updated successfully' });
    } catch (error) {
      console.error(error);
      await log('deals', req, 'updatePipeline', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ error: 'Update failed, try again' });
    }
  }

  public async updateStatus(req: Request, res: Response): Promise<Response> {
    try {
      const { status }: UpdateStatus = req.body;

      const id = req.params.id;

      const deal = await Deals.findOne(id, { relations: ['pipeline', 'pipeline.funnel'] });

      if (!deal) return res.status(404).json({ message: 'Deals does not exist' });

      const valuesToUpdate: UpdateStatus = {
        status,
      };

      await Deals.update(id, { ...valuesToUpdate });

      eventEmitter.emit(`pipelineDeals`, deal.pipeline?.funnel?.id);
      await log('deals', req, 'updateStatus', 'success', JSON.stringify({ id: id }), deal);
      return res.status(200).json({ message: 'Deals updated successfully' });
    } catch (error) {
      await log('deals', req, 'updateStatus', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ error: 'Update failed, try again' });
    }
  }
  public async createSale(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      const workspace = await Workspace.findOne(id);

      if (!workspace) {
        return res.status(400).json({ message: 'Invalid workspace values' });
      }

      const { dealId, commission, value, additional } = req.body;

      if (!dealId || !commission) {
        return res.status(400).json({ message: 'Invalid workspace values' });
      }
      const deal = await Deal.findOne(dealId, { relations: ['pipeline', 'pipeline.funnel']});

      if (!deal) {
        return res.status(404).json({ message: 'Deal not found' });
      }

      const sale = await Sale.create({
        workspace,
        deal,
        commission,
        value: value || 0,
        additional,
      }).save();

      if (!sale) {
        return res.status(400).json({ message: 'Cannot create sale' });
      }

      eventEmitter.emit(`pipelineDeals`, deal?.pipeline?.funnel?.id);

      await log('sales', req, 'createSale', 'success', JSON.stringify(req.body), sale);
      return res.status(201).json({ sale, message: 'Sale created successfully' });
    } catch (error) {
      console.error(error);
      await log('sales', req, 'createSale', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Create failed, try again' });
    }
  }

  public async getSale(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      const sale = await Sale.findOne(id, { relations: ['commission', 'commission.partner', 'commission.product', 'commission.bank'] });

      if (!sale) {
        return res.status(400).json({ message: 'Invalid workspace values' });
      }

      await log('sales', req, 'getSale', 'success', JSON.stringify({ id: id }), sale);
      return res.status(201).json(sale);
    } catch (error) {
      console.error(error);
      await log('sales', req, 'getSale', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Create failed, try again' });
    }
  }

  public async updateSale(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      const { commission, value, status, deadline, additional} = req.body;
      const sale = await Sale.findOne(id, {
        relations: ['commission', 'commission.partner', 'commission.product', 'commission.bank', 'deal'],
      });

      if (!sale || !commission) {
        return res.status(400).json({ message: 'Invalid workspace values' });
      }

      const isInprogress = status === 'PENDING' || status === 'INPROGRESS';

      const valuesUpdate = {
        commission: commission || sale.commission,
        status: status || sale.status,
        value: value || sale.value,
        deadline: isInprogress ? null : deadline || sale.deadline,
        additional: additional || sale.additional,
      };
      await Sale.update(sale.id, { ...valuesUpdate });

      const deal = await Deal.findOne(sale.deal.id, { relations: ['sales', 'pipeline', 'pipeline.funnel']})

      if(!deal) return res.status(404).json({ message: 'Cannot find Deal for this Sale' });

      if (status === 'PENDING') {
        await Deal.update(deal.id, { status: status, deadline: null! });
      } else {
        const dealFindOne = await Deal.findOne(deal.id, { relations: ['sales'] });
        if (status === 'WON') {
          const allSalesWon = dealFindOne?.sales?.every((sale) => sale.status === 'WON');
          if (allSalesWon) {
            await Deal.update(deal.id, { status: status, deadline: deadline! });
          } else {
            const allSalesStatus = deal.sales.map(sale => sale.status);
            if(allSalesStatus.includes('WON') && !allSalesStatus.includes('INPROGRESS') && !allSalesStatus.includes('PENDING')){
              await Deal.update(deal.id, { status: status, deadline: deadline! });
            }
          }
        } else if (status === 'LOST') {
          const allSalesWon = dealFindOne?.sales?.every((sale) => sale.status === 'LOST');
          if (allSalesWon) {
            await Deal.update(deal.id, { status: status, deadline: deadline! });
          } else {
            const hasWon = dealFindOne?.sales?.find((sale) => sale.status === 'WON');
            if(hasWon && !isInprogress){
              await Deal.update(deal.id, { status: 'WON', deadline: deadline! });
            }
          }
        } else {
          // Este caso é o INPROGRESS
          if(deal.status === 'PENDING'){
            await Deal.update(deal.id, { status: 'INPROGRESS', deadline: deadline! });
          }
        }
      }


      eventEmitter.emit(`pipelineDeals`, deal.pipeline?.funnel?.id);

      await log('sales', req, 'updateSale', 'success', JSON.stringify({ id: id }), sale);
      return res.status(201).json(sale);
    } catch (error) {
      console.error(error);
      await log('sales', req, 'updateSale', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Create failed, try again' });
    }
  }

  public async deleteSale(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      const sale = await Sale.findOne(id, { relations: ['commission', 'commission.partner', 'commission.product', 'commission.bank', 'deal', 'deal.pipeline', 'deal.pipeline.funnel'] });

      if (!sale) {
        return res.status(400).json({ message: 'Invalid workspace values' });
      }

      await Sale.softRemove(sale);

      eventEmitter.emit(`pipelineDeals`, sale?.deal?.pipeline?.funnel?.id);

      await log('sales', req, 'deleteSale', 'success', JSON.stringify({ id: id }), sale);
      return res.status(201).json(sale);
    } catch (error) {
      console.error(error);
      await log('sales', req, 'deleteSale', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Create failed, try again' });
    }
  }

  public async createTask(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      const { name, description, deadline, userId, dealId }: TaskInterface = req.body;

      const workspace = await Workspace.findOne(id);

      const user = await User.findOne(userId);

      const deal = await Deal.findOne(dealId, { relations: [ 'pipeline', 'pipeline.funnel']});

      const status = 'PENDING';

      if (!name || !userId || !dealId) return res.status(400).json({ message: 'Invalid deal values' });

      const task = await Task.create({
        name,
        description,
        deadline,
        status,
        deal,
        workspace,
        user,
      }).save();

      if (!task) return res.status(400).json({ message: 'Cannot create task' });

      eventEmitter.emit(`pipelineDeals`, deal?.pipeline?.funnel?.id);
      await log('tasks', req, 'createTask', 'success', JSON.stringify({ id: id }), deal);
      return res.status(201).json({ id: task.id, message: 'Task created successfully' });
    } catch (error) {
      console.error(error);
      await log('tasks', req, 'createTask', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Create failed, try again' });
    }
  }

  public async updateTask(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      const { name, description, deadline, status }: TaskInterface = req.body;

      const task = await Task.findOne(id, { relations: ['deal','deal.pipeline', 'deal.pipeline.funnel']});

      if (!task) return res.status(400).json({ message: 'Invalid deal values' });

      const taskUpdated = await Task.update(id, {
        name,
        description,
        deadline,
        status,
      });

      if (!task) return res.status(400).json({ message: 'Cannot update task' });

      eventEmitter.emit(`pipelineDeals`, task?.deal?.pipeline?.funnel?.id);
      await log('tasks', req, 'updateTask', 'success', JSON.stringify({ id: id }), taskUpdated);
      return res.status(201).json({ id: taskUpdated, message: 'Task updated successfully' });
    } catch (error) {
      console.error(error);
      await log('tasks', req, 'updateTask', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Update failed, try again' });
    }
  }

  public async deleteTask(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      if (!id) return res.status(400).json({ message: 'Please send a deal id' });

      const task = await Task.findOne(id, { relations: ['deal','deal.pipeline', 'deal.pipeline.funnel']});

      if (!task) return res.status(404).json({ message: 'Cannot find task' });

      await Task.softRemove(task);

      eventEmitter.emit(`pipelineDeals`, task?.deal?.pipeline?.funnel?.id);

      await log('tasks', req, 'deleteTask', 'success', JSON.stringify({ id: id }), task);
      return res.status(200).json({ message: 'Deals deleted successfully' });
    } catch (error) {
      await log('tasks', req, 'deleteTask', 'failed', JSON.stringify(error), null);
      return res.status(400).json({ error: 'Remove failed, try again' });
    }
  }


  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      if (!id) return res.status(400).json({ message: 'Please send a deal id' });

      const deal = await Deals.findOne(id);

      if (!deal) return res.status(404).json({ message: 'Cannot find deal' });

      await Deals.softRemove(deal);

      await log('deals', req, 'delete', 'success', JSON.stringify({ id: id }), deal);

      return res.status(200).json({ message: 'Deals deleted successfully' });
    } catch (error) {
      await log('deals', req, 'delete', 'failed', JSON.stringify(error), null);
      return res.status(400).json({ error: 'Remove failed, try again' });
    }
  }

}

export default new DealController();

