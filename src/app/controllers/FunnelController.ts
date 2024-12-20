import axios from 'axios';
import { Request, Response } from 'express';
import Funnel from '@entities/Funnel';
import queryBuilder from '@utils/queryBuilder';
import Pipeline from '@entities/Pipeline';
import Deal from '@entities/Deal';
import Workspace from '@entities/Workspace';
import { generateColor } from '@utils/generateColor';
import { getManager, getRepository } from 'typeorm';
import { log } from '@utils/createLog';
import Access from '@entities/Access';
import User from '@entities/User';
import { socket } from '@src/socket';
import eventEmitter from '@utils/emitter';

interface FunnelInterface {
  id?: string;
  name?: string;
  description?: string;
  pipelines?: Pipeline[];
  accesses?: Access[];
  dealParams?: any;
}

class FunnelController {
  public async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      if (!id) return res.status(400).json({ message: 'Please send an workspace id' });

      const workspace = await Workspace.findOne(id);

      if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

      // Crie um QueryBuilder para encontrar todos os funis com pipelines ativos
      const funnels = await getManager()
        .createQueryBuilder(Funnel, 'funnel')
        .leftJoinAndSelect('funnel.pipelines', 'pipeline')
        // .leftJoinAndSelect('pipeline.deals', 'deal')
        .where('funnel.workspace = :workspaceId', { workspaceId: workspace.id })
        // .andWhere('pipeline.active = :pipelineActive', { pipelineActive: true })
        // .orWhere('funnel.pipelines IS NULL') // Inclui funis sem pipelines
        // .orderBy('funnel.createdAt', 'DESC')
        .getMany();

      // Se houver funis sem pipelines ativos, adicione-os ao resultado
      // const filteredFunnels = funnels.filter(
      //   (funnel) => funnel.pipelines.length === 0 || funnel.pipelines.some((pipeline) => pipeline.active)
      // );

      // Filtrar pipelines ativos para cada funil
      const filteredFunels = funnels.map((funnel) => ({
        ...funnel,
        pipelines: funnel.pipelines?.filter((pipeline) => pipeline.active) || [],
      }));

      log('funnels', req, 'findAll', 'success', JSON.stringify({ id: id }), id);
      return res.status(200).json(filteredFunels.reverse());
    } catch (error) {
      log('funnels', req, 'findAll', 'failed', JSON.stringify(error), null);

      return res.status(404).json({ message: 'Cannot find funnels, try again' });
    }
  }
  public async findFunnels(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      if (!id) return res.status(400).json({ message: 'Please send an workspace id' });

      const workspace = await Workspace.findOne(id);

      if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

      const funnels = await Funnel.find({ where: {workspace, active: true}, select: ['id', 'name']})

      log('funnels', req, 'findAll', 'success', JSON.stringify({ id: id }), id);
      return res.status(200).json(funnels);
    } catch (error) {
      log('funnels', req, 'findAll', 'failed', JSON.stringify(error), null);

      return res.status(404).json({ message: 'Cannot find funnels, try again' });
    }
  }


public async findAllActive(req: Request, res: Response): Promise<Response> {
    const workspaceId = req.params.id;
    if (!workspaceId) {
        return res.status(400).json({ message: 'Please send a workspace id' });
    }

    try {
        // Verificar a existência do workspace e do usuário
        const workspace = await Workspace.findOne(workspaceId);
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        const user = await User.findOne(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Buscar um único acesso com cálculos agregados de pipelines, deals e totalValue
        const access = await getRepository(Access)
        .createQueryBuilder('access')
        .leftJoin('access.funnels', 'funnel')
        .leftJoin('funnel.pipelines', 'pipeline')
        .leftJoin('pipeline.deals', 'deal', 'deal.status IN (:...statuses)', { statuses: ['INPROGRESS', 'PENDING'] })
        .leftJoin('deal.sales', 'sale')
        .select([
            'funnel.id AS "funnelId"',
            'funnel.name AS "funnelName"',
            'funnel.active AS "active"',
            'COUNT(DISTINCT pipeline.id) AS "pipelinesCount"',
            'COUNT(DISTINCT deal.id) AS "totalDealsInFunnel"',
            'COALESCE(SUM(sale.value), 0) AS "totalValue"'
        ])
        .where('access.workspace = :workspaceId', { workspaceId: workspaceId })
        .andWhere('access.user = :userId', { userId: user.id })
        .groupBy('funnel.id')
        .getRawMany();  // getRawMany para trazer os cálculos diretamente como um array de resultados

        if (!access || access.length === 0) {
        return res.status(404).json({ message: 'Access not found' });
        }

        // Formatar os resultados para o frontend
        const formattedAccess = access.filter(funnel => funnel.active) // Filtra apenas os funis ativos
        .map(funnel => ({
        id: funnel.funnelId,
        name: funnel.funnelName,
        pipelines: parseInt(funnel.pipelinesCount, 10),
        deals: parseInt(funnel.totalDealsInFunnel, 10),
        totalValue: parseFloat(funnel.totalValue)
        }));


        await log('funnels', req, 'findAllActive', 'success', JSON.stringify({ id: workspaceId }), workspaceId);
        return res.status(200).json(formattedAccess);
    } catch (error) {
        console.error(error);
        await log('funnels', req, 'findAllActive', 'failed', JSON.stringify(error), null);
        return res.status(500).json({ message: 'Cannot find funnels, try again' });
    }
}

  public async findById(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      if (!id) return res.status(400).json({ message: 'Please send a funnel id' });

      // Crie um QueryBuilder para encontrar o funil com pipelines
      // const funnel = await getManager()
      //   .createQueryBuilder(Funnel, 'funnel')
      //   .leftJoinAndSelect('funnel.pipelines', 'pipeline')
      //   .leftJoinAndSelect('funnel.accesses', 'access')
      //   .where('funnel.id = :id', { id })
      //   .getOne();

      const funnel = await Funnel.findOne(id, {relations: ['pipelines', 'accesses', 'accesses.user']})

      if (!funnel) return res.status(404).json({ message: 'Funnel not found' });

      // Filtrar pipelines ativos com JavaScript
      const activePipelines = funnel.pipelines?.filter((pipeline) => pipeline.active) || [];
      log('funnels', req, 'findById', 'success', JSON.stringify({ id: id }), id);

      return res.status(200).json({
        ...funnel,
        pipelines: activePipelines,
      });
    } catch (error) {
      log('funnels', req, 'findById', 'failed', JSON.stringify(error), null);
      return res.status(500).json({ message: 'Cannot find funnel, try again' });
    }
  }
  public async findFunnelActive(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      if (!id) return res.status(400).json({ message: 'Please send a funnel id' });

      // Crie um QueryBuilder para encontrar o funil com pipelines ativos
      const funnel = await getManager()
        .createQueryBuilder(Funnel, 'funnel')
        .leftJoinAndSelect('funnel.pipelines', 'pipeline')
        .where('funnel.id = :id', { id })
        .andWhere('funnel.active = :active', { active: true })
        .getOne();

      if (!funnel) return res.status(404).json({ message: 'Funnel not found or inactive' });
      log('funnels', req, 'findFunnelActive', 'success', JSON.stringify({ id: id }), funnel);
      return res.status(200).json(funnel);
    } catch (error) {
      log('funnels', req, 'findFunnelActive', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Funel is not active' });
    }
  }

  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      if (!id) return res.status(400).json({ message: 'Please send id' });

      const workspace = await Workspace.findOne(id);

      if (!workspace) return res.status(404).json({ message: 'Please send id' });

      const { name, description, pipelines, dealParams, accesses }: FunnelInterface = req.body;

      if (!name || !description) return res.status(400).json({ message: 'Valores inválidos para o funil' });

      const findFunnel = await Funnel.find({ where: { workspace: workspace, active: true } });

      const hasFunnel = findFunnel.find((e) => e.name.toLowerCase() === name.toLowerCase());

      if (hasFunnel) return res.status(413).json({ message: 'Já existe um funil com esse nome neste access' });

      const funnel = await Funnel.create({
        name,
        description,
        workspace,
        dealParams,
        accesses,
      }).save();

      if (!funnel) return res.status(400).json({ message: 'Não foi possível criar o funil' });

      if (pipelines) {
        for (const pipeline of pipelines) {
          const createPipeline = await Pipeline.create({
            name: pipeline.name,
            description: pipeline.description,
            position: pipeline.position,
            color: pipeline.color,
            funnel: funnel,
          }).save();
        }
      }
      log('funnels', req, 'create', 'success', JSON.stringify({ id: id }), funnel);

      eventEmitter.emit(`activeFunnels`, workspace.id);

      return res.status(201).json({ id: funnel.id, message: 'Funil criado com sucesso' });
    } catch (error) {
      console.error(error);
      log('funnels', req, 'create', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Não foi possível criar o funil, tente novamente' });
    }
  }

  public async duplicate(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      if (!id) return res.status(400).json({ message: 'Please send a funnel id' });

      // 1. Encontra o funil original pelo ID
      const originalFunnel = await Funnel.findOne(id, { relations: ['pipelines', 'workspace'] });

      if (!originalFunnel) return res.status(404).json({ message: 'Funnel not found' });

      // 2. Cria uma nova instância de Funnel com os mesmos dados
      const newFunnel = Funnel.create({
        name: `${originalFunnel.name} (Copy)`, // Ajusta o nome para indicar que é uma cópia
        description: originalFunnel.description,
        workspace: originalFunnel.workspace,
        dealParams: originalFunnel.dealParams,
        active: originalFunnel.active,
        accesses: originalFunnel.accesses,
      });

      // 3. Salva o novo funil no banco de dados
      await newFunnel.save();

      // 4. Duplica os pipelines do funil original
      if (originalFunnel.pipelines && originalFunnel.pipelines.length > 0) {
        for (const originalPipeline of originalFunnel.pipelines) {
          const newPipeline = Pipeline.create({
            name: originalPipeline.name,
            description: originalPipeline.description,
            position: originalPipeline.position,
            color: originalPipeline.color,
            funnel: newFunnel, // Associa ao novo funil
          });
          await newPipeline.save();
        }
      }
      log('funnels', req, 'duplicate', 'success', JSON.stringify({ id: id }), newFunnel);

      // Retorna o novo funil criado
      return res.status(201).json({ id: newFunnel.id, message: 'Funil duplicado com sucesso' });
    } catch (error) {
      console.error(error);
      log('funnels', req, 'duplicate', 'failed', JSON.stringify(error), null);
      return res.status(500).json({ message: 'Cannot duplicate funnel, try again' });
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const { name, description, dealParams, pipelines, accesses }: FunnelInterface = req.body;

      const id = req.params.id;

      const funnel = await Funnel.findOne(id, { relations: ['workspace']});

      if (!funnel) return res.status(404).json({ message: 'Funnel does not exist' });

      // const valuesToUpdate: FunnelInterface = {
        funnel.name = name || funnel.name;
        funnel.description = description || funnel.description;
        funnel.dealParams = dealParams || funnel.dealParams;
      // };

      if (pipelines) {
        // Iniciar uma transação para garantir consistência
        await getManager().transaction(async (transactionalEntityManager) => {
          for (const pipeline of pipelines) {
            try {
              // Encontrar e atualizar o pipeline
              const pipelineFinded = await transactionalEntityManager.findOne(Pipeline, pipeline.id);
              if (pipelineFinded) {
                pipelineFinded.position = pipeline.position;
                await transactionalEntityManager.save(Pipeline, pipelineFinded);
              }
            } catch (error) {
              console.error(error);
              throw new Error('Pipeline update failed');
            }
          }
        });
      }

      if (accesses) {
        const accessRepository = getRepository(Access);
        funnel.accesses = await accessRepository.findByIds(accesses);
      }

      await funnel.save()

      eventEmitter.emit(`activeFunnels`, funnel.workspace.id);

      log('funnels', req, 'update', 'success', JSON.stringify({ id: id }), funnel);

      return res.status(200).json({ message: 'Funnel updated successfully' });
    } catch (error) {
      log('funnels', req, 'update', 'failed', JSON.stringify(error), null);
      console.log(error)
      return res.status(404).json({ error: 'Update failed, try again' });
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      if (!id) return res.status(400).json({ message: 'Please send a funnel id' });

      const funnel = await Funnel.findOne(id, { relations: ['pipelines'] });

      if (!funnel) return res.status(404).json({ message: 'Cannot find funnel' });

      const pipelines = await Pipeline.find({ where: { funnel: funnel.id } });

      for (const pipeline of pipelines) {
        // await Pipeline.softRemove(pipeline);
        const deals = await Deal.find({ where: { pipeline: pipeline.id } });
        deals.map(async (deal) => await Deal.update(deal.id, { status: 'ARCHIVED' }));
      }

      await Funnel.update(id, { active: !funnel.active });
      log('funnels', req, 'archive', 'success', JSON.stringify({ id: id }), funnel);

      return res.status(200).json({ message: 'Funnel deleted successfully' });
    } catch (error) {
      log('funnels', req, 'archive', 'failed', JSON.stringify(error), null);
      return res.status(400).json({ error: 'Remove failed, try again' });
    }
  }
}

export default new FunnelController();

