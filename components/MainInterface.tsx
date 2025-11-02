'use client'

import { useEffect, useRef } from 'react'
import { AdvancedCodeExplainer } from '@/utils/AdvancedCodeExplainer'

export default function MainInterface() {
  const interfaceRef = useRef<HTMLDivElement>(null)
  const codeExplainer = useRef(new AdvancedCodeExplainer())

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
    const explanationArea = document.getElementById('explanation-area')
    const summaryText = document.getElementById('summary-text')
    
    if (codeInput && explanationArea && summaryText) {
      const code = codeInput.value
      
      if (!code.trim()) {
        updateStatus('error', 'Please enter some C code to explain')
        return
      }

      const startTime = Date.now()
      updateStatus('processing', 'Analyzing code...')
      
      setTimeout(() => {
        try {
          const analysis = codeExplainer.current.analyze(code)
          
          displayAnalysis(analysis)
          updateMemoryStats(analysis.memoryUsage)
          
          const analysisTime = Date.now() - startTime
          updateStatus('complete', 'Analysis complete')
          updateAnalysisTime(analysisTime)
        } catch (error) {
          updateStatus('error', 'Error analyzing code')
          console.error('Analysis error:', error)
        }
      }, 800)
    }
  }

  const handleClearCode = () => {
    const codeInput = document.getElementById('code-input') as HTMLTextAreaElement
    const explanationArea = document.getElementById('explanation-area')
    const summaryText = document.getElementById('summary-text')
    
    if (codeInput) {
      codeInput.value = ''
    }
    
    if (explanationArea) {
      explanationArea.innerHTML = getWelcomeMessage()
    }
    
    if (summaryText) {
      summaryText.textContent = 'Ready to analyze your C code'
    }
    
    updateStatus('ready', 'Ready')
    resetMemoryStats()
    updateAnalysisTime(0)
  }

  const handleLoadExample = () => {
    const codeInput = document.getElementById('code-input') as HTMLTextAreaElement
    
    if (codeInput) {
      const exampleCode = `#include <stdio.h>
#include <stdlib.h>

struct Person {
    char name[30];
    int age;
};

int main() {
    struct Person people[3];
    int *scores = malloc(5 * sizeof(int));
    
    for (int i = 0; i < 5; i++) {
        scores[i] = i * 10;
        printf("Score %d: %d\\n", i + 1, scores[i]);
    }
    
    free(scores);
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

  const displayAnalysis = (analysis: any) => {
    const explanationCards = document.getElementById('explanation-cards')
    const summaryText = document.getElementById('summary-text')
    
    if (summaryText) {
      summaryText.textContent = analysis.summary
    }
    
    if (explanationCards) {
      let html = ''
      
      analysis.explanations.forEach((item: any, index: number) => {
        html += `
          <div class="explanation-item fade-in" style="animation-delay: ${index * 0.1}s">
            <div class="explanation-title">${item.title}</div>
            <div class="explanation-text">${item.text}</div>
          </div>
        `
      })
      
      explanationCards.innerHTML = html
    }
  }

  const getWelcomeMessage = () => {
    return `
      <div class="welcome-state">
        <div class="welcome-icon">🔍</div>
        <h2>Paste Your C Code</h2>
        <p>Enter any C program on the left and click "Explain Code" to get:</p>
        <ul class="feature-list">
          <li>📋 Quick summary of what the program does</li>
          <li>🔧 Detailed breakdown of each component</li>
          <li>💾 Memory usage analysis</li>
          <li>⚡ Performance insights</li>
        </ul>
      </div>
    `
  }

  const updateMemoryStats = (stats: any) => {
    const stackUsage = document.getElementById('stack-usage')
    const heapUsage = document.getElementById('heap-usage')
    const framesCount = document.getElementById('frames-count')
    const leaksCount = document.getElementById('leaks-count')
    
    if (stackUsage) {
      stackUsage.textContent = `${stats.stackUsed}/8192`
    }
    
    if (heapUsage) {
      heapUsage.textContent = `${stats.heapUsed}/65536`
    }
    
    if (framesCount) {
      framesCount.textContent = stats.activeFrames.toString()
    }
    
    if (leaksCount) {
      leaksCount.textContent = stats.memoryLeaks.toString()
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
  
  const updateAnalysisTime = (time: number) => {
    const analysisTimeEl = document.getElementById('analysis-time')
    if (analysisTimeEl) {
      if (time > 0) {
        analysisTimeEl.textContent = `Analysis time: ${time}ms`
      } else {
        analysisTimeEl.textContent = 'Analysis time: --'
      }
    }
  }



  return <div ref={interfaceRef} className="main-interface-container" />
}