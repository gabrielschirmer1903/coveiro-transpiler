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
    const leadingSpaces = getLeadingSpaces(text);

    if (str.match(/^\w+\s*=\s*(.+)/)) {
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
        transpiledCode.push(leadingSpaces + transpiledVariableAssignment);
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

      transpiledCode.push(leadingSpaces + transpiledFunction);
    }

    if (str.startsWith('local') && !str.includes('function')) {
      // Variable declaration with "local" keyword
      const declaration = str.replace(/^local\s+/, '');

      transpiledCode.push(leadingSpaces + declaration);

    } else if (str.includes('=') && !str.includes('function') && !str.includes('if') && !str.includes('else') && !str.includes('elseif') && !str.includes('while')) {
      // Variable assignment or mathematical operation
      const assignment = str.replace('=', '=');

      transpiledCode.push(leadingSpaces + assignment);
    }


    if (str.match('print')) {
      // Transpile the Lua print statement to Python
      let transpiledPrint
      let condi = str.match(/print\s*\(\s*(.*?)\s*\)/);

      if (str.includes('..')) {
        let splitStr = condi[1].split('..');

        transpiledPrint = "str(" + splitStr[0] + ")" + '+';
        for(let i = 1; i < splitStr.length; i++){
          transpiledPrint = transpiledPrint + " str(" + splitStr[i] + ")" + ' +';
        }

        transpiledPrint = transpiledPrint.substring(0, transpiledPrint.length - 1);
        transpiledPrint = "print(" + transpiledPrint.replace(/"'/g, '') + ")";
      } else {
        transpiledPrint = str.replace(/"'/g, 'print($1)');
      }

      transpiledCode.push(leadingSpaces + transpiledPrint);
    }

    if (str.match(/^\w+\s*\((.*?)\)$/)) {
      // Transpile the Lua function invocation to Python
      const transpiledInvocation = str.replace(/(\w+)\s*\((.*?)\)/, '$1($2)');
      // Push the transpiled function invocation into the transpiledCode array
      
      transpiledCode.push(leadingSpaces + transpiledInvocation);
    }

    // Assuming the Lua if statement is stored in the 'str' variable
    if (str.includes('if') && !str.includes('elseif')) {
      // Extract the condition from the Lua code
      const condition = str.match(/if\s+(.+)/)[1];

      // Replace "then" with ":" in the condition
      const modifiedCondition = condition.replace(/\bthen\b/, ':');

      // Build the transpiled if statement for Python
      const transpiledIf = `if ${modifiedCondition}`;

      // Push the transpiled if statement into the transpiledCode array
      transpiledCode.push(leadingSpaces + transpiledIf);
    }

    if (str.includes('else') && !str.includes('elseif')) {
      // Transpile the "else" statement to "else:"
      const transpiledElse = str.replace(/(^\s*)else\s*(.+)/, (_, leadingSpaces, rest) => `${leadingSpaces}else:${rest}`);

      // Push the transpiled "else" statement into the transpiledCode array
      transpiledCode.push(transpiledElse + `:`);
    }

    if (str.includes('elseif')) {
      // Transpile "elseif" to "elif" in Python
      const transpiledElseIf = str.replace(/(^\s*)elseif\s+(.+)/, (_, leadingSpaces, condition) => `${leadingSpaces}elif ${condition}`);
      const transpiledLine = transpiledElseIf.replace(/\bthen\b/, ':');

      transpiledCode.push(transpiledLine);
    }

    if (str.includes('while')) {
      // Extract the condition from the Lua code
      const condition = str.match(/while\s+(.+)/)[1];

      // Replace "do" with ":" in the condition
      const modifiedCondition = condition.replace(/\bdo\b/, ':');

      // Build the transpiled while statement for Python
      const transpiledWhile = `while ${modifiedCondition}`;

      // Push the transpiled while statement into the transpiledCode array
      transpiledCode.push(leadingSpaces + transpiledWhile);
    }

    if (str.includes('return')) {
      // Extract the value from the Lua code
      const value = str.match(/return\s+(.+)/)[1];

      // Build the transpiled return statement for Python
      const transpiledReturn = `return ${value}`;

      // Push the transpiled return statement into the transpiledCode array
      transpiledCode.push(leadingSpaces + transpiledReturn);
    }

    if (!str.trim()) {
      // Push an empty line into the transpiledCode array
      transpiledCode.push(leadingSpaces + '');
    }
  }

  updateOutput(transpiledCode);
}

function updateOutput(transpiledCode) {
  const textarea = document.getElementById('contador');
  console.log(transpiledCode)

  textarea.value = transpiledCode.join('\n');
}

// Function to add a line of transpiled code to the transpiledCode array
function addTranspiledLine(line) {
  // Push the line of code to the transpiledCode array
  const leadingSpaces = getLeadingSpaces(line);

  transpiledCode.push(leadingSpaces + line);
  // Update the output
  updateOutput();
}

// Function to clear the transpiledCode array and update the output
function limpacontador() {
  // Clear the transpiledCode array
  const textarea = document.getElementById('contador');

  transpiledCode = [];
  textarea.value = '';
}

function getLeadingSpaces(str) {
  const leadingSpacesMatch = str.match(/^\s*/);

  return leadingSpacesMatch[0];
}

function transpileToRuby() {
  const codigo = document.getElementById('CodeInput').value;
  let palavrasCodigo = codigo.split('\n');
  let transpiledCode = [];

  for (let i = 0; i < palavrasCodigo.length; i++) {
    const text = palavrasCodigo[i];
    const str = text.trim();
    const leadingSpaces = getLeadingSpaces(text);

    if (str.match(/^\w+\s*=\s*(.+)/)) {
      const assignmentMatch = str.match(/^(\w+)\s*=\s*(.+)/);
      if (assignmentMatch) {
        const assignedVariable = assignmentMatch[1];
        const assignedValue = assignmentMatch[2];

        const transpiledVariableAssignment = `${assignedVariable} = ${assignedValue}`;
        transpiledCode.push(leadingSpaces + transpiledVariableAssignment);
      }
    }

    if (str.match('def')) {
      // Extract the function name from the Lua code
      const functionName = str.match(/def\s+(\w+)/);

      // Extract the function parameters from the Lua code
      const parameters = str.match(/def\s+\w+\s*\((.*?)\)/);

      // Remove 'local' keyword from the parameter declaration
      const transpiledParameters = parameters ? parameters[1].replace(/local\s+([\w, ]+)/, '$1') : '';

      // Extract the function body from the Lua code
      const body = str.match(/def[\s\S]*?end/);
      const bodyString = body ? body[0] : '';

      // Build the transpiled function declaration string for Ruby
      const transpiledFunction = `def ${functionName[1]}(${transpiledParameters})\n${bodyString}\nend`;

      // Push the transpiled function into the transpiledCode array
      transpiledCode.push(leadingSpaces + transpiledFunction);
    }

    // correct aparentaly
    if (str.startsWith('local') && !str.includes('function')) {
      // Variable declaration with "local" keyword
      const declaration = str.replace(/^local\s+/, '');

      transpiledCode.push(leadingSpaces + declaration);

    } else if (str.includes('=') && !str.includes('function') && !str.includes('if') && !str.includes('else') && !str.includes('elsif') && !str.includes('while')) {
      // Variable assignment or mathematical operation
      const assignment = str.replace('=', '=');

      transpiledCode.push(leadingSpaces + assignment);
    }

    if (str.match('print')) {
      // Transpile the Lua print statement to Ruby
      let transpiledPrint;
      let condi = str.match(/print\s*\(\s*(.*?)\s*\)/);
    
      if (str.includes('..')) {
        let splitStr = condi[1].split('..');
        transpiledPrint = "puts " + splitStr.map(str => `#{${str}}`).join(' + ');
      } else {
        transpiledPrint = str.replace(/print\s*\(\s*(.*?)\s*\)/, 'puts $1');
      }

      transpiledCode.push(leadingSpaces + transpiledPrint);
    }
    
    if (str.match(/^\w+\s*\((.*?)\)$/) && !str.match(/^\s*print\s/)) {
      // Transpile the Lua function invocation to Ruby
      const transpiledInvocation = str.replace(/(\w+)\s*\((.*?)\)/, '$1($2)');
      
      transpiledCode.push(leadingSpaces + transpiledInvocation);
    }    

    if (str.includes('if') && !str.includes('elsif')) {
      // Extract the condition from the Lua code
      const condition = str.match(/if\s+(.+)/)[1];

      // Replace "then" with "then" in the condition
      const modifiedCondition = condition.replace(/\bthen\b/, 'then');

      // Build the transpiled if statement for Ruby
      const transpiledIf = `if ${modifiedCondition}`;

      // Push the transpiled if statement into the transpiledCode array
      transpiledCode.push(leadingSpaces + transpiledIf);
    }

    if (str.includes('else') && !str.includes('elsif')) {
      // Transpile the "else" statement to "else"
      const transpiledElse = str.replace(/(^\s*)else\s*(.+)/, (_, leadingSpaces, rest) => `${leadingSpaces}else${rest}`);

      // Push the transpiled "else" statement into the transpiledCode array
      transpiledCode.push(transpiledElse);
    }

    if (str.includes('elsif')) {
      // Transpile "elsif" to "elsif" in Ruby
      const transpiledElsIf = str.replace(/(^\s*)elsif\s+(.+)/, (_, leadingSpaces, condition) => `${leadingSpaces}elsif ${condition}`);

      transpiledCode.push(transpiledElsIf);
    }

    if (str.includes('while')) {
      // Extract the condition from the Lua code
      const condition = str.match(/while\s+(.+)/)[1];

      // Replace "do" with "do" in the condition
      const modifiedCondition = condition.replace(/\bdo\b/, 'do');

      // Build the transpiled while statement for Ruby
      const transpiledWhile = `while ${modifiedCondition}`;

      // Push the transpiled while statement into the transpiledCode array
      transpiledCode.push(leadingSpaces + transpiledWhile);
    }

    if (str.includes('return')) {
      // Extract the value from the Lua code
      const value = str.match(/return\s+(.+)/)[1];

      // Build the transpiled return statement for Ruby
      const transpiledReturn = `return ${value}`;

      // Push the transpiled return statement into the transpiledCode array
      transpiledCode.push(leadingSpaces + transpiledReturn);
    }

    if (!str.trim()) {
      // Push an empty line into the transpiledCode array
      transpiledCode.push(leadingSpaces + '');
    }
  }

  updateOutput(transpiledCode);
}


// Função para receber o código Lua do usuário
function transpileLuaCode() {
  const luaCode = document.getElementById('CodeInput').value;

  // Transpila o código Lua para Ruby
  const rubyCode = transpileLuaToRuby(luaCode);

  // Exibe o código Ruby resultante
  updateOutput(rubyCode);
}
