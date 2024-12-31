import { Request, Response } from 'express';
import Workspace from '@entities/Workspace';
import OpenAI from 'openai';
import { listSubscription } from '@utils/stripe/subscriptions/listSubscription';
import User from '@entities/User';
import { retrieveAssistant } from '@utils/openai/management/assistants/retrieveAssistant';

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

      const user = await User.findOne(id, { relations: ['accesses', 'accesses.workspace']});

      if (!user) return res.status(404).json({ message: 'user não encontrado' });

      const workspaces = user.accesses.flatMap(e => e.workspace)

      console.log(workspaces)


      const assistants: any = await Promise.all(
        workspaces.map(async (workspace: any) => {
          const assistant = await retrieveAssistant(openai, workspace.assistantId)
          return {
            id: workspace.id,
            name: workspace.name,
            assistantName: assistant?.name,
          };
        })
      );

      return res.status(200).json(assistants);
    } catch (error) {
      console.error(error)
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

