
import { formatMessages, sendMessagesWithDelay, splitMessages } from '../messagesControl';
import { Server } from 'socket.io';
import { mainOpenAI } from '@utils/openai';
import axios from 'axios';
import Thread from '@entities/Thread';
import Workspace from '@entities/Workspace';
import fs from 'fs';
import path from 'path';
import { formatToWhatsAppNumber } from '../format';
import Session from '@entities/Session';
import FormData from 'form-data';
import { convertWebmToOgg } from '@utils/convertOgg';

const messageBufferPerChatId = new Map();
const messageTimeouts = new Map();
const MAX_RETRIES = 3;

// Session as workspaceId

const secret = process.env.SECRET_WPPCONNECT_SERVER;

async function sendMessage(session: string, token: string, phone: string, message: string) {
  try {
    console.log(session, token, phone, message);

    const data = {
      phone: formatToWhatsAppNumber(phone),
      message,
      isGroup: false,
      isNewsletter: false,
      options: null,
    };

    console.log(data)

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    const response = await axios.post(`${process.env.SOCKET_SERVER_URL}/api/${session}/send-message`, data, config);
    return response.status;
  } catch (error: any) {
    console.error('Eage:', error.response ? error.response.data : error.message);
    const errorReturned = error.response ? error.response.data : error.message;
    return errorReturned;
  }
}

async function sendImage(session: string, token: string, phone: string, message: string, base64Image: string, filename = 'ig') {
  try {
    console.log(session, token, phone, message);

    // Prepare the request body to match the expected structure in sendFile
    const data = {
      phone: [formatToWhatsAppNumber(phone)], // Assuming 'phone' is a string, it's passed as an array
      base64: base64Image, // base64 image string
      filename: filename, // Set a default filename for the image
      caption: message, // Optional message or caption
      options: null,
    };

    // console.log(data);

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    // Make the API call to the sendFile endpoint
    const response = await axios.post(`${process.env.SOCKET_SERVER_URL}/api/${session}/send-file-base64`, data, config);

    return response.data;
  } catch (error: any) {
    console.error('Eage:', error.response ? error.response.data : error.message);
    const errorReturned = error.response ? error.response.data : error.message;
    return errorReturned;
  }
}
async function sendAudio(session: string, token: string, phone: string, message: string, base64Image: string, filename = 'ig') {
  try {
    console.log(session, token, phone, message);

    // Prepare the request body to match the expected structure in sendFile
    const data = {
      phone: [formatToWhatsAppNumber(phone)], // Assuming 'phone' is a string, it's passed as an array
      base64: base64Image, // base64 image string
      filename: filename, // Set a default filename for the image
      caption: message, // Optional message or caption
      options: null,
    };

    // console.log(data);

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    // Make the API call to the sendFile endpoint
    const response = await axios.post(`${process.env.SOCKET_SERVER_URL}/api/${session}/send-file-base64`, data, config);

    return response.data;
  } catch (error: any) {
    console.error('Eage:', error.response ? error.response.data : error.message);
    const errorReturned = error.response ? error.response.data : error.message;
    return errorReturned;
  }
}

async function sendAudio64(session: string, token: string, phone: string, base64: string) {
  try {
    const base64Ogg = await convertWebmToOgg(base64);

    const body = {
      phone: [formatToWhatsAppNumber(phone)], // O endpoint espera uma lista de números
      base64Ptt: base64Ogg,
      isGroup: false,
    }
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    console.log(body)
    // Fazendo a chamada API para enviar o arquivo
    const response = await axios.post(`${process.env.SOCKET_SERVER_URL}/api/${session}/send-file-base64`, body, config);
    console.log(response.data);
    return response.data;
  } catch (error: any) {
    console.error(error.response.data);
  }
}

async function generateToken(session: string) {
  const response = await axios.post(`${process.env.SOCKET_SERVER_URL}/api/${session}/${secret}/generate-token`);
  console.log(`Token gerado:${response.data.token}, Assistente atualizada com o token:`);
  return response.data.token;
}

async function startSession(token: string, session: string) {
  const data = {
    session: `${session}`,
    waitQrCode: true,
  };
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const response = await axios.post(`${process.env.SOCKET_SERVER_URL}/api/${session}/start-session`, data, { headers });

  const qrCode = response.data;

  return qrCode;
}

// async function replyMensageByOpenAI(data: any, workspaceId: any) {
//   try {
//     const currentMessage = data?.message;

//     const chatId = data?.number;

//     const reply = await mainOpenAI({
//       currentMessage: currentMessage,
//       workspaceId: workspaceId,
//       chatId: chatId,
//       usage: 'wpp',
//       emailWidget: '',
//     });
//   } catch (error) {
//     console.error(error);
//   }
// }

export async function getConnectionClient(token: string, id: string) {
  const session = await Session.findOne(id);
  try {
    if (!session) return;
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.get(`${process.env.SOCKET_SERVER_URL}/api/${id}/check-connection-session`, { headers });

    console.log(response.data)
    return {
      status: response.data.message,
      session: session,
    };
  } catch (error) {
    const { data }: any = error;
    console.error('Erro no getConnection');
    return {
      status: 'Disconnected',
      session: session,
    };
  }
}
export async function logOffClient(token: string, id: string) {
  try {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    try {
      await axios.post(`${process.env.SOCKET_SERVER_URL}/api/${id}/logout-session`, { headers });
    } catch (error) {
      console.error('Erro do logoff');
    }
    try {
      const clearSession = await axios.post(`${process.env.SOCKET_SERVER_URL}/api/${id}/${secret}/clear-session-data`, { headers });
      console.log('clearSession.data.message', clearSession.data.message);
    } catch (error) {
      console.error('Erro do clearSession');
    }
    // try {
    //   const closeSession = await axios.post(`${process.env.SOCKET_SERVER_URL}/api/${id}/close-session`, { headers });
    // } catch (error) {
    //   console.error('Erro do closeSession', error);
    // }
    return;
  } catch (error) {
    console.error('Logodfferror', error);
    // return 'Disconnecteds';
  }
}

function typeWppMessage(messageReceived: any) {
  const { mimeType, type } = messageReceived;
  if (mimeType === 'audio/ogg; codecs=opus') {
    return 'audio';
  } else if (type === 'image') {
    return 'image';
  } else {
    return 'text';
  }
}



async function saveBufferToFile(buffer: any, filename: any, directory: any) {
  const savePath = path.join(directory, filename);
  return new Promise((resolve, reject) => {
    fs.writeFile(savePath, buffer, (err) => {
      if (err) reject(err);
      resolve(savePath);
    });
  });
}
function fileToBase64(filePath: any) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, { encoding: 'base64' }, (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
}

export { sendMessage, saveBufferToFile, fileToBase64, sendImage, sendAudio, sendAudio64, generateToken, startSession, typeWppMessage };

