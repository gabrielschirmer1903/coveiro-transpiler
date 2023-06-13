// Encontrar as expressoes

let transpiledCode = [];

function contarPalavras() {
  // Obter o valor do campo de texto e da palavra a ser contada
  const codigo = document.getElementById('CodeInput').value;
  let palavrasCodigo = codigo.split('\n');
  console.log(palavrasCodigo);

  for (let i = 0; i < palavrasCodigo.length; i++) {
    const text = palavrasCodigo[i];
    const str = text.toLowerCase();
    if (str.match(/^\w+\s*=\s*(.+)/)) {
      console.log("teste")
      const assignmentMatch = str.match(/^(\w+)\s*=\s*(.+)/);
      if (assignmentMatch) {
        const assignedVariable = assignmentMatch[1];
        const assignedValue = assignmentMatch[2];
  
        if (!variableDeclarationAdded && assignedVariable === variableName) {
          // Add the variable declaration with the initial value
          const declarationStatement = variableInitialValue ? `${assignedVariable} = ${variableInitialValue}` : assignedVariable;
          variableDeclaration = variableDeclarationAdded ? assignedVariable : `local ${declarationStatement}`;
          variableDeclarationAdded = true;
        }
  
        const transpiledVariableAssignment = `${assignedVariable} = ${assignedValue}`;
        transpiledCode.push(transpiledVariableAssignment);
      }
    }
  
    // console.info(str)
    if (str.match('function')) {
      // Extract the function name from the Lua code
      const functionName = str.match(/function\s+(\w+)/);

      // Extract the function parameters from the Lua code
      const parameters = str.match(/function\s+\w+\s*\((.*?)\)/);

      // Remove 'local' keyword from the parameter declaration
      const transpiledParameters = parameters ? parameters[1].replace(/local\s+([\w, ]+)/, '$1') : '';

      // Extract the function body from the Lua code
      const body = str.match(/function[\s\S]*?end/);
      const bodyString = body ? body[0] : '';

      // Build the transpiled function declaration string for Python
      const transpiledFunction = `def ${functionName[1]}(${transpiledParameters}):\n${bodyString}`;

      // Push the transpiled function into the transpiledCode array
      transpiledCode.push(transpiledFunction);
    }


    if (str.match('print')) {
      // Transpile the Lua print statement to Python
      const transpiledPrint = str.replace(/print\s*\((.*?)\)/g, 'print($1)');

      // Push the transpiled print statement into the transpiledCode array
      transpiledCode.push(transpiledPrint);
    }

    if (str.match(/^\w+\s*\((.*?)\)$/)) {
      // Transpile the Lua function invocation to Python
      const transpiledInvocation = str.replace(/(\w+)\s*\((.*?)\)/, '$1($2)');

      // Push the transpiled function invocation into the transpiledCode array
      transpiledCode.push(transpiledInvocation);
    }

    if (!str.trim()) {
      // Push an empty line into the transpiledCode array
      transpiledCode.push('');
    }

    // Assuming the Lua if statement is stored in the 'str' variable
    if (str.includes('if')) {
      // Extract the condition from the Lua code
      const condition = str.match(/if\s+(.+)/)[1];
    
      // Replace "then" with ":" in the condition
      const modifiedCondition = condition.replace(/\bthen\b/, ':');
    
      // Build the transpiled if statement for Python
      const transpiledIf = `if ${modifiedCondition}`;
    
      // Push the transpiled if statement into the transpiledCode array
      transpiledCode.push(transpiledIf);
    }

    if (str.includes('else')) {
      // Transpile the "else" statement to "else:"
      const transpiledElse = str.replace(/else\s*/, 'else:');
    
      // Push the transpiled "else" statement into the transpiledCode array
      transpiledCode.push(transpiledElse);
    }

    if (str.includes('while')) {
      // Extract the condition from the Lua code
      const condition = str.match(/while\s+(.+)/)[1];
    
      // Replace "do" with ":" in the condition
      const modifiedCondition = condition.replace(/\bdo\b/, ':');
    
      // Build the transpiled while statement for Python
      const transpiledWhile = `while ${modifiedCondition}`;
    
      // Push the transpiled while statement into the transpiledCode array
      transpiledCode.push(transpiledWhile);
    }
    
  }
  updateOutput(transpiledCode);
}

function updateOutput(transpiledCode) {
  const outputElement = document.getElementById('contador');
  outputElement.innerHTML = '';

  for (let i = 0; i < transpiledCode.length; i++) {
    let line = transpiledCode[i];
    
    // Replace space characters with HTML entity representation
    line = line.replace(/ /g, '&nbsp;');
    
    // Append the line to the output element
    outputElement.innerHTML += `<p>${line}</p>`;
  }
}

// Function to add a line of transpiled code to the transpiledCode array
function addTranspiledLine(line) {
  // Push the line of code to the transpiledCode array
  transpiledCode.push(line);

  // Update the output
  updateOutput();
}

// Function to clear the transpiledCode array and update the output
function limpacontador() {
  // Clear the transpiledCode array
  transpiledCode = [];

  // Update the output
  updateOutput();
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
