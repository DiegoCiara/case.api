import axios from 'axios';
import { Request, Response } from 'express';
import Product from '@entities/Product';
import queryBuilder from '@utils/queryBuilder';
import Workspace from '@entities/Workspace';
import { generateColor } from '@utils/generateColor';
import { log } from '@utils/createLog';
import Profile from '@entities/Profile';
import { getRepository } from 'typeorm';

interface ProductInterface {
  id?: string;
  name?: string;
  description?: string;
  workspace?: Workspace;
  profiles?: Profile[];
  picture?: string;
}

class ProductController {
  public async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      const workspace = await Workspace.findOne(id, { relations: ['products'] });

      const products = await Product.find({ where: { workspace: workspace }, relations:['profiles'] });

      await log('products', req, 'findAll', 'success', JSON.stringify({ id: id }), id);
      return res.status(200).json(products?.reverse());
    } catch (error) {
      await log('products', req, 'findAll', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Cannot find products, try again' });
    }
  }
  public async findById(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      if (!id) return res.status(400).json({ message: 'Please send a product id' });
      const product = await Product.findOne(id, { relations: ['profiles']});
      await log('products', req, 'findById', 'success', JSON.stringify({ id: id }), id);
      return res.status(200).json(product);
    } catch (error) {
      await log('products', req, 'findById', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Cannot find products, try again' });
    }
  }

  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      const workspace = await Workspace.findOne(id);

      const { name, description, profiles }: ProductInterface = req.body;

      if (!name) return res.status(400).json({ message: 'Invalid product name' });

      const hasItem = await Product.findOne({ name })

      if(hasItem) return res.status(400).json({ message: 'Já existe um produto cadastrado com este nome.' });
      const product = await Product.create({ name, description, profiles, color: generateColor(), workspace }).save();

      if (!product) return res.status(400).json({ message: 'Cannot create product' });
      await log('products', req, 'create', 'success', JSON.stringify({ id: id }), product);
      return res.status(201).json({ id: product.id, message: 'Product created successfully' });
    } catch (error) {
      await log('products', req, 'create', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Create failed, try again' });
    }
  }

  public async import(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      const workspaceFind = await Workspace.findOne(id);
      // Supondo que req.body seja um array de objetos de comissão

      const productsData = req.body;

      let completed = 0;
      let failed = 0;

      for (const product of productsData) {
        const hasProduct = await Product.findOne({ where: { name: product.name, workspace: workspaceFind }})
        if(hasProduct){
          failed = failed + 1
        } else {
          const group = await Product.create({ name: product.name, color: generateColor(), workspace: workspaceFind }).save();
          if(group.id){
            completed = completed + 1
          } else {
            failed = failed + 1
          }
        }
      }

      await log('products', req, 'import', 'success', JSON.stringify({ workspace: workspaceFind, ...req.body }), { completed: completed, failed: failed});
      return res.status(201).json({ completed: completed, failed: failed});
    } catch (error) {
      console.error(error);
      await log('products', req, 'import', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Create failed, try again' });
    }
  }
  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const { name, description, profiles }: ProductInterface = req.body;
      const id = req.params.id;

      const product = await Product.findOne(id);

      if (!product) return res.status(404).json({ message: 'Product does not exist' });

      product.name = name|| product.name;
      product.description = description|| product.description;

      console.log(profiles)
      if (profiles) {
        const profileRepository = getRepository(Profile);
        product.profiles = await profileRepository.findByIds(profiles);
      }
      await product.save()
      await log('products', req, 'update', 'success', JSON.stringify({ id: id }), product);
      return res.status(200).json({ message: 'Product updated successfully' });
    } catch (error) {
      await log('products', req, 'update', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ error: 'Update failed, try again' });
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      if (!id) return res.status(400).json({ message: 'Please send a product id' });

      const product = await Product.findOne(id);

      if (!product) return res.status(404).json({ message: 'Cannot find product' });

      await Product.update(product.id, { active: !product.active });

      await log('products', req, 'delete', 'success', JSON.stringify({ id: id }), product);

      return res.status(200).json({ message: 'Product archived successfully' });
    } catch (error) {
      await log('products', req, 'delete', 'failed', JSON.stringify(error), null);
      return res.status(400).json({ error: 'Remove failed, try again' });
    }
  }
}

export default new ProductController();

