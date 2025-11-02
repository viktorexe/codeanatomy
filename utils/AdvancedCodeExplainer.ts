interface ExplanationItem {
  title: string
  text: string
}

interface ProgramAnalysis {
  summary: string
  explanations: ExplanationItem[]
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
        explanations: [],
        memoryUsage: { stackUsed: 0, heapUsed: 0, activeFrames: 0, memoryLeaks: 0 }
      }
    }

    return {
      summary: this.generateSummary(),
      explanations: this.generateExplanations(),
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
    const hasIO = /printf|scanf/.test(this.code)
    
    let summary = 'This C program '
    
    if (hasMain) {
      summary += 'starts execution from the main function'
    } else {
      summary += 'contains function definitions'
    }
    
    const features = []
    if (hasIO) features.push('displays output or reads input')
    if (hasLoops) features.push('uses loops for repetition')
    if (hasArrays) features.push('works with arrays')
    if (hasPointers) features.push('uses pointers')
    if (hasStructs) features.push('defines custom data types')
    if (hasMalloc) features.push('allocates memory dynamically')
    
    if (features.length > 0) {
      summary += ' and ' + features.join(', ')
    }
    
    summary += '.'
    
    return summary
  }

  private generateExplanations(): ExplanationItem[] {
    const explanations: ExplanationItem[] = []
    
    // Check what the code contains and explain each part
    this.explainIncludes(explanations)
    this.explainFunctions(explanations)
    this.explainVariables(explanations)
    this.explainStructs(explanations)
    this.explainLoops(explanations)
    this.explainMemory(explanations)
    
    return explanations
  }

  private explainIncludes(explanations: ExplanationItem[]): void {
    const includes = this.code.match(/#include\s*[<"](.*?)[>"]/g)
    if (!includes) return
    
    const libs = []
    includes.forEach(include => {
      const match = include.match(/#include\s*[<"](.*?)[>"]/)
      if (match) {
        const lib = match[1]
        switch (lib) {
          case 'stdio.h':
            libs.push('stdio.h for input/output functions')
            break
          case 'stdlib.h':
            libs.push('stdlib.h for memory and utility functions')
            break
          case 'string.h':
            libs.push('string.h for text manipulation')
            break
          case 'math.h':
            libs.push('math.h for mathematical operations')
            break
          default:
            libs.push(`${lib} (custom header)`)
        }
      }
    })
    
    if (libs.length > 0) {
      explanations.push({
        title: 'Libraries Used',
        text: 'Includes ' + libs.join(', ') + ' to access additional functionality.'
      })
    }
  }

  private explainFunctions(explanations: ExplanationItem[]): void {
    const functions = this.code.match(/(\w+)\s+(\w+)\s*\([^)]*\)\s*\{/g)
    if (!functions) return
    
    const funcList = []
    functions.forEach(func => {
      const match = func.match(/(\w+)\s+(\w+)\s*\([^)]*\)/)
      if (match) {
        const returnType = match[1]
        const name = match[2]
        
        if (name === 'main') {
          funcList.push('main() - program entry point')
        } else {
          funcList.push(`${name}() - ${returnType === 'void' ? 'performs operations' : 'returns ' + returnType}`)
        }
      }
    })
    
    if (funcList.length > 0) {
      explanations.push({
        title: 'Functions',
        text: funcList.join(', ') + '.'
      })
    }
  }

  private explainVariables(explanations: ExplanationItem[]): void {
    const variables = this.code.match(/\b(int|char|float|double)\s+(\**)(\w+)/g)
    if (!variables) return
    
    const types = new Set()
    let hasPointers = false
    
    variables.forEach(variable => {
      const match = variable.match(/\b(int|char|float|double)\s+(\**)(\w+)/)
      if (match) {
        const type = match[1]
        const isPointer = match[2].length > 0
        
        types.add(type)
        if (isPointer) hasPointers = true
      }
    })
    
    let text = 'Uses ' + Array.from(types).join(', ') + ' data types'
    if (hasPointers) text += ' and pointers for memory access'
    text += '.'
    
    explanations.push({
      title: 'Variables',
      text: text
    })
  }

  private explainStructs(explanations: ExplanationItem[]): void {
    const structs = this.code.match(/struct\s+(\w+)\s*\{([^}]+)\}/g)
    if (!structs) return
    
    const structList = []
    structs.forEach(struct => {
      const match = struct.match(/struct\s+(\w+)\s*\{([^}]+)\}/)
      if (match) {
        const name = match[1]
        const members = match[2].split(';').filter(m => m.trim()).length
        structList.push(`${name} (${members} members)`)
      }
    })
    
    if (structList.length > 0) {
      explanations.push({
        title: 'Custom Data Types',
        text: 'Defines struct ' + structList.join(', ') + ' to group related data together.'
      })
    }
  }

  private explainLoops(explanations: ExplanationItem[]): void {
    const forLoops = (this.code.match(/for\s*\(/g) || []).length
    const whileLoops = (this.code.match(/while\s*\(/g) || []).length
    const ifStatements = (this.code.match(/if\s*\(/g) || []).length
    
    const controls = []
    if (forLoops > 0) controls.push(`${forLoops} for loop${forLoops > 1 ? 's' : ''}`)
    if (whileLoops > 0) controls.push(`${whileLoops} while loop${whileLoops > 1 ? 's' : ''}`)
    if (ifStatements > 0) controls.push(`${ifStatements} if statement${ifStatements > 1 ? 's' : ''}`)
    
    if (controls.length > 0) {
      explanations.push({
        title: 'Control Flow',
        text: 'Contains ' + controls.join(', ') + ' to control program execution.'
      })
    }
  }

  private explainMemory(explanations: ExplanationItem[]): void {
    const mallocCalls = (this.code.match(/malloc|calloc/g) || []).length
    const freeCalls = (this.code.match(/free\s*\(/g) || []).length
    
    if (mallocCalls > 0) {
      let text = `Allocates memory dynamically ${mallocCalls} time${mallocCalls > 1 ? 's' : ''}`
      
      if (freeCalls === 0) {
        text += '. Warning: Memory is not freed (potential leak).'
      } else if (freeCalls < mallocCalls) {
        text += '. Warning: Some memory may not be freed.'
      } else {
        text += ' and properly frees it.'
      }
      
      explanations.push({
        title: 'Memory Management',
        text: text
      })
    }
  }

  private estimateMemoryUsage(): { stackUsed: number; heapUsed: number; activeFrames: number; memoryLeaks: number } {
    const variables = this.code.match(/\b(int|char|float|double)\s+\w+/g) || []
    const functions = this.code.match(/\w+\s+\w+\s*\([^)]*\)\s*\{/g) || []
    const mallocCalls = this.code.match(/malloc|calloc/g) || []
    const freeCalls = this.code.match(/free\s*\(/g) || []
    const arrays = this.code.match(/\w+\s+\w+\s*\[\d+\]/g) || []

    let stackUsed = 0
    
    // Basic variable sizes
    variables.forEach(variable => {
      if (variable.includes('int') || variable.includes('float')) stackUsed += 4
      else if (variable.includes('double')) stackUsed += 8
      else if (variable.includes('char')) stackUsed += 1
    })

    // Array sizes
    arrays.forEach(array => {
      const sizeMatch = array.match(/\[(\d+)\]/)
      if (sizeMatch) {
        const size = parseInt(sizeMatch[1])
        stackUsed += size * 4
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