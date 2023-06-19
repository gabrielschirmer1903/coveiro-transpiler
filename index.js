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

    // If block that transpiles the function from LUA to Python
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

    // If block that transpiles the for loop from LUA to Python
    if (str.includes('for')) {
      let transpiledFor;

      if (str.includes('=')) {
        // Breaks the for to separate the variable and the range
        const parts = str.split('=');
        // Extracts the variable from the for loop
        const variable = parts[0].trim().split(' ')[1];
        console.log(variable)
        // Extracts the range from the for loop
        const rangeValues = parts[1].split(',');
        console.log(rangeValues)
        // Extracts the start and end values from the range
        const start = rangeValues[0].trim();
        const end = rangeValues[1].trim().replace('do', '');

        transpiledFor = `for ${variable} in range( ${start}, ${end.replace('#', '')} + 1):`;

      } else if (str.includes('ipairs')) {
        let parts = str.split('ipairs');
        let variable = parts[0].trim().split(',')[1].trim();
        variable = variable.replace('in', '');
        transpiledFor = `for i, ${variable} in enumerate(${parts[1].trim().slice(0, -2)}) :`;
      }
    
     
      transpiledCode.push(leadingSpaces + transpiledFor.trimStart());
    }

    // If block that transpiles variables and arrays from LUA to Python
    if (str.includes('local') && !str.includes('function')) {
      // Variable declaration with "local" keyword
      let declaration;

      if(str.includes('=')) { 
        // removes the local keyword from the declaration
        declaration = str.replace('local ', '');
        
        // if it has nil, replace it with None
        if (declaration.includes('nil')) {
          declaration = declaration.replace('nil', 'None');
        }
      } else {
        // removes the local keyword from the declaration
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

    // If block that transpiles the print statement from LUA to Python
    if (str.match('print')) {
      let transpiledPrint;
      // ignores the print statement and delimiters the parentheses an gets the value inside them
      let condi = str.match(/print\s*\(\s*(.*?)\s*\)/);

      // Checks if the print statement is using '..' to concatenate strings
      if (str.includes('..')) {
        // Splits the string into an array of strings
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
        transpiledPrint = 'print(' + transpiledPrint.replace(/"'/g, '') + '))';
      } else {
        transpiledPrint = str.replace(/"'/g, 'print($1)');
      }

      transpiledCode.push(leadingSpaces + transpiledPrint.trimStart());
    }

    // If block that transpiles function calls from LUA to Ruby
    if (str.match(/^\w+\s*\((.*?)\)$/) && !str.includes('print')) {
      const transpiledInvocation = str.replace(/(\w+)\s*\((.*?)\)/, '$1($2)');

      transpiledCode.push(leadingSpaces + transpiledInvocation.trimStart());
    }

    // If block that transpiles the if statement from LUA to Python
    if (str.includes('if') && !str.includes('elseif')) {
      // Ignores the if, delimiters the parentheses and copies the parmeters inside
      const condition = str.match(/if\s+(.+)/)[1];
      const modifiedCondition = condition.replace(/\bthen\b/, ':');
      const transpiledIf = `if ${modifiedCondition}`;

      transpiledCode.push(leadingSpaces + transpiledIf.trimStart());
    }

    // If block that transpiles the else statement from LUA to Ruby
    if (str.includes('else') && !str.includes('elseif')) {
      const transpiledElse = str.replace(
        /(^\s*)else\s*(.+)/,
        (_, leadingSpaces, rest) => `${leadingSpaces}else:${rest}`,
      );

      transpiledCode.push(leadingSpaces + transpiledElse.trimStart() + `:`);
    }

    // If block that transpiles the elseif statement from LUA to Ruby
    if (str.includes('elseif')) {
      const transpiledElseIf = str.replace(
        /(^\s*)elseif\s+(.+)/,
        (_, leadingSpaces, condition) => `${leadingSpaces}elif ${condition}`,
      );
      const transpiledLine = transpiledElseIf.replace(/\bthen\b/, ':');

      transpiledCode.push(leadingSpaces + transpiledLine.trimStart());
    }

    // If block that transpiles the while statement from LUA to Python
    if (str.includes('while')) {
      // Ignores the while, delimiters the parentheses and copies the parmeters inside
      const condition = str.match(/while\s+(.+)/)[1];
      const modifiedCondition = condition.replace(/\bdo\b/, ':');
      const transpiledWhile = `while ${modifiedCondition}`;

      // Push the transpiled while statement into the transpiledCode array
      transpiledCode.push(leadingSpaces + transpiledWhile.trimStart());
    }

    // If block that transpiles the return statement from LUA to Python
    if (str.includes('return')) {
      const value = str.match(/return\s+(.+)/)[1];
      const transpiledReturn = `return ${value}`;

      transpiledCode.push(leadingSpaces + transpiledReturn.trimStart());
    }

    // Adds blank lines to the transpiled code
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

// Gets the Lua code from the textarea and transpiles it to Python
function transpileLuaCode() {
  const luaCode = document.getElementById('CodeInput').value;
  const rubyCode = transpileLuaToRuby(luaCode);

  updateOutput(rubyCode);
}
