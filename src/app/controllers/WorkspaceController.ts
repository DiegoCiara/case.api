import axios from 'axios';
import { Request, Response } from 'express';
import { type } from 'os';
import Workspace from '@entities/Workspace';
import { io } from '@src/socket';
import Thread from '@entities/Thread';
import { encrypt } from '@utils/encrypt/encrypt';
import OpenAI from 'openai';
import CreditCard from '@entities/CreditCard';
import { createCustomer } from '@utils/stripe/customer/createCustomer';
import { listInvoices } from '@utils/stripe/invoices/listInvoices';
import { listPaymentMethods } from '@utils/stripe/customer/listPaymentMethods';
import { createPaymentIntent } from '@utils/stripe/customer/createPaymentMethod';

class WorkspaceController {
  public async findWorkspace(req: Request, res: Response): Promise<Response> {
    try {
      const workspaceId = req.header('workspaceId');

      console.log('oims');
      const workspace = await Workspace.findOne(workspaceId, { relations: ['plan', 'creditCards'] });

      if (!workspace) return res.status(404).json({ message: 'Workspace não encontrado' });

      return res.status(200).json(workspace);
    } catch (error) {
      return res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }

  public async listInvoices(req: Request, res: Response): Promise<Response> {
    try {
      const workspaceId = req.header('workspaceId');

      console.log('oims');
      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) return res.status(404).json({ message: 'Workspace não encontrado' });

      const customer = await listInvoices(workspace.subscriptionId);

      const { data }: any = customer;

      return res.status(200).json(data);
    } catch (error) {
      console.log(error);
      return res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }

  public async listPaymentMethods(req: Request, res: Response): Promise<Response> {
    try {
      const workspaceId = req.header('workspaceId');

      console.log('oims');
      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) return res.status(404).json({ message: 'Workspace não encontrado' });

      const customer = await listPaymentMethods(workspace.customerId);

      const { data }: any = customer;

      return res.status(200).json(data);
    } catch (error) {
      console.log(error);
      return res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }

  public async createPaymentMethod(req: Request, res: Response): Promise<Response> {
    try {
      const workspaceId = req.header('workspaceId');

      console.log('oims');
      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) return res.status(404).json({ message: 'Workspace não encontrado' });

      const customer = await listPaymentMethods(workspace.customerId);

      const { data }: any = customer;

      return res.status(200).json(data);
    } catch (error) {
      console.log(error);
      return res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }

  public async createPaymentIntent(req: Request, res: Response): Promise<Response> {
    try {
      const workspaceId = req.header('workspaceId');

      console.log('oims');
      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) return res.status(404).json({ message: 'Workspace não encontrado' });

      const intent = await createPaymentIntent(workspace.customerId);
      console.log(intent)
      return res.status(200).json(intent);
    } catch (error) {
      console.log(error);
      return res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }

  public async deletePaymentMethod(req: Request, res: Response): Promise<Response> {
    try {
      const workspaceId = req.header('workspaceId');

      console.log('oims');
      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) return res.status(404).json({ message: 'Workspace não encontrado' });

      const customer = await listPaymentMethods(workspace.customerId);

      const { data }: any = customer;

      return res.status(200).json(data);
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

      const { name, color, picture } = req.body;

      if (!name) return res.status(404).json({ message: 'Informe um nome para seu workspace.' });

      const update = await Workspace.update(workspace.id, {
        picture,
        name,
        color,
      });

      return res.status(200).json({});
    } catch (error) {
      console.error(error);
      return res.status(404).json({ message: 'Algo deu errado, tente novamente.' });
    }
  }

  public async generateCreditCardToken(req: Request, res: Response): Promise<Response> {
    try {
      const { cardNumber, expiryMonth, expiryYear, cvv, holderName } = req.body;

      const workspaceId = req.header('workspaceId');

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) return res.status(404).json({ message: 'Workspace não encontrado.' });

      // Adicione a validação necessária para os dados do cartão aqui

      const tokenResponse = await axios.post(
        'https://www.asaas.com/api/v3/payments',
        {
          // Substitua os valores abaixo pelos campos correspondentes do cartão
          cardNumber,
          expiryMonth,
          expiryYear,
          cvv,
          holderName,
        },
        {
          headers: { 'Access-Token': process.env.ASAAS_API_KEY },
        }
      );

      const creditCard = await CreditCard.create({
        workspace,
      });

      return res.status(200).json(tokenResponse.data);
    } catch (error) {
      console.error('Error generating credit card token:', error);
      return res.status(500).json({ error: 'Error generating credit card token' });
    }
  }

  public async createSubscription(req: Request, res: Response): Promise<Response> {
    try {
      const { customerId, billingType, value, creditCardToken } = req.body;

      // Validações para os dados da assinatura

      const subscriptionResponse = await axios.post(
        'https://www.asaas.com/api/v3/subscriptions',
        {
          customer: customerId,
          billingType,
          value,
          nextDueDate: '2024-02-01', // Exemplo de data, ajuste conforme necessário
          creditCard: { token: creditCardToken },
        },
        {
          headers: { 'Access-Token': process.env.ASAAS_API_KEY },
        }
      );

      return res.status(200).json(subscriptionResponse.data);
    } catch (error) {
      console.error('Error creating subscription:', error);
      return res.status(500).json({ error: 'Error creating subscription' });
    }
  }
}

export default new WorkspaceController();

