import OpenAI from 'openai';

export async function retrieveAssistant(openai: OpenAI, assistantId: string) {
  try {
    const assistant = await openai.beta.assistants.retrieve(assistantId);
    return assistant
  } catch (error) {
    return;
  }
}

