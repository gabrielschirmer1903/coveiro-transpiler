// Encontrar as expressoes

function contarPalavras() {
    // Obter o valor do campo de texto e da palavra a ser contada
    const codigo = document.getElementById('codigo').value;
    let palavrasCodigo = codigo.split('\n');
    console.log(palavrasCodigo);
    var contEscreva = 0;
    var contLeia = 0;
    var contEscreval = 0;
    var contSe = 0;
    var contFimse = 0;
    var contEntao = 0;
  
    for (let i = 0; i < palavrasCodigo.length; i++) {
      const text = palavrasCodigo[i];
      const str = text.toLowerCase();
      if (str.match('escreva')) {
        contEscreva++;
      }
  
      if (str.match('escreval')) {
        contEscreval++;
      }
  
      if (str.match('leia')) {
        contLeia++;
      }
  
      if (str.match('se')) {
        contSe++;
      }
  
      if (str.match('fimse')) {
        contFimse++;
      }
  
      if (str.match('entao')) {
        contEntao++;
      }
      printPalavras(
        contEscreva,
        contEscreval,
        contLeia,
        contSe,
        contFimse,
        contEntao,
      );
    }
  }
  
  function printPalavras(
    contEscreva,
    contEscreval,
    contLeia,
    contSe,
    contFimse,
    contEntao,
  ) {
    document.getElementById(
      'contador',
    ).innerHTML = `<p> Escreva: ${contEscreva} <br>
           Escreval: ${contEscreval} <br>
           Leia: ${contLeia} <br>
           Se: ${contSe} <br>
           Fimse: ${contFimse} <br>
           Entao: ${contEntao} <br>
    </p>`;
  }
  
  function limpacontador() {
    document.getElementById('contador').innerHTML = '';
  }