const backBtn = document.getElementById('backBtn');
const languageSelect = document.getElementById('languageSelect');
const codeInput = document.getElementById('codeInput');
const codeOutput = document.getElementById('codeOutput');
const processBtn = document.getElementById('processBtn');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');
const statusText = document.getElementById('statusText');
const languageStatus = document.getElementById('languageStatus');
const lineCount = document.getElementById('lineCount');
const lineNumbers1 = document.getElementById('lineNumbers1');
const lineNumbers2 = document.getElementById('lineNumbers2');
const codeHighlight1 = document.getElementById('codeHighlight1');
const codeHighlight2 = document.getElementById('codeHighlight2');

const MAX_FILE_SIZE = 500000; // 500KB limit
const langMap = { python: 'python', c: 'c' }; // Language mapping for highlight.js

// Get mode from URL
const urlParams = new URLSearchParams(window.location.search);
const mode = urlParams.get('mode') || 'add'; // 'add' or 'remove'

// Update UI based on mode
if (mode === 'remove') {
    processBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" stroke-width="1.5"/>
        </svg>
        Remove Comments
    `;
    document.querySelector('.tab span:last-child').textContent = 'uncommented';
}

// Show error toast
function showError(message) {
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

// Syntax highlighting with highlight.js
function highlightCode(code, lang, targetElement) {
    if (!code) {
        targetElement.innerHTML = '<code></code>';
        return;
    }
    const codeElement = targetElement.querySelector('code');
    codeElement.textContent = code;
    codeElement.className = `language-${lang}`;
    delete codeElement.dataset.highlighted; // Reset highlight.js state for re-highlighting
    hljs.highlightElement(codeElement);
}

// Navigate back to home
backBtn.addEventListener('click', () => {
    window.location.href = '/';
});

// Update line numbers based on textarea content
function updateLineNumbers(textarea, lineNumbersDiv) {
    const lines = textarea.value.split('\n').length;
    if (lines > 5000) { // Performance optimization for large files
        lineNumbersDiv.textContent = '...';
        return;
    }
    let numbers = '';
    for (let i = 1; i <= lines; i++) {
        numbers += i + '\n';
    }
    lineNumbersDiv.textContent = numbers;
    
    lineNumbersDiv.scrollTop = textarea.scrollTop; // Sync scroll position
}

// Update cursor position
function updateCursorPosition() {
    try {
        const pos = codeInput.selectionStart;
        const textBeforeCursor = codeInput.value.substring(0, pos);
        const line = textBeforeCursor.split('\n').length;
        const col = textBeforeCursor.split('\n').pop().length + 1;
        lineCount.textContent = `Ln ${line}, Col ${col}`;
    } catch (e) {
        lineCount.textContent = 'Ln 1, Col 1';
    }
}

// Language selection handler
languageSelect.addEventListener('change', () => {
    const lang = languageSelect.value;
    if (lang) {
        languageStatus.textContent = lang.toUpperCase();
        codeInput.placeholder = `// Paste your ${lang.toUpperCase()} code here...`;
        statusText.textContent = `${lang.toUpperCase()} selected`;
        codeInput.disabled = false;
        codeInput.focus();
        if (codeInput.value) highlightCode(codeInput.value, langMap[lang], codeHighlight1);
    } else {
        languageStatus.textContent = 'No language selected';
        codeInput.placeholder = '// Select a language first...';
        statusText.textContent = 'Select a language';
        codeInput.disabled = true;
        codeHighlight1.innerHTML = '<code></code>';
    }
    checkInputs();
});

// Enable process button only when both language and code are present
function checkInputs() {
    processBtn.disabled = !(languageSelect.value && codeInput.value.trim());
}

// Input handler with debouncing for performance
let inputTimeout;
codeInput.addEventListener('input', () => {
    const code = codeInput.value;
    
    if (code.length > MAX_FILE_SIZE) {
        showError(`File too large! Maximum ${MAX_FILE_SIZE / 1000}KB allowed.`);
        return;
    }
    
    clearTimeout(inputTimeout);
    inputTimeout = setTimeout(() => {
        updateLineNumbers(codeInput, lineNumbers1);
        updateCursorPosition();
        checkInputs();
        statusText.textContent = 'Modified';
        const lang = languageSelect.value;
        if (lang) highlightCode(code, langMap[lang], codeHighlight1);
    }, 150); // Debounce for 150ms to avoid excessive re-renders
});

// Sync scroll positions between textarea, line numbers, and syntax highlighting
codeInput.addEventListener('scroll', () => {
    const scrollTop = codeInput.scrollTop;
    const scrollLeft = codeInput.scrollLeft;
    lineNumbers1.scrollTop = scrollTop;
    codeHighlight1.scrollTop = scrollTop;
    codeHighlight1.scrollLeft = scrollLeft;
});

codeOutput.addEventListener('scroll', () => {
    const scrollTop = codeOutput.scrollTop;
    const scrollLeft = codeOutput.scrollLeft;
    lineNumbers2.scrollTop = scrollTop;
    codeHighlight2.scrollTop = scrollTop;
    codeHighlight2.scrollLeft = scrollLeft;
});

// Cursor position updates
codeInput.addEventListener('click', updateCursorPosition);
codeInput.addEventListener('keyup', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
        updateCursorPosition();
    }
});

// Tab key support with smart auto-indentation
codeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = codeInput.selectionStart;
        const end = codeInput.selectionEnd;
        codeInput.value = codeInput.value.substring(0, start) + '    ' + codeInput.value.substring(end);
        codeInput.selectionStart = codeInput.selectionEnd = start + 4;
        const event = new Event('input', { bubbles: true });
        codeInput.dispatchEvent(event);
    } else if (e.key === 'Enter') {
        e.preventDefault();
        const start = codeInput.selectionStart;
        const lines = codeInput.value.substring(0, start).split('\n');
        const currentLine = lines[lines.length - 1];
        const indent = currentLine.match(/^\s*/)[0]; // Preserve current indentation
        const extraIndent = /[{([]\s*$/.test(currentLine) ? '    ' : ''; // Add indent after opening brackets
        const newText = '\n' + indent + extraIndent;
        codeInput.value = codeInput.value.substring(0, start) + newText + codeInput.value.substring(start);
        codeInput.selectionStart = codeInput.selectionEnd = start + newText.length;
        const event = new Event('input', { bubbles: true });
        codeInput.dispatchEvent(event);
    } else if (e.key === 'Backspace') {
        const start = codeInput.selectionStart;
        const end = codeInput.selectionEnd;
        if (start === end) {
            const before = codeInput.value.substring(0, start);
            if (/    $/.test(before)) { // Delete 4 spaces at once (full tab)
                e.preventDefault();
                codeInput.value = before.slice(0, -4) + codeInput.value.substring(start);
                codeInput.selectionStart = codeInput.selectionEnd = start - 4;
                const event = new Event('input', { bubbles: true });
                codeInput.dispatchEvent(event);
            }
        }
    }
});

// Update output pane with syntax highlighting
function updateOutputHighlight() {
    updateLineNumbers(codeOutput, lineNumbers2);
    const lang = languageSelect.value;
    if (lang && codeOutput.value) {
        highlightCode(codeOutput.value, langMap[lang], codeHighlight2);
    }
}

// Clear input
clearBtn.addEventListener('click', () => {
    codeInput.value = '';
    codeOutput.value = '';
    lineNumbers1.textContent = '1';
    lineNumbers2.textContent = '1';
    codeHighlight1.innerHTML = '<code></code>';
    codeHighlight2.innerHTML = '<code></code>';
    statusText.textContent = 'Cleared';
    checkInputs();
});

// Copy output to clipboard
copyBtn.addEventListener('click', async () => {
    if (codeOutput.value) {
        await navigator.clipboard.writeText(codeOutput.value);
        statusText.textContent = 'Copied to clipboard';
        copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8L6 11L13 4" stroke="currentColor" stroke-width="1.5"/></svg>';
        setTimeout(() => {
            copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="5" y="5" width="9" height="9" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M3 11V3C3 2.44772 3.44772 2 4 2H10" stroke="currentColor" stroke-width="1.5"/></svg>';
            statusText.textContent = 'Ready';
        }, 2000);
    }
});

// Process code with Groq API or hardcoded logic
processBtn.addEventListener('click', async () => {
    const code = codeInput.value.trim();
    const language = languageSelect.value;

    if (!code || !language) return;

    if (code.length > MAX_FILE_SIZE) {
        showError(`File too large! Maximum ${MAX_FILE_SIZE / 1000}KB allowed.`);
        return;
    }

    if (mode === 'add') {
        // Detect if code already has comments (20% threshold)
        const commentLines = language === 'python' 
            ? (code.match(/^\s*#/gm) || []).length
            : (code.match(/\/\/|^\/\*|\*\//gm) || []).length;
        const totalLines = code.split('\n').length;
        const commentRatio = commentLines / totalLines;

        // Confirm if user wants to add more comments to already-commented code
        if (commentRatio > 0.2) {
            if (!confirm('This code already has comments. Do you still want to add more comments?')) {
                return;
            }
        }
    }

    processBtn.disabled = true;
    processBtn.classList.add('loading');
    statusText.textContent = 'Processing...';
    codeOutput.value = '';
    codeHighlight2.innerHTML = '<code></code>';

    try {
        const endpoint = mode === 'add' ? '/api/add-comments' : '/api/remove-comments';
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, language, hasComments: mode === 'add' })
        });

        const data = await response.json();

        if (data.success) {
            codeOutput.value = mode === 'add' ? data.commented_code : data.uncommented_code;
            updateOutputHighlight();
            statusText.textContent = 'Success';
        } else {
            showError(data.error || 'Failed to process code');
            statusText.textContent = 'Error';
        }
    } catch (error) {
        showError(error.message);
        statusText.textContent = 'Error';
    } finally {
        processBtn.classList.remove('loading');
        checkInputs();
    }
});

// Initialize
codeInput.disabled = true;
lineNumbers1.textContent = '1';
lineNumbers2.textContent = '1';
codeHighlight1.innerHTML = '<code></code>';
codeHighlight2.innerHTML = '<code></code>';
