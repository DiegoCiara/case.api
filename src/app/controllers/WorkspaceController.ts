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
  public async findWorkspaces(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.userId;

      const user = await User.findOne(id, { relations: ['accesses', 'accesses.workspace'] });

      if (!user) return res.status(404).json({ message: 'user não encontrado' });

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

      return res.status(200).json(assistants);
    } catch (error) {
      console.error(error);
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
  public async createWorkspace(req: Request, res: Response): Promise<any> {
    try {
      const workspaceId = req.header('workspaceId');

      const { name, priceId, paymentMethodId } = req.body;

      if (!name) return res.status(404).json({ message: 'Informe um nome para seu workspace.' });

      const user = await User.findOne(req.userId)

      if(!user)return res.status(404).json({ message: 'Usuário não encontrado.' });

      const subscription = await createSubscription(user.customerId, priceId, paymentMethodId)

      if(!subscription?.id)return res.status(400).json({ message: 'Não foi possível realizar a assinatura, altere o método de pagamento e tente novamente.' });

      const vector = await openai.beta.vectorStores.create({
        name: 'Base de conhecimento',
      });

      const assistant = await openai.beta.assistants.create({
        model: 'gpt-4o-mini',
        tools: [{ type: 'file_search' }],
        tool_resources: {
          file_search: { vector_store_ids: [vector.id] },
        },
      });

      const workspace = await Workspace.create({
        name,
        assistantId: assistant.id,
        vectorId: vector.id,
        subscriptionId: subscription.id,
        colorTheme: generateColor(),
      }).save();


      const access = await Access.create({
        user,
        workspace,
        role: 'OWNER'
      }).save()

      if(!access) return res.status(400).json({ message: 'Ocorreu um erro ao criar seu acesso ao workspace, tente novamente.' });

      return res.status(200).json(workspace);
    } catch (error) {
      console.error(error);
      return res.status(404).json({ message: 'Algo deu errado, tente novamente.' });
    }
  }
}

export default new WorkspaceController();

