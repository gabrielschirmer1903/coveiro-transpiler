function updateOutput(transpiledCode) {
  const textarea = document.getElementById('contador');
  console.log(transpiledCode);

  textarea.value = transpiledCode.join('\n');
}

function addTranspiledLine(line) {
  const leadingSpaces = getLeadingSpaces(line);

  transpiledCode.push(leadingSpaces + line);
  updateOutput();
}

function limpacontador() {
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

    // If block that transpiles the function from LUA to Ruby
    if (str.match('function')) {
      // This extracts the function name from the Lua code
      const functionName = str.match(/function\s+(\w+)/);
      // This extracts the parameters from the Lua code
      const parameters = str.match(/function\s+\w+\s*\((.*?)\)/);
      // Removes the local keyword from the parameters
      const transpiledParameters = parameters ? parameters[1].replace(/local\s+([\w, ]+)/, '$1') : '';
      // Build the transpiled function declaration string for Ruby
      const transpiledFunction = `def ${functionName[1]}(${transpiledParameters})`;

      transpiledCode.push(leadingSpaces + transpiledFunction.trimStart());
    }

    // If block that transpiles the for loop from LUA to Ruby
    if (str.includes('for')) {
      let transpiledFor;

      if (str.includes('=')) {
        // Breaks the for to separate the variable and the range
        const parts = str.split('=');
        // Extracts the variable from the for loop
        const variable = parts[0].trim().split(' ')[1];
        // Extracts the range from the for loop
        const rangeValues = parts[1].split(',');
        // Extracts the start and end values from the range
        const start = rangeValues[0].trim();
        const end = rangeValues[1].trim().replace('do', '');

        transpiledFor = `(${start}..${end}).each do |${variable}|`;

        // Checks if the for loop is using the ipairs method
      } else if (str.includes('ipairs')) {
        // Basically does the same as above, breakes the for to get the necessary parameters
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

    // If block that transpiles the end statement from LUA to Ruby
    if (str.match('end')) {
      transpiledCode.push(leadingSpaces + str.trimStart());
    }

    // If block that transpiles variables and arrays from LUA to Ruby
    if (str.startsWith('local') && !str.includes('function') && !str.includes('=')) {
      // removes the local keyword from the declaration
      let declaration = str.replace(/^local\s+/, '');
      declaration = str.replace('local', '');

      // Since '=' doesn't exist, we need to add nil to the declaration
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
      // Transpiles veriables, arrays and mathmatical operations from LUA to Ruby
      // Removes the local keyword from the assignment
      let assignment = str.replace('local', '');

      if(assignment.includes('{') && assignment.includes('}')) {
        assignment = assignment.replace('{', '[');
        assignment = assignment.replace('}', ']');
      }
      
      transpiledCode.push(leadingSpaces + assignment.trimStart());
    }

    // If block that transpiles the print statement from LUA to Ruby
    if (str.match('print')) {
      let transpiledPrint;
      // ignores the print statement and delimiters the parentheses an gets the value inside them
      let condi = str.match(/print\s*\(\s*(.*?)\s*\)/);

      // Checks if the print statement is using '..' to concatenate strings
      if (str.includes('..')) {
        // Splits the string into an array of strings
        let splitStr = condi[1].split('..');

        // Transpiles the print statement to Ruby using the interpolation method #{}
        transpiledPrint = 'puts ' + '"' + '#{' + splitStr[0] + '}';
        for (let i = 1; i < splitStr.length; i++) {
          transpiledPrint =
            transpiledPrint + '#{' + splitStr[i] + '}';
        }
        transpiledPrint = transpiledPrint + '"';
      } else {
        // Transpiles the print statement to Ruby without the interpolation method #{}
        transpiledPrint = str.replace(/print\s*\(\s*(.*?)\s*\)/, 'puts $1');
      }

      transpiledCode.push(leadingSpaces + transpiledPrint.trimStart());
    }

    // If block that transpiles function calls from LUA to Ruby
    if (str.match(/^\w+\s*\((.*?)\)$/) && !str.includes('print')) {
      const transpiledInvocation = str.replace(/(\w+)\s*\((.*?)\)/, '$1($2)');

      transpiledCode.push(leadingSpaces + transpiledInvocation.trimStart());
    }

    // If block that transpiles the if statement from LUA to Ruby
    if (str.includes('if') && !str.includes('elseif')) {
      // Ignores the if, delimiters the parentheses and copies the parmeters inside
      const condition = str.match(/if\s+(.+)/)[1];
      const modifiedCondition = condition.replace(/\bthen\b/, '');
      const transpiledIf = `if ${modifiedCondition}`;

      transpiledCode.push(leadingSpaces + transpiledIf.trimStart());
    }

    // If block that transpiles the else statement from LUA to Ruby
    if (str.includes('else') && !str.includes('elseif')) {
      let transpiledElse = str.replace(
        /(^\s*)else\s*(.+)/,
        (_, leadingSpaces, rest) => `else${rest}`,
      );
      transpiledElse = transpiledElse.replace(/\bthen\b/, '');

      transpiledCode.push(leadingSpaces + transpiledElse.trimStart());
    }

    // If block that transpiles the elseif statement from LUA to Ruby
    if (str.includes('elseif')) {
      let transpiledElsIf = str.replace(
        /(^\s*)elsif\s+(.+)/,
        (_, leadingSpaces, condition) => `elsif ${condition}`,
      );
      transpiledElsIf = transpiledElsIf.replace(/\bthen\b/, '');

      transpiledCode.push(leadingSpaces + transpiledElsIf.trimStart());
    }

    // If block that transpiles the while statement from LUA to Ruby
    if (str.includes('while')) {
      // Ignores the while, delimiters the parentheses and copies the parmeters inside
      const condition = str.match(/while\s+(.+)/)[1];
      const modifiedCondition = condition.replace(/\bdo\b/, 'do');
      const transpiledWhile = `while ${modifiedCondition}`;

      transpiledCode.push(leadingSpaces + transpiledWhile.trimStart());
    }

    // If block that transpiles the return statement from LUA to Ruby
    if (str.includes('return')) {
      const value = str.match(/return\s+(.+)/)[1];
      const transpiledReturn = `return ${value}`;

      transpiledCode.push(leadingSpaces + transpiledReturn.trimStart());
    }

    // Adds blank lines to the transpiled code
    if (!str.trim()) {
      transpiledCode.push(leadingSpaces + '');
    }
  }
  updateOutput(transpiledCode);
}

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
