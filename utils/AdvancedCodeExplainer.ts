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
      summary: this.generateAdvancedSummary(),
      explanations: this.generateAdvancedExplanations(),
      memoryUsage: this.estimateMemoryUsage()
    }
  }

  private generateAdvancedSummary(): string {
    // Detect algorithm patterns
    const isBST = /typedef struct.*Node.*left.*right/s.test(this.code) && /insert.*root.*value/s.test(this.code)
    const isLinkedList = /typedef struct.*Node.*next/s.test(this.code)
    const isRecursive = /(\w+)\s*\([^)]*\).*\1\s*\(/s.test(this.code)
    const hasTraversal = /inorder|preorder|postorder|traverse/i.test(this.code)
    const hasSorting = /sort|bubble|quick|merge|selection/i.test(this.code)
    const hasSearching = /search|find|binary.*search/i.test(this.code)
    const hasDP = /dp\[|memo\[|dynamic.*programming/i.test(this.code)
    
    if (isBST) {
      return "This implements a Binary Search Tree (BST) - a hierarchical data structure where each node has at most two children, with left children smaller and right children larger than the parent. BSTs provide O(log n) average-case search, insertion, and deletion operations."
    }
    
    if (isLinkedList) {
      return "This implements a Linked List - a linear data structure where elements are stored in nodes connected via pointers. Unlike arrays, linked lists allow dynamic memory allocation and efficient insertion/deletion at any position."
    }
    
    if (hasSorting) {
      return "This implements a sorting algorithm to arrange data in a specific order. Sorting is fundamental in computer science as it enables efficient searching and data organization."
    }
    
    if (hasSearching) {
      return "This implements a searching algorithm to find specific elements in a data structure. Efficient searching is crucial for database operations and information retrieval."
    }
    
    if (hasDP) {
      return "This uses Dynamic Programming - an optimization technique that solves complex problems by breaking them into simpler subproblems and storing results to avoid redundant calculations."
    }
    
    // Default analysis
    const hasPointers = /\*\w+/.test(this.code)
    const hasStructs = /typedef struct|struct\s+\w+/.test(this.code)
    const hasRecursion = isRecursive
    
    if (hasStructs && hasPointers && hasRecursion) {
      return "This is an advanced C program implementing custom data structures with pointer manipulation and recursive algorithms - fundamental concepts in systems programming and algorithm design."
    }
    
    return "This C program demonstrates core programming concepts including data structures, memory management, and algorithmic thinking."
  }

  private generateAdvancedExplanations(): ExplanationItem[] {
    const explanations: ExplanationItem[] = []
    
    this.explainDataStructures(explanations)
    this.explainAlgorithms(explanations)
    this.explainMemoryManagement(explanations)
    this.explainPointerConcepts(explanations)
    this.explainRecursion(explanations)
    this.explainComplexity(explanations)
    this.explainBestPractices(explanations)
    
    return explanations
  }

  private explainDataStructures(explanations: ExplanationItem[]): void {
    // Detect BST
    if (/typedef struct.*Node.*left.*right/s.test(this.code)) {
      explanations.push({
        title: "Binary Search Tree Implementation",
        text: "This creates a BST where each node contains data and two pointers (left/right). The BST property ensures left subtree values < parent < right subtree values. This enables O(log n) operations in balanced trees, making it efficient for searching, insertion, and deletion compared to linear structures like arrays."
      })
    }
    
    // Detect Linked List
    if (/typedef struct.*Node.*next/s.test(this.code)) {
      explanations.push({
        title: "Linked List Structure",
        text: "Uses a linked list where each node contains data and a pointer to the next node. Unlike arrays with fixed memory locations, linked lists use dynamic allocation, allowing efficient insertion/deletion anywhere in the list without shifting elements. Trade-off: O(1) insertion but O(n) random access."
      })
    }
    
    // Detect Arrays
    if (/\w+\s+\w+\[\d*\]/.test(this.code)) {
      explanations.push({
        title: "Array Usage",
        text: "Arrays provide contiguous memory storage with O(1) random access via indexing. They're cache-friendly due to spatial locality but have fixed size limitations. Perfect for scenarios requiring frequent element access by position."
      })
    }
  }

  private explainAlgorithms(explanations: ExplanationItem[]): void {
    // Tree traversal
    if (/inorder|preorder|postorder/i.test(this.code)) {
      if (/inorder/i.test(this.code)) {
        explanations.push({
          title: "Inorder Traversal Algorithm",
          text: "Inorder traversal (Left → Root → Right) visits BST nodes in sorted order. This is crucial because it leverages the BST property to output elements in ascending sequence without explicit sorting. The recursive nature elegantly handles the tree structure, making it a classic example of divide-and-conquer."
        })
      }
    }
    
    // Insertion algorithm
    if (/insert.*root.*value/s.test(this.code)) {
      explanations.push({
        title: "BST Insertion Algorithm",
        text: "The insertion algorithm maintains BST property by recursively comparing values: go left if smaller, right if larger. This ensures the tree remains searchable. The base case (root == NULL) creates new nodes, while recursive calls build the path. Time complexity: O(log n) average, O(n) worst case (skewed tree)."
      })
    }
    
    // Search patterns
    if (/search|find/i.test(this.code)) {
      explanations.push({
        title: "Search Algorithm",
        text: "Implements efficient searching by leveraging data structure properties. In BSTs, binary search eliminates half the search space at each step, achieving O(log n) complexity. This is exponentially faster than linear search O(n) in unsorted data."
      })
    }
  }

  private explainMemoryManagement(explanations: ExplanationItem[]): void {
    const hasMalloc = /malloc|calloc/.test(this.code)
    const hasFree = /free\s*\(/.test(this.code)
    
    if (hasMalloc) {
      explanations.push({
        title: "Dynamic Memory Allocation",
        text: "Uses malloc() to allocate memory on the heap at runtime. This enables creating data structures of unknown size and prevents stack overflow for large datasets. Each malloc() must be paired with free() to prevent memory leaks. The heap provides more space than the stack but requires manual management."
      })
    }
    
    if (hasFree) {
      explanations.push({
        title: "Memory Deallocation Strategy",
        text: "Implements proper memory cleanup using free(). The postorder traversal for freeing ensures child nodes are freed before parents, preventing access to deallocated memory. Setting pointers to NULL after freeing prevents dangling pointer bugs - a common source of crashes and security vulnerabilities."
      })
    }
    
    // Detect memory leaks
    const mallocCount = (this.code.match(/malloc|calloc/g) || []).length
    const freeCount = (this.code.match(/free\s*\(/g) || []).length
    
    if (mallocCount > freeCount) {
      explanations.push({
        title: "Memory Leak Warning",
        text: `Potential memory leak detected: ${mallocCount} allocations vs ${freeCount} deallocations. Each malloc() should have a corresponding free(). Memory leaks cause programs to consume increasing memory over time, eventually leading to system slowdown or crashes.`
      })
    }
  }

  private explainPointerConcepts(explanations: ExplanationItem[]): void {
    if (/\*\w+/.test(this.code)) {
      explanations.push({
        title: "Pointer Mechanics",
        text: "Pointers store memory addresses, enabling indirect data access and dynamic structures. The -> operator dereferences structure pointers (syntactic sugar for (*ptr).member). Pointers enable efficient parameter passing (pass by reference) and are essential for implementing linked data structures like trees and lists."
      })
    }
    
    // Detect double pointers or complex pointer usage
    if (/\*\*\w+/.test(this.code)) {
      explanations.push({
        title: "Advanced Pointer Usage",
        text: "Uses double pointers (pointer to pointer) for scenarios requiring modification of pointer values themselves. Common in functions that need to change what a pointer points to, such as inserting at the head of a linked list or implementing dynamic arrays."
      })
    }
  }

  private explainRecursion(explanations: ExplanationItem[]): void {
    // Detect recursive functions
    const recursiveFunctions = this.findRecursiveFunctions()
    
    if (recursiveFunctions.length > 0) {
      explanations.push({
        title: "Recursive Algorithm Design",
        text: `Functions like ${recursiveFunctions.join(', ')} use recursion - a powerful technique where functions call themselves with modified parameters. Recursion naturally matches tree structures: base case handles empty nodes, recursive case processes current node and delegates subtrees. This creates elegant, readable code for hierarchical data.`
      })
      
      // Check for tail recursion
      if (this.hasTailRecursion()) {
        explanations.push({
          title: "Tail Recursion Optimization",
          text: "Some recursive calls are in tail position (last operation before return), enabling compiler optimization to convert recursion into iteration. This prevents stack overflow for deep recursion by reusing the same stack frame."
        })
      }
    }
  }

  private explainComplexity(explanations: ExplanationItem[]): void {
    // BST complexity analysis
    if (/typedef struct.*Node.*left.*right/s.test(this.code)) {
      explanations.push({
        title: "Time & Space Complexity Analysis",
        text: "BST operations: O(log n) average case for balanced trees, O(n) worst case for skewed trees. Space complexity: O(n) for storage + O(log n) average recursion depth. The performance depends heavily on input order - random insertion creates balanced trees, sorted input creates linked-list-like structures."
      })
    }
    
    // General complexity hints
    const hasNestedLoops = /for.*for|while.*while/s.test(this.code)
    if (hasNestedLoops) {
      explanations.push({
        title: "Complexity Warning",
        text: "Nested loops detected - this typically indicates O(n²) or higher time complexity. Consider if the algorithm can be optimized using better data structures (hash tables, heaps) or algorithmic techniques (divide-and-conquer, dynamic programming)."
      })
    }
  }

  private explainBestPractices(explanations: ExplanationItem[]): void {
    const practices: string[] = []
    
    // Check for typedef usage
    if (/typedef struct/.test(this.code)) {
      practices.push("Uses typedef for cleaner syntax (Node* instead of struct Node*)")
    }
    
    // Check for null checks
    if (/== NULL|!= NULL/.test(this.code)) {
      practices.push("Implements proper null pointer checks to prevent segmentation faults")
    }
    
    // Check for const usage
    if (/const\s+/.test(this.code)) {
      practices.push("Uses const keyword to prevent accidental modifications")
    }
    
    // Check for meaningful names
    if (/createNode|insert|traverse|inorder/i.test(this.code)) {
      practices.push("Uses descriptive function names that clearly indicate purpose")
    }
    
    if (practices.length > 0) {
      explanations.push({
        title: "Programming Best Practices",
        text: practices.join('. ') + '. These practices improve code readability, maintainability, and reduce bugs.'
      })
    }
    
    // Suggest improvements
    const improvements: string[] = []
    
    if (!/const/.test(this.code) && /\*/.test(this.code)) {
      improvements.push("Consider using const for read-only parameters")
    }
    
    if (!/static/.test(this.code) && /^[a-z].*\(/m.test(this.code)) {
      improvements.push("Consider making helper functions static to limit scope")
    }
    
    if (improvements.length > 0) {
      explanations.push({
        title: "Potential Improvements",
        text: improvements.join('. ') + '. These changes would enhance code quality and performance.'
      })
    }
  }

  private findRecursiveFunctions(): string[] {
    const functions: string[] = []
    const functionRegex = /(\w+)\s*\([^)]*\)\s*\{[^}]*\1\s*\(/gs
    let match
    
    while ((match = functionRegex.exec(this.code)) !== null) {
      functions.push(match[1])
    }
    
    return functions
  }

  private hasTailRecursion(): boolean {
    // Simple heuristic: return statement directly calls the function
    return /return\s+\w+\s*\([^)]*\)\s*;/.test(this.code)
  }

  private estimateMemoryUsage(): { stackUsed: number; heapUsed: number; activeFrames: number; memoryLeaks: number } {
    const variables = this.code.match(/\b(int|char|float|double)\s+\w+/g) || []
    const functions = this.code.match(/\w+\s+\w+\s*\([^)]*\)\s*\{/g) || []
    const mallocCalls = this.code.match(/malloc|calloc/g) || []
    const freeCalls = this.code.match(/free\s*\(/g) || []
    const arrays = this.code.match(/\w+\s+\w+\s*\[\d+\]/g) || []
    const structs = this.code.match(/typedef struct|struct\s+\w+/g) || []

    let stackUsed = 0
    
    // Calculate variable sizes
    variables.forEach(variable => {
      if (variable.includes('int') || variable.includes('float')) stackUsed += 4
      else if (variable.includes('double')) stackUsed += 8
      else if (variable.includes('char')) stackUsed += 1
    })

    // Add struct sizes (estimate)
    stackUsed += structs.length * 16

    // Add array sizes
    arrays.forEach(array => {
      const sizeMatch = array.match(/\[(\d+)\]/)
      if (sizeMatch) {
        const size = parseInt(sizeMatch[1])
        stackUsed += size * 4
      }
    })

    // Function call overhead + recursion depth estimate
    const recursiveDepth = this.estimateRecursionDepth()
    stackUsed += functions.length * 16 * recursiveDepth

    return {
      stackUsed: Math.min(stackUsed, 2048),
      heapUsed: mallocCalls.length * 48, // Estimate node size
      activeFrames: Math.max(1, functions.length * recursiveDepth),
      memoryLeaks: Math.max(0, mallocCalls.length - freeCalls.length)
    }
  }

  private estimateRecursionDepth(): number {
    // Estimate based on algorithm type
    if (/typedef struct.*Node.*left.*right/s.test(this.code)) {
      return 10 // Typical BST depth
    }
    if (/fibonacci|factorial/i.test(this.code)) {
      return 20 // Deep recursion
    }
    return 3 // Default shallow recursion
  }
}