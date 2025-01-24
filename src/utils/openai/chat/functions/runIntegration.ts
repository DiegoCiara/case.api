import Integration from '@entities/Integration';
import axios from 'axios';

export async  function runIntegration(integration: Integration, args: string) {
  try {
    const body = JSON.parse(args);

    // Definindo a assinatura de índice para o objeto final
    const headersObject = integration.headers.reduce<{ [key: string]: string }>((acc, { key, value }) => {
      acc[key] = value; // Adiciona a chave e o valor no objeto acumulado
      return acc; // Retorna o objeto acumulado
    }, {});

    const headers = {
      headers: headersObject
    }

    if (integration.method === 'POST') {
      const response = await axios.post(integration.url, body, headers);

      console.log(response);
      return {
        id: '',
        message: 'Integração executada com sucesso',
      };
    } else {
      return {
        id: '',
        message: 'Ocorreu um erro ao fazer a requisição, verifique a integração e tente novamente',
      };
    }
    return;
  } catch (error) {
    console.error(error);
    return {
      id: '',
      message: 'Ocorreu um erro ao fazer a requisição, verifique a integração e tente novamente',
    };
  }
}

