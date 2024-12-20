// Importação dinâmica de inquirer e fs
(async () => {
  // Importar os módulos dinamicamente
  const { default: inquirer } = await import('inquirer');
  const fs = await import('fs');
  const { log } = await import('console');
  require("dotenv").config();
  const crypto = require('crypto');

  function generateSecretKey() {
    // Gera 16 bytes aleatórios e os converte para uma string hexadecimal
    return crypto.randomBytes(16).toString('hex');
  }


  // Carregar variáveis de ambiente

  const ASAAS_API_KEY = "$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwODQ2NTY6OiRhYWNoX2VmMDdmM2VhLTQ4MDAtNDVlMi04MjcwLWQ2M2ZmY2MyNTRjZQ==";

  const OPENAI_API_KEY = "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";

  const geminiQuestion = [

    {
      type: 'list',
      name: 'ENVIROMENT',
      message: 'Em qual ambimente estamos?',
      choices: ['DEV', 'PROD'],
    },
    {
      type: 'input',
      name: 'DB_NAME',
      message:
        'Informe o Nome do banco de dados(DB_NAME)',
      validate: (input) =>
        !!input ||
        'O Nome do banco de daddos não pode estar vazio. Por favor, informe um valor válido.',
    },
    {
      type: 'input',
      name: 'DB_NAME',
      message:
        'Informe o Nome do banco de dados(DB_NAME)',
      validate: (input) =>
        !!input ||
        'O Nome do banco de daddos não pode estar vazio. Por favor, informe um valor válido.',
    },
    {
      type: 'input',
      name: 'DB_PORT',
      message: 'Informe a Porta do banco de dados (DB_PORT):',
      validate: (input) =>
        !!input ||
        'O DB_PORT não pode ser vazio. Por favor, informe um valor válido.',
    },
    {
      type: 'input',
      name: 'DB_PASSWORD',
      message: 'Informe a Senha do banco de dados (DB_PASSWORD):',
      validate: (input) =>
        !!input ||
        'O DB_PASSWORD não pode ser vazio. Por favor, informe um valor válido.',
    },
    {
      type: 'input',
      name: 'CLIENT_PORT',
      message: 'Informe a porta do cliente (CLIENT_PORT), certifique-se de já ter inserido-a no proxy reverse:',
      validate: (input) =>
        !!input ||
        'O CLIENT_PORT não pode ser vazio. Por favor, informe um valor válido.',
    },
    {
      type: 'input',
      name: 'SOCKET_PORT',
      message: 'Informe a porta do socket (SOCKET_PORT), certifique-se de já ter inserido-a no proxy reverse:',
      validate: (input) =>
        !!input ||
        'O SOCKET_PORT não pode ser vazio. Por favor, informe um valor válido.',
    },
    {
      type: 'input',
      name: 'CLIENT_CONNECTION',
      message: 'Informe a URL de acesso do cliente (CLIENT_CONNECTION), exemplo "https://wave.softspace.com.br":',
      validate: (input) =>
        !!input ||
        'O CLIENT_CONNECTION não pode ser vazio. Por favor, informe um valor válido.',
    },
  ];


  const geminiAnswers = await inquirer.prompt(geminiQuestion);

  let envConfig = `DB_NAME=${geminiAnswers.DB_NAME}\n`;
  envConfig += `
DB_PORT=${geminiAnswers.DB_PORT}\n
DB_PASSWORD=${geminiAnswers.DB_PASSWORD}\n
DB_USER=docker\n
DB_HOST=localhost\n
SECRET=${generateSecretKey()}\n
ASAAS_API_KEY=${ASAAS_API_KEY}\n
OPENAI_API_KEY=${OPENAI_API_KEY}\n
CLIENT_CONNECTION=${geminiAnswers.CLIENT_CONNECTION}\n
SOCKET_PORT=${geminiAnswers.SOCKET_PORT}\n
CLIENT_PORT=${geminiAnswers.CLIENT_PORT}\n
ENVIROMENT=${geminiAnswers.ENVIROMENT}\n
SECRET_WPPCONNECT_SERVER=9dceca71c7caa25c583a1959556faa62\n
SOCKET_SERVER_URL=https://wppconnect.figio.com.br\n
WPP_SOCKET_PORT=2345\n

AWS_BUCKET_NAME=softspace-cloud

AWS_ACCESS_KEY_ID=AKIAQMEY5Y2VB2RZOG2M

AWS_SECRET_ACCESS_KEY=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
  `;

  // Escrever no arquivo .env
  fs.writeFileSync('.env', envConfig, { encoding: 'utf8' });

  const success = `


  Configuração salva com sucesso! 🎉\n
  1º Gere a build do projeto;
  2º Suba o container
  3º Rode as migrations
  4º Rode o projeto em produção


  .`
  log(success);
})();
