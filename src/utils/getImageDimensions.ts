import Workspace from '@entities/Workspace';
import Vision from '@entities/Vision';
import probe from 'probe-image-size';
import OpenAI from 'openai';
import Thread from '@entities/Thread';
import { decrypt } from './encrypt';
import Assistant from '@entities/Assistant';

/**
 * Função para obter as dimensões da imagem através da URL
 * @param {String} imageUrl - URL do objeto armazenado no S3
 * @returns {Promise<Object>} - Retorna um objeto com altura e largura da imagem
 */
export const saveDimensionsImage = async (imageS3Location: string, workspace: Workspace, assistant: Assistant, thread: Thread) => {
  try {
    // Obter as dimensões da imagem diretamente pela URL

    const apiKey = await decrypt(workspace?.openaiApiKey);
    const openai = new OpenAI({ apiKey });

    const ai = await openai.beta.assistants.retrieve(assistant.openaiAssistantId!);
    const result = await probe(imageS3Location);

    const vision = await Vision.create({
      width: result.width,
      height: result.height,
      model: ai.model,
      type: result.type,
      thread,
      assistant,
      workspace,
    }).save();

    return vision;
  } catch (error) {
    console.error('Erro ao obter as dimensões da imagem:', error);
    throw error;
  }
};

