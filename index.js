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

    // if (str.match(/^\w+\s*=\s*(.+)/)) {
    //   const assignmentMatch = str.match(/^(\w+)\s*=\s*(.+)/);
    //   if (assignmentMatch) {
    //     const assignedVariable = assignmentMatch[1];
    //     const assignedValue = assignmentMatch[2];

    //     if (!variableDeclarationAdded && assignedVariable === variableName) {
    //       // Add the variable declaration with the initial value
    //       const declarationStatement = variableInitialValue ? `${assignedVariable} = ${variableInitialValue}` : assignedVariable;
    //       variableDeclaration = variableDeclarationAdded ? assignedVariable : `${declarationStatement}`;
    //       variableDeclarationAdded = true;
    //     }

    //     const transpiledVariableAssignment = `${assignedVariable} = ${assignedValue}`;
    //     transpiledCode.push(leadingSpaces + transpiledVariableAssignment.trimStart());
    //   }
    // }

    // console.info(str)
    if (str.match('function')) {
      // Extract the function name from the Lua code
      const functionName = str.match(/function\s+(\w+)/);

      // Extract the function parameters from the Lua code
      const parameters = str.match(/function\s+\w+\s*\((.*?)\)/);

      // Remove 'local' keyword from the parameter declaration
      const transpiledParameters = parameters
        ? parameters[1].replace(/local\s+([\w, ]+)/, '$1')
        : '';

      // Extract the function body from the Lua code
      const body = str.match(/function[\s\S]*?end/);
      const bodyString = body ? body[0] : '';

      // Build the transpiled function declaration string for Python
      const transpiledFunction = `def ${functionName[1]}(${transpiledParameters}):`;

      // Push the transpiled function into the transpiledCode array

      transpiledCode.push(leadingSpaces + transpiledFunction.trimStart());
    }

    if (str.includes('for')) {
      const parts = str.split('=');
      const variable = parts[0].trim().split(' ')[1];
      const rangeValues = parts[1].split(',');
      const start = rangeValues[0].trim();
      const end = rangeValues[1].trim().replace('do', '');
      const transpiledFor = `for ${variable} in range(${start}, ${end} + 1):`;

      transpiledCode.push(leadingSpaces + transpiledFor.trimStart());
    }

    if (str.includes('local') && !str.includes('function')) {
      // Variable declaration with "local" keyword
      let declaration;

      if(str.includes('=')) { 
        declaration = str.replace('local ', '');
        
        if (declaration.includes('nil')) {
          declaration = declaration.replace('nil', 'None');
        }
      } else {
        declaration = str.replace('local ', '');
        declaration = declaration + ' = None';
      }

      transpiledCode.push(leadingSpaces + declaration.trimStart());
    } else if (str.includes('=') && !str.includes('function') && !str.includes('for') && !str.includes('if') && !str.includes('else') && !str.includes('elseif') && !str.includes('while') && !str.includes('print')) {
      // Variable assignment or mathematical operation
      let assignment = str.replace('local', '');

      if (assignment.includes('nil')) {
        assignment = assignment.replace('nil', 'None');
      }

      transpiledCode.push(leadingSpaces + assignment.trimStart());
    }

    if (str.match('print')) {
      // Transpile the Lua print statement to Python
      let transpiledPrint;
      let condi = str.match(/print\s*\(\s*(.*?)\s*\)/);

      if (str.includes('..')) {
        let splitStr = condi[1].split('..');

        transpiledPrint = 'str(' + splitStr[0] + ')' + '+';
        for (let i = 1; i < splitStr.length; i++) {
          transpiledPrint =
            transpiledPrint + ' str(' + splitStr[i] + ')' + ' +';
        }

        transpiledPrint = transpiledPrint.substring(
          0,
          transpiledPrint.length - 1,
        );
        transpiledPrint = 'print(' + transpiledPrint.replace(/"'/g, '') + ')';
      } else {
        transpiledPrint = str.replace(/"'/g, 'print($1)');
      }

      transpiledCode.push(leadingSpaces + transpiledPrint.trimStart());
    }

    if (str.match(/^\w+\s*\((.*?)\)$/) && !str.includes('print')) {
      // Transpile the Lua function invocation to Python
      const transpiledInvocation = str.replace(/(\w+)\s*\((.*?)\)/, '$1($2)');
      // Push the transpiled function invocation into the transpiledCode array

      transpiledCode.push(leadingSpaces + transpiledInvocation.trimStart());
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
      transpiledCode.push(leadingSpaces + transpiledIf.trimStart());
    }

    if (str.includes('else') && !str.includes('elseif')) {
      // Transpile the "else" statement to "else:"
      const transpiledElse = str.replace(
        /(^\s*)else\s*(.+)/,
        (_, leadingSpaces, rest) => `${leadingSpaces}else:${rest}`,
      );

      // Push the transpiled "else" statement into the transpiledCode array
      transpiledCode.push(leadingSpaces + transpiledElse.trimStart() + `:`);
    }

    if (str.includes('elseif')) {
      // Transpile "elseif" to "elif" in Python
      const transpiledElseIf = str.replace(
        /(^\s*)elseif\s+(.+)/,
        (_, leadingSpaces, condition) => `${leadingSpaces}elif ${condition}`,
      );
      const transpiledLine = transpiledElseIf.replace(/\bthen\b/, ':');

      transpiledCode.push(leadingSpaces + transpiledLine.trimStart());
    }

    if (str.includes('while')) {
      // Extract the condition from the Lua code
      const condition = str.match(/while\s+(.+)/)[1];

      // Replace "do" with ":" in the condition
      const modifiedCondition = condition.replace(/\bdo\b/, ':');

      // Build the transpiled while statement for Python
      const transpiledWhile = `while ${modifiedCondition}`;

      // Push the transpiled while statement into the transpiledCode array
      transpiledCode.push(leadingSpaces + transpiledWhile.trimStart());
    }

    if (str.includes('return')) {
      // Extract the value from the Lua code
      const value = str.match(/return\s+(.+)/)[1];

      // Build the transpiled return statement for Python
      const transpiledReturn = `return ${value}`;

      // Push the transpiled return statement into the transpiledCode array
      transpiledCode.push(leadingSpaces + transpiledReturn.trimStart());
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
  console.log(transpiledCode);

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

// Função para receber o código Lua do usuário
function transpileLuaCode() {
  const luaCode = document.getElementById('CodeInput').value;

  // Transpila o código Lua para Ruby
  const rubyCode = transpileLuaToRuby(luaCode);

  // Exibe o código Ruby resultante
  updateOutput(rubyCode);
}
