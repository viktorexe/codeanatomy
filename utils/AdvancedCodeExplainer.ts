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
      summary: this.analyzePurpose(),
      explanations: this.generateExplanations(),
      memoryUsage: this.estimateMemoryUsage()
    }
  }

  private analyzePurpose(): string {
    // Find main function
    const mainStart = this.code.indexOf('int main')
    if (mainStart === -1) return "Program structure without main function."
    
    const mainCode = this.code.substring(mainStart)
    const braceStart = mainCode.indexOf('{')
    if (braceStart === -1) return "Invalid main function structure."
    
    // Extract main body (simple approach)
    const mainBody = mainCode.substring(braceStart + 1, mainCode.lastIndexOf('}'))
    
    // Check actual operations in main
    const hasInsert = /insert\s*\(/.test(mainBody)
    const hasTraversal = /inorder\s*\(|preorder\s*\(|postorder\s*\(/.test(mainBody)
    const hasPrint = /printf\s*\(/.test(mainBody)
    const hasLoop = /for\s*\(|while\s*\(/.test(mainBody)
    const hasFree = /free\s*\(/.test(mainBody)
    const hasArray = /\[\s*\d+\s*\]/.test(mainBody)
    
    let purpose = ""
    
    if (hasInsert && hasTraversal) {
      purpose = "Builds a binary search tree by inserting values and performs inorder traversal to display sorted output."
    } else if (hasInsert) {
      purpose = "Creates and populates a data structure through insertion operations."
    } else if (hasLoop && hasArray) {
      purpose = "Processes array elements using loops."
    } else if (hasPrint) {
      purpose = "Displays output to console."
    } else {
      purpose = "Executes a sequence of operations defined in main function."
    }
    
    return purpose
  }

  private generateExplanations(): ExplanationItem[] {
    const explanations: ExplanationItem[] = []
    
    this.explainKeyComponents(explanations)
    this.explainHowItWorks(explanations)
    this.explainImportantConcepts(explanations)
    this.explainComplexityAndSafety(explanations)
    
    return explanations
  }

  private explainKeyComponents(explanations: ExplanationItem[]): void {
    const components: string[] = []
    
    // Check for actual structs
    const structMatches = this.code.match(/typedef\s+struct\s+\w*\s*\{[^}]+\}\s*(\w+);/g)
    if (structMatches) {
      structMatches.forEach(match => {
        const nameMatch = match.match(/\}\s*(\w+);/)
        if (nameMatch) {
          const members = match.match(/\{([^}]+)\}/)?.[1]
          const memberCount = members ? members.split(';').filter(m => m.trim()).length : 0
          components.push(`${nameMatch[1]} struct (${memberCount} members)`)
        }
      })
    }
    
    // Check for actual functions (excluding main)
    const functionMatches = this.code.match(/(\w+)\s+(\w+)\s*\([^)]*\)\s*\{/g)
    if (functionMatches) {
      functionMatches.forEach(match => {
        const funcMatch = match.match(/(\w+)\s+(\w+)\s*\(/)
        if (funcMatch && funcMatch[2] !== 'main') {
          components.push(`${funcMatch[2]}() function`)
        }
      })
    }
    
    // Check for arrays
    const arrayMatches = this.code.match(/\w+\s+\w+\[\d+\]/g)
    if (arrayMatches) {
      arrayMatches.forEach(match => {
        const arrMatch = match.match(/(\w+)\s+(\w+)\[(\d+)\]/)
        if (arrMatch) {
          components.push(`${arrMatch[2]}[${arrMatch[3]}] array`)
        }
      })
    }
    
    if (components.length > 0) {
      explanations.push({
        title: "Key Components",
        text: components.join(', ') + '.'
      })
    }
  }

  private explainHowItWorks(explanations: ExplanationItem[]): void {
    const mainStart = this.code.indexOf('int main')
    if (mainStart === -1) return

    const mainCode = this.code.substring(mainStart)
    const braceStart = mainCode.indexOf('{')
    if (braceStart === -1) return
    
    const mainBody = mainCode.substring(braceStart + 1, mainCode.lastIndexOf('}'))
    const steps: string[] = []
    
    // Analyze main() execution flow
    if (/\w+\*\s+\w+\s*=\s*NULL/.test(mainBody)) {
      steps.push("Initializes root pointer to NULL")
    }
    
    if (/\w+\s+\w+\[\s*\]\s*=/.test(mainBody)) {
      steps.push("Declares and initializes array with values")
    }
    
    if (/for\s*\([^)]*\)/.test(mainBody)) {
      const forMatch = mainBody.match(/for\s*\([^)]*\)/)
      if (forMatch && /insert/.test(mainBody)) {
        steps.push("Loops through array inserting each value into tree")
      } else if (forMatch) {
        steps.push("Iterates through elements using for loop")
      }
    }
    
    if (/printf.*traversal/i.test(mainBody)) {
      steps.push("Prints traversal label")
    }
    
    if (/inorder\s*\(/.test(mainBody)) {
      steps.push("Performs inorder traversal to display sorted values")
    }
    
    if (/printf.*\\n/.test(mainBody)) {
      steps.push("Prints newline for formatting")
    }
    
    if (/freeTree\s*\(/.test(mainBody)) {
      steps.push("Frees all allocated memory")
    }
    
    if (/\w+\s*=\s*NULL/.test(mainBody) && /free/.test(this.code)) {
      steps.push("Sets root to NULL preventing dangling pointer")
    }
    
    if (steps.length > 0) {
      explanations.push({
        title: "How It Works",
        text: steps.join(' → ') + '.'
      })
    }
  }

  private explainImportantConcepts(explanations: ExplanationItem[]): void {
    const concepts: string[] = []
    
    // Check for actual recursion
    const recursiveFuncs = this.findActualRecursiveFunctions()
    if (recursiveFuncs.length > 0) {
      concepts.push(`Recursion in ${recursiveFuncs.join(', ')} functions`)
    }
    
    // Check for dynamic memory
    if (/malloc\s*\(/.test(this.code)) {
      concepts.push("Dynamic memory allocation with malloc()")
    }
    
    // Check for pointers
    if (/\*\w+/.test(this.code) && /->/.test(this.code)) {
      concepts.push("Pointer manipulation and structure access")
    }
    
    // Check for specific algorithms
    if (/insert.*root.*value/.test(this.code) && /left.*right/.test(this.code)) {
      concepts.push("Binary search tree insertion algorithm")
    }
    
    if (/inorder.*left.*printf.*right/.test(this.code.replace(/\s+/g, ' '))) {
      concepts.push("Inorder tree traversal (left-root-right)")
    }
    
    if (concepts.length > 0) {
      explanations.push({
        title: "Important Concepts",
        text: concepts.join(', ') + '.'
      })
    }
  }

  private explainComplexityAndSafety(explanations: ExplanationItem[]): void {
    const analysis: string[] = []
    
    // Time complexity based on actual operations
    if (/insert.*root/.test(this.code) && /left.*right/.test(this.code)) {
      analysis.push("BST operations: O(log n) average, O(n) worst case")
    }
    
    if (/inorder.*left.*right/.test(this.code.replace(/\s+/g, ' '))) {
      analysis.push("Traversal: O(n) time")
    }
    
    // Space complexity
    const hasRecursion = this.findActualRecursiveFunctions().length > 0
    if (hasRecursion) {
      analysis.push("O(log n) recursion stack space")
    }
    
    // Safety analysis
    const mallocCount = (this.code.match(/malloc\s*\(/g) || []).length
    const freeCount = (this.code.match(/free\s*\(/g) || []).length
    
    if (mallocCount > 0 && freeCount >= mallocCount) {
      analysis.push("Memory properly freed - no leaks")
    } else if (mallocCount > freeCount) {
      analysis.push(`Memory leak risk: ${mallocCount} malloc vs ${freeCount} free calls`)
    }
    
    // Null pointer checks
    if (/== NULL/.test(this.code)) {
      analysis.push("Includes null pointer safety checks")
    }
    
    if (analysis.length > 0) {
      explanations.push({
        title: "Complexity & Safety",
        text: analysis.join('. ') + '.'
      })
    }
  }

  private findActualRecursiveFunctions(): string[] {
    const functions: string[] = []
    
    // Simple approach to find recursive functions
    const lines = this.code.split('\n')
    let currentFunction = ''
    let inFunction = false
    
    for (const line of lines) {
      const funcMatch = line.match(/(\w+)\s+(\w+)\s*\([^)]*\)\s*\{/)
      if (funcMatch) {
        currentFunction = funcMatch[2]
        inFunction = true
        continue
      }
      
      if (inFunction && line.includes('}') && !line.includes('{')) {
        inFunction = false
        currentFunction = ''
        continue
      }
      
      if (inFunction && currentFunction && line.includes(currentFunction + '(')) {
        if (!functions.includes(currentFunction)) {
          functions.push(currentFunction)
        }
      }
    }
    
    return functions
  }

  private estimateMemoryUsage(): { stackUsed: number; heapUsed: number; activeFrames: number; memoryLeaks: number } {
    const variables = this.code.match(/\b(int|char|float|double)\s+\w+/g) || []
    const functions = this.code.match(/\w+\s+\w+\s*\([^)]*\)\s*\{/g) || []
    const mallocCalls = this.code.match(/malloc\s*\(/g) || []
    const freeCalls = this.code.match(/free\s*\(/g) || []
    const arrays = this.code.match(/\w+\s+\w+\s*\[\d+\]/g) || []

    let stackUsed = 0
    
    // Calculate actual variable sizes
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
        stackUsed += size * 4
      }
    })

    // Function overhead
    stackUsed += functions.length * 16

    return {
      stackUsed: Math.min(stackUsed, 1024),
      heapUsed: mallocCalls.length * 24,
      activeFrames: Math.max(1, functions.length),
      memoryLeaks: Math.max(0, mallocCalls.length - freeCalls.length)
    }
  }
}