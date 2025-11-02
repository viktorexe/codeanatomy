interface ExplanationBlock {
  title: string
  content: string
  codeLines?: string[]
  type: 'overview' | 'includes' | 'function' | 'variable' | 'logic' | 'output'
}

export class CodeExplainer {
  private code: string = ''

  explain(code: string): ExplanationBlock[] {
    this.code = code.trim()
    
    if (!this.code) {
      return [{
        title: 'Empty Code',
        content: 'Please enter some C code to get an explanation.',
        type: 'overview'
      }]
    }

    const explanations: ExplanationBlock[] = []
    
    // Program Overview
    explanations.push(this.generateOverview())
    
    // Include Analysis
    const includes = this.analyzeIncludes()
    if (includes.length > 0) {
      explanations.push(...includes)
    }
    
    // Function Analysis
    const functions = this.analyzeFunctions()
    explanations.push(...functions)
    
    // Variable Analysis
    const variables = this.analyzeVariables()
    if (variables.length > 0) {
      explanations.push(...variables)
    }
    
    // Logic Flow
    const logic = this.analyzeLogic()
    if (logic.length > 0) {
      explanations.push(...logic)
    }

    return explanations
  }

  private generateOverview(): ExplanationBlock {
    const lines = this.code.split('\n').filter(line => line.trim())
    const hasMain = /int\s+main\s*\(/.test(this.code)
    const hasIncludes = /#include/.test(this.code)
    const hasVariables = /\b(int|char|float|double|void)\s+\w+/.test(this.code)
    const hasPrintf = /printf\s*\(/.test(this.code)

    let description = `This C program contains ${lines.length} lines of code. `
    
    if (hasMain) {
      description += 'It has a main function which serves as the entry point. '
    }
    
    if (hasIncludes) {
      description += 'It includes header files for additional functionality. '
    }
    
    if (hasVariables) {
      description += 'It declares and uses variables for data storage. '
    }
    
    if (hasPrintf) {
      description += 'It outputs information to the console. '
    }

    return {
      title: 'Program Overview',
      content: description,
      type: 'overview'
    }
  }

  private analyzeIncludes(): ExplanationBlock[] {
    const includeRegex = /#include\s*[<"](.*?)[>"]/g
    const includes: ExplanationBlock[] = []
    let match

    while ((match = includeRegex.exec(this.code)) !== null) {
      const headerFile = match[1]
      let explanation = ''

      switch (headerFile) {
        case 'stdio.h':
          explanation = 'Provides input/output functions like printf(), scanf(), getchar(), etc.'
          break
        case 'stdlib.h':
          explanation = 'Provides memory allocation functions like malloc(), free(), and utility functions.'
          break
        case 'string.h':
          explanation = 'Provides string manipulation functions like strlen(), strcpy(), strcmp(), etc.'
          break
        case 'math.h':
          explanation = 'Provides mathematical functions like sqrt(), pow(), sin(), cos(), etc.'
          break
        case 'ctype.h':
          explanation = 'Provides character classification functions like isalpha(), isdigit(), etc.'
          break
        default:
          explanation = `Custom header file that likely contains function declarations and definitions.`
      }

      includes.push({
        title: `Header File: ${headerFile}`,
        content: explanation,
        codeLines: [match[0]],
        type: 'includes'
      })
    }

    return includes
  }

  private analyzeFunctions(): ExplanationBlock[] {
    const functionRegex = /(\w+)\s+(\w+)\s*\([^)]*\)\s*\{/g
    const functions: ExplanationBlock[] = []
    let match

    while ((match = functionRegex.exec(this.code)) !== null) {
      const returnType = match[1]
      const functionName = match[2]
      
      let explanation = `This function named "${functionName}" `
      
      if (returnType === 'void') {
        explanation += 'does not return any value. '
      } else {
        explanation += `returns a value of type "${returnType}". `
      }

      if (functionName === 'main') {
        explanation += 'This is the main function where program execution begins. Every C program must have a main function.'
      } else {
        explanation += 'This is a user-defined function that performs specific tasks.'
      }

      functions.push({
        title: `Function: ${functionName}()`,
        content: explanation,
        codeLines: [match[0].replace('{', '{ ... }')],
        type: 'function'
      })
    }

    return functions
  }

  private analyzeVariables(): ExplanationBlock[] {
    const variableRegex = /\b(int|char|float|double|long|short)\s+(\w+)(?:\s*=\s*([^;]+))?/g
    const variables: ExplanationBlock[] = []
    let match

    while ((match = variableRegex.exec(this.code)) !== null) {
      const type = match[1]
      const name = match[2]
      const value = match[3]

      let explanation = `Variable "${name}" is declared as type "${type}". `
      
      switch (type) {
        case 'int':
          explanation += 'This can store integer numbers (whole numbers). '
          break
        case 'char':
          explanation += 'This can store a single character or small integer values. '
          break
        case 'float':
          explanation += 'This can store decimal numbers with single precision. '
          break
        case 'double':
          explanation += 'This can store decimal numbers with double precision. '
          break
      }

      if (value) {
        explanation += `It is initialized with the value: ${value.trim()}`
      } else {
        explanation += 'It is declared but not initialized, so it contains garbage value.'
      }

      variables.push({
        title: `Variable: ${name}`,
        content: explanation,
        codeLines: [match[0] + ';'],
        type: 'variable'
      })
    }

    return variables
  }

  private analyzeLogic(): ExplanationBlock[] {
    const logic: ExplanationBlock[] = []

    // Printf statements
    const printfRegex = /printf\s*\([^)]+\)/g
    let match
    while ((match = printfRegex.exec(this.code)) !== null) {
      logic.push({
        title: 'Output Statement',
        content: 'This printf statement displays formatted output to the console. It takes a format string and optional arguments to print values.',
        codeLines: [match[0] + ';'],
        type: 'output'
      })
    }

    // Return statements
    const returnRegex = /return\s+([^;]+);/g
    while ((match = returnRegex.exec(this.code)) !== null) {
      const returnValue = match[1].trim()
      logic.push({
        title: 'Return Statement',
        content: `This return statement ends the function execution and returns the value "${returnValue}" to the caller. In main(), returning 0 typically indicates successful program execution.`,
        codeLines: [match[0]],
        type: 'logic'
      })
    }

    // Assignment operations
    const assignmentRegex = /(\w+)\s*=\s*([^;]+);/g
    while ((match = assignmentRegex.exec(this.code)) !== null) {
      const variable = match[1]
      const expression = match[2].trim()
      
      if (!expression.match(/^\d+$/) && !expression.match(/^".*"$/)) {
        logic.push({
          title: 'Assignment Operation',
          content: `The variable "${variable}" is assigned the result of the expression "${expression}". This calculates the value and stores it in the variable.`,
          codeLines: [match[0]],
          type: 'logic'
        })
      }
    }

    return logic
  }

  estimateMemoryUsage(): { stackUsed: number; heapUsed: number; activeFrames: number; memoryLeaks: number } {
    const variables = this.code.match(/\b(int|char|float|double|long|short)\s+\w+/g) || []
    const functions = this.code.match(/\w+\s+\w+\s*\([^)]*\)\s*\{/g) || []
    const mallocCalls = this.code.match(/malloc\s*\(/g) || []
    const freeCalls = this.code.match(/free\s*\(/g) || []

    // Estimate stack usage (rough calculation)
    let stackUsed = 0
    variables.forEach(variable => {
      if (variable.includes('int') || variable.includes('float')) stackUsed += 4
      else if (variable.includes('double') || variable.includes('long')) stackUsed += 8
      else if (variable.includes('char')) stackUsed += 1
      else if (variable.includes('short')) stackUsed += 2
    })

    // Add function call overhead
    stackUsed += functions.length * 16

    return {
      stackUsed: Math.min(stackUsed, 1024),
      heapUsed: Math.max(0, mallocCalls.length * 32),
      activeFrames: Math.max(1, functions.length),
      memoryLeaks: Math.max(0, mallocCalls.length - freeCalls.length)
    }
  }
}