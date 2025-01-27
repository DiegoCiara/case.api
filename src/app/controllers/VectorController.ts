import Workspace from '@entities/Workspace';
import { Request, Response } from 'express';
import AWS from 'aws-sdk';
import OpenAI from 'openai';
import fs from 'fs';
import { ioSocket } from '@src/socket';
import { listFiles } from '@utils/openai/management/vector/listFiles';

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-2',
});

const bucketName = process.env.AWS_BUCKET_NAME;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

const GB = 1024 * 1024 * 1024; // 1GB em bytes
const percentOf250MB = 250 / 1024; // 250MB em GB
const maxStorage = percentOf250MB * GB; // Percentual proporcional a 250MB de 1GB em bytes

const s3 = new AWS.S3();
class VectorController {
  public async findById(req: Request, res: Response): Promise<void> {
    try {
      const workspaceId = req.header('workspaceId');

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) {
        res.status(404).json({ message: 'Workspace não encontrado' });
        return;
      }
      const files = await listFiles(openai, workspace);

      res.status(200).json(files);
    } catch (error) {
      console.log(error);
      res.status(404).json({ message: 'Cannot find groups, try again' });
    }
  }

  public async getStorage(req: Request, res: Response): Promise<void> {
    try {
      const workspaceId = req.header('workspaceId');

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) {
        res.status(404).json({ message: 'Workspace não encontrado' });
        return;
      }
      const vector = await openai.beta.vectorStores.retrieve(workspace.vectorId);

      const totalBytesUsed = vector.usage_bytes;

      const usagePercentage = (totalBytesUsed / maxStorage) * 100;

      res.status(200).json({ percent: usagePercentage.toFixed(2), bytes: totalBytesUsed });
    } catch (error) {
      console.log(error);

      res.status(404).json({ message: 'Cannot find groups, try again' });
    }
  }

  // public async fileById(req: Request, res: Response): Promise<void> {
  //   try {
  //     const workspaceId = req.header('workspaceId');

  //     const workspace = await Workspace.findOne(workspaceId);

  //     if (!workspace) return res.status(404).json({ message: 'Workspace não encontrado' });

  //     const { id } = req.params;

  //     if (!id) return res.status(404).json({ message: 'Forneça um id de arquivo' });

  //     await log('vectors', req, 'findById', 'success', JSON.stringify({ id: id }), id);

  //     return res.status(200).json('');
  //   } catch (error) {
  //     await log('vectors', req, 'findById', 'failed', JSON.stringify(error), null);
  //     return res.status(404).json({ message: 'Cannot find File' });
  //   }
  // }

  public async uploadFiles(req: Request, res: Response): Promise<void> {
    const workspaceId = req.header('workspaceId');

    console.log(workspaceId);

    const workspace = await Workspace.findOne(workspaceId);

    if (!workspace) {
      res.status(404).json({ message: 'Workspace não encontrado' });
      return;
    }
    const { vectorId } = workspace;

    try {
      const files = req.files as Express.Multer.File[]; // 'files' deve ser a chave usada no multer ou middleware equivalente

      if (!files || files.length === 0 || !vectorId) {
        res.status(400).json({ message: 'Documentos não informados' });
        return;
      }

      if (!workspace) {
        res.status(400).json({ message: 'Workspace ou vetor não encontrado' });
        return;
      }

      let completed = 0;
      let failed = 0;

      if (!files || files.length === 0) {
        console.log('Sem documentos para adicionar');
        res.status(400).json({ message: 'Documentos não enviados.' });
        return;
      } else {
        for (const file of files) {
          const vector = await openai.beta.vectorStores.retrieve(workspace.vectorId);

          let totalBytesUsed = vector.usage_bytes;

          // Calculando a porcentagem do uso real
          const usagePercentage = (totalBytesUsed / maxStorage) * 100;

          const usagePercentageSum = (totalBytesUsed + file.size / maxStorage) * 100;

          if (usagePercentage >= 100 && usagePercentageSum >= 100) {
            failed = failed + 1;
          } else {
            const openaiFile = await openai.files.create({
              file: fs.createReadStream(file.path),
              purpose: 'assistants',
            });

            totalBytesUsed = openaiFile.bytes + totalBytesUsed;

            await openai.beta.vectorStores.fileBatches.createAndPoll(workspace.vectorId, {
              file_ids: [openaiFile.id],
            });

            // Deletar o arquivo temporário após o processamento
            await fs.unlinkSync(file.path);

            fs.unlink(file.path, (err) => {
              if (err) {
                console.error(`Erro ao excluir o arquivo ${file.path}:`, err);
              } else {
                console.log(`Arquivo ${file.path} excluído com sucesso.`);
              }
            });
            completed = completed + 1;
          }
        }
      }

      (await ioSocket).emit(`vector:${workspace.id}`);

      res.status(200).json({ completed: completed, failed: failed }); // Retornar os documentos criados
    } catch (error) {
      console.error(error);

      res.status(500).json({ message: 'Falha ao realizar upload, tente novamente.' });
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
      if (!workspace) {
        res.status(400).json({ message: 'Workspace não encontrado' });
        return;
      }

      const openaiFile = await openai.files.del(id);

      (await ioSocket).emit(`vector:${workspace.id}`);

      res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
      console.error(error);

      res.status(500).json({ error: 'Delete failed, try again' });
    }
  }
  public async deleteBatchFiles(req: Request, res: Response): Promise<void> {
    try {
      const files = req.body;

      const workspaceId = req.header('workspaceId');

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) {
         res.status(404).json({ message: 'Workspace não encontrado' });
         return
      }
      let completed = 0;
      let failed = 0;

      for (const file of files) {
        try {
          const deleted = await openai.files.del(file);
          if (deleted.id) {
            completed = completed + 1;
          } else {
            failed = failed + 1;
          }
        } catch (error) {
          console.log(error);
          failed = failed + 1;
        }
      }

      (await ioSocket).emit(`vector:${workspace.id}`);

       res.status(200).json({ completed: completed, failed: failed });
    } catch (error) {
      console.error(error);

       res.status(500).json({ error: 'Delete failed, try again' });
    }
  }
}

export default new VectorController();
