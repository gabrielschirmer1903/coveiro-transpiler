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

function transpileLuaToRuby() {
  const codigo = document.getElementById('CodeInput').value;
  let palavrasCodigo = codigo.split('\n');
  let transpiledCode = [];

  for (let i = 0; i < palavrasCodigo.length; i++) {
    const text = palavrasCodigo[i];
    const str = text.trim();
    const leadingSpaces = getLeadingSpaces(text);

    // if (str.match(/^\w+\s*=\s*(.+)/)) {
    //   const assignmentMatch = str.match(/^(\w+)\s*=\s*(.+)/);
    //   if (assignmentMatch) {
    //     const assignedVariable = assignmentMatch[1];
    //     const assignedValue = assignmentMatch[2];

    //     const transpiledVariableAssignment = `${assignedVariable} = ${assignedValue}`;
    //     transpiledCode.push(leadingSpaces + transpiledVariableAssignment.trimStart());
    //   }
    // }

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

      // Build the transpiled function declaration string for Ruby
      const transpiledFunction = `def ${functionName[1]}(${transpiledParameters})`;

      // Push the transpiled function into the transpiledCode array
      transpiledCode.push(leadingSpaces + transpiledFunction.trimStart());
    }

    if (str.includes('for')) {
      let transpiledFor;

      if (str.includes('=')) {
        const parts = str.split('=');
        const variable = parts[0].trim().split(' ')[1];
        const rangeValues = parts[1].split(',');
        const start = rangeValues[0].trim();
        const end = rangeValues[1].trim().replace('do', '');

        if (str.includes('#')) {
          transpiledFor = `${start}..${end}.each do |${variable}|`;
        } else if (str.includes('{')) {
          
        } else {
          transpiledFor = `(${start}..${end}).each do |${variable}|`;
        }

      } else if (str.includes('ipairs')) {	
        let parts = str.split('ipairs');
        let indexName = parts[0].split(',')
        indexName = indexName[0].replace('for ', "")

        let variable = parts[1].split('(');
        variable = parts[1].split(')');
        variable = variable[0].replace('(', "")
        const rangeValues = parts[0].split(',');

        transpiledFor = `${variable}.each do |${indexName}|`;
      }
    
      transpiledCode.push(leadingSpaces + transpiledFor.trimStart());
    }
    

    if (str.match('end')) {
      transpiledCode.push(leadingSpaces + str.trimStart());
    }

    // correct aparentaly
    if (str.startsWith('local') && !str.includes('function') && !str.includes('=')) {
      // Variable declaration with "local" keyword
      let declaration = str.replace(/^local\s+/, '');
      declaration = str.replace('local', '');

      transpiledCode.push(leadingSpaces + declaration + ' = nil');
    } else if (
      str.includes('=') &&
      !str.includes('function') &&
      !str.includes('if') &&
      !str.includes('else') &&
      !str.includes('elsif') &&
      !str.includes('for') &&
      !str.includes('print') &&
      !str.includes('while')
    ) {
      // Variable assignment or mathematical operation
      let assignment = str.replace('local', '');

      if(assignment.includes('{') && assignment.includes('}')) {
        assignment = assignment.replace('{', '[');
        assignment = assignment.replace('}', ']');
      }
      
      transpiledCode.push(leadingSpaces + assignment.trimStart());
    }

    if (str.match('print')) {
      // Transpile the Lua print statement to Ruby
      let transpiledPrint;
      let condi = str.match(/print\s*\(\s*(.*?)\s*\)/);
      // print("Hello, " .. name .. "!")
      if (str.includes('..')) {
        let splitStr = condi[1].split('..');

        transpiledPrint = 'puts ' + '"' + '#{' + splitStr[0] + '}';
        for (let i = 1; i < splitStr.length; i++) {
          transpiledPrint =
            transpiledPrint + '#{' + splitStr[i] + '}';
        }
        transpiledPrint = transpiledPrint + '"';
      } else {
        transpiledPrint = str.replace(/print\s*\(\s*(.*?)\s*\)/, 'puts $1');
      }

      transpiledCode.push(leadingSpaces + transpiledPrint.trimStart());
    }

    if (str.match(/^\w+\s*\((.*?)\)$/) && !str.includes('print')) {
      // Transpile the Lua function invocation to Ruby
      const transpiledInvocation = str.replace(/(\w+)\s*\((.*?)\)/, '$1($2)');

      transpiledCode.push(leadingSpaces + transpiledInvocation.trimStart());
    }

    if (str.includes('if') && !str.includes('elseif')) {
      // Extract the condition from the Lua code
      const condition = str.match(/if\s+(.+)/)[1];

      // Replace "then" with "then" in the condition
      const modifiedCondition = condition.replace(/\bthen\b/, '');

      // Build the transpiled if statement for Ruby
      const transpiledIf = `if ${modifiedCondition}`;

      // Push the transpiled if statement into the transpiledCode array
      transpiledCode.push(leadingSpaces + transpiledIf.trimStart());
    }

    if (str.includes('else') && !str.includes('elseif')) {
      // Transpile the "else" statement to "else"
      let transpiledElse = str.replace(
        /(^\s*)else\s*(.+)/,
        (_, leadingSpaces, rest) => `else${rest}`,
      );
      transpiledElse = transpiledElse.replace(/\bthen\b/, '');

      // Push the transpiled "else" statement into the transpiledCode array
      transpiledCode.push(leadingSpaces + transpiledElse.trimStart());
    }

    if (str.includes('elseif')) {
      // Transpile "elsif" to "elsif" in Ruby
      let transpiledElsIf = str.replace(
        /(^\s*)elsif\s+(.+)/,
        (_, leadingSpaces, condition) => `elsif ${condition}`,
      );
      transpiledElsIf = transpiledElsIf.replace(/\bthen\b/, '');

      transpiledCode.push(leadingSpaces + transpiledElsIf.trimStart());
    }

    if (str.includes('while')) {
      // Extract the condition from the Lua code
      const condition = str.match(/while\s+(.+)/)[1];

      // Replace "do" with "do" in the condition
      const modifiedCondition = condition.replace(/\bdo\b/, 'do');

      // Build the transpiled while statement for Ruby
      const transpiledWhile = `while ${modifiedCondition}`;

      // Push the transpiled while statement into the transpiledCode array
      transpiledCode.push(leadingSpaces + transpiledWhile.trimStart());
    }

    if (str.includes('return')) {
      // Extract the value from the Lua code
      const value = str.match(/return\s+(.+)/)[1];

      // Build the transpiled return statement for Ruby
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

// // Função para receber o código Lua do usuário
// function transpileLuaCode() {
//   const luaCode = document.getElementById('CodeInput').value;

//   // Transpila o código Lua para Ruby
//   const rubyCode = transpileLuaToRuby(luaCode);

//   // Exibe o código Ruby resultante
//   updateOutput(rubyCode);
// }

function indentRubyCode(rubyCode) {
  const lines = rubyCode.split('\n');
  let indentLevel = 0;
  let indentedCode = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (
      line.includes('end') ||
      line.includes('elsif') ||
      line.includes('else') ||
      line.includes('when')
    ) {
      indentLevel--;
    }

   // indentedCode += '  '.repeat(indentLevel) + line + '\n';

    if (
      line.startsWith('if') ||
      line.startsWith('elsif') ||
      line.startsWith('unless') ||
      line.startsWith('while') ||
      line.startsWith('until') ||
      line.startsWith('for') ||
      line.startsWith('case') ||
      line.endsWith('do') ||
      line.endsWith('then')
    ) {
      indentLevel++;
    }
  }

  return indentedCode;
}

function transpileToRuby() {
  transpileLuaToRuby();
  const rubyCode = document.getElementById('contador').value;
  const indentedRubyCode = indentRubyCode(rubyCode);
  updateOutput(indentedRubyCode);
}