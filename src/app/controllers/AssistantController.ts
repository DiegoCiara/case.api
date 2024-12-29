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
import { retrieveAssistant } from '@utils/openai/management/assistants/retrieveAssistant';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

class WorkspaceController {
  public async findAssistant(req: Request, res: Response): Promise<Response> {
    try {
      const workspaceId = req.header('workspaceId');

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) return res.status(404).json({ message: 'Workspace não encontrado' });

      const assistant = await retrieveAssistant(openai, workspace.assistantId);

      return res.status(200).json({ ...assistant, picture: workspace.assistantPicture });
    } catch (error) {
      return res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }
}

export default new WorkspaceController();

