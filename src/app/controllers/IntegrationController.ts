import Workspace from '@entities/Workspace';
import { Request, Response } from 'express';
import { ioSocket } from '@src/socket';
import Integration from '@entities/Integration';


class VectorController {
  public async findById(req: Request, res: Response): Promise<Response> {
    try {
      const workspaceId = req.header('workspaceId');

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) return res.status(404).json({ message: 'Workspace não encontrado' });

      const id = req.params.id;

      if (!id) return res.status(404).json({ message: 'Forneça um id de integração' });

      const integration = await Integration.findOne(id, { where: { workspace } });

      if (!integration) return res.status(404).json({ message: 'Integração não encontrada' });

      console.log(integration);

      return res.status(200).json(integration);
    } catch (error) {
      console.log(error);
      return res.status(404).json({ message: 'Cannot find groups, try again' });
    }
  }
  public async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const workspaceId = req.header('workspaceId');

      const workspace = await Workspace.findOne(workspaceId, { relations: ['integrations'] });

      if (!workspace) return res.status(404).json({ message: 'Workspace não encontrado' });

      return res.status(200).json(workspace.integrations);
    } catch (error) {
      console.log(error);
      return res.status(404).json({ message: 'Cannot find groups, try again' });
    }
  }
  public async createIntegration(req: Request, res: Response): Promise<Response> {
    const workspaceId = req.header('workspaceId');

    const workspace = await Workspace.findOne(workspaceId);

    if (!workspace) return res.status(404).json({ message: 'Workspace não encontrado' });

    try {
      const { name, functionName, description, url, method, body, headers } = req.body;

      console.log(name, functionName, description, url, method, body, headers);
      if (!name || !functionName || !description || !url || !method) return res.status(400).json({ message: 'Valores inválidos.' });

      const integration = await Integration.create({ name, functionName, description, url, method, body, headers, workspace }).save();

      if (!integration.id) return res.status(400).json({ message: 'Não foi possível criar a integração, tente novamente' });

      (await ioSocket).emit(`integration:${workspace.id}`);
      return res.status(200).json(integration);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Falha ao criar integração, tente novamente.' });
    }
  }
  public async updateIntegration(req: Request, res: Response): Promise<Response> {
    const workspaceId = req.header('workspaceId');

    const workspace = await Workspace.findOne(workspaceId);

    if (!workspace) return res.status(404).json({ message: 'Workspace não encontrado' });

    try {
      const id = req.params.id;

      if (!id) return res.status(404).json({ message: 'ID não informado' });

      const integration = await Integration.findOne(id);

      if (!integration) return res.status(404).json({ message: 'integration não encontrado' });

      const { name, functionName, description, url, method, body, headers } = req.body;

      console.log(name, functionName, description, url, method, body, headers);
      if (!name || !functionName || !description || !url || !method) return res.status(400).json({ message: 'Valores inválidos.' });

      await Integration.update(integration.id, { name, functionName, description, url, method, body, headers });

      if (!integration.id) return res.status(400).json({ message: 'Não foi possível criar a integração, tente novamente' });

      (await ioSocket).emit(`integration:${workspace.id}`);
      return res.status(200).json(integration);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Falha ao criar integração, tente novamente.' });
    }
  }
  public async deleteIntegration(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const workspaceId = req.header('workspaceId');

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) return res.status(404).json({ message: 'Workspace não encontrado' });

      if (!id) return res.status(400).json({ message: 'Please send a file id' });

      const integration = await Integration.findOne(id);

      if (!workspace) {
        return res.status(400).json({ message: 'Workspace não encontrado' });
      }
      if (!integration) {
        return res.status(400).json({ message: 'Integração não encontrado' });
      }

      await Integration.softRemove(integration);

      (await ioSocket).emit(`integration:${workspace.id}`);

      return res.status(200).json({ message: 'File integration successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Delete failed, try again' });
    }
  }
  public async deleteBatchIntegrations(req: Request, res: Response): Promise<Response> {
    try {
      const files = req.body;

      const workspaceId = req.header('workspaceId');

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) return res.status(404).json({ message: 'Workspace não encontrado' });

      let completed = 0;
      let failed = 0;

      for (const file of files) {
        try {
          const integration = await Integration.findOne(file);
          if (!integration) {
            failed++;
            continue;
          }

          const deleted = await Integration.softRemove(integration);
          if (deleted.id) {
            completed++;
          } else {
            failed++;
          }
        } catch (error) {
          console.error('Erro ao deletar arquivo:', file, error);
          failed++;
        }
      }

      (await ioSocket).emit(`integration:${workspace.id}`);

      return res.status(200).json({ completed: completed, failed: failed });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Delete jjj, try again' });
    }
  }
}

export default new VectorController();

