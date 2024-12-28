

function openaiMessage(media: string, message: string) {
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
