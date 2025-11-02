interface StackFrame {
  name: string
  size: number
  variables: Map<string, any>
  startAddress: number
}

interface HeapBlock {
  address: number
  size: number
  allocated: boolean
  data: any
}

export class MemoryManager {
  private stackFrames: StackFrame[] = []
  private heapBlocks: HeapBlock[] = []
  private stackSize: number = 8192 // 8KB default stack
  private heapSize: number = 65536 // 64KB default heap
  private currentStackPointer: number = 0
  private currentHeapPointer: number = 0

  constructor() {
    this.reset()
  }

  reset(): void {
    this.stackFrames = []
    this.heapBlocks = []
    this.currentStackPointer = 0
    this.currentHeapPointer = 0
  }

  allocateStack(functionName: string, size: number): boolean {
    if (this.currentStackPointer + size > this.stackSize) {
      throw new Error('Stack overflow')
    }

    const frame: StackFrame = {
      name: functionName,
      size: size,
      variables: new Map(),
      startAddress: this.currentStackPointer
    }

    this.stackFrames.push(frame)
    this.currentStackPointer += size
    return true
  }

  deallocateStack(): boolean {
    if (this.stackFrames.length === 0) {
      return false
    }

    const frame = this.stackFrames.pop()
    if (frame) {
      this.currentStackPointer -= frame.size
    }
    return true
  }

  allocateHeap(size: number): number {
    if (this.currentHeapPointer + size > this.heapSize) {
      throw new Error('Heap overflow')
    }

    const address = this.currentHeapPointer
    const block: HeapBlock = {
      address: address,
      size: size,
      allocated: true,
      data: null
    }

    this.heapBlocks.push(block)
    this.currentHeapPointer += size
    return address
  }

  deallocateHeap(address: number): boolean {
    const blockIndex = this.heapBlocks.findIndex(block => block.address === address)
    if (blockIndex === -1) {
      throw new Error('Invalid heap address')
    }

    this.heapBlocks[blockIndex].allocated = false
    return true
  }

  setVariable(name: string, value: any, type: string): boolean {
    if (this.stackFrames.length === 0) {
      return false
    }

    const currentFrame = this.stackFrames[this.stackFrames.length - 1]
    currentFrame.variables.set(name, { value, type })
    return true
  }

  getVariable(name: string): any {
    for (let i = this.stackFrames.length - 1; i >= 0; i--) {
      const frame = this.stackFrames[i]
      if (frame.variables.has(name)) {
        return frame.variables.get(name)
      }
    }
    return null
  }

  getStackFrames(): StackFrame[] {
    return [...this.stackFrames]
  }

  getHeapBlocks(): HeapBlock[] {
    return [...this.heapBlocks]
  }

  getMemoryInfo() {
    const stackUsed = this.currentStackPointer
    const heapUsed = this.heapBlocks
      .filter(block => block.allocated)
      .reduce((total, block) => total + block.size, 0)
    
    const leaks = this.heapBlocks.filter(block => block.allocated).length

    return {
      stackUsed,
      stackTotal: this.stackSize,
      heapUsed,
      heapTotal: this.heapSize,
      activeFrames: this.stackFrames.length,
      leaks
    }
  }

  detectMemoryLeaks(): HeapBlock[] {
    return this.heapBlocks.filter(block => block.allocated)
  }

  getMemoryLayout() {
    return {
      stack: {
        frames: this.stackFrames,
        used: this.currentStackPointer,
        total: this.stackSize
      },
      heap: {
        blocks: this.heapBlocks,
        used: this.currentHeapPointer,
        total: this.heapSize
      }
    }
  }
}