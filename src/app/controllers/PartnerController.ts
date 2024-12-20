import Workspace from '@entities/Workspace';
import { Request, Response } from 'express';
import Partner from '@entities/Partner';
import { getRepository } from 'typeorm';
import { generateColor } from '@utils/generateColor';
import { log } from '@utils/createLog';

interface PartnerInterface {
  name: string;
  phone?: string;
  email?: string;
  site?: string;
  workspace?: Workspace;
}

class PartnerController {
  public async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      const workspace = await Workspace.findOne(id);

      if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

      const groups = await Partner.find({ where: { workspace: workspace }, order: { createdAt: 'ASC' } });

      await log('partners', req, 'findAll', 'success', JSON.stringify({ id: id }), id);

      return res.status(200).json(groups);
    } catch (error) {
      console.error(error);
      await log('partners', req, 'findAll', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Cannot find customers, try again' });
    }
  }
  public async findById(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      if (!id) return res.status(400).json({ message: 'Please send a partner id' });

      const group = await Partner.findOne(id);
      await log('partners', req, 'findById', 'success', JSON.stringify({ id: id }), id);

      return res.status(200).json(group);
    } catch (error) {
      await log('partners', req, 'findById', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Cannot find groups, try again' });
    }
  }

  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      const { name, phone, email, site }: PartnerInterface = req.body;

      const workspaceFind = await Workspace.findOne(id);

      if(name) return res.status(400).json({ message: 'Invalid values for create.' });

      const hasItem = await Partner.findOne({ name })

      if(hasItem) return res.status(400).json({ message: 'Já existe um parceiro cadastrado com este nome.' });

      const group = await Partner.create({
        name,
        phone: phone?.replace(/\D/g, ''),
        color: generateColor(),
        email,
        site,
        workspace: workspaceFind,
      }).save();
      await log('partners', req, 'create', 'success', JSON.stringify({ id: id }), group);

      return res.status(201).json(group);
    } catch (error) {
      console.error(error);
      await log('partners', req, 'create', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Create failed, try again' });
    }
  }


  public async import(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      const workspaceFind = await Workspace.findOne(id);
      // Supondo que req.body seja um array de objetos de comissão

      const partnersData = req.body;

      let completed = 0;
      let failed = 0;

      for (const partner of partnersData) {
        const hasPartner = await Partner.findOne({ where: { name: partner.name, workspace: workspaceFind }})
        if(hasPartner){
          failed = failed + 1
        } else {
          const group = await Partner.create({ name: partner.name, color: generateColor(), workspace: workspaceFind }).save();
          if(group.id){
            completed = completed + 1
          } else {
            failed = failed + 1
          }
        }
      }

      await log('partners', req, 'import', 'success', JSON.stringify({ workspace: workspaceFind, ...req.body }), { completed: completed, failed: failed});
      return res.status(201).json({ completed: completed, failed: failed});
    } catch (error) {
      console.error(error);
      await log('partners', req, 'import', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Create failed, try again' });
    }
  }
  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const { name, phone, email, site }: PartnerInterface = req.body;
      const id = req.params.id;

      const customer = await Partner.findOne(id, { relations: ['workspace'] });

      if (!customer) return res.status(404).json({ message: 'Partner does not exist' });

      const valuesToUpdatePartner: PartnerInterface = {
        name: name || customer.name,
        phone: phone?.replace(/\D/g, '') || customer.phone,
        email: email || customer.email,
        site: site || customer.site,
      };
      await Partner.update(id, { ...valuesToUpdatePartner });
      await log('partners', req, 'update', 'success', JSON.stringify({ id: id }), customer);

      return res.status(200).json({ message: 'Partner updated successfully' });
    } catch (error) {
      console.error(error);
      await log('partners', req, 'update', 'failed', JSON.stringify(error), null);

      return res.status(404).json({ error: 'Update failed, try again' });
    }
  }
  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      if (!id) return res.status(400).json({ message: 'Please send a customer id' });

      const customer = await Partner.findOne(id);

      if (!customer) return res.status(404).json({ message: 'Cannot find customer' });

      await Partner.update(customer.id, { active: !customer.active });
      await log('partners', req, 'archive', 'success', JSON.stringify({ id: id }), customer);

      return res.status(200).json({ message: 'Customer archived successfully' });
    } catch (error) {
      console.error(error);
      await log('partners', req, 'archive', 'failed', JSON.stringify(error), null);
      return res.status(500).json({ error: 'Remove failed, try again' });
    }
  }
}

export default new PartnerController();

