import Workspace from '@entities/Workspace';
import { Request, Response } from 'express';
import Group from '@entities/Group';
import { getRepository } from 'typeorm';
import { log } from '@utils/createLog';
import { generateColor } from '@utils/generateColor';
import compareApiKey from '@utils/compareApiKey';

interface GroupInterface {
  name: string;
  description: string;
  color: string;
  workspace?: Workspace;
}

class GroupController {
  public async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      const workspace = await Workspace.findOne(id);

      if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

      const groups = await Group.find({ where: { workspace: workspace }, order: { createdAt: 'ASC' }, relations: ['profiles'] });
      await log('groups', req, 'findAll', 'success', JSON.stringify({ id: id }), id);
      return res.status(200).json(groups);
    } catch (error) {
      console.error(error);
      await log('groups', req, 'findAll', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Cannot find customers, try again' });
    }
  }
  public async findExternalAll(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      const apiKey = req.header('apiKey');

      if (!apiKey) return res.status(401).json({ message: 'API Key not provided' });

      const keyCompared = await compareApiKey(apiKey);

      if (!keyCompared) return res.status(401).json({ message: 'API Key is not valid' });

      const workspace = await Workspace.findOne(id);

      if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

      const groups = await Group.find({ where: { workspace: workspace }, order: { createdAt: 'ASC' }, relations: ['profiles'] });
      await log('groups', req, 'findAll', 'success', JSON.stringify({ id: id }), id);
      return res.status(200).json(groups);
    } catch (error) {
      console.error(error);
      await log('groups', req, 'findAll', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Cannot find customers, try again' });
    }
  }
  public async findById(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      if (!id) return res.status(400).json({ message: 'Please send a customer id' });

      const group = await Group.findOne(id);

      await log('groups', req, 'findById', 'success', JSON.stringify({ id: id }), id);

      return res.status(200).json(group);
    } catch (error) {
      await log('groups', req, 'findById', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Cannot find groups, try again' });
    }
  }

  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      const { name, description, color }: GroupInterface = req.body;

      const workspaceFind = await Workspace.findOne(id);

      if(name) return res.status(400).json({ message: 'Invalid values for create' });

      const hasItem = await Group.findOne({ name })

      if(hasItem) return res.status(400).json({ message: 'Já existe um grupo cadastrado com este nome.' });

      const group = await Group.create({ name, description, color, workspace: workspaceFind }).save();

      await log('groups', req, 'create', 'success', JSON.stringify({ id: id }), group);

      return res.status(201).json(group);
    } catch (error) {
      console.error(error);
      await log('groups', req, 'create', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Create failed, try again' });
    }
  }

  public async import(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      const workspaceFind = await Workspace.findOne(id);

      const groupsData = req.body;

      let completed = 0;
      let failed = 0;

      for (const group of groupsData) {
        const hasGroup = await Group.findOne({ where: { name: group.name, workspace: workspaceFind }})
        if(hasGroup){
          failed = failed + 1
        } else {
          let groupCreated = null
          try {
           groupCreated = await Group.create({ name: group.name, color: generateColor(), workspace: workspaceFind }).save();
          } catch (error) {
            console.log(error)
          }
          if(groupCreated?.id){
            completed = completed + 1
          } else {
            failed = failed + 1
          }
        }
      }

      await log('groups', req, 'import', 'success', JSON.stringify({ workspace: workspaceFind, ...req.body }), { completed: completed, failed: failed});
      return res.status(201).json({ completed: completed, failed: failed});
    } catch (error) {
      console.error(error);
      await log('groups', req, 'import', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Create failed, try again' });
    }
  }
  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const { name, description, color }: GroupInterface = req.body;
      const id = req.params.id;

      const customer = await Group.findOne(id, { relations: ['workspace'] });

      if (!customer) return res.status(404).json({ message: 'Group does not exist' });

      const valuesToUpdateGroup: GroupInterface = {
        name: name || customer.name,
        description: description || customer.description,
        color: color || customer.color,
      };

      await Group.update(id, { ...valuesToUpdateGroup });

      await log('groups', req, 'update', 'success', JSON.stringify({ id: id }), customer);

      return res.status(200).json({ message: 'Group updated successfully' });
    } catch (error) {
      console.error(error);
      await log('groups', req, 'update', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ error: 'Update failed, try again' });
    }
  }
  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      if (!id) return res.status(400).json({ message: 'Please send a customer id' });

      const customer = await Group.findOne(id);

      if (!customer) return res.status(404).json({ message: 'Cannot find customer' });

      await Group.update(customer.id, { active: !customer.active });
      await log('groups', req, 'delete', 'success', JSON.stringify({ id: id }), customer);
      return res.status(200).json({ message: 'Customer deleted successfully' });
    } catch (error) {
      console.error(error);
      await log('groups', req, 'delete', 'failed', JSON.stringify(error), null);
      return res.status(500).json({ error: 'Remove failed, try again' });
    }
  }
}

export default new GroupController();

