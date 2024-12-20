import axios from 'axios';
import { Request, Response } from 'express';
import Pipelines from '@entities/Pipeline';
import queryBuilder from '@utils/queryBuilder';
import Funnel from '@entities/Funnel';
import Deal from '@entities/Deal';
import Workspace from '@entities/Workspace';
import { In, getManager } from 'typeorm';
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import { log } from '@utils/createLog';
import User from '@entities/User';
import Access from '@entities/Access';
import Thread from '@entities/Thread';
import Message from '@entities/Message';
import eventEmitter from '@utils/emitter';
import { generateDealsList } from '@utils/generateDealsList';

interface PipelineInterface {
  id?: string;
  name?: string;
  description?: string;
  color?: string;
  position?: number;
  funnel?: Funnel;
}

class PipelineController {
  public async findDealsPipeline(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      // const userId = req.params.sort;

      if (!uuidValidate(id)) return res.status(400).json({ message: 'Id not provided or invalid' });

      const funnel = await Funnel.findOne(id, {
        where: { active: true },
        relations: ['pipelines', 'workspace'],
      });
      if (!funnel) return res.status(404).json({ message: 'Funnel not found' });

      const user = await User.findOne(req.userId);
      if (!user) return res.status(404).json({ message: 'Funnel not found' });

      const access = await Access.findOne({ where: { user, workspace: funnel.workspace}})

      if(!access)return res.status(404).json({ message: 'Access not found' });

      const hasAccessToFunnel = await Access.createQueryBuilder('access')
        .innerJoin('access.funnels', 'funnel')
        .where('access.user = :userId', { userId: user.id })
        .andWhere('funnel.id = :funnelId', { funnelId: funnel.id })
        .getOne();

      if (!hasAccessToFunnel) {
        return res.status(403).json({ message: 'User does not have access to this funnel' });
      }

      const restricted = await funnel.dealParams?.restrictedTo?.includes(hasAccessToFunnel?.role);

      // Carrega apenas os dados essenciais de deals
      let deals = []
      if(access.role === 'SELLER'){
        deals = await Deal.find({
         where:[
          {
           pipeline: In(funnel.pipelines.map((pipeline) => pipeline.id)),
           ...(funnel?.dealParams.status ? { status: In(funnel?.dealParams.status) } : {}),
           user: null
         },
         {
          pipeline: In(funnel.pipelines.map((pipeline) => pipeline.id)),
          ...(funnel?.dealParams.status ? { status: In(funnel?.dealParams.status) } : {}),
          user: user
         }
         ],
         select: ['id', 'status', 'createdAt', 'updatedAt', 'deadline'], // Limita os campos carregados
         relations: ['customer','customer.contact','customer.contact.threads','customer.contact.threads.messages', 'tasks', 'customer.groups', 'sales', 'pipeline', 'user'], // Remove relações desnecessárias
         order: { updatedAt: 'DESC' }
       });
      } else {
         deals = await Deal.find({
          where: {
            pipeline: In(funnel.pipelines.map((pipeline) => pipeline.id)),
            ...(funnel?.dealParams.status ? { status: In(funnel?.dealParams.status) } : {}),
            ...(restricted ? { user: user } : {}),
          },
          select: ['id', 'status', 'updatedAt', 'createdAt', 'deadline',], // Limita os campos carregados
          relations: ['customer','customer.contact','customer.contact.threads','customer.contact.threads.messages', 'tasks', 'customer.groups', 'sales', 'pipeline', 'user'], // Remove relações desnecessárias
          order: { updatedAt: 'DESC' }
        });
      }

      // Mapeia os dados em uma estrutura mais simples
      console.log('Chegou no findDeals pipelines')
      const responseDeals = deals.map((e: Deal) => {

        const groupNames = e.customer.groups.map((e) => {
          return e.name;
        });

        const tasks = e?.tasks.map((e) => {
          return {
            name: e?.name,
            deadline: e?.deadline,
          }
        })

        const messagesNotViewed = e?.customer.contact.threads?.find(e => e.chatActive === true)?.messages.filter(e => e.viewed === false).length || 0

        return {
          id: e.id,
          customerName: e?.customer?.name || '',
          customerPhone: e?.customer?.contact?.phone || '',
          customerCpfCnpj: e?.customer?.cpfCnpj || '',
          funelName: e?.pipeline?.funnel?.name || '',
          groupNames: groupNames || [],
          userName: e?.user?.name || '',
          value: e.sales.reduce((acc, curr) => acc + curr.value, 0),
          status: e?.status,
          createdAt: e?.createdAt,
          updatedAt: e?.updatedAt,
          pipeline: { id: e?.pipeline.id },
          userPicture: e?.user?.picture,
          tasks: tasks,
          messagesNotViewed: messagesNotViewed,
          deadline: e?.deadline,
        }}
      );

      funnel.pipelines = funnel.pipelines.sort((a, b) => a.position - b.position);
      const dealsList = await generateDealsList(funnel?.pipelines, responseDeals)
      const pipelineData = {
        funnel: funnel,
        deals: responseDeals,
        dealsList: dealsList,
      };

      await log('pipelines', req, 'findDealsPipeline', 'success', JSON.stringify({ id: id }), id);
      return res.status(200).json(pipelineData);
    } catch (error) {
      console.error(error);
      await log('pipelines', req, 'findDealsPipeline', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Cannot find Funnel, try again' });
    }
  }
  public async findDealsByPipeline(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      if (!uuidValidate(id)) return res.status(400).json({ message: 'Id not provided or invalid' });

      const pipeline = await Pipelines.findOne(id, { relations: ['funnel', 'funnel.workspace']});
      if (!pipeline) return res.status(404).json({ message: 'Funnel not found' });

      const user = await User.findOne(req.userId);
      if (!user) return res.status(404).json({ message: 'Funnel not found' });

      const access = await Access.findOne({ where: { user, workspace: pipeline?.funnel.workspace}})

      if(!access)return res.status(404).json({ message: 'Access not found' });

      const hasAccessToFunnel = await Access.createQueryBuilder('access')
        .innerJoin('access.funnels', 'funnel')
        .where('access.user = :userId', { userId: user.id })
        .andWhere('funnel.id = :funnelId', { funnelId: pipeline?.funnel.id })
        .getOne();

      if (!hasAccessToFunnel) {
        return res.status(403).json({ message: 'User does not have access to this funnel' });
      }

      const restricted = await pipeline?.funnel?.dealParams?.restrictedTo?.includes(hasAccessToFunnel?.role);

      // Carrega apenas os dados essenciais de deals
      let deals = []
      if(access.role === 'SELLER'){
        deals = await Deal.find({
         where:[
          {
           pipeline: In(pipeline?.funnel.pipelines.map((pipeline) => pipeline.id)),
           ...(pipeline?.funnel?.dealParams.status ? { status: In(pipeline?.funnel?.dealParams.status) } : {}),
           user: null
         },
         {
          pipeline: pipeline,
          ...(pipeline?.funnel?.dealParams.status ? { status: In(pipeline?.funnel?.dealParams.status) } : {}),
          user: user
         }
         ],
         select: ['id', 'status', 'createdAt', 'updatedAt', 'deadline'], // Limita os campos carregados
         relations: ['customer','customer.contact','customer.contact.threads','customer.contact.threads.messages', 'tasks', 'customer.groups', 'sales', 'pipeline', 'user'], // Remove relações desnecessárias
         order: { updatedAt: 'DESC' },
         take: 3,
       });
      } else {
         deals = await Deal.find({
          where: {
            pipeline: pipeline,
            ...(pipeline?.funnel?.dealParams.status ? { status: In(pipeline?.funnel?.dealParams.status) } : {}),
            ...(restricted ? { user: user } : {}),
          },
          select: ['id', 'status', 'updatedAt', 'createdAt', 'deadline',], // Limita os campos carregados
          relations: ['customer','customer.contact','customer.contact.threads','customer.contact.threads.messages', 'tasks', 'customer.groups', 'sales', 'pipeline', 'user'], // Remove relações desnecessárias
          order: { updatedAt: 'DESC' },
          take: 3,
        });
      }

      // Mapeia os dados em uma estrutura mais simples
      console.log('Chegou no findDeals pipelines by pipelines')
      const responseDeals = deals.map((e: Deal) => {

        const groupNames = e.customer.groups.map((e) => {
          return e.name;
        });

        const tasks = e?.tasks.map((e) => {
          return {
            name: e?.name,
            deadline: e?.deadline,
          }
        })

        const messagesNotViewed = e?.customer.contact.threads?.find(e => e.chatActive === true)?.messages.filter(e => e.viewed === false).length || 0

        return {
          id: e.id,
          customerName: e?.customer?.name || '',
          customerPhone: e?.customer?.contact?.phone || '',
          customerCpfCnpj: e?.customer?.cpfCnpj || '',
          funelName: e?.pipeline?.funnel?.name || '',
          groupNames: groupNames || [],
          userName: e?.user?.name || '',
          value: e.sales.reduce((acc, curr) => acc + curr.value, 0),
          status: e?.status,
          createdAt: e?.createdAt,
          updatedAt: e?.updatedAt,
          pipeline: { id: e?.pipeline.id },
          userPicture: e?.user?.picture,
          tasks: tasks,
          messagesNotViewed: messagesNotViewed,
          deadline: e?.deadline,
        }}
      );


      await log('pipelines', req, 'findDealsPipeline', 'success', JSON.stringify({ id: id }), id);
      return res.status(200).json(responseDeals);
    } catch (error) {
      console.error(error);
      await log('pipelines', req, 'findDealsPipeline', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Cannot find Funnel, try again' });
    }
  }

  public async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      if (!id) return res.status(400).json({ message: 'Id not provided' });

      const funnel = await Funnel.findOne(id);

      const deals = await Pipelines.find({ where: { funnel: funnel } });

      await log('pipelines', req, 'findAll', 'success', JSON.stringify({ id: id }), id);

      return res.status(200).json(deals);
    } catch (error) {
      await log('pipelines', req, 'findAll', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Cannot find contacts, try again' });
    }
  }

  public async findById(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      if (!id) return res.status(400).json({ message: 'Please send a contact id' });

      const deal = await Pipelines.findOne(id, queryBuilder(req.query));

      await log('pipelines', req, 'findById', 'success', JSON.stringify({ id: id }), id);
      return res.status(200).json(deal);
    } catch (error) {
      await log('pipelines', req, 'findById', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Cannot find contacts, try again' });
    }
  }

  public async findByFunnel(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      if (!id) return res.status(400).json({ message: 'Please send a contact id' });

      const funnel = await Funnel.findOne(id, { relations: ['pipelines']});

      await log('pipelines', req, 'findByFunnel', 'success', JSON.stringify({ id: id }), id);
      return res.status(200).json(funnel?.pipelines);
    } catch (error) {
      await log('pipelines', req, 'findById', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Cannot find contacts, try again' });
    }
  }

  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const { name, description, funnel, color, position }: PipelineInterface = req.body;

      if (!name) return res.status(400).json({ message: 'Invalid pipeline values' });

      const funnelFind = await Funnel.findOne(funnel?.id, { relations: ['pipelines'] });

      if (!funnelFind) return res.status(404).json({ message: 'Funil não encontrado' });

      const pipelines = funnelFind.pipelines.filter((e) => e.active === true);

      const pipelineExists = pipelines.find((e) => e.name.toLowerCase() === name.toLowerCase());

      if (pipelineExists) return res.status(413).json({ message: 'Não é possível adicionar outro pipeline com o mesmo nome.' });

      const pipeline = await Pipelines.create({
        name,
        description,
        funnel,
        color,
        position,
      }).save();

      if (!pipeline) return res.status(400).json({ message: 'Cannot create pipeline' });

      await log('pipelines', req, 'create', 'success', JSON.stringify(req.body), pipeline);
      return res.status(201).json(pipeline);
    } catch (error) {
      console.error(error);
      await log('pipelines', req, 'create', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Create failed, try again' });
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const { name, description, color }: PipelineInterface = req.body;

      const id = req.params.id;

      const pipeline = await Pipelines.findOne(id);

      if (!pipeline) return res.status(404).json({ message: 'Pipelines does not exist' });

      const valuesToUpdate: PipelineInterface = {
        name: name || pipeline?.name,
        description: description || pipeline?.description,
        color: color || pipeline?.color,
      };


      await Pipelines.update(id, { ...valuesToUpdate });

      await log('pipelines', req, 'update', 'success', JSON.stringify({ id: id }), pipeline);
      return res.status(200).json({ message: 'Pipelines updated successfully' });
    } catch (error) {
      await log('pipelines', req, 'update', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ error: 'Update failed, try again' });
    }
  }

  public async archive(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      if (!id) return res.status(400).json({ message: 'Please send a pipeline id' });

      const pipeline = await Pipelines.findOne(id, { relations: ['funnel'] });

      if (!pipeline) return res.status(404).json({ message: 'Cannot find pipeline' });

      const funnel = await Funnel.findOne(pipeline?.funnel?.id, { relations: ['pipelines'] });

      if (!funnel) return res.status(404).json({ message: 'Cannot find funnel' });

      const pipelinesActive = await funnel.pipelines.filter((e) => e.active === true);

      if (pipelinesActive.length === 1) return res.status(413).json({ message: 'O funil precisa ter ao menos um único pipeline.' });

      // await Pipelines.softRemove(pipeline);

      await Pipelines.update(id, { active: false });

      const deals = await Deal.find({ where: { pipeline: pipeline } });

      deals.map(async (deal) => await Deal.update(deal.id, { status: 'ARCHIVED' }));

      await log('pipelines', req, 'archive', 'success', JSON.stringify(req.body), pipeline);
      return res.status(200).json({ message: 'Pipelines deleted successfully' });
    } catch (error) {
      await log('pipelines', req, 'archive', 'failed', JSON.stringify(error), null);
      return res.status(400).json({ error: 'Remove failed, try again' });
    }
  }
  // public async delete(req: Request, res: Response): Promise<Response> {
  //   try {
  //     const id = req.params.id;

  //     if (!id) return res.status(400).json({ message: 'Please send a pipeline id' });

  //     const pipeline = await Pipelines.findOne(id, { relations: [ 'funnel']});

  //     if (!pipeline) return res.status(404).json({ message: 'Cannot find pipeline' });

  //     // const deals = await Deal.find({ where: { pipeline: pipeline } });

  //     // deals.map(async (deal) => await Deal.update(deal.id, { status: 'ARCHIVED' }));

  //     return res.status(200).json({ message: 'Pipelines deleted successfully' });
  //   } catch (error) {
  //     return res.status(400).json({ error: 'Remove failed, try again' });
  //   }
  // }
}

export default new PipelineController();

