const backBtn = document.getElementById('backBtn');
const languageSelect = document.getElementById('languageSelect');
const codeInput = document.getElementById('codeInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const clearBtn = document.getElementById('clearBtn');
const statusText = document.getElementById('statusText');
const languageStatus = document.getElementById('languageStatus');
const lineCount = document.getElementById('lineCount');
const lineNumbers = document.getElementById('lineNumbers');
const codeHighlight = document.getElementById('codeHighlight');
const resultsPlaceholder = document.getElementById('resultsPlaceholder');
const resultsLoading = document.getElementById('resultsLoading');
const resultsCards = document.getElementById('resultsCards');

const MAX_FILE_SIZE = 500000;
const langMap = { python: 'python', c: 'c' };

backBtn.addEventListener('click', () => window.location.href = '/');

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

function highlightCode(code, lang) {
    if (!code) { codeHighlight.innerHTML = '<code></code>'; codeInput.classList.remove('has-highlight'); return; }
    const el = codeHighlight.querySelector('code');
    el.textContent = code;
    el.className = `language-${lang}`;
    delete el.dataset.highlighted;
    hljs.highlightElement(el);
    codeInput.classList.add('has-highlight');
}

function updateLineNumbers() {
    const lines = codeInput.value.split('\n').length;
    if (lines > 5000) { lineNumbers.textContent = '...'; return; }
    let nums = '';
    for (let i = 1; i <= lines; i++) nums += i + '\n';
    lineNumbers.textContent = nums;
    lineNumbers.scrollTop = codeInput.scrollTop;
}

function updateCursorPosition() {
    try {
        const pos = codeInput.selectionStart;
        const text = codeInput.value.substring(0, pos);
        lineCount.textContent = `Ln ${text.split('\n').length}, Col ${text.split('\n').pop().length + 1}`;
    } catch { lineCount.textContent = 'Ln 1, Col 1'; }
}

let inputTimeout;
codeInput.addEventListener('input', () => {
    if (codeInput.value.length > MAX_FILE_SIZE) { showError('File too large!'); return; }
    clearTimeout(inputTimeout);
    inputTimeout = setTimeout(() => {
        updateLineNumbers(); updateCursorPosition(); checkInputs();
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

clearBtn.addEventListener('click', () => {
    codeInput.value = '';
    lineNumbers.textContent = '1';
    codeHighlight.innerHTML = '<code></code>';
    codeInput.classList.remove('has-highlight');
    resultsCards.style.display = 'none';
    resultsPlaceholder.style.display = 'flex';
    statusText.textContent = 'Cleared';
    checkInputs();
});

function showError(msg) {
    const t = document.createElement('div');
    t.className = 'error-toast'; t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 4000);
}

function renderResults(data) {
    document.getElementById('algoName').textContent = data.algorithm || 'Unknown';
    document.getElementById('algoDesc').textContent = data.algorithmDescription || '';

    const badge = document.getElementById('ratingBadge');
    const rating = (data.rating || 'moderate').toLowerCase();
    badge.textContent = rating;
    badge.className = 'rating-badge ' + rating;

    const tc = data.timeComplexity || {};
    document.getElementById('timeNotation').textContent = tc.notation || '—';
    document.getElementById('timeBest').textContent = tc.best || '—';
    document.getElementById('timeAvg').textContent = tc.average || '—';
    document.getElementById('timeWorst').textContent = tc.worst || '—';
    document.getElementById('timeExplain').textContent = tc.explanation || '';

    const sc = data.spaceComplexity || {};
    document.getElementById('spaceNotation').textContent = sc.notation || '—';
    document.getElementById('spaceExplain').textContent = sc.explanation || '';

    const tipsList = document.getElementById('tipsList');
    tipsList.innerHTML = '';
    (data.tips || []).forEach(tip => {
        const li = document.createElement('li');
        li.textContent = tip;
        tipsList.appendChild(li);
    });

    resultsCards.style.display = 'flex';
    resultsPlaceholder.style.display = 'none';
    resultsLoading.style.display = 'none';
}

analyzeBtn.addEventListener('click', async () => {
    const code = codeInput.value.trim();
    const language = languageSelect.value;
    if (!code || !language) return;

    analyzeBtn.disabled = true;
    analyzeBtn.classList.add('loading');
    resultsPlaceholder.style.display = 'none';
    resultsCards.style.display = 'none';
    resultsLoading.style.display = 'flex';
    statusText.textContent = 'Analyzing complexity...';

    try {
        const res = await fetch('/api/analyze-complexity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, language })
        });
        const data = await res.json();
        if (data.success && data.analysis) {
            renderResults(data.analysis);
            statusText.textContent = 'Analysis complete';
        } else {
            showError(data.error || 'Analysis failed');
            statusText.textContent = 'Error';
            resultsLoading.style.display = 'none';
            resultsPlaceholder.style.display = 'flex';
        }
    } catch (err) {
        showError(err.message);
        statusText.textContent = 'Error';
        resultsLoading.style.display = 'none';
        resultsPlaceholder.style.display = 'flex';
    } finally {
        analyzeBtn.classList.remove('loading');
        checkInputs();
    }
});

// Auto-detect language on paste
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

codeInput.placeholder = '// Paste code here — language will be auto-detected...';
lineNumbers.textContent = '1';
codeHighlight.innerHTML = '<code></code>';
