import OpenAI from "openai";




export async function generateThreadName(openai: OpenAI, content: any): Promise<string>{
  try {

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      store: true,
      temperature: 0,
      messages: [
        { role: 'system', content: `Dê um nome para a conversa que inicie com a mensagem abaixo, sua resposta não poderá conter nenhum outro assunto ou frase que não seja o nome para a conversa` },
        { role: 'user', content }
      ],
    });

    const threadName = response.choices[0].message.content;

    return threadName || '';
  } catch (error) {
    console.error(error)
    return '';
  }
}
