import Document from '@entities/Document';
import Workspace from '@entities/Workspace';
import { ioSocket } from '@src/socket';

export async function createDocument(workspace: Workspace, threadId: string, args: string): Promise<{ status: string; message: string; object: any | null }> {
  console.log('Entrou na action: createDocument');

  const body = JSON.parse(args);

  const { name, description, content } = body;

  try {
    const document = await Document.create({ name, description, content, workspace }).save();

    if (!document) {
      return {
        status: 'failed',
        message: `Ouve um erro ao executar a função, tente novamente`,
        object: document,
      };
    }

    (await ioSocket).emit(`document:${threadId}`, document.id)
    return {
      status: 'completed',
      message: `Documento ${name} criado com sucesso.`,
      object: document,
    };
  } catch (error) {
    // await createAction(call)
    console.error(error);
    return {
      status: 'failed',
      message: 'Ouve um erro ao executar a função, tente novamente',
      object: null,
    };
  }
}

