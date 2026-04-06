// ── Mermaid initialization ──
mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    themeVariables: {
        primaryColor: '#1e1e3a',
        primaryTextColor: '#e8e8f0',
        primaryBorderColor: '#6366f1',
        lineColor: '#6366f1',
        secondaryColor: '#1a1a2e',
        tertiaryColor: '#13131a',
        background: '#0a0a0f',
        mainBkg: '#1a1a2e',
        nodeBorder: '#6366f1',
        clusterBkg: '#0f0f1a',
        clusterBorder: '#3a3a55',
        titleColor: '#e8e8f0',
        edgeLabelBackground: '#13131a',
        nodeTextColor: '#e8e8f0',
    },
    flowchart: { curve: 'basis', padding: 20, htmlLabels: true }
});

// ── DOM refs ──
const backBtn = document.getElementById('backBtn');
const languageSelect = document.getElementById('languageSelect');
const codeInput = document.getElementById('codeInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const clearBtn = document.getElementById('clearBtn');
const copyMermaidBtn = document.getElementById('copyMermaidBtn');
const downloadBtn = document.getElementById('downloadBtn');
const statusText = document.getElementById('statusText');
const languageStatus = document.getElementById('languageStatus');
const lineCount = document.getElementById('lineCount');
const lineNumbers = document.getElementById('lineNumbers');
const codeHighlight = document.getElementById('codeHighlight');
const diagramContent = document.getElementById('diagramContent');
const diagramPlaceholder = document.getElementById('diagramPlaceholder');
const diagramLoading = document.getElementById('diagramLoading');
const diagramContainer = document.getElementById('diagramContainer');
const mermaidRaw = document.getElementById('mermaidRaw');
const mermaidCodeDisplay = document.getElementById('mermaidCodeDisplay');
const diagramViewBtn = document.getElementById('diagramViewBtn');
const codeViewBtn = document.getElementById('codeViewBtn');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const zoomResetBtn = document.getElementById('zoomResetBtn');
const zoomLevelEl = document.getElementById('zoomLevel');

const MAX_FILE_SIZE = 500000;
const langMap = { python: 'python', c: 'c' };
let currentMermaidCode = '';
let scale = 1, translateX = 0, translateY = 0;
let isDragging = false, startX = 0, startY = 0;
let renderCount = 0;

// ── Navigation ──
backBtn.addEventListener('click', () => window.location.href = '/');

// ── Language selection ──
languageSelect.addEventListener('change', () => {
    const lang = languageSelect.value;
    if (lang) {
        languageStatus.textContent = lang.toUpperCase();
        codeInput.placeholder = `// Paste your ${lang.toUpperCase()} code here...`;
        statusText.textContent = `${lang.toUpperCase()} selected`;
        codeInput.disabled = false;
        codeInput.focus();
        if (codeInput.value) highlightCode(codeInput.value, langMap[lang]);
    } else {
        codeInput.classList.remove('has-highlight');
        languageStatus.textContent = 'No language selected';
        codeInput.placeholder = '// Select a language first...';
        codeInput.disabled = true;
        codeHighlight.innerHTML = '<code></code>';
    }
    checkInputs();
});

function checkInputs() {
    analyzeBtn.disabled = !(languageSelect.value && codeInput.value.trim());
}

// ── Syntax highlighting ──
function highlightCode(code, lang) {
    if (!code) { codeHighlight.innerHTML = '<code></code>'; codeInput.classList.remove('has-highlight'); return; }
    const el = codeHighlight.querySelector('code');
    el.textContent = code;
    el.className = `language-${lang}`;
    delete el.dataset.highlighted;
    hljs.highlightElement(el);
    codeInput.classList.add('has-highlight');
}

// ── Line numbers ──
function updateLineNumbers() {
    const lines = codeInput.value.split('\n').length;
    if (lines > 5000) { lineNumbers.textContent = '...'; return; }
    let nums = '';
    for (let i = 1; i <= lines; i++) nums += i + '\n';
    lineNumbers.textContent = nums;
    lineNumbers.scrollTop = codeInput.scrollTop;
}

// ── Cursor position ──
function updateCursorPosition() {
    try {
        const pos = codeInput.selectionStart;
        const text = codeInput.value.substring(0, pos);
        const ln = text.split('\n').length;
        const col = text.split('\n').pop().length + 1;
        lineCount.textContent = `Ln ${ln}, Col ${col}`;
    } catch { lineCount.textContent = 'Ln 1, Col 1'; }
}

// ── Input handling ──
let inputTimeout;
codeInput.addEventListener('input', () => {
    if (codeInput.value.length > MAX_FILE_SIZE) { showError('File too large!'); return; }
    clearTimeout(inputTimeout);
    inputTimeout = setTimeout(() => {
        updateLineNumbers();
        updateCursorPosition();
        checkInputs();
        const lang = languageSelect.value;
        if (lang) highlightCode(codeInput.value, langMap[lang]);
    }, 150);
});

codeInput.addEventListener('scroll', () => {
    lineNumbers.scrollTop = codeInput.scrollTop;
    codeHighlight.scrollTop = codeInput.scrollTop;
    codeHighlight.scrollLeft = codeInput.scrollLeft;
});

codeInput.addEventListener('click', updateCursorPosition);
codeInput.addEventListener('keyup', (e) => {
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Home','End'].includes(e.key)) updateCursorPosition();
});

// ── Tab & Enter support ──
codeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        e.preventDefault();
        const s = codeInput.selectionStart, end = codeInput.selectionEnd;
        codeInput.value = codeInput.value.substring(0, s) + '    ' + codeInput.value.substring(end);
        codeInput.selectionStart = codeInput.selectionEnd = s + 4;
        codeInput.dispatchEvent(new Event('input', { bubbles: true }));
    } else if (e.key === 'Enter') {
        e.preventDefault();
        const s = codeInput.selectionStart;
        const lines = codeInput.value.substring(0, s).split('\n');
        const cur = lines[lines.length - 1];
        const indent = cur.match(/^\s*/)[0];
        const extra = /[{(\[]\s*$/.test(cur) ? '    ' : '';
        const txt = '\n' + indent + extra;
        codeInput.value = codeInput.value.substring(0, s) + txt + codeInput.value.substring(s);
        codeInput.selectionStart = codeInput.selectionEnd = s + txt.length;
        codeInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
});

// ── Clear ──
clearBtn.addEventListener('click', () => {
    codeInput.value = '';
    lineNumbers.textContent = '1';
    codeHighlight.innerHTML = '<code></code>';
    resetDiagram();
    statusText.textContent = 'Cleared';
    checkInputs();
});

// ── Toasts ──
function showError(msg) {
    const t = document.createElement('div');
    t.className = 'error-toast'; t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 4000);
}
function showSuccess(msg) {
    const t = document.createElement('div');
    t.className = 'success-toast'; t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

// ── Mermaid helpers ──
function sanitizeMermaid(code) {
    code = code.replace(/```mermaid\n?/g, '').replace(/```\n?/g, '').trim();
    if (!code.startsWith('flowchart') && !code.startsWith('graph')) {
        code = 'flowchart TD\n' + code;
    }
    return code;
}

function resetDiagram() {
    diagramContainer.style.display = 'none';
    diagramContainer.innerHTML = '';
    mermaidRaw.style.display = 'none';
    diagramPlaceholder.style.display = 'flex';
    diagramLoading.style.display = 'none';
    currentMermaidCode = '';
    scale = 1; translateX = 0; translateY = 0;
    zoomLevelEl.textContent = '100%';
    diagramViewBtn.classList.add('active');
    codeViewBtn.classList.remove('active');
}

async function renderDiagram(code) {
    currentMermaidCode = sanitizeMermaid(code);
    mermaidCodeDisplay.textContent = currentMermaidCode;

    try {
        renderCount++;
        const { svg } = await mermaid.render('diag-' + renderCount, currentMermaidCode);
        diagramContainer.innerHTML = svg;
        diagramContainer.style.display = 'flex';
        diagramPlaceholder.style.display = 'none';
        diagramLoading.style.display = 'none';
        mermaidRaw.style.display = 'none';
        diagramViewBtn.classList.add('active');
        codeViewBtn.classList.remove('active');

        const svgEl = diagramContainer.querySelector('svg');
        if (svgEl) {
            svgEl.style.maxWidth = '100%';
            svgEl.style.height = 'auto';
            svgEl.style.transition = 'transform 0.15s ease-out';
        }
        statusText.textContent = 'Analysis complete';
        fitDiagram();
    } catch (err) {
        console.error('Mermaid render error:', err);
        diagramLoading.style.display = 'none';
        diagramPlaceholder.style.display = 'none';
        diagramContainer.style.display = 'none';
        mermaidRaw.style.display = 'block';
        codeViewBtn.classList.add('active');
        diagramViewBtn.classList.remove('active');
        showError('Diagram render issue — raw Mermaid code shown. You can copy it to mermaid.live');
        statusText.textContent = 'Raw code shown';
    }
}

// ── Analyze button ──
analyzeBtn.addEventListener('click', async () => {
    const code = codeInput.value.trim();
    const language = languageSelect.value;
    if (!code || !language) return;
    if (code.length > MAX_FILE_SIZE) { showError('File too large!'); return; }

    analyzeBtn.disabled = true;
    analyzeBtn.classList.add('loading');
    diagramPlaceholder.style.display = 'none';
    diagramContainer.style.display = 'none';
    mermaidRaw.style.display = 'none';
    diagramLoading.style.display = 'flex';
    statusText.textContent = 'Analyzing code structure...';

    try {
        const res = await fetch('/api/analyze-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, language })
        });
        const data = await res.json();
        if (data.success) {
            await renderDiagram(data.mermaid_code);
        } else {
            showError(data.error || 'Analysis failed');
            statusText.textContent = 'Error';
            diagramLoading.style.display = 'none';
            diagramPlaceholder.style.display = 'flex';
        }
    } catch (err) {
        showError(err.message);
        statusText.textContent = 'Error';
        diagramLoading.style.display = 'none';
        diagramPlaceholder.style.display = 'flex';
    } finally {
        analyzeBtn.classList.remove('loading');
        checkInputs();
    }
});

// ── Tab switching ──
diagramViewBtn.addEventListener('click', () => {
    diagramViewBtn.classList.add('active');
    codeViewBtn.classList.remove('active');
    if (currentMermaidCode && diagramContainer.innerHTML) {
        diagramContainer.style.display = 'flex';
        mermaidRaw.style.display = 'none';
    }
});
codeViewBtn.addEventListener('click', () => {
    codeViewBtn.classList.add('active');
    diagramViewBtn.classList.remove('active');
    if (currentMermaidCode) {
        mermaidRaw.style.display = 'block';
        diagramContainer.style.display = 'none';
    }
});

// ── Zoom & Pan ──
function updateTransform() {
    const svg = diagramContainer.querySelector('svg');
    if (!svg) return;
    svg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    svg.style.transformOrigin = 'center center';
    zoomLevelEl.textContent = Math.round(scale * 100) + '%';
}

function fitDiagram() {
    scale = 1; translateX = 0; translateY = 0;
    updateTransform();
}

zoomInBtn.addEventListener('click', () => { scale = Math.min(5, scale + 0.2); updateTransform(); });
zoomOutBtn.addEventListener('click', () => { scale = Math.max(0.1, scale - 0.2); updateTransform(); });
zoomResetBtn.addEventListener('click', fitDiagram);

diagramContent.addEventListener('wheel', (e) => {
    if (!diagramContainer.innerHTML) return;
    e.preventDefault();
    scale = Math.max(0.1, Math.min(5, scale + (e.deltaY > 0 ? -0.1 : 0.1)));
    updateTransform();
});

diagramContent.addEventListener('mousedown', (e) => {
    if (!diagramContainer.innerHTML) return;
    isDragging = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    diagramContent.style.cursor = 'grabbing';
});
window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    updateTransform();
});
window.addEventListener('mouseup', () => {
    if (isDragging) { isDragging = false; diagramContent.style.cursor = 'grab'; }
});

// ── Copy & Download ──
copyMermaidBtn.addEventListener('click', async () => {
    if (!currentMermaidCode) return;
    await navigator.clipboard.writeText(currentMermaidCode);
    showSuccess('Mermaid code copied!');
});

downloadBtn.addEventListener('click', () => {
    const svg = diagramContainer.querySelector('svg');
    if (!svg) return;
    const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'code-anatomy.svg'; a.click();
    URL.revokeObjectURL(url);
    showSuccess('SVG downloaded!');
});

// ── Auto-detect language on paste ──
codeInput.addEventListener('paste', () => {
    setTimeout(() => {
        if (!languageSelect.value && codeInput.value.trim()) {
            const detected = detectLanguage(codeInput.value);
            if (detected) {
                languageSelect.value = detected;
                languageSelect.dispatchEvent(new Event('change'));
                statusText.textContent = `${detected.toUpperCase()} auto-detected`;
            }
        }
    }, 50);
});

// ── Init ──
codeInput.placeholder = '// Paste code here — language will be auto-detected...';
lineNumbers.textContent = '1';
codeHighlight.innerHTML = '<code></code>';

