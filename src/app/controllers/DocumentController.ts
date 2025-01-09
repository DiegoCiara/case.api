import Workspace from '@entities/Workspace';
import { Request, Response } from 'express';
import { log } from '@utils/functions/createLog';
import AWS from 'aws-sdk';
import OpenAI from 'openai';
import fs from 'fs';
import { ioSocket } from '@src/socket';
import { listFiles } from '@utils/openai/management/vector/listFiles';
import Document from '@entities/Document';

const s3 = new AWS.S3();
class VectorController {
  public async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const workspaceId = req.header('workspaceId');

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) return res.status(404).json({ message: 'Workspace não encontrado' });

      await log('vectors', req, 'findById', 'success', JSON.stringify({ id: workspace.vectorId }), workspace.vectorId);

      const documents = await Document.find({ where: { workspace } });
      // const files = await listFiles(openai, workspace)

      return res.status(200).json(documents.reverse());
    } catch (error) {
      console.log(error);
      await log('vectors', req, 'findById', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Cannot find groups, try again' });
    }
  }
  public async findById(req: Request, res: Response): Promise<Response> {
    try {
      const workspaceId = req.header('workspaceId');

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) return res.status(404).json({ message: 'Workspace não encontrado' });

      const id = req.params.id;

      if (!id) return res.status(400).json({ message: 'ID não encontrado' });

      const document = await Document.findOne(id);

      if (!document) return res.status(404).json({ message: 'Workspace não encontrado' });

      await log('vectors', req, 'findById', 'success', JSON.stringify({ id: workspace.vectorId }), workspace.vectorId);

      // const files = await listFiles(openai, workspace)

      return res.status(200).json(document);
    } catch (error) {
      console.log(error);
      await log('vectors', req, 'findById', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Cannot find groups, try again' });
    }
  }
  public async deleteFile(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const workspaceId = req.header('workspaceId');

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) return res.status(404).json({ message: 'Workspace não encontrado' });

      if (!id) return res.status(400).json({ message: 'Please send a file id' });

      const document = await Document.findOne(id);

      if (!document) return res.status(400).json({ message: 'Documento não encontrado' });

      await Document.softRemove(document);

      await log('files', req, 'delete', 'success', JSON.stringify(id), { file: document.id, document: document.id });

      (await ioSocket).emit(`document:${workspace.id}`);

      return res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
      console.error(error);
      await log('files', req, 'delete', 'failed', JSON.stringify(error), null);
      return res.status(500).json({ error: 'Delete failed, try again' });
    }
  }
  public async deleteBatchFiles(req: Request, res: Response): Promise<Response> {
    try {
      const files = req.body;

      console.log(files)
      const workspaceId = req.header('workspaceId');

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) return res.status(404).json({ message: 'Workspace não encontrado' });

      let completed = 0;
      let failed = 0;

      console.log(files)

      for (const file of files) {
        try {
          const document = await Document.findOne(file);
          console.log(document)
          if (document.id) {
            const deleted = await Document.softRemove(document);
            if (!deleted) {
              failed = failed + 1;
            } else {
              completed = completed + 1;
            }
            // const deleted = await openai.files.del(file);
          } else {
            failed = failed + 1;
          }
        } catch (error) {
          console.log(error);
          failed = failed + 1;
        }
      }

      await log('files', req, 'delete', 'success', JSON.stringify(workspaceId), { workspaceId });

      (await ioSocket).emit(`document:${workspace.id}`);

      return res.status(200).json({ completed: completed, failed: failed });
    } catch (error) {
      console.error(error);
      await log('files', req, 'delete', 'failed', JSON.stringify(error), null);
      return res.status(500).json({ error: 'Delete failed, try again' });
    }
  }
}

export default new VectorController();

