// Encontrar as expressoes

let transpiledCode = []

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
    // console.info(str)
    if (str.match('local')) {
      if (str.match('function')) {
        // Extract the function name from the Lua code
        const functionName = str.match(/function\s+(\w+)/);

        // Extract the function parameters from the Lua code
        const parameters = str.match(/function\s+\w+\s*\((.*?)\)/);

        // Remove 'local' keyword from the parameter declaration
        const transpiledParameters = parameters[1].replace(/local\s+([\w, ]+)/, '$1');

        // Extract the function body from the Lua code
        const body = str.match(/function[\s\S]*?end/);
        const bodyString = body ? body[0] : '';

        // Build the transpiled function declaration string for Python
        const transpiledFunction = `def ${functionName[1]}(${transpiledParameters}):    ${bodyString}`;

        transpiledCode.push(transpiledFunction);
      }
    }
    if (str.match(/^local\s+\w+\s*=/)) {
      // Transpile the Lua variable declaration to Python
      const transpiledVariable = str.replace(/local\s+(\w+)\s*=/, 'let $1 =');
  
      // Push the transpiled variable declaration into the transpiledCode array
      transpiledCode.push(transpiledVariable);
    }
    if (str.match('print')) {
      // Transpile the Lua print statement to Python
      const transpiledPrint = str.replace(/print\s*\((.*?)\)/g, 'print($1)');
  
      // Push the transpiled print statement into the transpiledCode array
      transpiledCode.push(transpiledPrint);
    }
    // Check if the line contains only blank spaces or space characters
    if (!str.trim()) {
      // Push an empty line into the transpiledCode array
      transpiledCode.push('');
    }
    console.log(transpiledCode);

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