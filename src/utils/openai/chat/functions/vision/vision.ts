import Workspace from '@entities/Workspace';
import Vision from '@entities/Vision';
import probe from 'probe-image-size';
import OpenAI from 'openai';
import Thread from '@entities/Thread';

/**
 * Função para obter as dimensões da imagem através da URL
 * @param {String} imageUrl - URL do objeto armazenado no S3
 * @returns {Promise<Object>} - Retorna um objeto com altura e largura da imagem
 */
export const vision = async (openai: OpenAI, imageS3Location: string, workspace: Workspace, threadId: string) => {
  try {
    // Obter as dimensões da imagem diretamente pela URL
    console.log(threadId);

    const ai = await openai.beta.assistants.retrieve(workspace.assistantId);
    const result = await probe(imageS3Location);

    const thread = await Thread.findOne({ where: { threadId: threadId } });
    if (!thread) return;
    const vision = await Vision.create({
      width: result.width,
      height: result.height,
      model: ai.model,
      type: result.type,
      thread,
      workspace,
    }).save();

    console.log(vision);

    return vision;
  } catch (error) {
    console.error('Erro ao obter as dimensões da imagem:', error);
    throw error;
  }
};
