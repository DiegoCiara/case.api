import fs from 'fs';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import Workspace from '@entities/Workspace';
import Whisper from '@entities/Whisper';
import mediaInfo from 'mediainfo-wrapper';
import Thread from '@entities/Thread';
import { decrypt } from '@utils/encrypt/encrypt';
import Assistant from '@entities/Assistant';
dotenv.config();

async function getAudioDuration(filePath: string) {
  try {
    const info = await mediaInfo(filePath);
    console.log(info[0].audio[0].duration);
    let lastDuration = info[0].audio[0].duration;
    let ultimoItem = lastDuration[lastDuration.length - 1];
    return ultimoItem;
  } catch (error) {
    console.error(`Error reading media file: ${error}`);
    return null;
  }
}
export default async function whisper(id: string, workspace: Workspace, assistant: Assistant, mediaUrl: string, thread: Thread) {
  try {
    const filePath = `src/temp/messages/${id}.m4a`;

    const duration = await getAudioDuration(filePath);

    console.log(`Duração do áudio: ${duration} segundos`);

    const apiKey = await decrypt(workspace!.openaiApiKey);
    const openai = new OpenAI({ apiKey });

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-1',
    });

    console.log(transcription.text);

    const whisper = await Whisper.create({
      s3Location: mediaUrl,
      output: transcription.text,
      duration: duration!,
      workspace,
      thread,
      assistant,
    }).save();

    console.log(whisper);

    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Erro ao apagar o arquivo local:', err);
      } else {
        console.log('Arquivo local apagado com sucesso!');
      }
    });
    return transcription.text;
  } catch (error) {
    console.log(error);
  }
}

