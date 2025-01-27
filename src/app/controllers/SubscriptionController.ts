import { Request, Response } from 'express';
import Workspace from '@entities/Workspace';
import OpenAI from 'openai';
import { listInvoices } from '@utils/stripe/invoices/listInvoices';
import { listPaymentMethods } from '@utils/stripe/customer/listPaymentMethods';
import { createPaymentIntent, setPaymentMethodAsDefault } from '@utils/stripe/customer/createPaymentMethod';
import { deleteMethod } from '@utils/stripe/customer/deletePaymentMethod';
import { listSubscription } from '@utils/stripe/subscriptions/listSubscription';
import { listPlans } from '@utils/stripe/products/listPlans';
import User from '@entities/User';
import { updateSubscription } from '@utils/stripe/subscriptions/updateSubscription';
import { findPlan } from '@utils/stripe/products/findPlan';

class SubscriptionController {
  public async findSubscription(req: Request, res: Response): Promise<void> {
    try {
      const workspaceId = req.header('workspaceId');

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) {
        res.status(404).json({ message: 'Workspace não encontrado' });
        return;
      }
      const subscription = await listSubscription(workspace.subscriptionId);

      res.status(200).json(subscription);
    } catch (error) {
      res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }

  public async listPlans(req: Request, res: Response): Promise<void> {
    try {
      const data = await listPlans();

      console.log(data);
      res.status(200).json(data);
    } catch (error) {
      res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }

  public async findPlan(req: Request, res: Response): Promise<void> {
    try {
      const { priceId } = req.params;
      const data = await findPlan(priceId);
      res.status(200).json(data);
    } catch (error) {
      res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }

  public async listInvoices(req: Request, res: Response): Promise<void> {
    try {
      const workspaceId = req.header('workspaceId');

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) {
        res.status(404).json({ message: 'Workspace não encontrado' });
        return;
      }
      const customer = await listInvoices(workspace.subscriptionId);

      const { data }: any = customer;

      const invoices = data.map((e: any) => {
        const moeda = e.currency;
        return {
          number: e.number,
          customer_email: e.customer_email,
          moeda: moeda.toString().toUpperCase(),
          status: e.status,
          amount_paid: e.amount_paid,
          created: e.created,
          hosted_invoice_url: e.hosted_invoice_url,
        };
      });
      console.log(invoices);
      res.status(200).json(invoices);
    } catch (error) {
      console.log(error);
      res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }

  public async listPaymentMethods(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      const user = await User.findOne(userId);

      if (!user) {
        res.status(404).json({ message: 'Usuário não encontrado' });
        return;
      }
      const customer = await listPaymentMethods(user.customer_id);

      const { data }: any = customer;

      res.status(200).json(data);
    } catch (error) {
      console.log(error);
      res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }

  public async deletePaymentMethod(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ message: 'Id not provided' });
        return;
      }
      const customer = await deleteMethod(id);

      res.status(200).json(customer);
    } catch (error) {
      console.log(error);
      res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }
  public async createPaymentMethod(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      const user = await User.findOne(userId);

      if (!user) {
        res.status(404).json({ message: 'Usuário não encontrado' });
        return;
      }
      const customer = await listPaymentMethods(user.customer_id);

      const { data }: any = customer;

      res.status(200).json(data);
    } catch (error) {
      console.log(error);
      res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }

  public async setPaymentAsDefault(req: Request, res: Response): Promise<void> {
    try {
      const { payment_method } = req.body;

      const userId = req.userId;

      const user = await User.findOne(userId);

      if (!user) {
        res.status(404).json({ message: 'user não encontrado' });
        return;
      }
      const customer = await setPaymentMethodAsDefault(user.customer_id, payment_method);

      const { data }: any = customer;

      res.status(200).json(data);
    } catch (error) {
      console.log(error);
      res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }

  public async createPaymentIntent(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      const user = await User.findOne(userId);

      if (!user) {
        res.status(404).json({ message: 'user não encontrado' });
        return;
      }
      const intent = await createPaymentIntent(user.customer_id);
      console.log(intent);
      res.status(200).json(intent);
    } catch (error) {
      console.log(error);
      res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }

  public async upgradePlan(req: Request, res: Response): Promise<void> {
    try {
      const workspaceId = req.header('workspaceId');

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) {
        res.status(404).json({ message: 'Workspace não encontrado.' });
        return;
      }
      const { planId, paymentMethodId } = req.body;

      const customer = await updateSubscription(workspace.subscriptionId, planId, paymentMethodId);

      if (!customer) {
        res.status(404).json({ message: 'Ocorreu um erro, tente nvoamente' });
        return;
      }
      res.status(200).json(customer);
    } catch (error) {
      console.log(error);
      res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }
}

export default new SubscriptionController();
