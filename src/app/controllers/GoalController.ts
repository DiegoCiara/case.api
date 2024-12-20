import Workspace from '@entities/Workspace';
import { Request, Response } from 'express';
import Goal from '@entities/Goal';
import { getRepository } from 'typeorm';
import Product from '@entities/Product';
import Partner from '@entities/Partner';
import Bank from '@entities/Bank';
import { formatNumber } from '@utils/format';
import { log } from '@utils/createLog';
import Access from '@entities/Access';

interface GoalInterface {
  name: string;
  goal: number;
  value: number;
  type: string;
  valueRecurrence: number;
  typeRecurrence: string;
  accesses?: any;
  workspace?: Workspace;
  product?: Product;
}


class GoalController {
  public async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      const workspace = await Workspace.findOne(id);

      if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

      const groups = await Goal.find({ where: { workspace: workspace }, relations: ['product'], order: { createdAt: 'DESC' } });

      await log('goals', req, 'findAll', 'success', JSON.stringify({ id: id, workspace: workspace }), id);
      return res.status(200).json(groups);
    } catch (error) {
      console.error(error);
      await log('goals', req, 'findAll', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Cannot find goals, try again' });
    }
  }

  public async findById(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      if (!id) return res.status(400).json({ message: 'Please send a partner id' });

      const group = await Goal.findOne(id, { relations: ['product', 'accesses', 'accesses.user'] });

      await log('goals', req, 'findById', 'success', JSON.stringify({ id: id }), id);
      return res.status(200).json(group);
    } catch (error) {
      await log('goals', req, 'findById', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Cannot find groups, try again' });
    }
  }

  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      const { name, goal, product, type, value, typeRecurrence, valueRecurrence, accesses }: GoalInterface = req.body;

      if (!name || !goal ) return res.status(400).json({ message: 'Produto, parceiro ou banco não informados.' });


      if(name) return res.status(400).json({ message: 'Invalid values for create' });
      
      const hasItem = await Goal.findOne({ name })

      if(hasItem) return res.status(400).json({ message: 'Já existe uma meta cadastrado com este nome.' });
      // Validação para garantir que value e valueRecurrence sejam números
      const numericValue = value;
      const numericValueRecurrence = valueRecurrence;

      if (isNaN(numericValue) || isNaN(numericValueRecurrence)) {
        return res.status(400).json({ message: 'Os valores informados devem ser números.' });
      }

      const workspaceFind = await Workspace.findOne(id);

      const group = await Goal.create({
        name,
        goal,
        product,
        type,
        value: formatNumber(value),
        typeRecurrence,
        valueRecurrence,
        workspace: workspaceFind,
        accesses,
      }).save();

      await log('goals', req, 'create', 'success', JSON.stringify({ id: id, ...req.body }), group);
      return res.status(201).json(group);
    } catch (error) {
      console.error(error);
      await log('goals', req, 'create', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Create failed, try again' });
    }
  }

  public async import(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      const workspaceFind = await Workspace.findOne(id);
      // Supondo que req.body seja um array de objetos de comissão
      const goalsData = req.body.map((goal: GoalInterface) => ({
        ...goal,
        value: Number(goal.value),
        valueRecurrence: Number(goal.valueRecurrence),
        workspace: workspaceFind,
      }));

      // Usando o método save do TypeORM que aceita um array para salvar múltiplos registros de uma vez
      const groups = await Goal.save(goalsData);

      await log('goals', req, 'import', 'success', JSON.stringify({ workspace: workspaceFind, ...req.body }), groups);
      return res.status(201).json(groups);
    } catch (error) {
      console.error(error);
      await log('goals', req, 'import', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Create failed, try again' });
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const { name, goal, product, type, value, typeRecurrence, valueRecurrence, accesses }: GoalInterface = req.body;
      const id = req.params.id;

      const goalFind = await Goal.findOne(id, { relations: ['workspace'] });

      if (!goalFind) return res.status(404).json({ message: 'Goal does not exist' });

      // const valuesToUpdateGoal: GoalInterface = {
        goalFind.name = name || goalFind.name;
        goalFind.goal = goal || goalFind.goal;
        goalFind.value = formatNumber(value);
        goalFind.type = type || goalFind.type;
        goalFind.valueRecurrence = formatNumber(valueRecurrence);
        goalFind.typeRecurrence = typeRecurrence || goalFind.typeRecurrence;
        goalFind.product = product!;
      // };


      if (accesses) {
        const accessRepository = getRepository(Access);
        goalFind.accesses = await accessRepository.findByIds(accesses);
      }

      await goalFind.save()
      // await Goal.update(id, { ...valuesToUpdateGoal });

      await log('goal', req, 'update', 'success', JSON.stringify({ id: id, ...req.body }), goal);
      return res.status(200).json({ message: 'Goal updated successfully' });
    } catch (error) {
      console.error(error);
      await log('goals', req, 'update', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ error: 'Update failed, try again' });
    }
  }
  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      if (!id) return res.status(400).json({ message: 'Please send a goal id' });

      const goal = await Goal.findOne(id);

      if (!goal) return res.status(404).json({ message: 'Cannot find goal' });

      await Goal.update(goal.id, { active: !goal.active });

      await log('goals', req, 'archive', 'success', JSON.stringify({ id: id }), goal);
      return res.status(200).json({ message: 'Customer deleted successfully' });
    } catch (error) {
      console.error(error);
      await log('goals', req, 'update', 'failed', JSON.stringify(error), null);
      return res.status(500).json({ error: 'Remove failed, try again' });
    }
  }
}

export default new GoalController();

