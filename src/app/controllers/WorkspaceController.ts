import axios from 'axios';
import { Request, Response } from 'express';
import { type } from 'os';
import Workspace from '@entities/Workspace';
import { io } from '@src/socket';
import Thread from '@entities/Thread';
import { encrypt } from '@utils/encrypt/encrypt';
import OpenAI from 'openai';

class WorkspaceController {
  public async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const workspaces = await Workspace.find();

      return res.status(200).json(workspaces);
    } catch (error) {
      return res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }
  public async updateWorkspace(req: Request, res: Response): Promise<any> {
    const id = req.params.id;
    try {
      const { name, color, picture, enterpriseName, cnpj } = req.body;

      if (!id) return res.status(400).json({ message: 'Please send a workspace id' });

      const workspace = await Workspace.update(id, {
        picture,
        name,
        color,
      });

      if (!workspace) return res.status(404).json({ message: 'Cannot find workspace' });

      return res.status(200).json({});
    } catch (error) {
      console.error(error);
      return res.status(404).json({ error: 'Conection failed, try again' });
    }
  }
  public async updateOpenaiApiKey(req: Request, res: Response): Promise<any> {
    const id = req.params.id;
    try {
      const { apiKey } = req.body;

      if (!id || !apiKey) return res.status(400).json({ message: 'Please send a workspace id' });

      const openai = new OpenAI({ apiKey: apiKey });
      const actionAssistant = await openai.beta.assistants.create({
        name: 'Verify',
        description: null,
        model: 'gpt-4o-mini',
        temperature: 0.5,
        top_p: 1,
        metadata: {},
        response_format: 'auto',
      });

      if (!actionAssistant.id) return res.status(400).json({ message: 'Inválid API Key' });

      const hashApiKey = await encrypt(apiKey! as string);

      if (!hashApiKey) return res.status(404).json({ message: 'Cannot find workspace' });

      const workspace = await Workspace.update(id, {
        openaiApiKey: hashApiKey,
      });

      if (!workspace) return res.status(404).json({ message: 'Cannot find workspace' });

      await openai.beta.assistants.del(actionAssistant.id);

      return res.status(200).json({});
    } catch (error) {
      console.error(error);
      return res.status(404).json({ error: 'Conection failed, try again' });
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      if (!id) return res.status(400).json({ message: 'Please send a workspace id' });

      const workspace = await Workspace.findOne(id);

      if (!workspace) return res.status(404).json({ message: 'Cannot find workspace' });

      await Workspace.softRemove(workspace);

      return res.status(200).json({ message: 'Workspace deleted successfully' });
    } catch (error) {
      return res.status(400).json({ error: 'Remove failed, try again' });
    }
  }
  public async generateCreditCardToken(req: Request, res: Response): Promise<Response> {
    try {
      const { cardNumber, expiryMonth, expiryYear, cvv, holderName } = req.body;

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

