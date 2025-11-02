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
  private lines: string[] = []

  analyze(code: string): ProgramAnalysis {
    this.code = code.trim()
    this.lines = this.code.split('\n').filter(line => line.trim())

    if (!this.code) {
      return {
        summary: 'No code provided for analysis.',
        detailedExplanation: 'Please paste your C code in the left panel to get a comprehensive analysis of what your program does, how it works, and how it uses memory.',
        memoryUsage: { stackUsed: 0, heapUsed: 0, activeFrames: 0, memoryLeaks: 0 }
      }
    }

    const summary = this.generateSummary()
    const detailedExplanation = this.generateDetailedExplanation()
    const memoryUsage = this.estimateMemoryUsage()

    return { summary, detailedExplanation, memoryUsage }
  }

  private generateSummary(): string {
    const lineCount = this.lines.length
    const complexity = this.determineComplexity()
    const features = this.detectFeatures()
    
    let summary = `This ${complexity.toLowerCase()} C program spans ${lineCount} lines and `
    
    if (features.hasMain) {
      summary += 'contains a main function as its entry point. '
    }
    
    if (features.functionCount > 1) {
      summary += `It defines ${features.functionCount} functions in total, promoting code modularity and reusability. `
    }
    
    if (features.hasStructs) {
      summary += 'The program utilizes custom data structures (structs) to organize related data efficiently. '
    }
    
    if (features.hasDynamicMemory) {
      summary += 'It employs dynamic memory allocation for flexible memory management during runtime. '
    }
    
    if (features.hasPointers) {
      summary += 'Pointer operations are used for indirect memory access and efficient data manipulation. '
    }
    
    if (features.hasArrays) {
      summary += 'Arrays are implemented to handle collections of related data elements. '
    }
    
    if (features.hasLoops) {
      summary += 'The program includes iterative constructs (loops) for repetitive operations. '
    }
    
    if (features.hasIO) {
      summary += 'Input/output operations facilitate interaction with the user or external systems. '
    }

    return summary
  }

  private generateDetailedExplanation(): string {
    let explanation = ''
    
    // Program structure analysis
    explanation += this.analyzeIncludes()
    explanation += this.analyzeDataTypes()
    explanation += this.analyzeFunctions()
    explanation += this.analyzeVariables()
    explanation += this.analyzeControlFlow()
    explanation += this.analyzeMemoryManagement()
    explanation += this.analyzeInputOutput()
    explanation += this.analyzeComplexity()
    explanation += this.analyzeOptimizations()
    
    return explanation
  }

  private analyzeIncludes(): string {
    const includes = this.code.match(/#include\s*[<"](.*?)[>"]/g) || []
    if (includes.length === 0) return ''
    
    let explanation = 'HEADER FILES AND LIBRARIES: '
    
    includes.forEach(include => {
      const headerMatch = include.match(/#include\s*[<"](.*?)[>"]/)
      if (headerMatch) {
        const header = headerMatch[1]
        
        switch (header) {
          case 'stdio.h':
            explanation += `The program includes stdio.h (Standard Input/Output Header), which is fundamental for C programming as it provides essential functions for input and output operations. This header gives access to printf() for formatted output to the console, scanf() for reading user input, fgets() for safe string input, fputs() for string output, and file handling functions like fopen(), fclose(), fread(), and fwrite(). Without this header, the program would not be able to communicate with the user or handle basic I/O operations. `
            break
          case 'stdlib.h':
            explanation += `The stdlib.h (Standard Library Header) inclusion provides access to general-purpose functions that are crucial for memory management and utility operations. This header enables dynamic memory allocation through malloc() which reserves memory blocks during runtime, calloc() which allocates and initializes memory to zero, realloc() which resizes previously allocated memory blocks, and free() which releases allocated memory back to the system. Additionally, it provides process control functions like exit() for program termination, system() for executing system commands, and utility functions such as atoi() for string-to-integer conversion, rand() for random number generation, and qsort() for sorting arrays. `
            break
          case 'string.h':
            explanation += `The string.h header is included to provide comprehensive string manipulation capabilities. This library offers functions like strlen() to calculate string length, strcpy() and strncpy() for copying strings safely, strcmp() and strncmp() for comparing strings lexicographically, strcat() and strncat() for concatenating strings, strchr() and strstr() for searching within strings, and memcpy() and memset() for low-level memory operations. These functions are essential when the program needs to process text data, manipulate character arrays, or perform any string-related operations efficiently and safely. `
            break
          case 'math.h':
            explanation += `The math.h header provides access to mathematical functions and constants that extend the program's computational capabilities beyond basic arithmetic. This includes trigonometric functions like sin(), cos(), tan(), and their inverse counterparts, exponential and logarithmic functions such as exp(), log(), log10(), power functions like pow() and sqrt(), rounding functions including ceil(), floor(), and round(), and mathematical constants like M_PI and M_E. When this header is included, the program typically performs complex mathematical calculations, scientific computations, or engineering calculations that require precision and advanced mathematical operations. `
            break
          case 'ctype.h':
            explanation += `The ctype.h header provides character classification and conversion functions that are invaluable for text processing and input validation. This library includes functions like isalpha() to check if a character is alphabetic, isdigit() to verify numeric characters, isalnum() for alphanumeric validation, isspace() for whitespace detection, isupper() and islower() for case checking, and toupper() and tolower() for case conversion. These functions are particularly useful when the program needs to parse user input, validate data formats, process text files, or implement custom parsing logic with proper character handling. `
            break
          default:
            explanation += `The program includes a custom header file "${header}" which likely contains application-specific function declarations, constant definitions, type definitions, or macro definitions that are essential for this particular program's functionality. Custom headers promote code organization, reusability, and modularity by separating interface declarations from implementation details. `
        }
      }
    })
    
    explanation += '\n\n'
    return explanation
  }

  private analyzeDataTypes(): string {
    let explanation = ''
    
    // Analyze structs
    const structs = this.code.match(/struct\s+(\w+)\s*\{([^}]+)\}/g) || []
    if (structs.length > 0) {
      explanation += 'CUSTOM DATA STRUCTURES: '
      
      structs.forEach(structDef => {
        const structMatch = structDef.match(/struct\s+(\w+)\s*\{([^}]+)\}/)
        if (structMatch) {
          const structName = structMatch[1]
          const members = structMatch[2].trim().split(';').filter(m => m.trim())
          
          explanation += `The program defines a custom structure named "${structName}" which serves as a blueprint for creating complex data types that group related information together. This structure contains ${members.length} member variables: `
          
          members.forEach((member, index) => {
            const memberTrimmed = member.trim()
            if (memberTrimmed) {
              explanation += `${memberTrimmed.replace(/\s+/g, ' ')}`
              if (index < members.length - 1) explanation += ', '
            }
          })
          
          explanation += `. Structures like this are fundamental in C programming for modeling real-world entities, organizing related data efficiently, and creating more maintainable code. When variables of this struct type are declared, memory is allocated to store all member variables contiguously, allowing efficient access and manipulation of the grouped data. The structure promotes data encapsulation and helps prevent errors by keeping related information together in a single, well-defined unit. `
        }
      })
      
      explanation += '\n\n'
    }
    
    // Analyze arrays
    const arrays = this.code.match(/(\w+)\s+(\w+)\s*\[([^\]]*)\]/g) || []
    if (arrays.length > 0) {
      explanation += 'ARRAY DECLARATIONS: '
      
      arrays.forEach(arrayDef => {
        const arrayMatch = arrayDef.match(/(\w+)\s+(\w+)\s*\[([^\]]*)\]/)
        if (arrayMatch) {
          const type = arrayMatch[1]
          const name = arrayMatch[2]
          const size = arrayMatch[3]
          
          explanation += `The program declares an array named "${name}" of type ${type}, which creates a collection of ${size ? size : 'dynamically determined'} elements stored in contiguous memory locations. Arrays are fundamental data structures that allow efficient storage and access of multiple values of the same type using a single variable name and index-based addressing. Each element can be accessed using zero-based indexing (${name}[0] through ${name}[${size ? parseInt(size) - 1 : 'size-1'}]), enabling efficient iteration and random access to any element. The memory layout ensures that elements are stored sequentially, which provides excellent cache locality and performance for operations that process multiple elements. `
        }
      })
      
      explanation += '\n\n'
    }
    
    return explanation
  }

  private analyzeFunctions(): string {
    const functions = this.code.match(/(\w+)\s+(\w+)\s*\(([^)]*)\)\s*\{/g) || []
    if (functions.length === 0) return ''
    
    let explanation = 'FUNCTION DEFINITIONS AND PROGRAM STRUCTURE: '
    
    functions.forEach(funcDef => {
      const funcMatch = funcDef.match(/(\w+)\s+(\w+)\s*\(([^)]*)\)\s*\{/)
      if (funcMatch) {
        const returnType = funcMatch[1]
        const funcName = funcMatch[2]
        const params = funcMatch[3].trim()
        
        if (funcName === 'main') {
          explanation += `The main() function serves as the program's entry point and execution starting location. Every C program must contain exactly one main function, as it's where the operating system begins program execution. This function has a return type of ${returnType}, which ${returnType === 'int' ? 'follows the standard convention of returning an integer status code to the operating system (typically 0 for success, non-zero for error conditions)' : 'indicates a non-standard main function signature'}. `
          
          if (params) {
            explanation += `The main function accepts parameters (${params}), which typically represent command-line arguments passed to the program when it's executed. These parameters allow the program to receive input from the command line, making it more flexible and interactive. `
          } else {
            explanation += `The main function takes no parameters, indicating that this program doesn't process command-line arguments and operates independently of external input parameters. `
          }
        } else {
          explanation += `The program defines a user-defined function named "${funcName}" with return type ${returnType}. `
          
          if (returnType === 'void') {
            explanation += `Since it returns void, this function performs operations or computations but doesn't return any value to the calling code. It likely modifies global variables, performs I/O operations, or changes the state of data structures passed by reference. `
          } else {
            explanation += `This function returns a ${returnType} value, meaning it computes and provides a result that can be used by the calling code. The returned value represents the outcome of the function's computation and can be assigned to variables, used in expressions, or passed to other functions. `
          }
          
          if (params) {
            const paramCount = params.split(',').length
            explanation += `The function accepts ${paramCount} parameter${paramCount > 1 ? 's' : ''} (${params}), which ${paramCount === 1 ? 'provides' : 'provide'} the input data necessary for the function to perform its operations. Parameters enable the function to work with different data each time it's called, making it reusable and flexible. `
          } else {
            explanation += `This function takes no parameters, indicating it either works with global variables, performs operations that don't require input data, or generates results based on internal logic or constants. `
          }
          
          explanation += `User-defined functions like this promote code modularity, reusability, and maintainability by encapsulating specific functionality into discrete, testable units. `
        }
      }
    })
    
    explanation += '\n\n'
    return explanation
  }

  private analyzeVariables(): string {
    const variables = this.code.match(/\b(int|char|float|double|long|short|unsigned)\s+(\**)(\w+)(?:\s*=\s*([^;,]+))?/g) || []
    if (variables.length === 0) return ''
    
    let explanation = 'VARIABLE DECLARATIONS AND MEMORY ALLOCATION: '
    
    variables.forEach(varDef => {
      const varMatch = varDef.match(/\b(int|char|float|double|long|short|unsigned)\s+(\**)(\w+)(?:\s*=\s*([^;,]+))?/)
      if (varMatch) {
        const type = varMatch[1]
        const pointerLevel = varMatch[2].length
        const name = varMatch[3]
        const initialValue = varMatch[4]
        
        explanation += `The program declares a variable named "${name}" of type ${type}${pointerLevel > 0 ? ' pointer' : ''}. `
        
        if (pointerLevel > 0) {
          explanation += `This is a ${pointerLevel}-level pointer, meaning it stores the memory address of ${pointerLevel === 1 ? 'a variable' : 'another pointer'} rather than a direct value. Pointers are powerful features in C that enable indirect memory access, dynamic memory allocation, efficient parameter passing, and implementation of complex data structures like linked lists and trees. The pointer allows the program to access and modify data at the memory location it points to using the dereference operator (*). `
        }
        
        // Type-specific detailed explanation
        switch (type) {
          case 'int':
            explanation += `Integer variables typically occupy 4 bytes (32 bits) of memory and can store whole numbers ranging from -2,147,483,648 to 2,147,483,647 on most modern systems. The exact range depends on the system architecture and compiler implementation. Integers are stored in two's complement format, which allows efficient arithmetic operations and negative number representation. `
            break
          case 'char':
            explanation += `Character variables use 1 byte (8 bits) of memory and can store ASCII character values from 0 to 127, or extended ASCII values from 0 to 255 if unsigned. Characters are often used not just for storing letters and symbols, but also as small integers for flags, counters, or array indices due to their compact size. `
            break
          case 'float':
            explanation += `Single-precision floating-point variables occupy 4 bytes and follow the IEEE 754 standard for representing decimal numbers. They provide approximately 7 decimal digits of precision and can represent numbers with magnitudes ranging from about 1.2 × 10^-38 to 3.4 × 10^38. Floating-point arithmetic may introduce small rounding errors due to the binary representation of decimal fractions. `
            break
          case 'double':
            explanation += `Double-precision floating-point variables use 8 bytes and provide approximately 15-17 decimal digits of precision. They can represent much larger and smaller numbers than float variables, with magnitudes ranging from about 2.3 × 10^-308 to 1.7 × 10^308. Double variables are preferred when high precision is required for mathematical calculations or when dealing with very large or very small numbers. `
            break
          case 'long':
            explanation += `Long integer variables typically use 8 bytes on 64-bit systems (or 4 bytes on some 32-bit systems) and can store larger integer values than regular int variables. They're essential when dealing with large numbers that exceed the range of standard integers, such as file sizes, timestamps, or mathematical calculations requiring extended precision. `
            break
        }
        
        if (initialValue) {
          explanation += `The variable is initialized with the value ${initialValue.trim()}, which means memory is allocated and immediately populated with this specific value. Initialization at declaration time is a good programming practice as it prevents the variable from containing unpredictable garbage values and ensures deterministic program behavior from the start. `
        } else {
          explanation += `The variable is declared but not initialized, meaning it contains unpredictable garbage values left over from previous memory usage. This uninitialized state can lead to undefined behavior if the variable is used before being assigned a proper value, making initialization a critical consideration for program reliability. `
        }
      }
    })
    
    explanation += '\n\n'
    return explanation
  }

  private analyzeControlFlow(): string {
    let explanation = ''
    
    // Analyze loops
    const forLoops = this.code.match(/for\s*\([^)]+\)/g) || []
    const whileLoops = this.code.match(/while\s*\([^)]+\)/g) || []
    const doWhileLoops = this.code.match(/do\s*\{[^}]*\}\s*while\s*\([^)]+\)/g) || []
    
    if (forLoops.length > 0 || whileLoops.length > 0 || doWhileLoops.length > 0) {
      explanation += 'ITERATIVE CONTROL STRUCTURES: '
      
      if (forLoops.length > 0) {
        explanation += `The program contains ${forLoops.length} for loop${forLoops.length > 1 ? 's' : ''}, which ${forLoops.length === 1 ? 'provides' : 'provide'} a compact and efficient way to perform repetitive operations with a known number of iterations. For loops are particularly well-suited for array traversal, counting operations, and mathematical computations that require iteration over a specific range. The for loop structure combines initialization, condition checking, and increment/decrement operations in a single, readable statement, making the loop's behavior immediately clear to anyone reading the code. Each iteration executes the loop body and then updates the loop variable according to the specified increment or decrement operation, continuing until the termination condition is met. `
      }
      
      if (whileLoops.length > 0) {
        explanation += `The program implements ${whileLoops.length} while loop${whileLoops.length > 1 ? 's' : ''}, which ${whileLoops.length === 1 ? 'provides' : 'provide'} conditional iteration where the loop continues executing as long as the specified condition remains true. While loops are ideal for situations where the number of iterations is not known in advance and depends on runtime conditions, user input, or the state of data being processed. The condition is evaluated before each iteration, ensuring that if the condition is initially false, the loop body never executes. This makes while loops perfect for input validation, file processing, and algorithms that must continue until a specific state is reached. `
      }
      
      if (doWhileLoops.length > 0) {
        explanation += `The program uses ${doWhileLoops.length} do-while loop${doWhileLoops.length > 1 ? 's' : ''}, which guarantee${doWhileLoops.length === 1 ? 's' : ''} that the loop body executes at least once before checking the continuation condition. This structure is particularly useful for menu systems, input validation loops, and scenarios where you need to perform an operation and then decide whether to repeat it based on the results. `
      }
      
      explanation += '\n\n'
    }
    
    // Analyze conditional statements
    const ifStatements = this.code.match(/if\s*\([^)]+\)/g) || []
    const switchStatements = this.code.match(/switch\s*\([^)]+\)/g) || []
    
    if (ifStatements.length > 0 || switchStatements.length > 0) {
      explanation += 'CONDITIONAL CONTROL STRUCTURES: '
      
      if (ifStatements.length > 0) {
        explanation += `The program contains ${ifStatements.length} conditional statement${ifStatements.length > 1 ? 's' : ''} using if constructs, which enable decision-making and branching logic based on runtime conditions. These conditional statements allow the program to execute different code paths depending on the evaluation of boolean expressions, user input, variable values, or computational results. Each if statement evaluates its condition and executes the associated code block only when the condition is true, enabling the program to respond dynamically to different scenarios and data states. This conditional logic is fundamental for implementing algorithms, handling edge cases, validating input, and creating interactive programs that adapt their behavior based on circumstances. `
      }
      
      if (switchStatements.length > 0) {
        explanation += `The program implements ${switchStatements.length} switch statement${switchStatements.length > 1 ? 's' : ''}, which provide${switchStatements.length === 1 ? 's' : ''} an efficient way to handle multiple discrete values or cases. Switch statements are particularly effective for menu systems, state machines, and scenarios where a single variable needs to be compared against multiple possible values. The switch construct offers better performance than multiple if-else statements when dealing with many cases, as it can be optimized by the compiler into jump tables for faster execution. `
      }
      
      explanation += '\n\n'
    }
    
    return explanation
  }

  private analyzeMemoryManagement(): string {
    const mallocCalls = this.code.match(/malloc\s*\(/g) || []
    const callocCalls = this.code.match(/calloc\s*\(/g) || []
    const reallocCalls = this.code.match(/realloc\s*\(/g) || []
    const freeCalls = this.code.match(/free\s*\(/g) || []
    
    if (mallocCalls.length === 0 && callocCalls.length === 0 && reallocCalls.length === 0) return ''
    
    let explanation = 'DYNAMIC MEMORY MANAGEMENT: '
    
    if (mallocCalls.length > 0) {
      explanation += `The program performs ${mallocCalls.length} dynamic memory allocation${mallocCalls.length > 1 ? 's' : ''} using malloc(), which requests memory blocks from the heap during runtime. Dynamic memory allocation is crucial for programs that need to handle variable amounts of data, create data structures of unknown size at compile time, or optimize memory usage by allocating only what's needed. The malloc() function returns a pointer to the allocated memory block, which must be properly managed to prevent memory leaks and ensure program stability. `
    }
    
    if (callocCalls.length > 0) {
      explanation += `The program uses calloc() for ${callocCalls.length} memory allocation${callocCalls.length > 1 ? 's' : ''}, which not only allocates memory like malloc() but also initializes all bytes to zero. This initialization is particularly important for arrays, structures, and situations where clean, predictable initial values are required to prevent undefined behavior from garbage data. `
    }
    
    if (reallocCalls.length > 0) {
      explanation += `The program employs realloc() for ${reallocCalls.length} memory reallocation operation${reallocCalls.length > 1 ? 's' : ''}, which allows resizing previously allocated memory blocks. This is essential for dynamic data structures that need to grow or shrink during program execution, such as dynamic arrays or lists that adapt to changing data requirements. `
    }
    
    if (freeCalls.length > 0) {
      explanation += `The program properly releases ${freeCalls.length} allocated memory block${freeCalls.length > 1 ? 's' : ''} using free(), which returns the memory to the system for reuse. Proper memory deallocation is critical for preventing memory leaks, especially in long-running programs or those that allocate memory repeatedly. `
    } else if (mallocCalls.length > 0 || callocCalls.length > 0) {
      explanation += `However, the program appears to lack corresponding free() calls for the allocated memory, which could potentially lead to memory leaks where allocated memory is never returned to the system. `
    }
    
    explanation += 'Dynamic memory management requires careful attention to allocation and deallocation patterns to ensure program stability, prevent memory leaks, and avoid accessing freed or uninitialized memory. '
    
    explanation += '\n\n'
    return explanation
  }

  private analyzeInputOutput(): string {
    const printfCalls = this.code.match(/printf\s*\(/g) || []
    const scanfCalls = this.code.match(/scanf\s*\(/g) || []
    const fgetsCalls = this.code.match(/fgets\s*\(/g) || []
    const fputsCalls = this.code.match(/fputs\s*\(/g) || []
    
    if (printfCalls.length === 0 && scanfCalls.length === 0 && fgetsCalls.length === 0 && fputsCalls.length === 0) return ''
    
    let explanation = 'INPUT/OUTPUT OPERATIONS: '
    
    if (printfCalls.length > 0) {
      explanation += `The program performs ${printfCalls.length} formatted output operation${printfCalls.length > 1 ? 's' : ''} using printf(), which displays formatted text and variable values to the console. Printf is one of the most versatile I/O functions in C, supporting format specifiers like %d for integers, %f for floating-point numbers, %c for characters, %s for strings, and many others with precision and width modifiers. This function enables the program to communicate results, status information, prompts, and debugging information to the user in a readable, formatted manner. `
    }
    
    if (scanfCalls.length > 0) {
      explanation += `The program reads user input through ${scanfCalls.length} scanf() operation${scanfCalls.length > 1 ? 's' : ''}, which parses formatted input from the standard input stream (typically the keyboard). Scanf uses format specifiers to interpret different types of input data and store them in the appropriate variables. While powerful, scanf requires careful handling of input validation and buffer management to prevent security vulnerabilities and ensure robust input processing. `
    }
    
    if (fgetsCalls.length > 0) {
      explanation += `The program uses fgets() for ${fgetsCalls.length} safer string input operation${fgetsCalls.length > 1 ? 's' : ''}, which reads a line of text while respecting buffer boundaries to prevent buffer overflow attacks. Fgets is generally preferred over gets() and scanf() for string input because it limits the number of characters read and includes the newline character in the result, providing better control over input processing. `
    }
    
    if (fputsCalls.length > 0) {
      explanation += `The program outputs strings using fputs() in ${fputsCalls.length} operation${fputsCalls.length > 1 ? 's' : ''}, which writes string data to a specified output stream without automatic formatting. This function is efficient for outputting pre-formatted strings and provides more control over output formatting compared to printf when complex formatting is not needed. `
    }
    
    explanation += 'Input/output operations are fundamental for creating interactive programs that can communicate with users, process external data, and provide meaningful feedback about program execution and results. '
    
    explanation += '\n\n'
    return explanation
  }

  private analyzeComplexity(): string {
    const complexityScore = this.calculateComplexityScore()
    let explanation = 'PROGRAM COMPLEXITY AND PERFORMANCE CHARACTERISTICS: '
    
    if (complexityScore < 5) {
      explanation += 'This program exhibits low complexity with straightforward linear execution flow. The simple structure makes it easy to understand, debug, and maintain, with predictable performance characteristics and minimal resource requirements. '
    } else if (complexityScore < 10) {
      explanation += 'This program demonstrates moderate complexity with some branching logic, loops, or function calls that create multiple execution paths. The complexity level requires careful consideration of different scenarios and potential edge cases, but remains manageable for most developers. '
    } else if (complexityScore < 15) {
      explanation += 'This program shows significant complexity with multiple interacting components, nested control structures, or advanced data manipulation. The complexity requires thorough testing, careful documentation, and systematic debugging approaches to ensure correctness and maintainability. '
    } else {
      explanation += 'This program exhibits high complexity with sophisticated algorithms, multiple levels of abstraction, complex data structures, or intricate control flow patterns. Such complexity demands advanced programming skills, comprehensive testing strategies, and careful architectural planning to manage effectively. '
    }
    
    explanation += '\n\n'
    return explanation
  }

  private analyzeOptimizations(): string {
    let explanation = 'POTENTIAL OPTIMIZATIONS AND BEST PRACTICES: '
    
    const hasLoops = /(for|while|do)\s*\(/.test(this.code)
    const hasRecursion = /(\w+)\s*\([^)]*\).*\1\s*\(/.test(this.code)
    const hasArrays = /\w+\[\w*\]/.test(this.code)
    const hasDynamicMemory = /malloc|calloc/.test(this.code)
    
    if (hasLoops) {
      explanation += 'The presence of loops suggests opportunities for optimization through loop unrolling, vectorization, or algorithmic improvements that could reduce time complexity. Consider analyzing loop invariants and minimizing operations within loop bodies for better performance. '
    }
    
    if (hasRecursion) {
      explanation += 'Recursive functions may benefit from memoization, tail recursion optimization, or iterative alternatives to reduce stack usage and improve performance for large input sizes. '
    }
    
    if (hasArrays) {
      explanation += 'Array operations could be optimized through cache-friendly access patterns, prefetching strategies, or SIMD instructions for bulk operations on compatible data types. '
    }
    
    if (hasDynamicMemory) {
      explanation += 'Dynamic memory usage could be optimized through memory pooling, custom allocators, or stack-based alternatives where appropriate to reduce allocation overhead and fragmentation. '
    }
    
    explanation += 'General optimization opportunities include compiler optimizations (-O2, -O3 flags), profile-guided optimization, and algorithmic improvements based on specific use cases and performance requirements.'
    
    return explanation
  }

  private determineComplexity(): string {
    const score = this.calculateComplexityScore()
    if (score >= 15) return 'Advanced'
    if (score >= 10) return 'Complex'
    if (score >= 5) return 'Moderate'
    return 'Simple'
  }

  private calculateComplexityScore(): number {
    let score = 0
    score += (this.code.match(/\bfor\b/g) || []).length * 2
    score += (this.code.match(/\bwhile\b/g) || []).length * 2
    score += (this.code.match(/\bif\b/g) || []).length * 1
    score += (this.code.match(/\*\w+|\w+\*/g) || []).length * 2
    score += (this.code.match(/malloc|calloc/g) || []).length * 3
    score += (this.code.match(/struct\s+\w+/g) || []).length * 2
    score += (this.code.match(/\w+\s+\w+\s*\([^)]*\)\s*\{/g) || []).length * 1
    return score
  }

  private detectFeatures() {
    return {
      hasMain: /int\s+main\s*\(/.test(this.code),
      hasStructs: /struct\s+\w+/.test(this.code),
      hasDynamicMemory: /malloc|calloc|free/.test(this.code),
      hasPointers: /\*\w+|\w+\*/.test(this.code),
      hasArrays: /\w+\[\w*\]/.test(this.code),
      hasLoops: /(for|while|do)\s*\(/.test(this.code),
      hasIO: /printf|scanf|fgets|fputs/.test(this.code),
      functionCount: (this.code.match(/\w+\s+\w+\s*\([^)]*\)\s*\{/g) || []).length
    }
  }

  private estimateMemoryUsage(): { stackUsed: number; heapUsed: number; activeFrames: number; memoryLeaks: number } {
    const variables = this.code.match(/\b(int|char|float|double|long|short)\s+\w+/g) || []
    const functions = this.code.match(/\w+\s+\w+\s*\([^)]*\)\s*\{/g) || []
    const mallocCalls = this.code.match(/malloc|calloc/g) || []
    const freeCalls = this.code.match(/free\s*\(/g) || []
    const arrays = this.code.match(/\w+\s+\w+\s*\[\d+\]/g) || []

    let stackUsed = 0
    
    variables.forEach(variable => {
      if (variable.includes('int') || variable.includes('float')) stackUsed += 4
      else if (variable.includes('double') || variable.includes('long')) stackUsed += 8
      else if (variable.includes('char')) stackUsed += 1
      else if (variable.includes('short')) stackUsed += 2
    })

    arrays.forEach(array => {
      const sizeMatch = array.match(/\[(\d+)\]/)
      if (sizeMatch) {
        const size = parseInt(sizeMatch[1])
        if (array.includes('int') || array.includes('float')) stackUsed += size * 4
        else if (array.includes('double')) stackUsed += size * 8
        else if (array.includes('char')) stackUsed += size
      }
    })

    stackUsed += functions.length * 24

    return {
      stackUsed: Math.min(stackUsed, 2048),
      heapUsed: mallocCalls.length * 64,
      activeFrames: Math.max(1, functions.length),
      memoryLeaks: Math.max(0, mallocCalls.length - freeCalls.length)
    }
  }
}