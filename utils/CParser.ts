interface ParseResult {
  success: boolean
  ast?: any
  error?: string
}

interface ASTNode {
  type: string
  value?: any
  children?: ASTNode[]
  line?: number
  column?: number
}

export class CParser {
  private tokens: string[] = []
  private currentToken: number = 0

  parse(code: string): ParseResult {
    try {
      // Basic tokenization
      this.tokens = this.tokenize(code)
      this.currentToken = 0

      if (this.tokens.length === 0) {
        return { success: false, error: 'Empty code' }
      }

      // Basic validation
      if (!this.hasMainFunction(code)) {
        return { success: false, error: 'No main function found' }
      }

      // Create a simple AST
      const ast = this.parseProgram()
      
      return { success: true, ast }
    } catch (error) {
      return { success: false, error: `Parse error: ${error}` }
    }
  }

  private tokenize(code: string): string[] {
    // Simple tokenization - split by whitespace and common delimiters
    const tokens = code
      .replace(/([{}();,])/g, ' $1 ')
      .split(/\s+/)
      .filter(token => token.trim().length > 0)
    
    return tokens
  }

  private hasMainFunction(code: string): boolean {
    // Check for main function pattern
    const mainPattern = /int\s+main\s*\(/
    return mainPattern.test(code)
  }

  private parseProgram(): ASTNode {
    const program: ASTNode = {
      type: 'Program',
      children: []
    }

    // Parse includes
    while (this.currentToken < this.tokens.length && this.tokens[this.currentToken] === '#include') {
      program.children?.push(this.parseInclude())
    }

    // Parse functions
    while (this.currentToken < this.tokens.length) {
      if (this.isFunction()) {
        program.children?.push(this.parseFunction())
      } else {
        this.currentToken++
      }
    }

    return program
  }

  private parseInclude(): ASTNode {
    const include: ASTNode = {
      type: 'Include',
      value: ''
    }

    this.currentToken++ // skip '#include'
    
    if (this.currentToken < this.tokens.length) {
      include.value = this.tokens[this.currentToken]
      this.currentToken++
    }

    return include
  }

  private isFunction(): boolean {
    // Simple function detection
    const typeKeywords = ['int', 'void', 'char', 'float', 'double']
    
    if (this.currentToken >= this.tokens.length) return false
    
    const currentToken = this.tokens[this.currentToken]
    return typeKeywords.includes(currentToken)
  }

  private parseFunction(): ASTNode {
    const func: ASTNode = {
      type: 'Function',
      children: []
    }

    // Parse return type
    if (this.currentToken < this.tokens.length) {
      const returnType: ASTNode = {
        type: 'ReturnType',
        value: this.tokens[this.currentToken]
      }
      func.children?.push(returnType)
      this.currentToken++
    }

    // Parse function name
    if (this.currentToken < this.tokens.length) {
      const name: ASTNode = {
        type: 'FunctionName',
        value: this.tokens[this.currentToken]
      }
      func.children?.push(name)
      this.currentToken++
    }

    // Skip parameters for now
    while (this.currentToken < this.tokens.length && this.tokens[this.currentToken] !== '{') {
      this.currentToken++
    }

    // Parse function body
    if (this.currentToken < this.tokens.length && this.tokens[this.currentToken] === '{') {
      func.children?.push(this.parseBlock())
    }

    return func
  }

  private parseBlock(): ASTNode {
    const block: ASTNode = {
      type: 'Block',
      children: []
    }

    this.currentToken++ // skip '{'

    while (this.currentToken < this.tokens.length && this.tokens[this.currentToken] !== '}') {
      if (this.isStatement()) {
        block.children?.push(this.parseStatement())
      } else {
        this.currentToken++
      }
    }

    if (this.currentToken < this.tokens.length && this.tokens[this.currentToken] === '}') {
      this.currentToken++ // skip '}'
    }

    return block
  }

  private isStatement(): boolean {
    if (this.currentToken >= this.tokens.length) return false
    
    const token = this.tokens[this.currentToken]
    const statementKeywords = ['int', 'char', 'float', 'double', 'printf', 'scanf', 'return', 'if', 'while', 'for']
    
    return statementKeywords.includes(token) || /^[a-zA-Z_]/.test(token)
  }

  private parseStatement(): ASTNode {
    const token = this.tokens[this.currentToken]

    switch (token) {
      case 'printf':
        return this.parsePrintfStatement()
      case 'return':
        return this.parseReturnStatement()
      case 'int':
      case 'char':
      case 'float':
      case 'double':
        return this.parseDeclaration()
      default:
        return this.parseExpressionStatement()
    }
  }

  private parsePrintfStatement(): ASTNode {
    const stmt: ASTNode = {
      type: 'PrintfStatement',
      children: []
    }

    this.currentToken++ // skip 'printf'

    // Skip until semicolon
    while (this.currentToken < this.tokens.length && this.tokens[this.currentToken] !== ';') {
      this.currentToken++
    }

    if (this.currentToken < this.tokens.length && this.tokens[this.currentToken] === ';') {
      this.currentToken++ // skip ';'
    }

    return stmt
  }

  private parseReturnStatement(): ASTNode {
    const stmt: ASTNode = {
      type: 'ReturnStatement',
      value: null
    }

    this.currentToken++ // skip 'return'

    // Parse return value if present
    if (this.currentToken < this.tokens.length && this.tokens[this.currentToken] !== ';') {
      stmt.value = this.tokens[this.currentToken]
      this.currentToken++
    }

    if (this.currentToken < this.tokens.length && this.tokens[this.currentToken] === ';') {
      this.currentToken++ // skip ';'
    }

    return stmt
  }

  private parseDeclaration(): ASTNode {
    const decl: ASTNode = {
      type: 'Declaration',
      children: []
    }

    // Parse type
    const type: ASTNode = {
      type: 'Type',
      value: this.tokens[this.currentToken]
    }
    decl.children?.push(type)
    this.currentToken++

    // Parse variable name
    if (this.currentToken < this.tokens.length) {
      const name: ASTNode = {
        type: 'Identifier',
        value: this.tokens[this.currentToken]
      }
      decl.children?.push(name)
      this.currentToken++
    }

    // Skip until semicolon
    while (this.currentToken < this.tokens.length && this.tokens[this.currentToken] !== ';') {
      this.currentToken++
    }

    if (this.currentToken < this.tokens.length && this.tokens[this.currentToken] === ';') {
      this.currentToken++ // skip ';'
    }

    return decl
  }

  private parseExpressionStatement(): ASTNode {
    const stmt: ASTNode = {
      type: 'ExpressionStatement',
      value: this.tokens[this.currentToken]
    }

    // Skip until semicolon
    while (this.currentToken < this.tokens.length && this.tokens[this.currentToken] !== ';') {
      this.currentToken++
    }

    if (this.currentToken < this.tokens.length && this.tokens[this.currentToken] === ';') {
      this.currentToken++ // skip ';'
    }

    return stmt
  }

  validateSyntax(code: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check for balanced braces
    let braceCount = 0
    for (const char of code) {
      if (char === '{') braceCount++
      if (char === '}') braceCount--
    }
    if (braceCount !== 0) {
      errors.push('Unbalanced braces')
    }

    // Check for balanced parentheses
    let parenCount = 0
    for (const char of code) {
      if (char === '(') parenCount++
      if (char === ')') parenCount--
    }
    if (parenCount !== 0) {
      errors.push('Unbalanced parentheses')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}