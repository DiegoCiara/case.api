import OpenAI from 'openai';

interface AssistantData {
  name: string;
  instructions: string;
  temperature: 0.5;
}

export async function createAssistant(openai: OpenAI, data: AssistantData, tools: any, vectorId: string) {
  try {
    const assistant = await openai.beta.assistants.create({
      ...data,
      model: 'gpt-4o-mini',
      tools,
      tool_resources: {
        file_search: { vector_store_ids: [vectorId] },
      },
      top_p: 1,
      metadata: {},
      response_format: 'auto',
    });
    return assistant
  } catch (error) {
    return;
  }
}

