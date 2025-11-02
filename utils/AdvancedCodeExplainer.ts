interface CodeComponent {
  type: 'include' | 'function' | 'variable' | 'struct' | 'loop' | 'condition' | 'pointer' | 'array'
  title: string
  description: string
  codeSnippet?: string
  complexity?: string
}

interface ProgramSummary {
  overview: string
  complexity: 'Simple' | 'Moderate' | 'Complex' | 'Advanced'
  mainFeatures: string[]
  memoryUsage: {
    stackUsed: number
    heapUsed: number
    activeFrames: number
    memoryLeaks: number
  }
}

export class AdvancedCodeExplainer {
  private code: string = ''
  private lines: string[] = []

  analyze(code: string): { summary: ProgramSummary; components: CodeComponent[] } {
    this.code = code.trim()
    this.lines = this.code.split('\n').filter(line => line.trim())

    if (!this.code) {
      return {
        summary: {
          overview: 'No code provided for analysis.',
          complexity: 'Simple',
          mainFeatures: [],
          memoryUsage: { stackUsed: 0, heapUsed: 0, activeFrames: 0, memoryLeaks: 0 }
        },
        components: []
      }
    }

    const summary = this.generateSummary()
    const components = this.analyzeComponents()

    return { summary, components }
  }

  private generateSummary(): ProgramSummary {
    const features: string[] = []
    let complexity: 'Simple' | 'Moderate' | 'Complex' | 'Advanced' = 'Simple'

    // Detect features
    if (/#include/.test(this.code)) features.push('Uses standard libraries')
    if (/int\s+main\s*\(/.test(this.code)) features.push('Has main function')
    if (/printf|scanf/.test(this.code)) features.push('Input/Output operations')
    if (/\b(int|char|float|double)\s+\w+/.test(this.code)) features.push('Variable declarations')
    if (/malloc|calloc|free/.test(this.code)) features.push('Dynamic memory allocation')
    if (/struct\s+\w+/.test(this.code)) features.push('Custom data structures')
    if (/\*\w+|\w+\*/.test(this.code)) features.push('Pointer operations')
    if (/\w+\[\w*\]/.test(this.code)) features.push('Array usage')
    if (/(for|while|do)\s*\(/.test(this.code)) features.push('Loops')
    if /(if|else|switch)\s*\(/.test(this.code)) features.push('Conditional logic')
    if (/\w+\s+\w+\s*\([^)]*\)\s*\{/.test(this.code)) features.push('Function definitions')

    // Determine complexity
    const complexityScore = this.calculateComplexity()
    if (complexityScore >= 15) complexity = 'Advanced'
    else if (complexityScore >= 10) complexity = 'Complex'
    else if (complexityScore >= 5) complexity = 'Moderate'

    // Generate overview
    const lineCount = this.lines.length
    const functionCount = (this.code.match(/\w+\s+\w+\s*\([^)]*\)\s*\{/g) || []).length
    
    let overview = `This ${complexity.toLowerCase()} C program contains ${lineCount} lines of code`
    if (functionCount > 1) overview += ` with ${functionCount} functions`
    overview += '. '

    if (features.includes('Dynamic memory allocation')) {
      overview += 'It uses dynamic memory management for flexible data handling. '
    }
    if (features.includes('Custom data structures')) {
      overview += 'It defines custom data structures for organized data storage. '
    }
    if (features.includes('Pointer operations')) {
      overview += 'It utilizes pointers for efficient memory access and manipulation. '
    }

    const memoryUsage = this.estimateMemoryUsage()

    return {
      overview,
      complexity,
      mainFeatures: features,
      memoryUsage
    }
  }

  private calculateComplexity(): number {
    let score = 0
    
    // Basic complexity indicators
    score += (this.code.match(/\bfor\b/g) || []).length * 2
    score += (this.code.match(/\bwhile\b/g) || []).length * 2
    score += (this.code.match(/\bif\b/g) || []).length * 1
    score += (this.code.match(/\*\w+|\w+\*/g) || []).length * 2
    score += (this.code.match(/malloc|calloc/g) || []).length * 3
    score += (this.code.match(/struct\s+\w+/g) || []).length * 2
    score += (this.code.match(/\w+\s+\w+\s*\([^)]*\)\s*\{/g) || []).length * 1
    score += (this.code.match(/\w+\[\w*\]/g) || []).length * 1

    return score
  }

  private analyzeComponents(): CodeComponent[] {
    const components: CodeComponent[] = []

    // Analyze includes
    components.push(...this.analyzeIncludes())
    
    // Analyze functions
    components.push(...this.analyzeFunctions())
    
    // Analyze variables
    components.push(...this.analyzeVariables())
    
    // Analyze structures
    components.push(...this.analyzeStructures())
    
    // Analyze arrays
    components.push(...this.analyzeArrays())
    
    // Analyze pointers
    components.push(...this.analyzePointers())
    
    // Analyze loops
    components.push(...this.analyzeLoops())
    
    // Analyze conditions
    components.push(...this.analyzeConditions())

    return components
  }

  private analyzeIncludes(): CodeComponent[] {
    const includes: CodeComponent[] = []
    const includeRegex = /#include\s*[<"](.*?)[>"]/g
    let match

    while ((match = includeRegex.exec(this.code)) !== null) {
      const headerFile = match[1]
      let description = ''

      switch (headerFile) {
        case 'stdio.h':
          description = 'Standard Input/Output library. Provides functions like printf(), scanf(), fgets(), etc. for console and file operations.'
          break
        case 'stdlib.h':
          description = 'Standard Library. Includes memory allocation (malloc, free), process control (exit), and utility functions (atoi, rand).'
          break
        case 'string.h':
          description = 'String manipulation library. Provides functions like strlen(), strcpy(), strcmp(), strcat() for string operations.'
          break
        case 'math.h':
          description = 'Mathematical functions library. Includes sqrt(), pow(), sin(), cos(), log() and other mathematical operations.'
          break
        case 'ctype.h':
          description = 'Character type library. Provides functions like isalpha(), isdigit(), toupper(), tolower() for character classification.'
          break
        default:
          description = `Custom header file "${headerFile}". Likely contains function declarations, constants, or type definitions specific to this program.`
      }

      includes.push({
        type: 'include',
        title: `#include <${headerFile}>`,
        description,
        codeSnippet: match[0]
      })
    }

    return includes
  }

  private analyzeFunctions(): CodeComponent[] {
    const functions: CodeComponent[] = []
    const functionRegex = /(\w+)\s+(\w+)\s*\(([^)]*)\)\s*\{/g
    let match

    while ((match = functionRegex.exec(this.code)) !== null) {
      const returnType = match[1]
      const functionName = match[2]
      const parameters = match[3].trim()

      let description = `Function "${functionName}" `
      
      if (returnType === 'void') {
        description += 'performs operations without returning a value. '
      } else {
        description += `returns a ${returnType} value. `
      }

      if (parameters) {
        const paramCount = parameters.split(',').length
        description += `It takes ${paramCount} parameter${paramCount > 1 ? 's' : ''}: ${parameters}. `
      } else {
        description += 'It takes no parameters. '
      }

      if (functionName === 'main') {
        description += 'This is the program entry point where execution begins. Every C program must have a main function.'
      } else {
        description += 'This is a user-defined function that encapsulates specific functionality for code reusability and organization.'
      }

      functions.push({
        type: 'function',
        title: `${functionName}()`,
        description,
        codeSnippet: `${returnType} ${functionName}(${parameters})`
      })
    }

    return functions
  }

  private analyzeVariables(): CodeComponent[] {
    const variables: CodeComponent[] = []
    const variableRegex = /\b(int|char|float|double|long|short|unsigned)\s+(\**)(\w+)(?:\s*=\s*([^;,]+))?/g
    let match

    while ((match = variableRegex.exec(this.code)) !== null) {
      const type = match[1]
      const pointerLevel = match[2].length
      const name = match[3]
      const value = match[4]

      let description = `Variable "${name}" is declared as `
      
      if (pointerLevel > 0) {
        description += `a ${pointerLevel}-level pointer to ${type}. `
        description += 'Pointers store memory addresses and allow indirect access to data. '
      } else {
        description += `type "${type}". `
      }

      // Type-specific information
      switch (type) {
        case 'int':
          description += 'Integers typically use 4 bytes and can store whole numbers from -2,147,483,648 to 2,147,483,647. '
          break
        case 'char':
          description += 'Characters use 1 byte and can store ASCII values (0-127) or single characters. '
          break
        case 'float':
          description += 'Single-precision floating-point numbers use 4 bytes with ~7 decimal digits of precision. '
          break
        case 'double':
          description += 'Double-precision floating-point numbers use 8 bytes with ~15 decimal digits of precision. '
          break
      }

      if (value) {
        description += `Initialized with value: ${value.trim()}.`
      } else {
        description += 'Declared but not initialized - contains unpredictable garbage value until assigned.'
      }

      variables.push({
        type: 'variable',
        title: `${name} (${type}${pointerLevel > 0 ? ' pointer' : ''})`,
        description,
        codeSnippet: match[0]
      })
    }

    return variables
  }

  private analyzeStructures(): CodeComponent[] {
    const structures: CodeComponent[] = []
    const structRegex = /struct\s+(\w+)\s*\{([^}]+)\}/g
    let match

    while ((match = structRegex.exec(this.code)) !== null) {
      const structName = match[1]
      const members = match[2].trim()
      
      const memberCount = members.split(';').filter(m => m.trim()).length
      
      let description = `Structure "${structName}" is a custom data type that groups ${memberCount} related variables together. `
      description += 'Structures allow you to create complex data types by combining different data types into a single unit. '
      description += 'This promotes better code organization and enables you to model real-world entities more effectively.'

      structures.push({
        type: 'struct',
        title: `struct ${structName}`,
        description,
        codeSnippet: match[0],
        complexity: memberCount > 5 ? 'Complex' : memberCount > 2 ? 'Moderate' : 'Simple'
      })
    }

    return structures
  }

  private analyzeArrays(): CodeComponent[] {
    const arrays: CodeComponent[] = []
    const arrayRegex = /(\w+)\s+(\w+)\s*\[([^\]]*)\]/g
    let match

    while ((match = arrayRegex.exec(this.code)) !== null) {
      const type = match[1]
      const name = match[2]
      const size = match[3]

      let description = `Array "${name}" is a collection of ${type} elements. `
      
      if (size) {
        description += `It can hold ${size} elements, indexed from 0 to ${parseInt(size) - 1}. `
      } else {
        description += 'Its size is determined by initialization or function parameter context. '
      }

      description += 'Arrays store elements in contiguous memory locations, allowing efficient access through indexing. '
      description += 'They are fundamental for handling multiple related data items of the same type.'

      arrays.push({
        type: 'array',
        title: `${name}[] (${type} array)`,
        description,
        codeSnippet: match[0]
      })
    }

    return arrays
  }

  private analyzePointers(): CodeComponent[] {
    const pointers: CodeComponent[] = []
    const pointerRegex = /(\w+)\s*\*+\s*(\w+)/g
    let match

    while ((match = pointerRegex.exec(this.code)) !== null) {
      const type = match[1]
      const name = match[2]

      let description = `Pointer "${name}" stores the memory address of a ${type} variable. `
      description += 'Pointers enable indirect access to data, dynamic memory allocation, and efficient parameter passing. '
      description += 'They are powerful but require careful handling to avoid memory errors like segmentation faults.'

      pointers.push({
        type: 'pointer',
        title: `*${name} (${type} pointer)`,
        description,
        codeSnippet: match[0]
      })
    }

    return pointers
  }

  private analyzeLoops(): CodeComponent[] {
    const loops: CodeComponent[] = []
    
    // For loops
    const forRegex = /for\s*\([^)]+\)/g
    let match
    while ((match = forRegex.exec(this.code)) !== null) {
      loops.push({
        type: 'loop',
        title: 'For Loop',
        description: 'A for loop provides a compact way to iterate with initialization, condition, and increment/decrement in one line. It\'s ideal for counting loops where you know the number of iterations in advance.',
        codeSnippet: match[0],
        complexity: 'Moderate'
      })
    }

    // While loops
    const whileRegex = /while\s*\([^)]+\)/g
    while ((match = whileRegex.exec(this.code)) !== null) {
      loops.push({
        type: 'loop',
        title: 'While Loop',
        description: 'A while loop continues executing as long as the condition remains true. It\'s perfect for situations where the number of iterations is not known beforehand and depends on runtime conditions.',
        codeSnippet: match[0],
        complexity: 'Moderate'
      })
    }

    return loops
  }

  private analyzeConditions(): CodeComponent[] {
    const conditions: CodeComponent[] = []
    
    const ifRegex = /if\s*\([^)]+\)/g
    let match
    while ((match = ifRegex.exec(this.code)) !== null) {
      conditions.push({
        type: 'condition',
        title: 'Conditional Statement',
        description: 'An if statement executes code blocks based on boolean conditions. It enables decision-making in programs by allowing different execution paths based on runtime values and comparisons.',
        codeSnippet: match[0],
        complexity: 'Simple'
      })
    }

    return conditions
  }

  private estimateMemoryUsage(): { stackUsed: number; heapUsed: number; activeFrames: number; memoryLeaks: number } {
    const variables = this.code.match(/\b(int|char|float|double|long|short)\s+\w+/g) || []
    const functions = this.code.match(/\w+\s+\w+\s*\([^)]*\)\s*\{/g) || []
    const mallocCalls = this.code.match(/malloc|calloc/g) || []
    const freeCalls = this.code.match(/free\s*\(/g) || []
    const arrays = this.code.match(/\w+\s+\w+\s*\[\d+\]/g) || []

    let stackUsed = 0
    
    // Calculate variable sizes
    variables.forEach(variable => {
      if (variable.includes('int') || variable.includes('float')) stackUsed += 4
      else if (variable.includes('double') || variable.includes('long')) stackUsed += 8
      else if (variable.includes('char')) stackUsed += 1
      else if (variable.includes('short')) stackUsed += 2
    })

    // Add array sizes
    arrays.forEach(array => {
      const sizeMatch = array.match(/\[(\d+)\]/)
      if (sizeMatch) {
        const size = parseInt(sizeMatch[1])
        if (array.includes('int') || array.includes('float')) stackUsed += size * 4
        else if (array.includes('double')) stackUsed += size * 8
        else if (array.includes('char')) stackUsed += size
      }
    })

    // Function call overhead
    stackUsed += functions.length * 24

    return {
      stackUsed: Math.min(stackUsed, 2048),
      heapUsed: mallocCalls.length * 64,
      activeFrames: Math.max(1, functions.length),
      memoryLeaks: Math.max(0, mallocCalls.length - freeCalls.length)
    }
  }
}