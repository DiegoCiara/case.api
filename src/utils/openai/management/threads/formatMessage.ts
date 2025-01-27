import Workspace from '@entities/Workspace';
import { vision } from '@utils/openai/chat/functions/vision/vision';
import { s3Image } from '@utils/s3';
import OpenAI from 'openai';

import { v4 as uuidv4 } from 'uuid';

export async function formatMessage(openai: OpenAI, media: any, message: string, threadId: string, workspace: Workspace, type: string) {
  if (media) {
    // Verifica se media é um array, caso contrário, transforma em array
    const mediaArray = Array.isArray(media) ? media : [media];

    // Aguardar a obtenção do Location para todas as imagens
    const images = await Promise.all(
      mediaArray.map(async (e: any) => {
        const { Location }: any = await s3Image(e, workspace, uuidv4(), threadId);
        const visions: any = await vision(openai, Location, workspace, threadId);
        console.log(visions);
        return {
          type: 'image_url',
          image_url: {
            url: Location,
          },
        };
      })
    );

    // Se houver mensagem, retornar imagem + texto, caso contrário apenas a imagem
    return message ? [{ type: 'text', text: message }, ...images] : images;
  } else {
    return [{ type: 'text', text: message }];
  }
}

export function transformMessages(messages: any) {
  return messages
    .map((msg: any) => {
      // Extraindo o texto e as anotações do conteúdo
      const messageText = msg.content.find((e: any) => e.type === 'text');
      const messageImages = msg.content.filter((e: any) => e.type === 'image_url');
      const annotations = messageText?.text?.annotations || [];

      return {
        id: msg.id,
        role: msg.role,
        images: messageImages || [],
        content: messageText?.text?.value || '',
        annotations: annotations, // Incluindo as anotações
        createdAt: new Date(msg.created_at * 1000).toISOString(), // Convertendo timestamp para ISO8601
      };
    })
    .reverse();
}
