import Workspace from '@entities/Workspace';
import { Request, Response } from 'express';
import Goal from '@entities/Goal';
import { getRepository, In } from 'typeorm';
import Product from '@entities/Product';
import Partner from '@entities/Partner';
import Bank from '@entities/Bank';
import { formatNumber } from '@utils/format';
import { log } from '@utils/createLog';
import Access from '@entities/Access';
import User from '@entities/User';
import bcrypt from 'bcryptjs';
import Playground from '@entities/Playground';
import { sendToQueue } from '@utils/rabbitMq/send';
import eventEmitter from '@utils/emitter';
import { decrypt } from '@utils/encrypt';
import OpenAI from 'openai';
import { proccessPlayground } from '@utils/rabbitMq/chat/playground/playground';
import Assistant from '@entities/Assistant';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import moment from 'moment';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


interface UserInterface {
  name?: string;
  role?: string;
  token?: string;
  picture?: string;
  email: string;
  password: string;
  client: string;
}

function generateToken(params = {}) {
  return jwt.sign(params, `${process.env.SECRET}`, { expiresIn: 84600 });
}

class PlaygroundController {
  public async authenticate(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password }: UserInterface = req.body;
      if (!email || !password) return res.status(400).json({ message: 'Invalid values for User' });

      const user = await User.findOne(
        { email },
        {
          select: ['id', 'email', 'name', 'passwordResetToken', 'passwordHash', 'picture',],
        }
      );

      if (!user) return res.status(404).json({ message: 'E-mail inválido!' });

      if (!(await bcrypt.compare(password, user.passwordHash))) return res.status(404).json({ message: 'Senha inválida!' });

      const accesses = await Access.find({ where: { user: user, role: In(['ADMIN', 'OWNER', 'SUPPORT']) }, relations: ['workspace', 'workspace.tokens'] });

      if(accesses.length === 0 || !accesses) return res.status(404).json({ message: 'Você não tem autorização para acessar o playground de nenhum workspace.' });

      const workspacesWorkspace = await Promise.all(
        accesses.map(async (access) => {
          const workspace = access.workspace;
          return {
            id: workspace.id,
            color: workspace.color,
            role: access.role,
          };
        })
      );

      const flattenedAssistants = workspacesWorkspace.flat();

      return res.status(200).json({
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        notifyEnabled: user.notifyEnabled,
        token: generateToken({ id: user.id }),
        passwordResetToken: user.passwordResetToken,
        workspaces: flattenedAssistants,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Authenticate failed, try again' });
    }
  }

  public async findByIdUser(req: Request, res: Response): Promise<Response> {
    try {
      const id: string = req.params.id;

      if (!id) return res.status(400).json({ message: 'Invalid values for User' });

      const user = await User.findOne(id, {
        relations: [ 'accesses'],
        select: ['id', 'email', 'name', 'passwordResetToken', 'passwordHash', 'picture', 'accesses'],
      });

      if (!user) return res.status(404).json({ message: 'Usuário inválido!' });

      const accesses = await Access.find({ where: { user: user, role: In(['ADMIN', 'OWNER', 'SUPPORT']) }, relations: ['workspace', 'workspace.tokens'] });

      const workspacesWorkspace = await Promise.all(
        accesses.map(async (access) => {
          const workspace = access.workspace;
          // Filtrar tokens do mês atual
          const tokensThisMonth = workspace.tokens.filter((token) => moment(token.createdAt).isSame(moment(), 'month'));

          // Calcular total de tokens, completion tokens e prompt tokens
          const totalTokens = tokensThisMonth.reduce((acc, token) => acc + token.total_tokens, 0);
          const completionTokens = tokensThisMonth.reduce((acc, token) => acc + token.completion_tokens, 0);
          const promptTokens = tokensThisMonth.reduce((acc, token) => acc + token.prompt_tokens, 0);


          return {
            id: workspace.id,
            name: workspace.name,
            color: workspace.color,
            workspaceName: workspace.name,
            totalTokens,
            completionTokens,
            promptTokens,
            role: access.role,
          };
        })
      );

      const flattenedAssistants = workspacesWorkspace.flat();

      await log('openai', req, 'findByIdUser', 'success', JSON.stringify({ id: id }), id);
      return res.json({
        id: user.id,
        workspaces: flattenedAssistants,
      });
    } catch (error) {
      console.error(error);
      await log('openai', req, 'findByIdUser', 'failed', JSON.stringify(error), null);
      return res.status(400).json({ error: 'Authenticate failed, try again' });
    }
  }

  public async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      console.log(id,'aquieeeee', req.userId)

      const workspace = await Workspace.findOne(id);

      if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

      const user = await User.findOne(req.userId);

      if (!user) return res.status(404).json({ message: 'Access not found' });

      const access = await Access.findOne({ where: { user, workspace }});

      if (!access) return res.status(404).json({ message: 'Access not found' });

      const groups = await Playground.find({ where: { workspace: workspace, user: access }, order: { createdAt: 'DESC' } });
      await log('playgrounds', req, 'findAll', 'success', JSON.stringify({ id: id, workspace: workspace }), id);
      return res.status(200).json(groups);
    } catch (error) {
      console.error(error);
      await log('playgrounds', req, 'findAll', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Cannot find goals, try again' });
    }
  }

  public async findById(req: Request, res: Response): Promise<Response> {
    try {

      const id = req.params.id;

      if (!id) return res.status(400).json({ message: 'Please send a partner id' });

      const playground = await Playground.findOne(id, { relations: ['messages', 'messages.user'] });

      if (!playground) return res.status(400).json({ message: 'Playground not found' });

      await log('playgrounds', req, 'findById', 'success', JSON.stringify({ id: id }), id);

      return res.status(200).json(playground.messages);

    } catch (error) {
      await log('playgrounds', req, 'findById', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Cannot find groups, try again' });
    }
  }

  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      const { content } = req.body;

      if(!content) return res.status(400).json({ message: 'Por favor, escreva alguma mensagem.' });

      const user = await User.findOne(req.userId)

      if (!user) return res.status(404).json({ message: 'Usuário não autorizado' });

      const workspace = await Workspace.findOne(id);

      if (!workspace) return res.status(404).json({ message: 'Workspace não encontrado' });

      const assistantId = req.header('assistantId');

      if (!assistantId) return res.status(400).json({ message: 'Id da assistente não fornecido' });

      const assistant = await Assistant.findOne(assistantId);

      if (!assistant) return res.status(404).json({ message: 'Assistente não encontrado' });

      const access = await Access.findOne({ where: { user, workspace }})

      if (!access) return res.status(401).json({ message: 'Usuário não autorizado' });

      // const apiKey = await decrypt(workspace!.openaiApiKey);

      // const openai = new OpenAI({ apiKey });

      // function openaiMessage() {
      //   if (image) {
      //     return caption
      //       ? [
      //           { type: 'text', text: captionMessage },
      //           { type: 'image_url', image_url: { url: mediaUrl } },
      //         ]
      //       : [{ type: 'image_url', image_url: { url: mediaUrl } }];
      //   } else {
      //     return [{ type: 'text', text: messageReceived }];
      //   }
      // }

      const msg = [{ type: 'text', text: content }];

      const newPlayground = await openai.beta.threads.create();

      const playgroundCreated = await Playground.create({
        name: '',
        threadId: newPlayground.id,
        assistant: assistant,
        workspace: workspace,
        user: access,
      }).save();

      console.log(access)

      const followUpPayload = {
        workspaceId: workspace.id,
        assistantId: assistant.openaiAssistantId,
        playgroundId: playgroundCreated.id,
        accessId: access.id,
        message: msg
      }

      await sendToQueue('playgrounds', (followUpPayload));

      await proccessPlayground()

      await log('playgrounds', req, 'create', 'success', JSON.stringify({ id: id, ...req.body }), '');
      return res.status(201).json(playgroundCreated);
    } catch (error) {
      console.error(error);
      await log('playgrounds', req, 'create', 'failed', JSON.stringify(error), null);
      return res.status(500).json({ message: 'Algo deu errado, tente novamente mais tarde.' });
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      if (!id) return res.status(400).json({ message: 'Please send a goal id' });

      const playground = await Playground.findOne(id);

      if (!playground) return res.status(404).json({ message: 'Cannot find playground' });

      await Playground.update(playground.id, { active: !playground.active });

      await log('playgrounds', req, 'archive', 'success', JSON.stringify({ id: id }), playground);
      return res.status(200).json({ message: 'Customer deleted successfully' });
    } catch (error) {
      console.error(error);
      await log('playgrounds', req, 'update', 'failed', JSON.stringify(error), null);
      return res.status(500).json({ error: 'Remove failed, try again' });
    }
  }
}

export default new PlaygroundController();

