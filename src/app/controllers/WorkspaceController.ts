import { Request, Response } from 'express';
import Workspace from '@entities/Workspace';
import OpenAI from 'openai';
import { listSubscription } from '@utils/stripe/subscriptions/listSubscription';

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

