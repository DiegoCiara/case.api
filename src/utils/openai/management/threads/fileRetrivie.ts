import OpenAI from 'openai';

export async function retrieveFile(openai: OpenAI, fileId: string) {
  try {
    const openaiFile = await openai.files.retrieve(fileId);

    return openaiFile
  } catch (error) {
    console.error(error)
  }
}
