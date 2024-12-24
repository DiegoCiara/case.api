import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import Plans from '@entities/Plan';
import queryBuilder from '@utils/queryBuilder';
import { log } from '@utils/functions/createLog';

interface PlanInterface {
  name?: string;
  role?: string;
  token?: string;
  picture?: string;
  email?: string;
  password?: string;
}

class PlanController {
  public async findPlans(req: Request, res: Response): Promise<Response> {
    try {

      const plans = await Plans.find();
      console.log('pln')
      await log('plans', req, 'findPlans', 'success', JSON.stringify(plans), null);
      return res.status(200).json(plans);
    } catch (error) {
      await log('plans', req, 'findPlans', 'failed', JSON.stringify(error), null);
      return res.status(400).json({ error: 'Find plans failed, try again' });
    }
  }

  public async findPlanById(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      const plan = await Plans.findOne(id);

      if (!plan) return res.status(404).json({ message: 'Plans not exist' });

      await log('plans', req, 'findPlanById', 'success', JSON.stringify({ id: id }), id);

      return res.status(200).json(plan);
    } catch (error) {
      await log('plans', req, 'findPlanById', 'failed', JSON.stringify(error), null);
      return res.status(400).json({ error: 'Find plan failed, try again' });
    }
  }
}

export default new PlanController();

