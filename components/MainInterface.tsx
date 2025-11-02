'use client'

import { useEffect, useRef } from 'react'
import { CodeEditor } from './CodeEditor'
import { VisualizationCanvas } from './VisualizationCanvas'
import { ConsoleOutput } from './ConsoleOutput'
import { MemoryManager } from '@/utils/MemoryManager'
import { CParser } from '@/utils/CParser'

export default function MainInterface() {
  const interfaceRef = useRef<HTMLDivElement>(null)
  const memoryManager = useRef(new MemoryManager())
  const cParser = useRef(new CParser())

  useEffect(() => {
    // Load HTML template
    fetch('/templates/main-interface.html')
      .then(response => response.text())
      .then(html => {
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, 'text/html')
        const mainInterface = doc.getElementById('main-interface')
        
        if (interfaceRef.current && mainInterface) {
          interfaceRef.current.innerHTML = mainInterface.innerHTML
          initializeEventListeners()
        }
      })
      .catch(error => console.error('Error loading template:', error))
  }, [])

  const initializeEventListeners = () => {
    // Run button functionality
    const runBtn = document.getElementById('run-btn')
    if (runBtn) {
      runBtn.addEventListener('click', handleRunCode)
    }

    // Step button functionality
    const stepBtn = document.getElementById('step-btn')
    if (stepBtn) {
      stepBtn.addEventListener('click', handleStepCode)
    }

    // Reset button functionality
    const resetBtn = document.getElementById('reset-btn')
    if (resetBtn) {
      resetBtn.addEventListener('click', handleResetCode)
    }

    // Tab switching functionality
    const tabs = document.querySelectorAll('.info-tab')
    tabs.forEach(tab => {
      tab.addEventListener('click', handleTabSwitch)
    })

    // Visualization view switching
    const vizBtns = document.querySelectorAll('.viz-btn')
    vizBtns.forEach(btn => {
      btn.addEventListener('click', handleVizViewSwitch)
    })
  }

  const handleRunCode = () => {
    const codeEditor = document.getElementById('code-editor') as HTMLTextAreaElement
    const consoleOutput = document.getElementById('console-output')
    
    if (codeEditor && consoleOutput) {
      const code = codeEditor.value
      
      if (!code.trim()) {
        updateConsole('Error: Please enter some C code to run.')
        return
      }

      updateConsole('Parsing C code...')
      
      try {
        const parseResult = cParser.current.parse(code)
        if (parseResult.success) {
          updateConsole('Code parsed successfully. Starting execution...')
          memoryManager.current.reset()
          executeCode(parseResult.ast)
        } else {
          updateConsole(`Parse Error: ${parseResult.error}`)
        }
      } catch (error) {
        updateConsole(`Error: ${error}`)
      }
    }
  }

  const handleStepCode = () => {
    const consoleOutput = document.getElementById('console-output')
    if (consoleOutput) {
      updateConsole('Step execution not yet implemented.')
    }
  }

  const handleResetCode = () => {
    const consoleOutput = document.getElementById('console-output')
    if (consoleOutput) {
      consoleOutput.innerHTML = ''
      memoryManager.current.reset()
      updateVisualization()
    }
  }

  const handleTabSwitch = (event: Event) => {
    const clickedTab = event.target as HTMLElement
    const tabId = clickedTab.id
    
    // Remove active class from all tabs
    document.querySelectorAll('.info-tab').forEach(tab => {
      tab.classList.remove('active')
    })
    
    // Add active class to clicked tab
    clickedTab.classList.add('active')
    
    // Hide all content panels
    document.querySelectorAll('.console-output, .memory-info, .performance-info').forEach(panel => {
      panel.classList.add('hidden')
    })
    
    // Show corresponding content panel
    switch (tabId) {
      case 'console-tab':
        document.getElementById('console-output')?.classList.remove('hidden')
        break
      case 'memory-tab':
        document.getElementById('memory-info')?.classList.remove('hidden')
        updateMemoryInfo()
        break
      case 'performance-tab':
        document.getElementById('performance-info')?.classList.remove('hidden')
        updatePerformanceInfo()
        break
    }
  }

  const handleVizViewSwitch = (event: Event) => {
    const clickedBtn = event.target as HTMLElement
    
    // Remove active class from all viz buttons
    document.querySelectorAll('.viz-btn').forEach(btn => {
      btn.classList.remove('active')
    })
    
    // Add active class to clicked button
    clickedBtn.classList.add('active')
    
    // Update visualization based on selected view
    const viewType = clickedBtn.textContent?.toLowerCase() || 'memory'
    updateVisualization(viewType)
  }

  const executeCode = (ast: any) => {
    // Basic execution simulation
    updateConsole('Executing main function...')
    
    // Simulate memory allocation
    memoryManager.current.allocateStack('main', 1024)
    updateConsole('Stack frame allocated for main()')
    
    // Update visualization
    updateVisualization()
    
    updateConsole('Execution completed.')
  }

  const updateConsole = (message: string) => {
    const consoleOutput = document.getElementById('console-output')
    if (consoleOutput) {
      const timestamp = new Date().toLocaleTimeString()
      consoleOutput.innerHTML += `<div>[${timestamp}] ${message}</div>`
      consoleOutput.scrollTop = consoleOutput.scrollHeight
    }
  }

  const updateVisualization = (viewType: string = 'memory') => {
    const canvas = document.getElementById('visualization-canvas') as HTMLCanvasElement
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        
        // Set canvas size
        canvas.width = canvas.offsetWidth
        canvas.height = canvas.offsetHeight
        
        // Draw based on view type
        switch (viewType) {
          case 'memory':
            drawMemoryView(ctx)
            break
          case 'stack':
            drawStackView(ctx)
            break
          case 'heap':
            drawHeapView(ctx)
            break
        }
      }
    }
  }

  const drawMemoryView = (ctx: CanvasRenderingContext2D) => {
    const width = ctx.canvas.width
    const height = ctx.canvas.height
    
    // Draw memory sections
    ctx.fillStyle = '#2a2a2a'
    ctx.fillRect(10, 10, width - 20, height - 20)
    
    ctx.strokeStyle = '#00ff88'
    ctx.lineWidth = 2
    ctx.strokeRect(10, 10, width - 20, height - 20)
    
    // Draw memory labels
    ctx.fillStyle = '#ffffff'
    ctx.font = '14px monospace'
    ctx.fillText('Memory Layout', 20, 35)
    
    // Draw stack section
    const stackHeight = height * 0.6
    ctx.fillStyle = '#1a4a3a'
    ctx.fillRect(20, 50, width - 40, stackHeight - 60)
    ctx.strokeStyle = '#00ff88'
    ctx.strokeRect(20, 50, width - 40, stackHeight - 60)
    ctx.fillStyle = '#00ff88'
    ctx.fillText('Stack', 30, 70)
    
    // Draw heap section
    ctx.fillStyle = '#4a1a1a'
    ctx.fillRect(20, stackHeight, width - 40, height - stackHeight - 20)
    ctx.strokeStyle = '#ff6b6b'
    ctx.strokeRect(20, stackHeight, width - 40, height - stackHeight - 20)
    ctx.fillStyle = '#ff6b6b'
    ctx.fillText('Heap', 30, stackHeight + 20)
  }

  const drawStackView = (ctx: CanvasRenderingContext2D) => {
    const width = ctx.canvas.width
    const height = ctx.canvas.height
    
    ctx.fillStyle = '#1a4a3a'
    ctx.fillRect(10, 10, width - 20, height - 20)
    
    ctx.strokeStyle = '#00ff88'
    ctx.lineWidth = 2
    ctx.strokeRect(10, 10, width - 20, height - 20)
    
    ctx.fillStyle = '#ffffff'
    ctx.font = '14px monospace'
    ctx.fillText('Stack View', 20, 35)
    
    // Draw stack frames
    const frames = memoryManager.current.getStackFrames()
    let yOffset = 60
    
    frames.forEach((frame, index) => {
      ctx.fillStyle = '#2a2a2a'
      ctx.fillRect(30, yOffset, width - 60, 40)
      ctx.strokeStyle = '#00ff88'
      ctx.strokeRect(30, yOffset, width - 60, 40)
      
      ctx.fillStyle = '#00ff88'
      ctx.fillText(`${frame.name} (${frame.size} bytes)`, 40, yOffset + 25)
      
      yOffset += 50
    })
  }

  const drawHeapView = (ctx: CanvasRenderingContext2D) => {
    const width = ctx.canvas.width
    const height = ctx.canvas.height
    
    ctx.fillStyle = '#4a1a1a'
    ctx.fillRect(10, 10, width - 20, height - 20)
    
    ctx.strokeStyle = '#ff6b6b'
    ctx.lineWidth = 2
    ctx.strokeRect(10, 10, width - 20, height - 20)
    
    ctx.fillStyle = '#ffffff'
    ctx.font = '14px monospace'
    ctx.fillText('Heap View', 20, 35)
    
    ctx.fillStyle = '#ff6b6b'
    ctx.fillText('No heap allocations yet', 30, 70)
  }

  const updateMemoryInfo = () => {
    const memoryInfo = document.getElementById('memory-info')
    if (memoryInfo) {
      const info = memoryManager.current.getMemoryInfo()
      memoryInfo.innerHTML = `
        <div style="font-family: monospace; line-height: 1.6;">
          <div><strong>Stack Usage:</strong> ${info.stackUsed} / ${info.stackTotal} bytes</div>
          <div><strong>Heap Usage:</strong> ${info.heapUsed} / ${info.heapTotal} bytes</div>
          <div><strong>Active Frames:</strong> ${info.activeFrames}</div>
          <div><strong>Memory Leaks:</strong> ${info.leaks}</div>
        </div>
      `
    }
  }

  const updatePerformanceInfo = () => {
    const performanceInfo = document.getElementById('performance-info')
    if (performanceInfo) {
      performanceInfo.innerHTML = `
        <div style="font-family: monospace; line-height: 1.6;">
          <div><strong>Execution Time:</strong> 0.001s</div>
          <div><strong>Memory Allocations:</strong> 1</div>
          <div><strong>Function Calls:</strong> 1</div>
          <div><strong>Big-O Complexity:</strong> O(1)</div>
        </div>
      `
    }
  }

  return <div ref={interfaceRef} className="main-interface-container" />
}