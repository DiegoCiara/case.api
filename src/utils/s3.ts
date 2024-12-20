import Workspace from '@entities/Workspace';
import Thread from '@entities/Thread';
import fs from 'fs';
import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-2',
});

const bucketName = process.env.AWS_BUCKET_NAME;
const aws = new AWS.S3();

export async function s3(data: any, workspace: Workspace, path: string, object: any, archiveType: string, fileType: string) {
  try {
    const params = {
      Bucket: bucketName!,
      Key: `workspace:${workspace.id}/${path}/user:${object?.id}/${new Date()}.jpg`, // Nome do arquivo no bucket
      Body: data,
      ContentType: `${archiveType}/${fileType}`, // o tipo do arquivo
    };

    // Fazer o upload do arquivo para o bucket S3
    const awsResponse = await aws.upload(params).promise();

    return awsResponse.Location;
  } catch (error) {
    console.error('Erro ao processar a imagem:', error);
    throw error;
  }
}

