import axios from 'axios';
import { Request, Response } from 'express';
import Pipelines from '@entities/Pipeline';
import queryBuilder from '@utils/queryBuilder';
import Workspace from '@entities/Workspace';
import { In, getManager } from 'typeorm';
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import { log } from '@utils/createLog';
import User from '@entities/User';
import Access from '@entities/Access';
import Thread from '@entities/Thread';
import Message from '@entities/Message';
import eventEmitter from '@utils/emitter';

interface PipelineInterface {
  id?: string;
  name?: string;
  description?: string;
  color?: string;
  position?: number;
}

class PipelineController {

  public async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      if (!id) return res.status(400).json({ message: 'Id not provided' });

      const workspace = await Workspace.findOne(id);

      const deals = await Pipelines.find({ where: { workspace } });

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

  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const { id }: PipelineInterface = req.params;
      const { name, description, color, position }: PipelineInterface = req.body;

      if (!name) return res.status(400).json({ message: 'Invalid pipeline values' });

      const workspace = await Workspace.findOne(id, { relations: ['pipelines'] });

      if (!workspace) return res.status(404).json({ message: 'Funil não encontrado' });

      const pipelines = workspace.pipelines.filter((e) => e.active === true);

      const pipelineExists = pipelines.find((e) => e.name.toLowerCase() === name.toLowerCase());

      if (pipelineExists) return res.status(413).json({ message: 'Não é possível adicionar outro pipeline com o mesmo nome.' });

      const pipeline = await Pipelines.create({
        name,
        description,
        workspace,
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

      await Pipelines.update(id, { active: false });

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

