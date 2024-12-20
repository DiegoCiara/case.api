import axios from 'axios';
import { Request, Response } from 'express';
import Sales from '@entities/Sale';
import queryBuilder from '@utils/queryBuilder';
import Contact from '@entities/Contact';
import Pipeline from '@entities/Pipeline';
import Workspace from '@entities/Workspace';
import Sale from '@entities/Sale';
import { log } from '@utils/createLog';
import Access from '@entities/Access';
import User from '@entities/User';
require('dotenv').config();

class SaleController {
  public async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      const workspace = await Workspace.findOne(id);

      const user = await User.findOne(req.userId);
      if (!user) return res.status(404).json({ message: 'Funnel not found' });

      const access = await Access.findOne({ where: { user, workspace}})

      if(!access)return res.status(404).json({ message: 'Access not found' });

      let sales = []
      if(access.role === 'SELLER'){
       sales = await Sale.find({
        where: { workspace: workspace, deal: { user: { id: user.id } },},
        relations: ['deal', 'deal.customer', 'deal.user', 'commission', 'commission.partner','commission.product', 'commission.bank'],
      });
    } else {
      sales = await Sale.find({
       where: { workspace: workspace },
       relations: ['deal', 'deal.customer', 'deal.user', 'commission', 'commission.partner','commission.product', 'commission.bank'],
     });
    }

      const returnedSales = sales.map((sale) => {
        return {
          id: sale?.id,
          customerName: sale?.deal?.customer?.name || '',
          customerCpfCnpj: sale?.deal?.customer?.cpfCnpj || '',
          partnerName: sale?.commission?.partner?.name || '',
          bankName: sale?.commission?.bank?.name || '',
          productName: sale?.commission?.product?.name || '',
          status: sale?.status,
          value: sale?.value,
          userName: sale?.deal?.user?.name || '',
        }
      })
      await log('sales', req, 'findAll', 'success', JSON.stringify({ id: id }), id);
      return res.status(200).json(returnedSales);
    } catch (error) {
      console.log(error)
      await log('sales', req, 'findAll', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Cannot find customers, try again' });
    }
  }

  public async findById(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      if (!id) return res.status(400).json({ message: 'Please send a customer id' });

      const sale = await Sales.findOne(id, {
        relations: ['deal', 'commission', 'commission.partner', 'commission.bank'],
      });
      await log('sales', req, 'findById', 'success', JSON.stringify({ id: id }), id);

      return res.status(200).json(sale);
    } catch (error) {
      await log('sales', req, 'findById', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Cannot find customers, try again' });
    }
  }

}

export default new SaleController();

