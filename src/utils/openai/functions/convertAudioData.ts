import Workspace from '@entities/Workspace';
import Thread from '@entities/Thread';
import fs from 'fs';
import AWS from 'aws-sdk';
import axios from 'axios';

const bucketName = process.env.AWS_BUCKET_NAME;

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-2',
});

const s3 = new AWS.S3();

export async function convertDataAudio(data: any, id: string, workspace: Workspace, thread: Thread) {
  try {
    const fileData = await Buffer.from(data, 'base64');

    await fs.promises.writeFile(`src/temp/messages/${id}.m4a`, fileData);

    const params = {
      Bucket: bucketName!,
      Key: `workspace:${workspace.id}/threads/thread:${thread.id}/${id}`, // Nome do arquivo no bucket
      Body: fileData,
      ContentType: 'audio/mpeg',
    };
    const s3Response = await s3.upload(params).promise();

    return s3Response.Location;
  } catch (error) {
    console.error(error);
  }
}

export async function getAwsBase64(id: string, workspace: Workspace, thread: Thread) {
  const url = await s3.getSignedUrl('getObject', {
    Bucket: bucketName,
    Key: `workspace:${workspace.id}/threads/thread:${thread.id}/${id}`,
    Expires: 60 * 5, // URL expira em 5 minutos
  });

  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer', // Importante para lidar com dados binários
    });

    let base64 = Buffer.from(response.data, 'binary').toString('base64');

    const filePath = `src/audios/${id}.mp3`;

    return {
      base64: base64,
      filePath: filePath,
    };
  } catch (error) {
    console.error('Erro ao baixar ou converter o arquivo:', error);
  }
}

