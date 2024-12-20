const axios = require('axios');
const fs = require('fs');
const path = require('path');

// URL do áudio
const audioUrl = 'https://mmg.whatsapp.net/v/t62.7117-24/13749445_1016325243837721_7132259545176521098_n.enc?ccb=11-4&oh=01_Q5AaIDeDX51uhqBWl8Wfs_K9udSPURwPRFk8qiYOXTykG6hQ&oe=66F02F6D&_nc_sid=5e03e0&mms3=true';
const fileName = 'audio_message.ogg';  // Nome do arquivo de saída
const outputDirectory = './audio_messages';  // Diretório onde o áudio será salvo


async function downloadAudio(url, outputPath) {
  try {
    // Faz o download do áudio
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
    });

    // Cria o diretório se ele não existir
    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory);
    }

    // Cria um caminho completo para o arquivo
    const filePath = path.join(outputDirectory, fileName);

    // Cria um fluxo de escrita para o arquivo
    const writer = fs.createWriteStream(filePath);

    // Pipe o fluxo de resposta para o arquivo
    response.data.pipe(writer);

    // Aguarda a conclusão da escrita


    writer.on('error', (err) => {
      console.error('Erro ao salvar o áudio:', err);
    });
  } catch (error) {
    console.error('Erro ao baixar o áudio:', error);
  }
}


downloadAudio(audioUrl, path.join(outputDirectory, fileName));