interface ProgramAnalysis {
  summary: string
  detailedExplanation: string
  memoryUsage: {
    stackUsed: number
    heapUsed: number
    activeFrames: number
    memoryLeaks: number
  }
}

export class AdvancedCodeExplainer {
  private code: string = ''

  analyze(code: string): ProgramAnalysis {
    this.code = code.trim()

    if (!this.code) {
      return {
        summary: 'No code provided for analysis.',
        detailedExplanation: 'Paste your C code to see what it does.',
        memoryUsage: { stackUsed: 0, heapUsed: 0, activeFrames: 0, memoryLeaks: 0 }
      }
    }

    return {
      summary: this.generateSummary(),
      detailedExplanation: this.generateExplanation(),
      memoryUsage: this.estimateMemoryUsage()
    }
  }

  private generateSummary(): string {
    const hasMain = /int\s+main\s*\(/.test(this.code)
    const hasLoops = /(for|while)\s*\(/.test(this.code)
    const hasArrays = /\w+\[\d*\]/.test(this.code)
    const hasPointers = /\*\w+/.test(this.code)
    const hasStructs = /struct\s+\w+/.test(this.code)
    const hasMalloc = /malloc|calloc/.test(this.code)
    
    let summary = 'This C program '
    
    if (hasMain) summary += 'starts with a main function and '
    if (hasLoops) summary += 'uses loops for repetition, '
    if (hasArrays) summary += 'works with arrays to store multiple values, '
    if (hasPointers) summary += 'uses pointers for memory access, '
    if (hasStructs) summary += 'defines custom data structures, '
    if (hasMalloc) summary += 'allocates memory dynamically, '
    
    summary = summary.replace(/,\s*$/, '.')
    
    return summary
  }

  private generateExplanation(): string {
    let explanation = ''
    
    // Libraries
    const includes = this.analyzeIncludes()
    if (includes) explanation += includes + '\n\n'
    
    // Main components
    const functions = this.analyzeFunctions()
    if (functions) explanation += functions + '\n\n'
    
    const variables = this.analyzeVariables()
    if (variables) explanation += variables + '\n\n'
    
    const structures = this.analyzeStructures()
    if (structures) explanation += structures + '\n\n'
    
    const logic = this.analyzeLogic()
    if (logic) explanation += logic + '\n\n'
    
    const memory = this.analyzeMemory()
    if (memory) explanation += memory
    
    return explanation.trim()
  }

  private analyzeIncludes(): string {
    const includes = this.code.match(/#include\s*[<"](.*?)[>"]/g)
    if (!includes || includes.length === 0) return ''
    
    let explanation = '📚 **Libraries Used:**\n'
    
    includes.forEach(include => {
      const match = include.match(/#include\s*[<"](.*?)[>"]/)
      if (match) {
        const lib = match[1]
        switch (lib) {
          case 'stdio.h':
            explanation += '• stdio.h - For input/output functions like printf() and scanf()\n'
            break
          case 'stdlib.h':
            explanation += '• stdlib.h - For memory allocation (malloc, free) and utility functions\n'
            break
          case 'string.h':
            explanation += '• string.h - For string manipulation functions like strlen(), strcpy()\n'
            break
          case 'math.h':
            explanation += '• math.h - For mathematical functions like sqrt(), pow()\n'
            break
          default:
            explanation += `• ${lib} - Custom header file\n`
        }
      }
    })
    
    return explanation
  }

  private analyzeFunctions(): string {
    const functions = this.code.match(/(\w+)\s+(\w+)\s*\([^)]*\)\s*\{/g)
    if (!functions || functions.length === 0) return ''
    
    let explanation = '🔧 **Functions:**\n'
    
    functions.forEach(func => {
      const match = func.match(/(\w+)\s+(\w+)\s*\([^)]*\)/)
      if (match) {
        const returnType = match[1]
        const name = match[2]
        
        if (name === 'main') {
          explanation += '• main() - Program entry point where execution starts\n'
        } else {
          explanation += `• ${name}() - ${returnType === 'void' ? 'Performs operations' : 'Returns ' + returnType + ' value'}\n`
        }
      }
    })
    
    return explanation
  }

  private analyzeVariables(): string {
    const variables = this.code.match(/\b(int|char|float|double)\s+(\**)(\w+)/g)
    if (!variables || variables.length === 0) return ''
    
    let explanation = '📊 **Variables:**\n'
    const varTypes = new Set()
    
    variables.forEach(variable => {
      const match = variable.match(/\b(int|char|float|double)\s+(\**)(\w+)/)
      if (match) {
        const type = match[1]
        const isPointer = match[2].length > 0
        const name = match[3]
        
        if (isPointer) {
          explanation += `• ${name} - Pointer to ${type} (stores memory address)\n`
        } else {
          varTypes.add(type)
        }
      }
    })
    
    if (varTypes.size > 0) {
      explanation += '• Uses data types: ' + Array.from(varTypes).join(', ') + '\n'
    }
    
    return explanation
  }

  private analyzeStructures(): string {
    const structs = this.code.match(/struct\s+(\w+)\s*\{([^}]+)\}/g)
    if (!structs || structs.length === 0) return ''
    
    let explanation = '🏗️ **Data Structures:**\n'
    
    structs.forEach(struct => {
      const match = struct.match(/struct\s+(\w+)\s*\{([^}]+)\}/)
      if (match) {
        const name = match[1]
        const members = match[2].split(';').filter(m => m.trim()).length
        explanation += `• struct ${name} - Custom type with ${members} member variables\n`
      }
    })
    
    return explanation
  }

  private analyzeLogic(): string {
    let explanation = ''
    const logicElements = []
    
    // Check for loops
    const forLoops = (this.code.match(/for\s*\(/g) || []).length
    const whileLoops = (this.code.match(/while\s*\(/g) || []).length
    
    if (forLoops > 0) logicElements.push(`${forLoops} for loop${forLoops > 1 ? 's' : ''}`)
    if (whileLoops > 0) logicElements.push(`${whileLoops} while loop${whileLoops > 1 ? 's' : ''}`)
    
    // Check for conditions
    const ifStatements = (this.code.match(/if\s*\(/g) || []).length
    if (ifStatements > 0) logicElements.push(`${ifStatements} conditional statement${ifStatements > 1 ? 's' : ''}`)
    
    // Check for arrays
    const arrays = (this.code.match(/\w+\[\d*\]/g) || []).length
    if (arrays > 0) logicElements.push(`${arrays} array${arrays > 1 ? 's' : ''}`)
    
    if (logicElements.length > 0) {
      explanation = '⚡ **Program Logic:**\n• Contains ' + logicElements.join(', ') + '\n'
    }
    
    return explanation
  }

  private analyzeMemory(): string {
    const mallocCalls = (this.code.match(/malloc|calloc/g) || []).length
    const freeCalls = (this.code.match(/free\s*\(/g) || []).length
    
    if (mallocCalls === 0) return ''
    
    let explanation = '💾 **Memory Management:**\n'
    explanation += `• Allocates memory ${mallocCalls} time${mallocCalls > 1 ? 's' : ''}\n`
    
    if (freeCalls === 0) {
      explanation += '• ⚠️ Warning: No memory is freed (potential memory leak)\n'
    } else if (freeCalls < mallocCalls) {
      explanation += '• ⚠️ Warning: Some memory may not be freed\n'
    } else {
      explanation += '• ✅ Memory is properly freed\n'
    }
    
    return explanation
  }

  private estimateMemoryUsage(): { stackUsed: number; heapUsed: number; activeFrames: number; memoryLeaks: number } {
    const variables = this.code.match(/\b(int|char|float|double)\s+\w+/g) || []
    const functions = this.code.match(/\w+\s+\w+\s*\([^)]*\)\s*\{/g) || []
    const mallocCalls = this.code.match(/malloc|calloc/g) || []
    const freeCalls = this.code.match(/free\s*\(/g) || []
    const arrays = this.code.match(/\w+\s+\w+\s*\[\d+\]/g) || []

    let stackUsed = 0
    
    // Calculate basic variable sizes
    variables.forEach(variable => {
      if (variable.includes('int') || variable.includes('float')) stackUsed += 4
      else if (variable.includes('double')) stackUsed += 8
      else if (variable.includes('char')) stackUsed += 1
    })

    // Add array sizes
    arrays.forEach(array => {
      const sizeMatch = array.match(/\[(\d+)\]/)
      if (sizeMatch) {
        const size = parseInt(sizeMatch[1])
        stackUsed += size * 4 // Assume int arrays
      }
    })

    // Function overhead
    stackUsed += functions.length * 16

    return {
      stackUsed: Math.min(stackUsed, 1024),
      heapUsed: mallocCalls.length * 32,
      activeFrames: Math.max(1, functions.length),
      memoryLeaks: Math.max(0, mallocCalls.length - freeCalls.length)
    }
  }
}