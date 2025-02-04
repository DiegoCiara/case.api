import Workspace from '@entities/Workspace';
import { Request, Response } from 'express';
import Document from '@entities/Document';
import { ioSocket } from '@src/socket';

class VectorController {
  public async findAll(req: Request, res: Response): Promise<void> {
    try {
      const workspaceId = req.header('workspaceId');

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) {
        res.status(404).json({ message: 'Workspace não encontrado' });
        return;
      }
      const documents = await Document.find({ where: { workspace } });

      res.status(200).json(documents.reverse());
    } catch (error) {
      res.status(404).json({ message: 'Cannot find groups, try again' });
    }
  }
  public async findById(req: Request, res: Response): Promise<void> {
    try {
      const workspaceId = req.header('workspaceId');

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) {
        res.status(404).json({ message: 'Workspace não encontrado' });
        return;
      }
      const id = req.params.id;

      if (!id) {
        res.status(400).json({ message: 'ID não encontrado' });
        return;
      }
      const document = await Document.findOne(id);

      if (!document) {
        res.status(404).json({ message: 'Workspace não encontrado' });
        return;
      }

      res.status(200).json(document);
    } catch (error) {
      res.status(404).json({ message: 'Cannot find groups, try again' });
    }
  }
  public async deleteFile(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const workspaceId = req.header('workspaceId');

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) {
        res.status(404).json({ message: 'Workspace não encontrado' });
        return;
      }
      if (!id) {
        res.status(400).json({ message: 'Please send a file id' });
        return;
      }
      const document = await Document.findOne(id);

      if (!document) {
        res.status(400).json({ message: 'Documento não encontrado' });
        return;
      }
      await Document.softRemove(document);

      (await ioSocket).emit(`document:${workspace.id}`);

      res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Delete failed, try again' });
    }
  }
  public async deleteBatchFiles(req: Request, res: Response): Promise<void> {
    try {
      const files = req.body;

      console.log(files);
      const workspaceId = req.header('workspaceId');

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) {
        res.status(404).json({ message: 'Workspace não encontrado' });
        return;
      }

      let completed = 0;
      let failed = 0;

      // console.log(files);

      for (const file of files) {
        try {
          const document = await Document.findOne(file);
          console.log(document);
          if (document) {
            const deleted = await Document.softRemove(document);
            if (!deleted) {
              failed = failed + 1;
            } else {
              completed = completed + 1;
            }
          } else {
            failed = failed + 1;
          }
        } catch (error) {
          console.log(error);
          failed = failed + 1;
        }
      }

      (await ioSocket).emit(`document:${workspace.id}`);

      res.status(200).json({ completed: completed, failed: failed });
    } catch (error) {
      res.status(500).json({ error: 'Delete failed, try again' });
    }
  }
}

export default new VectorController();
