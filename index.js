// Encontrar as expressoes

let transpiledCode = [];

function contarPalavras() {
  // Obter o valor do campo de texto e da palavra a ser contada
  const codigo = document.getElementById('CodeInput').value;
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
        const transpiledParameters = parameters[1].replace(
          /local\s+([\w, ]+)/,
          '$1',
        );

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

function transpileLuaToRuby(luaCode) {
  let rubyCode = '';

  // Função auxiliar para gerar espaçamento
  function indent(level) {
    let indentation = '';
    for (let i = 0; i < level; i++) {
      indentation += '  ';
    }
    return indentation;
  }

  // Tabela de tradução de palavras-chave
  const keywordTranslations = {
    function: 'def',
    if: 'if',
    then: '',
    else: 'else',
    end: 'end',
    return: 'return',
    for: 'for',
    do: 'do',
    'io.write': 'print',
  };

  // Transpila uma expressão Lua para Ruby
  function transpileExpression(expression) {
    let transpiled = '';

    // Remove os parênteses ao redor dos argumentos de uma função
    expression = expression.replace(/\((.*)\)/, '$1');

    // Verifica se é uma chamada de função
    if (expression.startsWith('fibonacci')) {
      const functionName = expression.split('(')[0];
      const args = expression.substring(
        functionName.length + 1,
        expression.length - 1,
      );
      const transpiledArgs = args
        .split(',')
        .map((arg) => arg.trim())
        .join(', ');
      transpiled += `${functionName}(${transpiledArgs})`;
    } else {
      transpiled += expression;
    }

    return transpiled;
  }

  // Percorre as linhas do código Lua
  const lines = luaCode.split('\n');
  let indentLevel = 0;
  for (let line of lines) {
    line = line.trim();

    // Verifica se a linha está vazia
    if (line === '') {
      continue;
    }

    // Verifica se a linha é um comentário
    if (line.startsWith('--')) {
      rubyCode += `${indent(indentLevel)}# ${line.substring(2)}\n`;
      continue;
    }

    // Verifica se a linha contém uma construção de bloco de controle
    const keywords = Object.keys(keywordTranslations);
    const keywordRegex = new RegExp(`^(${keywords.join('|')})`);
    const match = line.match(keywordRegex);
    if (match) {
      const keyword = match[0];
      const expression = line.substring(keyword.length).trim();
      const translatedKeyword = keywordTranslations[keyword];
      if (translatedKeyword) {
        rubyCode += `${indent(indentLevel)}${translatedKeyword}`;
        if (expression) {
          const transpiledExpression = transpileExpression(expression);
          rubyCode += ` ${transpiledExpression}`;
        }
        if (keyword === 'then' || keyword === 'do') {
          indentLevel++;
        }
        rubyCode += '\n';
        if (keyword === 'else' || keyword === 'end') {
          indentLevel--;
        }
      }
      continue;
    }

    // Verifica se a linha contém uma expressão
    const transpiledExpression = transpileExpression(line);
    if (transpiledExpression) {
      rubyCode += `${indent(indentLevel)}${transpiledExpression}\n`;
    }
  }

  return rubyCode;
}

// Função para receber o código Lua do usuário
function transpileLuaCode() {
  const luaCode = document.getElementById('CodeInput').value;

  // Transpila o código Lua para Ruby
  const rubyCode = transpileLuaToRuby(luaCode);

  // Exibe o código Ruby resultante
  document.getElementById('rubyCodeOutput').textContent = rubyCode;
}
