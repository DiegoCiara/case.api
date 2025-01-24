import Workspace from '@entities/Workspace';
import OpenAI from 'openai';

export async function listFiles(openai: OpenAI, workspace: Workspace) {
  try {

    const files = await openai.beta.vectorStores.files.list(workspace.vectorId);


    // Processa cada arquivo para obter o conteúdo adicional
    const filesPromise = await Promise.all(
      files.data.map(async (file) => {
        try {
          const openaiFile = await openai.files.retrieve(file.id);
          return {
            ...openaiFile,
            ...file,
          };
        } catch (fileError) {
          console.error(`Erro ao processar o arquivo ${file.id}:`, fileError);
          return { ...file, error: 'Não foi possível obter o conteúdo do arquivo' };
        }
      })
    );
    return filesPromise
  } catch (error) {
    return;
  }
}

