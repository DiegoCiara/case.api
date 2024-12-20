# Softspace BR: Backend

## Welcome to the Jungle

## Começando:

Vamos documentar todos os processos que estamos implementando neste README pra que depois ninguém se esqueça do que porra está fazendo

### Requisições:

Como o projeto consiste basicamente em fazer com que cada usuário tenha seu próprio access, todo o sistema funciona como um MultiTenant, onde o Id da assistente que foi adquirida pelo o usuário, então basicamente precisamos colocar este tenant na frente de todas as requests para não passarmos informações inválidas para o front.

### Tarefas

1. Precisamos validar todos os ids de requisição da aplicação, para não ocorrer da API morrer;
2. Precisamos refatorar bem os controllers e as rotas de API para ficar mais organizado;

## Rodando o Projeto:

### Necessário:

- Node
- Yarn ou NPM
- Docker/Docker-compose( linux );
- Docker Desktop ( Win/Mac );
- PostgreSQL;

### Rodando o Backend:

- Rode `yarn` ou `npm install`;
- Rode `node setup.js` para iniciar as configurações do ambiente;
- Rode `docker-compose up -d` ou `docker compose up -d` na ultima versão do docker;
- Rode `yarn typeorm migration:run`;
- Rode `yarn dev` ou `npm run dev`;
- Acesse a porta que aparece no terminal;

⚠️ APENAS EM AMBIENTE DE DESENVOLVIMENTO:

- SE NECESSÁRIO, PARA REVERTER AS MIGRATIONS, rode `yarn typeorm migration:revert`;
- SE NECESSÁRIO, PARA DROPAR O DB, rode `yarn typeorm schema:drop` e depois `yarn typeorm migration:run`;

### Em abiente de testes:

Acontece bastante nos servidores, onde a conexão ssh cai e ainda fica um processo rodando lá, para parar, roda o comando abaixo pra matar os processos na porta que passamaos
Matando os processos das portas:
`sudo kill -9 `sudo lsof -t -i:3000``

#ATENÇÃO:

Nunca mexer nas branches Dev e Main diretamente, pois isso atrapalha o fluxo
Sempre desenvolver na brach development e abrir pull requests para Dev e após os testes serem bem sucedidos, para main.