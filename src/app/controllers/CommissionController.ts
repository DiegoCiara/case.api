import Workspace from '@entities/Workspace';
import { Request, Response } from 'express';
import Commission from '@entities/Commission';
import { getRepository } from 'typeorm';
import Product from '@entities/Product';
import Partner from '@entities/Partner';
import Bank from '@entities/Bank';
import { formatNumber } from '@utils/format';
import { log } from '@utils/createLog';
import Group from '@entities/Group';

interface CommissionInterface {
  name: string;
  value: number;
  type: string;
  valueRecurrence: number;
  group: Group;
  typeRecurrence: string;
  workspace?: Workspace;
  hasRepresentant?: boolean;
  term?:string;
  product?: Product;
  partner?: Partner;
  bank?: Bank;
}

class CommissionController {
  public async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      const workspace = await Workspace.findOne(id);

      if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

      const groups = await Commission.find({
        where: { workspace: workspace },
        relations: ['bank', 'partner', 'product', 'group'],
        order: { createdAt: 'DESC' },
      });

      await log('commissions', req, 'findAll', 'success', JSON.stringify({ id: id, workspace: workspace }), id);
      return res.status(200).json(groups);
    } catch (error) {
      console.error(error);
      await log('commissions', req, 'findAll', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Cannot find commissions, try again' });
    }
  }
  public async findById(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      if (!id) return res.status(400).json({ message: 'Please send a partner id' });

      const group = await Commission.findOne(id, { relations: ['bank', 'partner', 'product', 'group'] });

      await log('commissions', req, 'findById', 'success', JSON.stringify({ id: id }), id);
      return res.status(200).json(group);
    } catch (error) {
      await log('commissions', req, 'findById', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Cannot find groups, try again' });
    }
  }

  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      const { name, bank, partner, product, type, value, typeRecurrence, valueRecurrence, hasRepresentant, term, group }: CommissionInterface = req.body;

      if (!partner || !product || !bank) return res.status(400).json({ message: 'Produto, parceiro ou banco não informados.' });

      if( name) return res.status(400).json({ message: 'Invlaid values for create' });
      
      const hasItem = await Commission.findOne({ name })

      if(hasItem) return res.status(400).json({ message: 'Já existe uma comissão cadastrado com este nome.' });
      // Validação para garantir que value e valueRecurrence sejam números
      const numericValue = value;
      const numericValueRecurrence = valueRecurrence;

      if (isNaN(numericValue) || isNaN(numericValueRecurrence)) {
        return res.status(400).json({ message: 'Os valores informados devem ser números.' });
      }

      const workspaceFind = await Workspace.findOne(id);

      const commission = await Commission.create({
        name,
        bank,
        partner,
        product,
        type,
        value: formatNumber(value),
        group,
        term,
        typeRecurrence,
        valueRecurrence,
        hasRepresentant,
        workspace: workspaceFind,
      }).save();

      await log('commissions', req, 'create', 'success', JSON.stringify({ id: id, ...req.body }), commission);
      return res.status(201).json(commission);
    } catch (error) {
      console.error(error);
      await log('commissions', req, 'create', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Create failed, try again' });
    }
  }

  public async import(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      const workspaceFind = await Workspace.findOne(id);
      // Supondo que req.body seja um array de objetos de comissão
      console.log(req.body)
      const commissionsData = req.body.map((commission: CommissionInterface) => ({
        ...commission,
        value: Number(commission.value),
        valueRecurrence: Number(commission.valueRecurrence),
        workspace: workspaceFind,
      }));

      // Usando o método save do TypeORM que aceita um array para salvar múltiplos registros de uma vez
      const groups = await Commission.save(commissionsData);

      await log('commissions', req, 'import', 'success', JSON.stringify({ workspace: workspaceFind, ...req.body }), groups);
      return res.status(201).json(groups);
    } catch (error) {
      console.error(error);
      await log('commissions', req, 'import', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Create failed, try again' });
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const { name, bank, partner, product, type, value, typeRecurrence, hasRepresentant, valueRecurrence, term, group }: CommissionInterface = req.body;
      const id = req.params.id;

      const commission = await Commission.findOne(id, { relations: ['workspace'] });

      if (!commission) return res.status(404).json({ message: 'Commission does not exist' });

      const valuesToUpdateCommission: CommissionInterface = {
        name: name || commission.name,
        value: formatNumber(value) || commission.value,
        type: type || commission.type,
        valueRecurrence: formatNumber(valueRecurrence) || commission.valueRecurrence,
        typeRecurrence: typeRecurrence || commission.typeRecurrence,
        bank: bank || commission.bank,
        partner: partner || commission.partner,
        product: product || commission.product,
        term: term || commission.term,
        hasRepresentant: hasRepresentant!,
        group: group || commission.group,
      };

      await Commission.update(id, { ...valuesToUpdateCommission });

      await log('commissions', req, 'update', 'success', JSON.stringify({ id: id, ...req.body }), commission);
      return res.status(200).json({ message: 'Commission updated successfully' });
    } catch (error) {
      console.error(error);
      await log('commissions', req, 'update', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ error: 'Update failed, try again' });
    }
  }
  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      if (!id) return res.status(400).json({ message: 'Please send a commission id' });

      const commission = await Commission.findOne(id);

      if (!commission) return res.status(404).json({ message: 'Cannot find commission' });

      await Commission.update(commission.id, { active: !commission.active });

      await log('commissions', req, 'archive', 'success', JSON.stringify({ id: id }), commission);
      return res.status(200).json({ message: 'Customer deleted successfully' });
    } catch (error) {
      console.error(error);
      await log('commissions', req, 'update', 'failed', JSON.stringify(error), null);
      return res.status(500).json({ error: 'Remove failed, try again' });
    }
  }
}

export default new CommissionController();

