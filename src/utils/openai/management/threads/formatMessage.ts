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

export function formatMessageTest(message: string) {
  return [
    { type: 'text', text: message },
    { type: 'image_file', image_file: { file_id: 'file-1yWBXUPkGaYCQ2wgCQbNan' } },
  ];
}

