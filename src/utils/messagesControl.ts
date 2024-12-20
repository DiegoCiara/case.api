
export function splitMessages(text: string): string[] {
  // 1. Combinando emojis com a palavra anterior
  const emojiPattern = /([\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E6}-\u{1F1FF}])/gu;
  text = text.replace(emojiPattern, '$1 '); // Adiciona espaço após o emoji

  const complexPattern = /(http[s]?:\/\/[^\s]+)|(www\.[^\s]+)|([^\s]+@[^\s]+\.[^\s]+)|(["'].*?["'])|(\b\d+\.\s)|(\w+\.\w+)/g;
  const placeholders: string[] = text.match(complexPattern) ?? [];
  const placeholder = 'PLACEHOLDER_';
  let currentIndex = 0;
  const textWithPlaceholders = text.replace(
    complexPattern,
    (): string => `${placeholder}${currentIndex++}`
  );

  // 2. Ajustando o padrão de divisão para incluir emojis na divisão
  const splitPattern = /(?<!\b\d+\.\s)(?<!\w+\.\w+)[^.?!]+(?:[.?!]+["']?|$)/gu;
  let parts: string[] = textWithPlaceholders.match(splitPattern) ?? [];

  if (placeholders.length > 0) {
    parts = parts.map((part) =>
      placeholders.reduce(
        (acc, val, idx) => acc.replace(`${placeholder}${idx}`, val),
        part
      )
    );
  }

  // 3. Removendo strings vazias e quebras de linha extras
  parts = parts.filter(part => part.trim() !== '');
  parts = parts.map(part => part.trim());

  return parts;
}


function removeCountryCode(phoneNumber: string) {
  const countryCode = "55"; // Código do país para o Brasil
  if (phoneNumber.startsWith(countryCode)) {
    return phoneNumber.slice(countryCode.length); // Remove o código do país
  }
  return phoneNumber;
}

// Função para formatar mensagens com o número de telefone
export function formatMessages(chatHistory: any) {
  return chatHistory
    ?.map((message: any) => {
      const remetente = message.fromMe
        ? `Você (${removeCountryCode(message.from)})`
        : `${message.sender.pushname || "Remetente Desconhecido"} (${removeCountryCode(message.from)})`;

      const destinatario = message.fromMe
        ? `Destinatário (${removeCountryCode(message.to)})`
        : `${message.sender.pushname || "Destinatário Desconhecido"} (${removeCountryCode(message.to)})`;

      const conteudo = message.content || message.body || "Sem conteúdo";

      return `${remetente}: ${conteudo}`;
    })
    .join("\n"); // Une cada mensagem separada por quebra de linha
}



export async function sendMessagesWithDelay({
  messages,
  client,
  targetNumber,
}: {
  messages: string[];
  client: any;
  targetNumber: string;
}): Promise<void> {
  for (const [, msg] of messages.entries()) {
    const dynamicDelay = msg.length * 100;
    await new Promise((resolve) => setTimeout(resolve, dynamicDelay));
    client
      .sendText(targetNumber, msg.trimStart())
      .catch((erro: any) => {
        console.error('Erro ao enviar mensagem:', erro);
      });
  }
}
