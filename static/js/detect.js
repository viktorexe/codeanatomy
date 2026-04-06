/**
 * Auto-detect whether code is Python or C based on syntax patterns.
 * Returns 'python', 'c', or null if unsure.
 */
function detectLanguage(code) {
    if (!code || code.trim().length < 10) return null;

    const py = [
        /\bdef\s+\w+\s*\(/, /\bimport\s+\w+/, /\bfrom\s+\w+\s+import/,
        /\bprint\s*\(/, /\belif\b/, /\bself[\.\,\)]/, /\bclass\s+\w+.*:/,
        /:\s*\n\s+/, /\bTrue\b/, /\bFalse\b/, /\bNone\b/,
        /\bin\s+range\s*\(/, /\blen\s*\(/, /\bfor\s+\w+\s+in\b/,
        /\blambda\s/, /\bexcept\b/, /\b__\w+__\b/
    ];
    const c = [
        /^\s*#include\b/m, /\bint\s+main\s*\(/, /\bprintf\s*\(/,
        /\bvoid\s+\w+\s*\(/, /\bstruct\s+\w+/, /\bsizeof\s*\(/,
        /;\s*$/m, /\bmalloc\s*\(/, /\bfree\s*\(/, /\-\>/,
        /\bchar\s*\*/, /\bint\s+\w+\s*[=;]/, /\breturn\s+\d+\s*;/,
        /\b(float|double|long|short|unsigned)\b/, /\bNULL\b/
    ];

    let ps = 0, cs = 0;
    py.forEach(r => { if (r.test(code)) ps++; });
    c.forEach(r => { if (r.test(code)) cs++; });

    if (ps > cs && ps >= 2) return 'python';
    if (cs > ps && cs >= 2) return 'c';
    return null;
}
