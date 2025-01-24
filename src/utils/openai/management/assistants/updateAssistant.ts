import OpenAI from 'openai';

interface AssistantData {
  name: string;
  instructions: string;
  temperature: 0.5;
}

export async function updateAssistant(openai: OpenAI, assistantId: string, data: AssistantData, tools: any) {
  try {
    const assistant = await openai.beta.assistants.update(assistantId, {
      ...data,
      description: '',
      model: 'gpt-4o-mini',
      tools,
      top_p: 1,
      metadata: {},
      response_format: 'auto',
    });
    return assistant
  } catch (error) {
    console.error(error)
    return;
  }
}

