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
      const plans = await Plans.find(queryBuilder(req.query));

      // // Agrupar os planos por modelo
      // const groupedByModel = plans.reduce((acc, plan) => {
      //   const { model, name, credits, creditValue } = plan;

      //   if (!acc[model]) {
      //     acc[model] = [];
      //   }

      //   acc[model].push({ name, credits, creditValue });

      //   return acc;
      // }, {} as Record<string, Array<{ name: string; credits: number; creditValue: number }>>);

      // // Transformar os grupos em um array de objetos
      // const response = Object.keys(groupedByModel).map((model) => ({
      //   model,
      //   plans: groupedByModel[model],
      // }));

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

      // plan.passwordHash = undefined;
      await log('plans', req, 'findPlanById', 'success', JSON.stringify({ id: id }), id);

      return res.status(200).json(plan);
    } catch (error) {
      await log('plans', req, 'findPlanById', 'failed', JSON.stringify(error), null);
      return res.status(400).json({ error: 'Find plan failed, try again' });
    }
  }

  //   public async create(req: Request, res: Response): Promise<Response> {
  //     try {
  //       const { name, email }: PlanInterface = req.body;

  //       if (!name || !email || !emailValidator(email)) return res.status(400).json({ message: 'Invalid values for new Plans!' });

  //       // Plans.findOne({ email }, { withDeleted: true });
  //       const findPlan = await Plans.findOne({ email });

  //       if (findPlan) return res.status(400).json({ message: 'Plans already exists' });

  //       const password = generatePassword();

  //       const planName = firstName(name);

  //       const client = process.env.CLIENT_CONNECTION;

  //       const token = crypto.randomBytes(20).toString('hex'); // token que será enviado via email.

  //       sendMail('newPlan.html', 'acesso', `Bem vindo ${planName}`, { client, name, email, password });

  //       const passwordHash = await bcrypt.hash(password, 10);

  //       const now = new Date();
  //       now.setHours(now.getHours() + 1);
  //       // const passwordHash = "password";

  //       const plan = await Plans.create({
  //         name,
  //         email,
  //         passwordHash,
  //         passwordResetToken: token,
  //         passwordResetExpires: now,
  //       }).save();

  //       if (!plan) return res.status(400).json({ message: 'Cannot create plan' });

  //       // plan.passwordHash = undefined;

  //       return res.status(201).json(plan.id);
  //     } catch (error) {
  //       console.error(error)
  //       return res.status(400).json({ error: 'Registration failed, try again' });
  //     }
  //   }

  //   public async update(req: Request, res: Response): Promise<Response> {

  //     try {
  //       const id = req.params.id;

  //       const { name, email, role, picture }: PlanInterface = req.body;

  //       if (email && !emailValidator(email)) return res.status(400).json({ message: 'Invalid email for Plans!' });

  //       const plan = await Plans.findOne(id);

  //       if (!plan) return res.status(404).json({ message: 'Cannot find plan' });

  //       let valuesToUpdate: PlanInterface;

  //       valuesToUpdate = {
  //         name: name || plan.name,
  //         email: email || plan.email,
  //         picture: picture || plan.picture,
  //       };
  //       await Plans.update(id, { ...valuesToUpdate });

  //       return res.status(200).json();
  //     } catch (error) {
  //       console.error(error);
  //       return res.status(400).json({ error: 'Update failed, try again' });
  //     }
  //   }

  //   public async delete(req: Request, res: Response): Promise<Response> {
  //     try {
  //       const id = req.params.id;

  //       const plan = await Plans.findOne(id);

  //       if (!plan) return res.status(404).json({ message: 'Cannot find plan' });

  //       await Plans.softRemove(plan);

  //       return res.status(200).json();
  //     } catch (error) {
  //       return res.status(400).json({ error: 'Remove failed, try again' });
  //     }
  //   }
}

export default new PlanController();

