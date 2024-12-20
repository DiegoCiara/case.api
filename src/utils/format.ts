import User from '@entities/User';
import currency from 'currency.js';

export const firstName = (name: string) => name.split(' ')[0];

export const formatAssistant = (workspace: any) => {
  const knowbaseList = workspace.knowbase.map((item: any) => `${item.name}: ${item.description}`).join(', ');

  return `
Seu nome é ${workspace?.name}.
${workspace?.description}.
${knowbaseList}

ATENÇÃO:
1º Responda apenas sobre o que informei a você agora e nunca, jamais informe nada que não for relacionado sobre.
2º Responda SEMPRE no contexto da conversa do usuário que está falando com você.
3º Sempre responda com no máximo 200 palavras.
4º Reduza a utilização de emojis nas suas respostas.
`;
};

export function convertOpenAIDate(createdAtTimestamp: any) {
  createdAtTimestamp = createdAtTimestamp * 1000;

  // Crie um objeto de data usando o timestamp ajustado
  const createdAtDate = new Date(createdAtTimestamp);

  // Formate a data para "DD/MM/YYYY : HH:mm"
  const formattedDate = `${createdAtDate.toLocaleDateString('pt-BR')} ${createdAtDate.toLocaleTimeString('pt-BR', { hour12: false })}`;
  // const formattedDate = new Date(createdAtTimestamp).toLocaleString('pt-BR', {
  //   timeZone: 'UTC',
  //   day: '2-digit',
  //   month: '2-digit',
  //   year: 'numeric',
  //   hour: '2-digit',
  //   minute: '2-digit',
  //   hour12: false, // Use 24-hour format
  // });

  return formattedDate;
}

export function formatPhoneElse(phone: string) {
  if (phone) {
    phone = phone?.toString();
    phone = phone?.replace(/^55/, ''); // Remove o 55 do início, se existir
    phone = phone?.replace(/[^*\d]/g, ''); // Remove tudo o que não é dígito exceto o asterisco
    phone = phone?.replace(/^(\d{2})(\d)/g, '($1) $2'); // Coloca parênteses em volta dos dois primeiros dígitos
    phone = phone?.replace(/(\d)(\d{4})$/, '$1-$2'); // Coloca hífen entre o quarto e o quinto dígitos
  }
  return phone;
}

export function formatPhone(phone: string) {
  if (phone) {
    phone = phone?.toString();
    phone = phone?.replace(/^55/, ''); // Remove o 55 do início, se existir
    phone = phone?.replace(/[^*\d]/g, ''); // Remove tudo o que não é dígito exceto o asterisco

    // Verifica se o número tem 9 após o DDD. Se não tiver, adiciona.
    phone = phone.replace(/^(\d{2})(\d{7,8})$/, (match, ddd, rest) => {
      if (rest.length === 8) {
        return `${ddd}9${rest}`;
      }
      return match;
    });

    // phone = phone?.replace(/^(\d{2})(\d)/g, '($1) $2'); // Coloca parênteses em volta dos dois primeiros dígitos
    // phone = phone?.replace(/(\d)(\d{4})$/, '$1-$2'); // Coloca hífen entre o quarto e o quinto dígitos
  }
  // console.log(phone)
  return phone;
}


export function formatMessageWhatsApp(userName: string, message: string) {
  const messageFormated = `*${userName}:*\n${message}`;
  return messageFormated;
}

export function formatToWhatsAppNumber(phone: string) {
  if (phone) {
    // Remove todos os caracteres que não são números
    phone = phone.toString().replace(/\D/g, '');

    // Remove todos os espaços entre os números (não há espaços neste ponto, mas só para garantir)
    phone = phone.replace(/\s+/g, '');

    // Adiciona o prefixo 55 antes de todos os números
    phone = `55${phone}`;

    // Adiciona @c.us no final do número
    phone = `${phone}@c.us`;
  }
  return phone;
}

export const formatDateTime = (date: Date) => {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();
  let hours = '' + d.getHours();
  let minutes = '' + d.getMinutes();
  let seconds = '' + d.getSeconds();
  let milliseconds = '' + d.getMilliseconds();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
  if (hours.length < 2) hours = '0' + hours;
  if (minutes.length < 2) minutes = '0' + minutes;
  if (seconds.length < 2) seconds = '0' + seconds;
  while (milliseconds.length < 3) milliseconds = '0' + milliseconds;

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}:${milliseconds}`;
};

export function statusFormat(status: string) {
  if (status === 'INPROGRESS') {
    return 'Em andamento';
  } else if (status === 'WON') {
    return 'Convertida';
  } else if (status === 'LOST') {
    return 'Perdida';
  } else if (status === 'ARCHIVED') {
    return 'Arquivada';
  } else if (status === 'PENDING') {
    return 'Pendente';
  } else {
    return status;
  }
}

export function formatNumber(number: number): number {
  // number = number.

  if (number === undefined || number === null) {
    return 0;
  }

  // Convert the number to a string with localized format
  const formattedNumber = number.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  const num = Number(formattedNumber);

  return num;
}

export function sumValueSales(array: any) {
  return array?.reduce((accumulator: any, currentObject: any) => {
    return accumulator + Number(currentObject?.value);
  }, 0);
}

export function sumSaleValues(array: any) {
  return array?.reduce((accumulator: any, currentObject: any) => {
    return accumulator + Number(currentObject?.value);
  }, 0);
}

export function calculateCommission(array: any) {
  return array?.reduce((accumulator: any, currentObject: any) => {
    if (currentObject.commission.type === 'percent') {
      return accumulator + Number((currentObject?.value / 100) * currentObject.commission.value);
    } else {
      return accumulator + Number(currentObject.commission.value);
    }
  }, 0);
}


export function calculateCommissionNew(array: any) {
  return array?.reduce((accumulator: any, currentObject: any) => {
    if (currentObject.commission_type === 'percent') {
      return accumulator + Number((currentObject.value / 100) * currentObject.commission_value);
    } else {
      return accumulator + Number(currentObject.commission_value);
    }
  }, 0);
}
export function sumQuantity(array: any) {
  return array?.reduce((accumulator: any, currentObject: any) => {
    return accumulator + Number(currentObject);
  }, 0);
}

export function formatDate(dateString: any) {
  // Cria um objeto Date a partir da string fornecida
  if (!dateString) {
    return 'Não informado';
  }
  const date = new Date(dateString);

  // Obtém os componentes da data e hora
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Meses são baseados em 0
  const year = date.getUTCFullYear();
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');

  // Formata a string no formato desejado
  return `${day}/${month}/${year} às ${hours}:${minutes}`;
}


export const formatCurrency = (value: number) => {
  return currency(value, { symbol: 'R$', decimal: ',', separator: '.' }).format()
};