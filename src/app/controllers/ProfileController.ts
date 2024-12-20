import Workspace from '@entities/Workspace';
import { Request, Response } from 'express';
import Profile from '@entities/Profile';
import { getRepository } from 'typeorm';
import { log } from '@utils/createLog';
import Group from '@entities/Group';

interface ProfileInterface {
  name: string;
  description: string;
  color: string;
  workspace?: Workspace;
  groups?: Group[]
}

class ProfileController {
  public async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      const workspace = await Workspace.findOne(id);

      if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

      const profiles = await Profile.find({ where: { workspace: workspace }, order: { createdAt: 'DESC' }, relations: ['groups'] });
      await log('profiles', req, 'findAll', 'success', JSON.stringify({ id: id }), id);
      return res.status(200).json(profiles);
    } catch (error) {
      console.error(error);
      await log('profiles', req, 'findAll', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Cannot find customers, try again' });
    }
  }

  public async findById(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      if (!id) return res.status(400).json({ message: 'Please send a customer id' });

      const profile = await Profile.findOne(id, { relations: ['groups']});

      await log('profiles', req, 'findById', 'success', JSON.stringify({ id: id }), id);

      return res.status(200).json(profile);
    } catch (error) {
      await log('profiles', req, 'findById', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Cannot find profiles, try again' });
    }
  }

  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      const { name, description, color, groups }: ProfileInterface = req.body;

      const workspaceFind = await Workspace.findOne(id);

      if (!name) return res.status(400).json({ message: 'Invalid product name' });

      const hasItem = await Profile.findOne({ name })

      if(hasItem) return res.status(400).json({ message: 'Já existe um perfil cadastrado com este nome.' });

      const profile = await Profile.create({ name, description, color, groups, workspace: workspaceFind }).save();

      await log('profiles', req, 'create', 'success', JSON.stringify({ id: id }), profile);

      return res.status(201).json(profile);
    } catch (error) {
      console.error(error);
      await log('profiles', req, 'create', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Create failed, try again' });
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const { name, description, color, groups }: ProfileInterface = req.body;
      const id = req.params.id;

      const profile = await Profile.findOne(id, { relations: ['workspace'] });

      if (!profile) return res.status(404).json({ message: 'Profile does not exist' });

      profile.name = name || profile.name;
      profile.description = description || profile.description;
      profile.color = color || profile.color;

      if (groups) {
        const groupRepository = getRepository(Group);
        profile.groups = await groupRepository.findByIds(groups);
      }

      await profile.save()

      await log('profiles', req, 'update', 'success', JSON.stringify({ id: id }), profile);

      return res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
      console.error(error);
      await log('profiles', req, 'update', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ error: 'Update failed, try again' });
    }
  }
  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      if (!id) return res.status(400).json({ message: 'Please send a customer id' });

      const customer = await Profile.findOne(id);

      if (!customer) return res.status(404).json({ message: 'Cannot find customer' });

      await Profile.update(customer.id, { active: !customer.active });
      await log('profiles', req, 'delete', 'success', JSON.stringify({ id: id }), customer);
      return res.status(200).json({ message: 'Customer deleted successfully' });
    } catch (error) {
      console.error(error);
      await log('profiles', req, 'delete', 'failed', JSON.stringify(error), null);
      return res.status(500).json({ error: 'Remove failed, try again' });
    }
  }
}

export default new ProfileController();

