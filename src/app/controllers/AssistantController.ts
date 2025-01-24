import { Request, Response } from 'express';
import Workspace from '@entities/Workspace';
import OpenAI from 'openai';
import { retrieveAssistant } from '@utils/openai/management/assistants/retrieveAssistant';
import { updateAssistant } from '@utils/openai/management/assistants/updateAssistant';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

class AssistantController {
  /**
   * @swagger
   * /assistant/:
   *   get:
   *     summary: Retorna o assistente do workspace
   *     tags: [Assistente]
   *     parameters:
   *       - in: header
   *         name: workspaceId
   *         required: true
   *         description: ID do workspace
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Detalhes do assistente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 accessId:
   *                   type: string
   *                 name:
   *                   type: string
   *                 email:
   *                   type: string
   *                 picture:
   *                   type: string
   *                 role:
   *                   type: string
   *       400:
   *         description: ID do workspace não informado
   *       404:
   *         description: Workspace ou assistente não encontrado
   *       500:
   *         description: Erro interno
   */
  public async findAssistant(req: Request, res: Response): Promise<void> {
    try {
      const workspaceId = req.header('workspaceId');

      if (!workspaceId) {
        res.status(400).json({ message: 'workspaceId é necessário' });
        return;
      }

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) {
        res.status(404).json({
          message: 'Não foi possível encontrar o workspace.',
        });
        return;
      }

      const assistant = await retrieveAssistant(openai, workspace.assistantId);

      if (!assistant) {
        res.status(404).json({
          message: 'Não foi possível encontrar a assistente, tente novamente mais tarde',
        });
        return;
      }

      res
        .status(200)
        .json({ ...assistant, picture: workspace.assistantPicture });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  /**
   * @swagger
   * /assistant/:
   *   put:
   *     summary: Atualiza o assistente do workspace
   *     tags: [Assistente]
   *     parameters:
   *       - in: header
   *         name: workspaceId
   *         required: true
   *         description: ID do workspace
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               instructions:
   *                 type: string
   *               temperature:
   *                 type: number
   *               functions:
   *                 type: array
   *                 items:
   *                   type: object
   *               picture:
   *                 type: string
   *     responses:
   *       200:
   *         description: Assistente atualizado com sucesso
   *       400:
   *         description: ID do workspace não informado
   *       404:
   *         description: Workspace não encontrado
   *       500:
   *         description: Erro interno
   */
  public async updateAssistant(req: Request, res: Response): Promise<void> {
    try {
      const workspaceId = req.header('workspaceId');

      if (!workspaceId) {
        res.status(400).json({ message: 'workspaceId é necessário' });
        return;
      }

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) {
        res.status(404).json({ message: 'Workspace não encontrado' });
        return;
      }

      const { name, instructions, temperature, functions, picture } = req.body;

      const body = {
        name,
        instructions,
        temperature,
      };

      const tools: any = [
        { type: 'file_search' },
        ...(functions ? functions : []), // Adiciona as funções caso elas existam
      ];

      await Workspace.update(workspace.id, {
        assistantPicture: picture,
      });

      const assistant = await updateAssistant(
        openai,
        workspace.assistantId,
        body,
        tools,
      );

      res.status(200).json(assistant);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  /**
   * @swagger
   * /assistant/generate:
   *   post:
   *     summary: Gera uma resposta do assistente baseado no prompt
   *     tags: [Assistente]
   *     parameters:
   *       - in: header
   *         name: workspaceId
   *         required: true
   *         description: ID do workspace
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               prompt:
   *                 type: string
   *     responses:
   *       200:
   *         description: Resposta gerada pelo assistente
   *         content:
   *           application/json:
   *             schema:
   *               type: string
   *       400:
   *         description: ID do workspace ou prompt não informado
   *       404:
   *         description: Workspace não encontrado
   *       500:
   *         description: Erro interno
   */
  public async generate(req: Request, res: Response): Promise<void> {
    try {
      const workspaceId = req.header('workspaceId');

      if (!workspaceId) {
        res.status(400).json({ message: 'workspaceId é necessário' });
        return;
      }

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) {
        res.status(404).json({ message: 'Workspace não encontrado' });
        return;
      }

      const { prompt } = req.body;

      if (!prompt) {
        res.status(400).json({ message: 'Prompt é necessário' });
        return;
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        store: true,
        temperature: 1,
        messages: [{ role: 'user', content: prompt }],
      });

      const ai = response.choices[0].message.content;

      console.log(response);

      res.status(200).json(ai);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
}

export default new AssistantController();