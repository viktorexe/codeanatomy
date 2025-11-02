'use client'

import { useEffect, useRef } from 'react'
import { CodeExplainer } from '@/utils/CodeExplainer'
import { MemoryManager } from '@/utils/MemoryManager'

export default function MainInterface() {
  const interfaceRef = useRef<HTMLDivElement>(null)
  const codeExplainer = useRef(new CodeExplainer())
  const memoryManager = useRef(new MemoryManager())

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
    // Explain button functionality
    const explainBtn = document.getElementById('explain-btn')
    if (explainBtn) {
      explainBtn.addEventListener('click', handleExplainCode)
    }

    // Clear button functionality
    const clearBtn = document.getElementById('clear-btn')
    if (clearBtn) {
      clearBtn.addEventListener('click', handleClearCode)
    }

    // Example button functionality
    const exampleBtn = document.getElementById('example-btn')
    if (exampleBtn) {
      exampleBtn.addEventListener('click', handleLoadExample)
    }
  }

  const handleExplainCode = () => {
    const codeInput = document.getElementById('code-input') as HTMLTextAreaElement
    const explanationContent = document.getElementById('explanation-content')
    const statusIndicator = document.getElementById('status-indicator')
    const statusText = document.getElementById('status-text')
    
    if (codeInput && explanationContent && statusIndicator && statusText) {
      const code = codeInput.value
      
      if (!code.trim()) {
        updateStatus('error', 'Please enter some C code to explain')
        return
      }

      updateStatus('processing', 'Analyzing your code...')
      
      // Simulate processing delay for better UX
      setTimeout(() => {
        try {
          const explanations = codeExplainer.current.explain(code)
          const memoryStats = codeExplainer.current.estimateMemoryUsage()
          
          displayExplanations(explanations)
          updateMemoryStats(memoryStats)
          updateStatus('complete', 'Code analysis complete')
        } catch (error) {
          updateStatus('error', 'Error analyzing code')
          console.error('Explanation error:', error)
        }
      }, 1000)
    }
  }

  const handleClearCode = () => {
    const codeInput = document.getElementById('code-input') as HTMLTextAreaElement
    const explanationContent = document.getElementById('explanation-content')
    
    if (codeInput) {
      codeInput.value = ''
    }
    
    if (explanationContent) {
      explanationContent.innerHTML = getWelcomeMessage()
    }
    
    updateStatus('ready', 'Ready to explain')
    resetMemoryStats()
  }

  const handleLoadExample = () => {
    const codeInput = document.getElementById('code-input') as HTMLTextAreaElement
    
    if (codeInput) {
      const exampleCode = `#include <stdio.h>

int main() {
    int x = 10;
    int y = 20;
    int sum = x + y;
    
    printf("First number: %d\\n", x);
    printf("Second number: %d\\n", y);
    printf("Sum: %d\\n", sum);
    
    return 0;
}`
      
      codeInput.value = exampleCode
      updateStatus('ready', 'Example loaded - click Explain Code')
    }
  }

  const updateStatus = (type: 'ready' | 'processing' | 'complete' | 'error', message: string) => {
    const statusIndicator = document.getElementById('status-indicator')
    const statusText = document.getElementById('status-text')
    
    if (statusIndicator && statusText) {
      statusIndicator.className = `status-indicator ${type}`
      statusText.textContent = message
    }
  }

  const displayExplanations = (explanations: any[]) => {
    const explanationContent = document.getElementById('explanation-content')
    
    if (explanationContent) {
      let html = '<div class="code-explanation">'
      
      explanations.forEach((explanation, index) => {
        html += `
          <div class="explanation-block fade-in" style="animation-delay: ${index * 0.1}s">
            <div class="explanation-title">${explanation.title}</div>
            <div class="explanation-text">${explanation.content}</div>
        `
        
        if (explanation.codeLines && explanation.codeLines.length > 0) {
          explanation.codeLines.forEach((line: string) => {
            html += `<div class="code-line">${line}</div>`
          })
        }
        
        html += '</div>'
      })
      
      html += '</div>'
      explanationContent.innerHTML = html
    }
  }

  const getWelcomeMessage = () => {
    return `
      <div class="welcome-message">
        <div class="welcome-icon">📖</div>
        <h3>Welcome to CodeAnatomy</h3>
        <p>Paste your C code on the left and click "Explain Code" to get a detailed breakdown of what your program does.</p>
        <div class="features">
          <div class="feature">✨ Line-by-line explanations</div>
          <div class="feature">🧠 Logic flow analysis</div>
          <div class="feature">💾 Memory usage insights</div>
          <div class="feature">🔧 Best practices tips</div>
        </div>
      </div>
    `
  }

  const updateMemoryStats = (stats: any) => {
    const stackUsed = document.getElementById('stack-used')
    const stackProgress = document.getElementById('stack-progress')
    const heapUsed = document.getElementById('heap-used')
    const heapProgress = document.getElementById('heap-progress')
    const activeFrames = document.getElementById('active-frames')
    const memoryLeaks = document.getElementById('memory-leaks')
    
    if (stackUsed && stackProgress) {
      stackUsed.textContent = stats.stackUsed.toString()
      const stackPercent = (stats.stackUsed / 8192) * 100
      stackProgress.style.width = `${stackPercent}%`
    }
    
    if (heapUsed && heapProgress) {
      heapUsed.textContent = stats.heapUsed.toString()
      const heapPercent = (stats.heapUsed / 65536) * 100
      heapProgress.style.width = `${heapPercent}%`
    }
    
    if (activeFrames) {
      activeFrames.textContent = stats.activeFrames.toString()
    }
    
    if (memoryLeaks) {
      memoryLeaks.textContent = stats.memoryLeaks.toString()
    }
  }

  const resetMemoryStats = () => {
    updateMemoryStats({
      stackUsed: 0,
      heapUsed: 0,
      activeFrames: 0,
      memoryLeaks: 0
    })
  }



  return <div ref={interfaceRef} className="main-interface-container" />
}