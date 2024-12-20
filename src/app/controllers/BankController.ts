import Workspace from '@entities/Workspace';
import { Request, Response } from 'express';
import Bank from '@entities/Bank';
import { getRepository } from 'typeorm';
import { generateColor } from '@utils/generateColor';
import { log } from '@utils/createLog';

interface BankInterface {
  name: string;
  workspace?: Workspace;
}

class BankController {
  public async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      const workspace = await Workspace.findOne(id);

      if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

      const groups = await Bank.find({ where: { workspace: workspace }, order: { createdAt: 'ASC' } });

      await log('banks', req, 'findAll', 'success', JSON.stringify(id), id);
      return res.status(200).json(groups);
    } catch (error) {
      console.error(error);
      await log('banks', req, 'findAll', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Cannot find customers, try again' });
    }
  }
  public async findById(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      if (!id) return res.status(400).json({ message: 'Please send a partner id' });

      const group = await Bank.findOne(id);

      await log('banks', req, 'findById', 'success', JSON.stringify(id), id);
      return res.status(200).json(group);
    } catch (error) {
      await log('banks', req, 'findById', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Cannot find groups, try again' });
    }
  }

  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      const { name }: BankInterface = req.body;

      const workspaceFind = await Workspace.findOne(id);

      if (!name) return res.status(400).json({ message: 'Invalid product name' });

      const hasItem = await Bank.findOne({ name })

      if(hasItem) return res.status(400).json({ message: 'Já existe um banco cadastrado com este nome.' });

      const group = await Bank.create({ name, workspace: workspaceFind, color: generateColor() }).save();

      await log('banks', req, 'create', 'success', JSON.stringify(req.body), id);
      return res.status(201).json(group);
    } catch (error) {
      console.error(error);
      await log('banks', req, 'create', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Create failed, try again' });
    }
  }
  public async import(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      const workspaceFind = await Workspace.findOne(id);
      const banksData = req.body;

      let completed = 0;
      let failed = 0;

      for (const bank of banksData) {
        const hasBank = await Bank.findOne({ where: { name: bank.name, workspace: workspaceFind }})
        if(hasBank){
          failed = failed + 1
        } else {
          let group = null
          try {
           group = await Bank.create({ name: bank.name, color: generateColor(), workspace: workspaceFind }).save();
          } catch (error) {
            console.log(error)
          }
          if(group?.id){
            completed = completed + 1
          } else {
            failed = failed + 1
          }
        }
      }

      await log('banks', req, 'import', 'success', JSON.stringify({ workspace: workspaceFind, ...req.body }), { completed: completed, failed: failed});
      return res.status(201).json({ completed: completed, failed: failed});
    } catch (error) {
      console.error(error);
      await log('banks', req, 'import', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Create failed, try again' });
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const { name }: BankInterface = req.body;
      const id = req.params.id;

      const customer = await Bank.findOne(id, { relations: ['workspace'] });

      if (!customer) return res.status(404).json({ message: 'Bank does not exist' });

      const valuesToUpdateBank: BankInterface = {
        name: name || customer.name,
      };

      await Bank.update(id, { ...valuesToUpdateBank });

      await log('banks', req, 'create', 'success', JSON.stringify(req.body), customer);
      return res.status(200).json({ message: 'Bank updated successfully' });
    } catch (error) {
      console.error(error);
      await log('banks', req, 'update', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ error: 'Update failed, try again' });
    }
  }
  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      if (!id) return res.status(400).json({ message: 'Please send a customer id' });

      const customer = await Bank.findOne(id);

      if (!customer) return res.status(404).json({ message: 'Cannot find customer' });

      await Bank.update(customer.id, { active: !customer.active });

      await log('banks', req, 'archive', 'success', JSON.stringify(id), customer);

      return res.status(200).json({ message: 'Customer deleted successfully' });
    } catch (error) {
      console.error(error);
      await log('banks', req, 'archive', 'failed', JSON.stringify(error), null);
      return res.status(500).json({ error: 'Remove failed, try again' });
    }
  }
}

export default new BankController();

