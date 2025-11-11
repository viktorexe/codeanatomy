let currentLanguage = '';

// Modal functionality
const featuresBtn = document.getElementById('featuresBtn');
const aboutBtn = document.getElementById('aboutBtn');
const featuresModal = document.getElementById('featuresModal');
const aboutModal = document.getElementById('aboutModal');
const modalCloses = document.querySelectorAll('.modal-close');

if (featuresBtn) {
    featuresBtn.addEventListener('click', () => {
        featuresModal.classList.add('active');
    });
}

if (aboutBtn) {
    aboutBtn.addEventListener('click', () => {
        aboutModal.classList.add('active');
    });
}

modalCloses.forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
        const modalId = closeBtn.getAttribute('data-modal');
        document.getElementById(modalId).classList.remove('active');
    });
});

// Close modal on outside click
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('info-modal')) {
        e.target.classList.remove('active');
    }
});

// Close modal on Escape key
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        featuresModal.classList.remove('active');
        aboutModal.classList.remove('active');
    }
});

const homepage = document.getElementById('homepage');
const languageSelection = document.getElementById('languageSelection');
const editor = document.getElementById('editor');
const addCommentsBtn = document.getElementById('addComments');
const langBtns = document.querySelectorAll('.lang-btn');
const backBtn = document.getElementById('backBtn');
const homeFromLang = document.getElementById('homeFromLang');
const homeFromEditor = document.getElementById('homeFromEditor');
const analyzeBtn = document.getElementById('analyzeBtn');
const copyBtn = document.getElementById('copyBtn');
const inputCode = document.getElementById('inputCode');
const outputCode = document.getElementById('outputCode');
const selectedLangTitle = document.getElementById('selectedLang');
let commentedCodeText = '';

addCommentsBtn.addEventListener('click', () => {
    currentLanguage = 'python';
    selectedLangTitle.textContent = 'Python - Add Comments';
    analyzeBtn.textContent = '▶ Analyze';
    homepage.classList.add('fade-out');
    setTimeout(() => {
        homepage.classList.add('hidden');
        editor.classList.remove('hidden');
    }, 300);
});

langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        currentLanguage = btn.dataset.lang;
        const modeText = currentMode === 'comment' ? 'Add Comments' : 'Fix Errors';
        selectedLangTitle.textContent = `${currentLanguage.charAt(0).toUpperCase() + currentLanguage.slice(1)} - ${modeText}`;
        analyzeBtn.textContent = currentMode === 'comment' ? '▶ Analyze' : '🔧 Fix Code';
        
        languageSelection.classList.add('fade-out');
        setTimeout(() => {
            languageSelection.classList.add('hidden');
            editor.classList.remove('hidden');
        }, 300);
    });
});

backBtn.addEventListener('click', () => {
    editor.classList.add('hidden');
    homepage.classList.remove('hidden', 'fade-out');
    inputCode.value = '';
    document.querySelector('#inputHighlight code').innerHTML = '';
    outputCode.querySelector('code').textContent = '';
});



homeFromEditor.addEventListener('click', () => {
    editor.classList.add('hidden');
    homepage.classList.remove('hidden', 'fade-out');
    inputCode.value = '';
    document.querySelector('#inputHighlight code').innerHTML = '';
    outputCode.querySelector('code').textContent = '';
});

// Syntax highlight input as user types
inputCode.addEventListener('input', () => {
    const code = inputCode.value;
    const highlighted = highlightCode(code, currentLanguage);
    document.querySelector('#inputHighlight code').innerHTML = highlighted;
});

// Sync scrolling between textarea and highlight
inputCode.addEventListener('scroll', () => {
    const highlight = document.getElementById('inputHighlight');
    highlight.scrollTop = inputCode.scrollTop;
    highlight.scrollLeft = inputCode.scrollLeft;
});

analyzeBtn.addEventListener('click', async () => {
    const code = inputCode.value;
    
    if (!code.trim()) {
        outputCode.querySelector('code').textContent = '// No code provided';
        return;
    }
    
    analyzeBtn.textContent = '⏳ Analyzing...';
    analyzeBtn.disabled = true;
    
    try {
        const response = await fetch('/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code: code,
                language: currentLanguage
            })
        });
        
        const data = await response.json();
        if (data.success) {
            commentedCodeText = data.commented_code;
            const highlighted = highlightCode(commentedCodeText, currentLanguage);
            outputCode.querySelector('code').innerHTML = highlighted;
        } else {
            commentedCodeText = '';
            outputCode.querySelector('code').innerHTML = `<span style="color:#f87171">${data.error || 'Analysis failed'}</span>`;
        }
    } catch (error) {
        console.error('Error:', error);
        outputCode.querySelector('code').textContent = '// Error analyzing code';
    } finally {
        analyzeBtn.textContent = '▶ Analyze';
        analyzeBtn.disabled = false;
    }
});

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function highlightCode(code, language) {
    const keywords = {
        python: ['def', 'class', 'if', 'else', 'elif', 'for', 'while', 'import', 'from', 'return', 'try', 'except', 'with', 'as', 'pass', 'break', 'continue', 'lambda', 'yield', 'async', 'await', 'in', 'is', 'not', 'and', 'or', 'None', 'True', 'False', 'self', 'raise', 'finally', 'assert', 'global', 'nonlocal', 'del'],
        javascript: ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return', 'class', 'new', 'this', 'async', 'await', 'import', 'export', 'default', 'try', 'catch', 'throw', 'extends', 'static', 'get', 'set', 'typeof', 'instanceof', 'delete', 'void', 'null', 'undefined', 'true', 'false', 'switch', 'case', 'break', 'continue', 'do', 'finally'],
        c: ['int', 'float', 'double', 'char', 'void', 'if', 'else', 'for', 'while', 'return', 'struct', 'typedef', 'include', 'define', 'sizeof', 'break', 'continue', 'switch', 'case', 'default', 'const', 'static', 'extern', 'unsigned', 'signed', 'long', 'short', 'enum', 'union', 'goto', 'volatile', 'register', 'auto', 'inline', 'NULL']
    };
    
    const langKeywords = keywords[language] || [];
    const lines = code.split('\n');
    const highlighted = [];
    
    for (let line of lines) {
        // Escape HTML first
        let escaped = line
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        
        // Comments (green)
        if (line.trim().startsWith('#') || line.trim().startsWith('//')) {
            highlighted.push(`<span style="color:#6A9955;font-style:italic">${escaped}</span>`);
            continue;
        }
        
        // Strings (orange)
        escaped = escaped.replace(/(&quot;[^&quot;]*&quot;)/g, '###STRING###$1###ENDSTRING###');
        escaped = escaped.replace(/('([^']*)')/g, '###STRING###$1###ENDSTRING###');
        
        // Keywords (blue)
        langKeywords.forEach(keyword => {
            const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
            escaped = escaped.replace(regex, '###KEYWORD###$1###ENDKEYWORD###');
        });
        
        // Numbers (light green) - only standalone numbers, not in words
        escaped = escaped.replace(/\b(\d+)\b/g, '###NUMBER###$1###ENDNUMBER###');
        
        // Function calls (yellow)
        escaped = escaped.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)(?=\()/g, '###FUNCTION###$1###ENDFUNCTION###');
        
        // Replace markers with actual spans
        escaped = escaped.replace(/###STRING###/g, '<span style="color:#CE9178">');
        escaped = escaped.replace(/###ENDSTRING###/g, '</span>');
        escaped = escaped.replace(/###KEYWORD###/g, '<span style="color:#569CD6;font-weight:600">');
        escaped = escaped.replace(/###ENDKEYWORD###/g, '</span>');
        escaped = escaped.replace(/###NUMBER###/g, '<span style="color:#B5CEA8">');
        escaped = escaped.replace(/###ENDNUMBER###/g, '</span>');
        escaped = escaped.replace(/###FUNCTION###/g, '<span style="color:#DCDCAA">');
        escaped = escaped.replace(/###ENDFUNCTION###/g, '</span>');
        
        highlighted.push(escaped);
    }
    
    return highlighted.join('\n');
}

copyBtn.addEventListener('click', async () => {
    if (!commentedCodeText) {
        return;
    }
    
    try {
        await navigator.clipboard.writeText(commentedCodeText);
        copyBtn.classList.add('copied');
        copyBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M13.5 2l-7 7-3-3L2 7.5l4.5 4.5L15 3.5z"/>
            </svg>
            Copied!
        `;
        
        setTimeout(() => {
            copyBtn.classList.remove('copied');
            copyBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M4 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H4z"/>
                    <path d="M2 6h1v7h7v1H2V6z"/>
                </svg>
                Copy
            `;
        }, 2000);
    } catch (err) {
        console.error('Failed to copy:', err);
    }
});
