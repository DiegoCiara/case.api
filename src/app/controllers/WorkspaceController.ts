import { Request, Response } from 'express';
import Workspace from '@entities/Workspace';
import OpenAI from 'openai';
import { listSubscription } from '@utils/stripe/subscriptions/listSubscription';
import User from '@entities/User';
import { retrieveAssistant } from '@utils/openai/management/assistants/retrieveAssistant';
import { generateColor } from '@utils/functions/generateColor';
import { createSubscription } from '@utils/stripe/subscriptions/createSubscription';
import Access from '@entities/Access';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

class WorkspaceController {
  public async findWorkspace(req: Request, res: Response): Promise<void> {
    try {
      const workspaceId = req.header('workspaceId');

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) {
        res.status(404).json({ message: 'Workspace não encontrado' });
        return;
      }
      const subscription = await listSubscription(workspace.subscriptionId);

      res.status(200).json({ ...workspace, subscription });
    } catch (error) {
      res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }
  public async findWorkspaces(req: Request, res: Response): Promise<void> {
    try {
      const id = req.userId;

      const user = await User.findOne(id, { relations: ['accesses', 'accesses.workspace'] });

      if (!user) {
        res.status(404).json({ message: 'user não encontrado' });
        return;
      }
      const workspaces = user.accesses.flatMap((e) => e.workspace);

      const assistants: any = await Promise.all(
        workspaces.map(async (workspace: any) => {
          const assistant = await retrieveAssistant(openai, workspace.assistantId);
          return {
            id: workspace.id,
            name: workspace.name,
            favicon: workspace.favicon,
            assistantName: assistant?.name,
            picture: workspace.assistantPicture,
          };
        })
      );

      res.status(200).json(assistants);
    } catch (error) {
      console.error(error);
      res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }
  public async updateWorkspace(req: Request, res: Response): Promise<void> {
    try {
      const workspaceId = req.header('workspaceId');

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) {
        res.status(404).json({ message: 'Workspace não encontrado.' });
        return;
      }
      const { name, logo, logoDark, favicon, subscriptionId } = req.body;

      if (!name) {
        res.status(404).json({ message: 'Informe um nome para seu workspace.' });
        return;
      }

      const update = await Workspace.update(workspace.id, {
        name,
        favicon,
        subscriptionId,
      });

      res.status(200).json({});
    } catch (error) {
      console.error(error);
      res.status(404).json({ message: 'Algo deu errado, tente novamente.' });
    }
  }
  public async createWorkspace(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceName, priceId, paymentMethodId } = req.body;

      if (!workspaceName) {
        res.status(404).json({ message: 'Informe um nome para seu workspace.' });
        return;
      }

      // if (!name || !instructions || !temperature) {
      //   res.status(404).json({ message: 'Valores inválidos para criação da assistente.' });
      //   return;
      // }
      const user = await User.findOne(req.userId);

      if (!user) {
        res.status(404).json({ message: 'Usuário não encontrado.' });
        return;
      }
      const subscription = await createSubscription(user.customer_id, priceId, paymentMethodId);

      if (!subscription?.id) {
        res.status(400).json({ message: 'Não foi possível realizar a assinatura, altere o método de pagamento e tente novamente.' });
        return;
      }
      const vector = await openai.beta.vectorStores.create({
        name: 'Base de conhecimento',
      });

      const assistant = await openai.beta.assistants.create({
        name: user.customer_id,
        temperature: 0.5,
        model: 'gpt-4o-mini',
        tools: [{ type: 'file_search' }],
        tool_resources: {
          file_search: { vector_store_ids: [vector.id] },
        },
      });

      const workspace = await Workspace.create({
        name: workspaceName,
        assistantId: assistant.id,
        vectorId: vector.id,
        subscriptionId: subscription.id,
        colorTheme: generateColor(),
      }).save();

      const access = await Access.create({
        user,
        workspace,
        role: 'OWNER',
      }).save();

      if (!access) {
        res.status(400).json({ message: 'Ocorreu um erro ao criar seu acesso ao workspace, tente novamente.' });
        return;
      }
      res.status(200).json(workspace);
    } catch (error) {
      console.error(error);
      res.status(404).json({ message: 'Algo deu errado, tente novamente.' });
    }
  }
}

export default new WorkspaceController();
