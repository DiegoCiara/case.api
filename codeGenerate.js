function encurtarPalavra(palavra) {
  // Truncamento
  const truncamento = palavra.substring(0, 3);

  // Abreviação com números
  let abreviacaoNumeros = '';
  for (let i = 0; i < palavra.length; i += 3) {
      abreviacaoNumeros += palavra.charAt(i);
      if (i + 1 < palavra.length) {
          abreviacaoNumeros += (i + 1);
      }
      if (i + 2 < palavra.length) {
          abreviacaoNumeros += (i + 2);
      }
  }

  // Acrônimo
  const acronimo = palavra.split(' ').map(word => word.charAt(0)).join('');

  // Juntando sílabas
  const juntandoSilabas = palavra.split(' ').map(word => word.substring(0, 2)).join('');

  // Espelhamento
  const espelhamento = palavra.split('').reverse().join('');

  // Combinação do acrônimo das formas fonéticas do espelhamento
  const acronimoEspelhamentoFonetico = espelhamento.replace(/[aeiou]/gi, '').split('').map(char => char.toUpperCase()).join('');

  // Acrônimo do espelhamento fonético, espelhado mais uma vez
  let acronimoEspelhamentoFoneticoEspelhado = acronimoEspelhamentoFonetico.split('').reverse().join('');
  let numerosEspelhamentoFoneticoEspelhado = '';
  for (let i = 0; i < acronimoEspelhamentoFoneticoEspelhado.length; i += 3) {
      numerosEspelhamentoFoneticoEspelhado += acronimoEspelhamentoFoneticoEspelhado.charAt(i);
      if (i + 1 < acronimoEspelhamentoFoneticoEspelhado.length) {
          numerosEspelhamentoFoneticoEspelhado += (i + 1);
      }
      if (i + 2 < acronimoEspelhamentoFoneticoEspelhado.length) {
          numerosEspelhamentoFoneticoEspelhado += (i + 2);
      }
  }

  // Randomizando a posição das letras em abreviacaoNumeros
  const letras = abreviacaoNumeros.split('');
  for (let i = letras.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letras[i], letras[j]] = [letras[j], letras[i]];
  }
  abreviacaoNumeros = letras.join('');

  return abreviacaoNumeros;
}

// Exemplo de uso:
const palavra = "Atualizar contato";
const resultado = encurtarPalavra(palavra.toLocaleUpperCase());
