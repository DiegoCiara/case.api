function embaralharLetras(frase, senha) {
  const letras = frase.split('');
  const senhaArray = senha.split('');
  const letrasEmbaralhadas = [];

  letras.forEach((letra, index) => {
      const senhaIndex = index % senhaArray.length;
      const senhaCharCode = senhaArray[senhaIndex].charCodeAt(0);
      const novaPosicao = (letra.charCodeAt(0) + senhaCharCode) % 256;
      letrasEmbaralhadas.push(String.fromCharCode(novaPosicao));
  });

  return letrasEmbaralhadas.join('');
}

function desembaralharLetras(letrasEmbaralhadas, senha) {
  const letras = letrasEmbaralhadas.split('');
  const senhaArray = senha.split('');
  const letrasOriginais = [];

  letras.forEach((letra, index) => {
      const senhaIndex = index % senhaArray.length;
      const senhaCharCode = senhaArray[senhaIndex].charCodeAt(0);
      const posicaoOriginal = (letra.charCodeAt(0) - senhaCharCode + 256) % 256;
      letrasOriginais.push(String.fromCharCode(posicaoOriginal));
  });

  return letrasOriginais.join('');
}

// Exemplo de uso:
const fraseOriginal = "Criando Contatos";
const senha = "senha123";
const fraseEmbaralhada = embaralharLetras(fraseOriginal, senha);
// log("Frase embaralhada:", fraseEmbaralhada);

const fraseDesembaralhada = desembaralharLetras(fraseEmbaralhada, senha);
