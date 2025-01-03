import Workspace from '@entities/Workspace';
import Thread from '@entities/Thread';
import fs from 'fs';
import AWS from 'aws-sdk';

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-2',
});

const bucketName = process.env.AWS_BUCKET_NAME;
const s3 = new AWS.S3();

export async function s3Image(base64: string, workspace: Workspace, id: string, threadId: string) {
  try {
    // Verificar o tipo de imagem a partir do prefixo base64
    let extension = '';
    let contentType = '';

    if (base64.startsWith('data:image/png')) {
      extension = 'png';
      contentType = 'image/png';
    } else if (base64.startsWith('data:image/jpeg') || base64.startsWith('data:image/jpg')) {
      extension = 'jpg';
      contentType = 'image/jpeg';
    } else if (base64.startsWith('data:image/svg+xml')) {
      extension = 'svg';
      contentType = 'image/svg+xml';
    } else if (base64.startsWith('data:audio/ogg; codecs=opus')) {
      extension = 'ogg';
      contentType = 'audio/ogg; codecs=opus';
    } else {
      throw new Error('Formato de imagem não suportado.');
    }

    // Remover o prefixo base64
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');

    // Converter a string base64 para um buffer
    const buffer = Buffer.from(base64Data, 'base64');

    // Definir o caminho do arquivo com a extensão correta

    // Configurar parâmetros para o upload do S3
    const params = {
      Bucket: bucketName!,
      Key: `workspace:${workspace.id}/threads/thread:${threadId}/${id}.${extension}`, // Nome do arquivo no bucket
      Body: buffer,
      ContentType: contentType, // Tipo de conteúdo dinâmico
    };

    // Fazer o upload do arquivo para o bucket S3
    const s3Response = await s3.upload(params).promise();

    return s3Response;
  } catch (error) {
    console.error('Erro ao processar a imagem:', error);
    throw error;
  }
}

