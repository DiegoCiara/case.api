export function formatMessage(media: string, message: string) {
  if (media) {
    return message
      ? [
          { type: 'text', text: message },
          { type: 'image_url', image_url: { url: media } },
        ]
      : [{ type: 'image_url', image_url: { url: media } }];
  } else {
    return [{ type: 'text', text: message }];
  }
}

export function transformMessages(messages: any) {
  return messages.map((msg: any) => {
    // Extraindo o texto e as anotações do conteúdo
    const messageText = msg.content.find((e: any) => e.type === 'text');
    const messageImages = msg.content.filter((e: any) => e.type === 'image_url');
    const annotations = messageText.text.annotations || [];

    return {
      id: msg.id,
      role: msg.role,
      images: messageImages || [],
      content: messageText.text.value || '',
      annotations: annotations, // Incluindo as anotações
      createdAt: new Date(msg.created_at * 1000).toISOString(), // Convertendo timestamp para ISO8601
    };
  }).reverse();
}

