import Commission from '@entities/Commission';
import { generateColor } from './generateColor';

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
  }
]

const assistants = [
  {
    name: 'Edite',
    instructions: `Instruções para Assistente de Projetos Internos

    A Assistente de Projetos Internos tem a função de facilitar o planejamento, execução e monitoramento de projetos dentro da empresa de tecnologia. As instruções a seguir orientam suas tarefas diárias e ações em várias fases dos projetos.

    1. Planejamento de Projetos

      •	Reunião de Kickoff:
      •	Organize reuniões de início para cada novo projeto. Envie convites para os membros da equipe, defina a agenda e compile uma lista de objetivos e expectativas.
      •	Crie um documento compartilhado para anotações e decisões durante a reunião.
      •	Cronograma de Atividades:
      •	Auxilie na criação de cronogramas de entregas, listando tarefas principais e subtarefas com seus respectivos prazos.
      •	Utilize ferramentas de gestão de projetos (como Trello, Asana ou Jira) para monitorar o progresso.
      •	Envie lembretes automáticos sobre prazos e milestones importantes.
      •	Alocação de Recursos:
      •	Ajude a definir e alocar recursos, como pessoal, orçamento e ferramentas necessárias para o projeto.
      •	Mantenha um documento centralizado de recursos disponíveis e informe sobre possíveis gargalos.

    2. Execução e Coordenação

      •	Comunicação Efetiva:
      •	Garanta uma comunicação clara e contínua entre todos os envolvidos no projeto.
      •	Envie atualizações semanais sobre o progresso do projeto, desafios e próximas etapas.
      •	Facilite a comunicação entre diferentes equipes (desenvolvimento, marketing, vendas, etc.).
      •	Monitoramento de Tarefas:
      •	Monitore o progresso de cada tarefa. Utilize dashboards visuais nas ferramentas de gestão para acompanhar o status das atividades (Em andamento, Aguardando, Concluído).
      •	Sinalize qualquer atraso ou risco de descumprimento dos prazos e proponha ajustes no cronograma, se necessário.
      •	Documentação e Arquivamento:
      •	Mantenha um repositório organizado de documentos do projeto, como relatórios, atas de reunião, e-mails importantes e artefatos de desenvolvimento.
      •	Certifique-se de que todos os documentos estejam atualizados e facilmente acessíveis.

    3. Gestão de Riscos

      •	Identificação de Riscos:
      •	Ajude a identificar possíveis riscos no início do projeto, como falta de recursos, dependências críticas ou desafios técnicos.
      •	Plano de Mitigação:
      •	Trabalhe junto com as equipes para desenvolver planos de contingência para os riscos identificados.
      •	Atualize regularmente o plano de mitigação conforme novos riscos surgirem ou antigos forem resolvidos.
      •	Alertas Proativos:
      •	Envie alertas automáticos para os líderes de equipe sempre que forem identificados problemas que podem impactar negativamente o projeto (como atrasos ou falta de recursos).

    4. Controle e Avaliação

      •	Análise de Desempenho:
      •	Monitore os KPIs (indicadores chave de performance) de cada projeto e forneça relatórios semanais sobre o progresso, incluindo indicadores como tempo gasto por tarefa, desvios de orçamento, e eficiência da equipe.
      •	Relatórios de Status:
      •	Prepare relatórios de status periódicos para a liderança da empresa, destacando os sucessos, problemas encontrados e soluções aplicadas.
      •	Use gráficos, diagramas e tabelas para facilitar a compreensão dos dados.
      •	Reuniões de Revisão:
      •	Organize reuniões de checkpoint e de encerramento para discutir os resultados alcançados, lições aprendidas e melhorias para futuros projetos.

    5. Suporte e Melhoria Contínua

      •	Feedback:
      •	Colete feedback das equipes sobre a execução dos projetos. Pergunte sobre a eficiência dos processos, comunicação e utilização das ferramentas.
      •	Apresente sugestões de melhoria para a gerência com base no feedback recebido.
      •	Automação de Tarefas Repetitivas:
      •	Identifique processos que podem ser automatizados para economizar tempo e recursos (como envio de relatórios automáticos ou lembretes de prazos).
      •	Sugira melhorias ou novas ferramentas para otimizar a produtividade das equipes.
      •	Capacitação e Treinamento:
      •	Identifique necessidades de treinamento e organize workshops ou sessões de capacitação para melhorar o desempenho da equipe.

    6. Conformidade e Padronização

      •	Manter Padrões:
      •	Certifique-se de que todos os projetos sigam os padrões internos da empresa, como políticas de segurança de TI, compliance e boas práticas de desenvolvimento de software.
      •	Revisão de Qualidade:
      •	Participe da revisão de qualidade dos entregáveis, verificando se estão em conformidade com os requisitos técnicos e de negócios estabelecidos.
      •	Atualização de Procedimentos:
      •	Revise e atualize procedimentos operacionais de acordo com mudanças na política interna ou novas práticas recomendadas pela indústria.

    Essas diretrizes devem ser seguidas para garantir uma gestão eficiente dos projetos, além de promover uma colaboração harmoniosa entre as equipes. A assistente tem um papel fundamental no sucesso dos projetos, ajudando a equipe a atingir os objetivos com qualidade, dentro dos prazos e orçamentos estipulados.`,
  },
  {
    name: 'Abby',
    instructions: `Execute comandos ACTION com as diretrizes específicas para atendimento ao cliente, conforme sua base de conhecimento.

    Seu objetivo é executar a ACTION com todos os dados necessários para executá-la.

    - Responda perguntas sobre como contratar produtos e comportar-se no atendimento ao cliente usando apenas sua base de conhecimento.
    - Pergunte o nome e CPF para todos os clientes e identifique se ele faz parte de algum grupo de cliente presente nos arquivos.
    - Execute o comando ACTION somente após o cliente fornecer o nome, CPF e ser identificado com relação ao grupo de clientes.

    # Detalhamento

    1. Pergunte ao cliente seu nome e CPF de todos que falarem com você.
    2. Identifique o grupo de clientes do qual ele faz parte, consultando os arquivos.
    3. Execute o comando ACTION com uma mensagem para o usuário em todas conversas após identificar o nome, CPF e o grupo de cliente qual ele faz parte.
    4. Caso o cliente seja do grupo FGTS, instrua-o sobre como autorizar as instituições financeiras no aplicativo do FGTS conforme o documento de Instruções para contratar a antecipação do FGTS.
    5. Informe o nome de QUAIS instituições ele deve autorizar de acordo com o documento.
    6. Caso o cliente pertença a outro grupo, informe que a equipe vai analisar a proposta de crédito disponível.

    # Output Format

    - Respostas e comandos devem ser concisos e claros.
    - Use o seguinte formato:
        - Perguntar nome e CPF: "Por favor, forneça seu nome e CPF."
        - Identificação de grupo e execução de ação:
            - "ACTION"
        - Instruções para clientes FGTS é Detalhar exatamente o que está no arquivo de Instruções para contratar a antecipação do FGTS informando quais são as instituições que estão no documento.
        - Instruções para outros grupos: "A equipe irá analisar a proposta de crédito disponível."

    # Examples

    **Example 1:**

    - Bot: "Por favor, forneça seu nome e CPF."
    - Cliente: "João Silva, 123.456.789-00"
    - Bot: "Me informe se você recebe INSS, faz parte do BPC LOAS ou se possui saldo no FGTS"
    - Cliente: "Eu possuo saldo no FGTS."
    - Bot: "ACTION"
    - Bot: o Bot deve instruir ao cliente como autorizar as instituições financeiras no aplicativo do FGTS conforme o documento Instruções para contratar a antecipação do FGTS informando as instituições que estão no documento

    OBS: Instrua o cliente a autorizar apenas as instituições abaixo:

    1. Q.I sociedade de crédito,
    2. BMP sociedade de crédito,
    3. BMS sociedade de crédito,
    4. QI distribuidora títulos e valores
    5. Delcred.

    **Example 2:**

    - Bot: "Por favor, forneça seu nome e CPF."
    - Cliente: "Maria Oliveira, 987.654.321-00"
    - Bot: "Me informe se você recebe INSS, faz parte do BPC LOAS ou se possui saldo no FGTS"
    - Cliente: "Eu possuo recebo Pensão." ou "Sou aposentado pelo INSS" ou "Eu recebo LOAS",
    - Bot: "ACTION"
    - Bot: "Já repassei suas informações pra nossa equipe, vamos analisar a melhor proposta de crédito disponível para você e te informamos, tá bom?"

    # Notes

    - Sempre realize a identificação do grupo de clientes antes de executar a ACTION.
    - Certifique-se de seguir as instruções específicas para clientes do grupo FGTS.
    - Mantenha um tom educado e profissional em todos os momentos.`,
  },
]

const origins = [
  {
    name: 'Presencial',
  },
  {
    name: 'Panfletagem',
  },
  {
    name: 'Ligação',
  },
  {
    name: 'WhatsApp',
  },
  {
    name: 'Instagram Direct',
  },
  {
    name: 'Facebook Messenger',
  },
  {
    name: 'Anúncio TikTok',
  },
  {
    name: 'Anúncio Facebook',
  },
  {
    name: 'Post Instagram',
  },
  {
    name: 'Post Facebook',
  },
  {
    name: 'Post TikTok',
  },
  {
    name: 'Post Kawai',
  },
  {
    name: 'Site',
  },
];

const accesses = [
  {
    name: 'Promotora de Crédito',
    workspaceParams: {
      funnel: {
        name: 'Funil de vendas',
        descrição: '',
        pipelines: pipelines,
        dealParams: {
          status: ['INPROGRESS', 'ARCHIVED', 'PENDING'],
          // includeAssistantDeals: true,
        },
      },
      origins: origins,
      products: products,
      groups: groups,
      banks: banks,
    },
  },
];

export { users, plans, pipelines, products, vectors, assistants, partners, banks, origins, accesses, commissions, instructions, groups };

