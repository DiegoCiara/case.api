import { generateColor } from './functions/generateColor';

const users = [
  {
    name: 'Suporte Técnico',
    email: 'admin@softspace.com.br',
    picture: 'https://seeklogo.com/images/S/spider-man-comic-new-logo-322E9DE914-seeklogo.com.png',
    role: 'SOFTSPACE',
    password: 'die140401',
  },
];

const pipelines = [
  {
    name: 'Análise Interna',
    description: 'Aqui a equipe precisa identificar se o cliente pode contratar algum tipo de empréstimo, seja lá ele qual for.',
    color: generateColor(),
  },
  {
    name: 'Simulação enviada',
    description:
      'Nessa etapa, a proposta de crédito foi enviada para o cliente e ele precisa confirmar que quer efetuar o empréstimo para poder prosseguir com a proposta para o banco.',
    color: generateColor(),
  },
  {
    name: 'Documentação',
    description: `É preciso que o cliente envie a documentação necessária para poder enviar a proposta para o banco, são essas as documentações:
    1. RG e CPF;
    2. Comprovante de residência;
    3. Se não tiver conta cadastrada no benefício, precisa informar uma conta para depositar o crédito.
    `,
    color: generateColor(),
  },
  {
    name: 'Aguardando envio para o Banco',
    description: `Nessa etapa a equipe está enviando a proposta de crédito para o banco, após isso basta aguardar o resultado da proposta na esteira de averbação.

    Daqui, um membro da equipe irá dar o retorno para o cliente do que está acontecendo na proposta dele.`,
    color: generateColor(),
  },
  {
    name: 'Aguardando Averbação',
    description:
      'Nesta etapa, o contrato está na análise do banco aguardando ser averbado, que é quando o banco aprova o contrato de crédito e efetua o pagamento na conta do cliente.',
    color: generateColor(),
  },
];

const products = [
  {
    name: 'Margem',
    description: 'Este produto é um novo contrato de empréstimo.',
    color: generateColor(),
  },
  {
    name: 'Refinanciamento',
    description: 'Este produto é um refinanciamento de um contrato de empréstimo já existente.',
    color: generateColor(),
  },
  {
    name: 'Portabilidade',
    description: 'Este produto é uma portabilidade de um contrato de empréstimo já existente para outro banco.',
    color: generateColor(),
  },
  {
    name: 'Portabilidade com Refinanciamento',
    description: 'Este produto é uma portabilidade de um contrato de empréstimo já existente para outro banco com refinanciamento.',
    color: generateColor(),
  },
  {
    name: 'Saque FGTS',
    description: 'Este produto é a antecipação de até 10 saques aniversários do FGTS.',
    color: generateColor(),
  },
];

const groups = [
  {
    name: 'INSS',
    description: 'Este grupo de clientes são aposentados e pensionistas do INSS.',
    color: generateColor(),
  },
  {
    name: 'BPC LOAS',
    description: 'Este grupo de clientes são aposentados pelo benefício BPC LOAS',
    color: generateColor(),
  },
  {
    name: 'FGTS',
    description: 'Este grupo são trabalhadores de carteira assinada, no regime da CLT que possuem Saldo no FGTS.',
    color: generateColor(),
  },
];

const partners = [
  {
    name: 'União',
    color: generateColor(),
  },
  {
    name: 'Softspace BR',
    color: generateColor(),
  },
  // {
  //   name: 'EPTA',
  //   color: generateColor()
  // },
];

const banks = [
  {
    name: 'Itaú',
    color: generateColor(),
  },
  {
    name: 'Banco C6',
    color: generateColor(),
  },
  {
    name: 'Banco PAN',
    color: generateColor(),
  },
];

const commissions = [
  {
    name: 'INSS NOVO',
    value: 40,
    type: 'percent',
    valueRecurrence: 40,
    typeRecurrence: 'percent',
  },
  {
    name: 'REFIN 6 PARCELAS',
    value: 80,
    type: 'percent',
    valueRecurrence: 80,
    typeRecurrence: 'percent',
  },
  {
    name: 'ANTECIPAÇÃO 10 PARCELAS',
    value: 100,
    type: 'percent',
    valueRecurrence: 100,
    typeRecurrence: 'percent',
  },
];

const plans = [
  {
    name: 'CRM',
    description:
      'Utilize o um CRM de alta eficiência, construído a partir de um médoto utilizado por empresas de alta rentabilidade que promete otimizar todo o seu processo de vendas, além de te entregar dados cruciais para a tomada de decisão no seu negócio. ',
    value: 399.9,
  },
  {
    name: 'CRM, Atendimento & AI SDR',
    description:
      'Com um CRM que te entrega todas todo os dados relevantes para tomada de decisão, você também pode contar com uma Inteligência Artificial SDR atendendo e cadastrando todos os seus leads em tempo real 24 horas por dia, todos os dias, atém de um sistema de atendimento integrado a plataforma.',
    value: 687.0,
  },
];

const instructions = [
  {
    name: 'Actions',
    description: `O comando ACTION deve ser utilizado para cadastrar ou consultar informações no sistema. basta responder a palavra ACTION junto com a mensagem automaticamente ao identificar os cenários descritos abaixo:

    1.	Quando o nome do cliente, CPF/CNPJ e seu grupo são identificados para registro no CRM.
    2.	Quando for detectada uma nova oportunidade de negócio.
    4.	Quando precisar consultar as informações de uma negociação.

  Importante:
    •	Responda o cliente normalmente e envie o comando ACTION junto com a mensagem logo após identificar o cenário.
    •	Não envie mais de um comando ACTION por mensagem.
    •	Nunca descreva a função do comando ACTION, apenas envie-o sem acentos ou pontuações próximas.`,
  },
];

const vectors = [
  {
    name: 'Base de conhecimento',
  },
];

const assistants = [
  {
    name: 'Abby',
    instructions: ``
  },
];


export { users, plans, pipelines, products, vectors, assistants };

