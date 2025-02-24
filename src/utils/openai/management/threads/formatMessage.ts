import fs from 'fs';
import path, { matchesGlob } from 'path';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';
import { s3, s3Image } from '@utils/s3';
import Workspace from '@entities/Workspace';

function getFileExtensionFromBase64(base64: string): string | null {
  const match = base64.match(/^data:(.+);base64,/);
  if (match) {
    const mimeType = match[1]; // Exemplo: "image/png"
    return mimeType.split('/')[1]; // Retorna "png"
  }
  return null;
}

export async function formatMessage(openai: OpenAI, files: any, images: any, message: string, workspace: Workspace, threadId: string) {
  let filesOpenai = [];
  let imagesOpenai = [];

  if (files?.length > 0) {
    filesOpenai = await Promise.all(
      files.map(async (e: any) => {
        // Decodifica Base64 e salva o arquivo temporariamente
        const base64SemPrefixo = e.data.replace(/^data:[^;]+;base64,/, '');
        const buffer = Buffer.from(base64SemPrefixo, 'base64');
        const fileName = `${e.name}`;
        const filePath = path.join('src/temp', fileName); // Caminho temporário (pode ser modificado)

        // Salva o arquivo no sistema de arquivos
        fs.writeFileSync(filePath, buffer);

        // Enviar arquivo salvo para OpenAI
        const file = await openai.files.create({
          file: fs.createReadStream(filePath),
          purpose: 'assistants',
        });

        // (Opcional) Remover o arquivo após o upload
        fs.unlinkSync(filePath);

        return {
          file_id: file.id,
          tools: [{ type: 'code_interpreter' }],
        };
      })
    );
  }
  if (images?.length > 0) {
    imagesOpenai = await Promise.all(
      images.map(async (e: any) => {
        // Decodifica Base64 e salva o arquivo temporariamente
        const { Location } = await s3Image(e.data, workspace, `${e.name}-${uuidv4()}`, threadId);

        return {
          type: 'image_url',
          image_url: { url: Location, detail: 'low' },
        };
      })
    );
  }

  // Cria o array content com a mensagem de texto e as imagens
  const content = [{ type: 'text', text: message }, ...imagesOpenai];

  console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', filesOpenai, message);
  return {
    role: 'user',
    content: content,
    attachments: filesOpenai,
  };
}

export function transformMessages(messages: any) {
  return messages
    .map((msg: any) => {
      // Extraindo o texto e as anotações do conteúdo
      const messageText = msg.content.find((e: any) => e.type === 'text');
      const messageImages = msg.content.filter((e: any) => e.type === 'image_url');
      const imageFiles = msg.content.filter((e: any) => e.type === 'image_file');
      const annotations = messageText?.text?.annotations || [];
      const attachments = msg?.attachments || [];

      return {
        id: msg.id,
        role: msg.role,
        images: messageImages || [],
        image_files: imageFiles || [],
        content: messageText?.text?.value || '',
        attachments: attachments,
        annotations: annotations, // Incluindo as anotações
        createdAt: new Date(msg.created_at * 1000).toISOString(), // Convertendo timestamp para ISO8601
      };
    })
    .reverse();
}
