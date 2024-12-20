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

export async function convertDataImage(data: string, id: string, workspace: Workspace, thread: Thread) {
  try {
    // Converte a string base64 para um buffer
    const imageData = Buffer.from(data, 'base64');

    // Salva o arquivo de imagem localmente

    // Configurar parâmetros para o upload do S3
    const params = {
      Bucket: bucketName!,
      Key: `workspace:${workspace.id}/threads/thread:${thread.id}/${id}.jpg`, // Nome do arquivo no bucket
      Body: imageData,
      ContentType: 'image/jpeg', // Tipo de conteúdo para a imagem
    };

    // Fazer o upload do arquivo para o bucket S3
    const s3Response = await s3.upload(params).promise();

    return s3Response.Location;
  } catch (error) {
    console.error('Erro ao processar a imagem:', error);
    throw error;
  }
}

export async function saveDataImage(base64: string, id: string, workspace: Workspace, thread: Thread) {
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
    }  else if (base64.startsWith('data:audio/mpeg')) { // Adicionado suporte a MP3
      extension = 'mp3';
      contentType = 'audio/mpeg';
    } else if (base64.startsWith('data:audio/mpeg')) { // Adicionado suporte a MP3
      extension = 'webm';
      contentType = 'audio/webm';
    } else {
      throw new Error('Formato de imagem não suportado.');
    }
// data:audio/mpeg;base64
    // Remover o prefixo base64
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');

    // Converter a string base64 para um buffer
    const buffer = Buffer.from(base64Data, 'base64');

    // Definir o caminho do arquivo com a extensão correta

    // Configurar parâmetros para o upload do S3
    const params = {
      Bucket: bucketName!,
      Key: `workspace:${workspace.id}/threads/thread:${thread.id}/${id}.${extension}`, // Nome do arquivo no bucket
      Body: buffer,
      ContentType: contentType, // Tipo de conteúdo dinâmico
    };

    // Fazer o upload do arquivo para o bucket S3
    const s3Response = await s3.upload(params).promise();

    return s3Response.Location;
  } catch (error) {
    console.error('Erro ao processar a imagem:', error);
    throw error;
  }
}

