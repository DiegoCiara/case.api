import { Request, Response } from 'express';
import Workspace from '@entities/Workspace';
import OpenAI from 'openai';
import { retrieveAssistant } from '@utils/openai/management/assistants/retrieveAssistant';
import { updateAssistant } from '@utils/openai/management/assistants/updateAssistant';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

class WorkspaceController {
  public async findAssistant(req: Request, res: Response): Promise<Response> {
    try {
      const workspaceId = req.header('workspaceId');

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) return res.status(404).json({ message: 'Workspace não encontrado' });

      const assistant = await retrieveAssistant(openai, workspace.assistantId);

      return res.status(200).json({ ...assistant, picture: workspace.assistantPicture });
    } catch (error) {
      return res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }
  public async updateAssistant(req: Request, res: Response): Promise<Response> {
    try {
      const workspaceId = req.header('workspaceId');

      const workspace = await Workspace.findOne(workspaceId);

      if (!workspace) return res.status(404).json({ message: 'Workspace não encontrado' });

      const { name, instructions, temperature, functions, picture } = req.body

      const body = {
        name, instructions, temperature
      }

      const tools: any = [
        { type: 'file_search' },
        ...(functions ? functions : []) // Adiciona as funções caso elas
      ];


      await Workspace.update(workspace.id, {
        assistantPicture: picture,
      });

      const assistant = await updateAssistant(openai, workspace.assistantId, body, tools );
      console.log(assistant)
      return res.status(200).json(assistant);
    } catch (error) {
      return res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }
  public async generate(req: Request, res: Response): Promise<Response> {
    try {
      const workspaceId = req.header('workspaceId');

      const workspace = await Workspace.findOne(workspaceId);

      const { prompt } = req.body;

      if (!workspace) return res.status(404).json({ message: 'Workspace não encontrado' });

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        store: true,
        temperature: 1,
        messages: [{ role: 'user', content: prompt }],
      });
      const ai =  response.choices[0].message.content;

      console.log(response)

      return res.status(200).json(ai);
    } catch (error) {
      console.error(error)
      return res.status(404).json({ message: 'Cannot find workspaces, try again' });
    }
  }
}

export default new WorkspaceController();

