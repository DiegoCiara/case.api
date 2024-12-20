import Workspace from '@entities/Workspace';
import { Request, Response } from 'express';
import Vector from '@entities/Vector';
import { log } from '@utils/functions/createLog';
import AWS from 'aws-sdk';
import { decrypt } from '@utils/encrypt/encrypt';
import OpenAI from 'openai';
import fs from 'fs';
import File from '@entities/File';

interface VectorInterface {
  name: string;
  phone?: string;
  email?: string;
  site?: string;
  workspace?: Workspace;
}

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-2',
});

const bucketName = process.env.AWS_BUCKET_NAME;

const s3 = new AWS.S3();
class VectorController {
  public async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      const workspace = await Workspace.findOne(id);

      if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

      const groups = await Vector.find({ where: { workspace: workspace }, relations: ['files'], order: { createdAt: 'ASC' } });

      await log('vectors', req, 'findAll', 'success', JSON.stringify({ id: id }), id);

      return res.status(200).json(groups);
    } catch (error) {
      console.error(error);
      await log('vectors', req, 'findAll', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Cannot find customers, try again' });
    }
  }
  public async findById(req: Request, res: Response): Promise<Response> {
    try {
      const { id, vectorId } = req.params;

      const workspace = await Workspace.findOne(id);

      if (!id) return res.status(400).json({ message: 'Please send a vector id' });

      const group = await Vector.findOne(vectorId, { where: { workspace: workspace }, relations: ['files'] });

      await log('vectors', req, 'findById', 'success', JSON.stringify({ id: id }), id);

      return res.status(200).json(group);
    } catch (error) {
      await log('vectors', req, 'findById', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Cannot find groups, try again' });
    }
  }

  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      const { name }: VectorInterface = req.body;

      const workspaceFind = await Workspace.findOne(id);

      if (!id || !workspaceFind) return res.status(400).json({ message: 'Create failed, try again' });

      const apiKey = await decrypt(workspaceFind.openaiApiKey);
      const openai = new OpenAI({ apiKey });

      const vectorStore = await openai.beta.vectorStores.create({
        name: name,
      });

      const vector = await Vector.create({
        name: name,
        vectorId: vectorStore.id,
        workspace: workspaceFind,
      }).save();

      const files = req.files as Express.Multer.File[]; // 'files' deve ser a chave usada no multer ou middleware equivalente

      const uploadedDocuments = [];

      if (!files || files.length === 0 || !id) {
        console.log('Sem documentos para adicionar');
      } else {
        for (const file of files) {
          const fileContent = fs.readFileSync(file.path);

          // Criar o arquivo na OpenAI
          const openaiFile = await openai.files.create({
            file: fs.createReadStream(file.path),
            purpose: 'assistants',
          });

          // Fazer o upload do arquivo para o bucket S3
          const params = {
            Bucket: bucketName!,
            Key: `workspace:${workspaceFind.id}/vector:${vector.id}/file:${openaiFile.id}`, // Nome do arquivo no bucket
            Body: fileContent,
            ContentType: file.mimetype,
          };
          const s3Response = await s3.upload(params).promise();

          // Criar a referência no banco de dados
          const document = await File.create({
            name: `${file.originalname}`, // Nome do arquivo, pode ser ajustado conforme necessário
            fileId: openaiFile.id,
            link: s3Response.Location,
            vector,
            workspace: workspaceFind,
          }).save();

          uploadedDocuments.push(document);

          // Enviar o arquivo para OpenAI
          await openai.beta.vectorStores.fileBatches.createAndPoll(vector.vectorId, {
            file_ids: [openaiFile.id],
          });

          // Deletar o arquivo temporário após o processamento
          fs.unlinkSync(file.path);
        }
      }
      return res.status(201).json({ ...vector, files: uploadedDocuments });
    } catch (error) {
      console.error(error);
      await log('vectors', req, 'create', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Create failed, try again' });
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const { name }: VectorInterface = req.body;
      const { id, vectorId } = req.params;

      const workspace = await Workspace.findOne(id);

      if (!workspace) return res.status(404).json({ message: 'Workspace does not exist' });

      const apiKey = await decrypt(workspace.openaiApiKey);
      const openai = new OpenAI({ apiKey });

      const vector = await Vector.findOne(vectorId, { relations: ['workspace'], where: { workspace: workspace } });

      if (!vector) return res.status(404).json({ message: 'Vector does not exist' });

      const valuesToUpdateVector: VectorInterface = {
        name: name || vector.name,
      };

      const vectorStore = await openai.beta.vectorStores.update(vector.vectorId, {
        name: name,
      });

      await Vector.update(vectorId, { ...valuesToUpdateVector });

      await log('vectors', req, 'create', 'success', JSON.stringify({ id: id }), { vector: vector, vectorStore: vectorStore });

      return res.status(200).json({ message: 'Vector updated successfully' });
    } catch (error) {
      console.error(error);
      await log('vectors', req, 'update', 'failed', JSON.stringify(error), null);

      return res.status(404).json({ error: 'Update failed, try again' });
    }
  }
  public async uploadFiles(req: Request, res: Response): Promise<Response> {
    const { id, vectorId } = req.params;

    try {
      const files = req.files as Express.Multer.File[]; // 'files' deve ser a chave usada no multer ou middleware equivalente

      if (!files || files.length === 0 || !id || !vectorId) {
        return res.status(400).json({ message: 'Documentos não informados' });
      }

      const workspaceFind = await Workspace.findOne(id);
      const vector = await Vector.findOne(vectorId);

      if (!workspaceFind || !vector) {
        return res.status(400).json({ message: 'Workspace ou vetor não encontrado' });
      }

      const apiKey = await decrypt(workspaceFind!.openaiApiKey);
      const openai = new OpenAI({ apiKey });

      const uploadedDocuments = [];

      if (!files || files.length === 0 || !id) {
        console.log('Sem documentos para adicionar');
      } else {
        for (const file of files) {
          const fileContent = fs.readFileSync(file.path);

          // Criar o arquivo na OpenAI
          const openaiFile = await openai.files.create({
            file: fs.createReadStream(file.path),
            purpose: 'assistants',
          });

          // Fazer o upload do arquivo para o bucket S3
          const params = {
            Bucket: bucketName!,
            Key: `workspace:${workspaceFind.id}/vector:${vector.id}/file:${openaiFile.id}`, // Nome do arquivo no bucket
            Body: fileContent,
            ContentType: file.mimetype,
          };
          const s3Response = await s3.upload(params).promise();

          // Criar a referência no banco de dados
          const document = await File.create({
            name: `${file.originalname}`, // Nome do arquivo, pode ser ajustado conforme necessário
            fileId: openaiFile.id,
            link: s3Response.Location,
            vector,
            workspace: workspaceFind,
          }).save();

          uploadedDocuments.push(document);

          // Enviar o arquivo para OpenAI
          await openai.beta.vectorStores.fileBatches.createAndPoll(vector.vectorId, {
            file_ids: [openaiFile.id],
          });

          // Deletar o arquivo temporário após o processamento
          fs.unlinkSync(file.path);
        }
      }

      // Logar a operação de sucesso
      await log('openai', req, 'uploadFiles', 'success', JSON.stringify({ id }), uploadedDocuments);

      return res.status(200).json(uploadedDocuments); // Retornar os documentos criados
    } catch (error) {
      console.error(error);
      await log('openai', req, 'uploadFiles', 'failed', JSON.stringify(error), null);
      return res.status(500).json({ message: 'Falha ao realizar upload, tente novamente.' });
    }
  }
  public async deleteFile(req: Request, res: Response): Promise<Response> {
    try {
      const { id, fileId } = req.params;

      if (!id) return res.status(400).json({ message: 'Please send a customer id' });

      const workspaceFind = await Workspace.findOne(id);
      const file = await File.findOne(fileId);

      if (!workspaceFind || !file) {
        return res.status(400).json({ message: 'Workspace ou vetor não encontrado' });
      }

      const apiKey = await decrypt(workspaceFind!.openaiApiKey);
      const openai = new OpenAI({ apiKey });

      if (!file) return res.status(404).json({ message: 'Cannot find file' });

      const openaiFile = await openai.files.del(file.fileId);

      const deleteFile = await File.softRemove(file);

      await log('files', req, 'delete', 'success', JSON.stringify(file), { file: deleteFile, openaiFile: openaiFile });

      return res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
      console.error(error);
      await log('files', req, 'delete', 'failed', JSON.stringify(error), null);
      return res.status(500).json({ error: 'Delete failed, try again' });
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id, vectorId } = req.params;

      if (!id) return res.status(400).json({ message: 'Please send a customer id' });

      const workspaceFind = await Workspace.findOne(id);
      const vector = await Vector.findOne(vectorId);

      if (!workspaceFind || !vector) {
        return res.status(400).json({ message: 'Workspace ou vetor não encontrado' });
      }
      console.log('aui');

      const apiKey = await decrypt(workspaceFind!.openaiApiKey);
      const openai = new OpenAI({ apiKey });

      if (!vector) return res.status(404).json({ message: 'Cannot find vector' });

      const vectorStore = await openai.beta.vectorStores.del(vector.vectorId);
      const deleteVector = await Vector.softRemove(vector);

      await log('vectors', req, 'delete', 'success', JSON.stringify(vector), { vector: deleteVector, openaiVector: vectorStore });

      return res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
      console.error(error);
      await log('files', req, 'delete', 'failed', JSON.stringify(error), null);
      return res.status(500).json({ error: 'Delete failed, try again' });
    }
  }
}

export default new VectorController();

