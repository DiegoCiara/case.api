import axios from 'axios';
import { Request, Response } from 'express';
import { type } from 'os';
import Workspace from '@entities/Workspace';
import { io } from '@src/socket';
import Thread from '@entities/Thread';
import { encrypt } from '@utils/encrypt/encrypt';
import OpenAI from 'openai';
import { createCustomer } from '@utils/stripe/customer/createCustomer';
import { listInvoices } from '@utils/stripe/invoices/listInvoices';
import { listPaymentMethods } from '@utils/stripe/customer/listPaymentMethods';
import { createPaymentIntent, setPaymentMethodAsDefault } from '@utils/stripe/customer/createPaymentMethod';
import { deleteMethod } from '@utils/stripe/customer/deletePaymentMethod';
import { listSubscription } from '@utils/stripe/subscriptions/listSubscription';
import currency from 'currency.js';
import { listPlans } from '@utils/stripe/products/listPlans';
import User from '@entities/User';
import { updateSubscription } from '@utils/stripe/subscriptions/updateSubscription';
import { findPlan } from '@utils/stripe/products/findPlan';

class WorkspaceController {
  public async findWorkspace(req: Request, res: Response): Promise<Response> {
    try {
      const workspaceId = req.header('workspaceId');

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) return res.status(404).json({ message: 'Workspace não encontrado' });

      const subscription = await listSubscription(workspace.subscriptionId);

      return res.status(200).json({ ...workspace, subscription });
    } catch (error) {
      return res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }
  public async findSubscription(req: Request, res: Response): Promise<Response> {
    try {
      const workspaceId = req.header('workspaceId');

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) return res.status(404).json({ message: 'Workspace não encontrado' });

      const subscription = await listSubscription(workspace.subscriptionId);

      return res.status(200).json(subscription);
    } catch (error) {
      return res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }

  public async listPlans(req: Request, res: Response): Promise<Response> {
    try {
      const data = await listPlans();

      console.log(data);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }

  public async findPlan(req: Request, res: Response): Promise<Response> {
    try {
      const { priceId } = req.params;
      const data = await findPlan(priceId);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }

  public async listInvoices(req: Request, res: Response): Promise<Response> {
    try {
      const workspaceId = req.header('workspaceId');

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) return res.status(404).json({ message: 'Workspace não encontrado' });

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
      return res.status(200).json(invoices);
    } catch (error) {
      console.log(error);
      return res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }

  public async listPaymentMethods(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.userId;

      const user = await User.findOne(userId);

      if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

      const customer = await listPaymentMethods(user.customerId);

      const { data }: any = customer;

      return res.status(200).json(data);
    } catch (error) {
      console.log(error);
      return res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }

  public async deletePaymentMethod(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id) return res.status(400).json({ message: 'Id not provided' });

      const customer = await deleteMethod(id);

      return res.status(200).json(customer);
    } catch (error) {
      console.log(error);
      return res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }
  public async createPaymentMethod(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.userId;

      const user = await User.findOne(userId);

      if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

      const customer = await listPaymentMethods(user.customerId);

      const { data }: any = customer;

      return res.status(200).json(data);
    } catch (error) {
      console.log(error);
      return res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }

  public async setPaymentAsDefault(req: Request, res: Response): Promise<Response> {
    try {
      const { payment_method } = req.body;

      const userId = req.userId;

      const user = await User.findOne(userId);

      if (!user) return res.status(404).json({ message: 'user não encontrado' });

      const customer = await setPaymentMethodAsDefault(user.customerId, payment_method);

      const { data }: any = customer;

      return res.status(200).json(data);
    } catch (error) {
      console.log(error);
      return res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }

  public async createPaymentIntent(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.userId;

      const user = await User.findOne(userId);

      if (!user) return res.status(404).json({ message: 'user não encontrado' });
      const intent = await createPaymentIntent(user.customerId);
      console.log(intent);
      return res.status(200).json(intent);
    } catch (error) {
      console.log(error);
      return res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }

  public async upgradePlan(req: Request, res: Response): Promise<Response> {
    try {
      const workspaceId = req.header('workspaceId');

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) return res.status(404).json({ message: 'Workspace não encontrado.' });

      const { planId, paymentMethodId } = req.body;

      const customer = await updateSubscription(workspace.subscriptionId, planId, paymentMethodId);

      if(!customer) return res.status(404).json({ message: 'Ocorreu um erro, tente nvoamente' });

      return res.status(200).json(customer);
    } catch (error) {
      console.log(error);
      return res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }

  public async updateWorkspace(req: Request, res: Response): Promise<any> {
    try {
      const workspaceId = req.header('workspaceId');

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) return res.status(404).json({ message: 'Workspace não encontrado.' });

      const { name, backgroundColor, logo, subscriptionId } = req.body;

      if (!name) return res.status(404).json({ message: 'Informe um nome para seu workspace.' });

      const update = await Workspace.update(workspace.id, {
        name,
        subscriptionId,
      });

      return res.status(200).json({});
    } catch (error) {
      console.error(error);
      return res.status(404).json({ message: 'Algo deu errado, tente novamente.' });
    }
  }
}

export default new WorkspaceController();

