from flask import Flask, render_template, request, jsonify
from groq import Groq
import groq as groq_sdk
import os
import json
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)

# ── API key pool (KEY_1 is the default; 2/3/4 are fallbacks) ──
_PLACEHOLDER_PREFIXES = ('your_', 'add_your_', 'replace_')

def _get_key_pool():
    """
    Return all real Groq API keys in priority order (KEY_1 → KEY_4).
    Placeholder and empty values are automatically skipped.
    """
    keys = []
    for i in range(1, 5):
        val = os.environ.get(f'GROQ_API_KEY_{i}', '').strip()
        if val and not any(val.lower().startswith(p) for p in _PLACEHOLDER_PREFIXES):
            keys.append((i, val))
    if not keys:
        raise ValueError(
            "No valid Groq API keys found. "
            "Set GROQ_API_KEY_1 (through _4) in your .env"
        )
    return keys

# Exception types that indicate a key-level problem → rotate to next key
_KEY_ERRORS = (
    groq_sdk.RateLimitError,          # 429 — rate-limited
    groq_sdk.AuthenticationError,     # 401 — bad/expired key
    groq_sdk.PermissionDeniedError,   # 403 — key lacks access
)

def call_groq_with_fallback(messages, model, temperature, max_tokens):
    """
    Try each API key in the pool in order.
    Rotates to the next key immediately on rate-limit / auth / permission errors.
    Any other error (bad request, network, etc.) is raised right away.
    Raises the last key-error if every key fails.
    """
    keys = _get_key_pool()
    last_error = None

    for key_num, key in keys:
        try:
            # max_retries=0 so the SDK hands control back to us immediately
            # instead of silently retrying on the same exhausted key
            client = Groq(api_key=key, max_retries=0)
            response = client.chat.completions.create(
                messages=messages,
                model=model,
                temperature=temperature,
                max_tokens=max_tokens
            )
            if key_num > 1:
                app.logger.info(f"[Groq] Succeeded with key #{key_num}")
            return response

        except _KEY_ERRORS as e:
            last_error = e
            app.logger.warning(
                f"[Groq] Key #{key_num} failed ({type(e).__name__}: {e}). "
                f"Rotating to next key..."
            )
            continue   # try next key

        except Exception:
            raise      # non-key error — propagate immediately

    # Every key was tried and failed
    total = len(keys)
    raise RuntimeError(
        f"All {total} Groq API key(s) are exhausted or invalid. "
        f"Last error: {last_error}"
    )

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/editor')
def editor():
    return render_template('editor.html')

@app.route('/anatomy')
def anatomy():
    return render_template('anatomy.html')

@app.route('/api/analyze-code', methods=['POST'])
def analyze_code():
    """API endpoint to analyze code and generate a comprehensive Mermaid flowchart + detailed algorithm"""
    try:
        data = request.json
        code = data.get('code', '')
        language = data.get('language', '')

        if not code or not language:
            return jsonify({'success': False, 'error': 'Code and language are required'})

        if len(code) > 500000:
            return jsonify({'success': False, 'error': 'Code too large. Maximum 500KB allowed'})

        # ── CALL 1: Comprehensive Mermaid Flowchart ──
        mermaid_prompt = f"""You are an expert software architect. Generate a COMPREHENSIVE, HIGHLY DETAILED Mermaid.js flowchart for this {language} code.

Cover EVERYTHING:
- Every function/method definition (use subgraph for each)
- Every class and route handler
- Every if/elif/else branch as diamond decision nodes with True/False paths
- Every loop (for/while) showing iterate and exit edges
- Every return statement labeled with what is returned
- Every try/except/error path
- Every external call (API, DB, etc.)
- Inter-function call relationships

MERMAID SYNTAX RULES (follow exactly):
1. First line: flowchart TD
2. Node IDs: simple alphanumeric only (A, B, FnSort, RouteHome). DO NOT USE PARENTHESES `()` or spaces in Node IDs.
3. Labels ALWAYS in double quotes:
   - Process: A["description details"]
   - Decision: B{{"condition?"}}
   - Start/End: S(("Start"))  E(("End"))
   - I/O: IO[/"input or output"/]
4. NEVER use double quotes (") INSIDE a label! Use single quotes (') inside labels instead. This is critical to prevent syntax errors.
5. Edges: A --> B  or  A -->|"label"| B. (Do not use quotes inside edge labels either).
6. Group each function/route in a subgraph:
   subgraph FnName["function_name(params)"]
   direction TB
   ...
   end
   Make sure the subgraph ID (FnName) is simple alphanumeric without parentheses.
7. Connect subgraphs to show function call chains
8. NO node count limit - be as detailed as the code requires
9. Return ONLY raw Mermaid code. No ``` fences, no explanation.

Code:
{code}"""

        mermaid_response = call_groq_with_fallback(
            messages=[{"role": "user", "content": mermaid_prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.1,
            max_tokens=7000
        )
        mermaid_raw = mermaid_response.choices[0].message.content.strip()

        # Strip any markdown fences
        if '```' in mermaid_raw:
            cleaned = [l for l in mermaid_raw.split('\n') if not l.strip().startswith('```')]
            mermaid_raw = '\n'.join(cleaned).strip()
        if not mermaid_raw.startswith('flowchart') and not mermaid_raw.startswith('graph'):
            mermaid_raw = 'flowchart TD\n' + mermaid_raw

        # ── CALL 2: Exhaustive Step-by-Step Algorithm ──
        algo_prompt = f"""You are an expert computer scientist. Write a COMPREHENSIVE, EXHAUSTIVE step-by-step algorithm document for this {language} code.

You MUST cover:
1. An OVERVIEW paragraph (3-5 sentences) describing the full program
2. For EVERY function/method/route — a dedicated section:
   - Its purpose
   - Parameters (name, type, meaning)
   - Return value
   - Full numbered steps covering ALL logic in the function
   - Sub-steps for complex conditionals and loops
   - Edge cases and error handling
3. Data Flow section
4. Error Handling summary

FORMAT:

Algorithm: [Name]

Overview:
[paragraph]

=== FUNCTION: name(params) ===
Purpose: ...
Parameters:
  - param (type): description
Returns: ...

Steps:
Step 1: ...
Step 2: ...
  Step 2.1: ...
  Step 2.2: ...
Step 3: ...

Edge Cases:
- ...

[Repeat for EVERY function]

=== DATA FLOW ===
...

=== ERROR HANDLING ===
...

RULES:
- Reference actual variable names and values from the code
- Do not skip any function — cover ALL of them
- Include inline Big-O notes where relevant
- Be precise and exhaustive, not vague

Code:
{code}"""

        algo_response = call_groq_with_fallback(
            messages=[{"role": "user", "content": algo_prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.1,
            max_tokens=7000
        )
        algorithm_steps = algo_response.choices[0].message.content.strip()

        return jsonify({
            'success': True,
            'mermaid_code': mermaid_raw,
            'algorithm_steps': algorithm_steps
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/analysis')
def analysis():
    return render_template('analysis.html')

@app.route('/api/analyze-complexity', methods=['POST'])
def analyze_complexity():
    """API endpoint to analyze code complexity, algorithm, and optimization tips"""
    try:
        data = request.json
        code = data.get('code', '')
        language = data.get('language', '')

        if not code or not language:
            return jsonify({'success': False, 'error': 'Code and language are required'})

        if len(code) > 500000:
            return jsonify({'success': False, 'error': 'Code too large. Maximum 500KB allowed'})

        prompt = f"""Analyze this {language} code and provide a detailed complexity analysis.

Return your response as valid JSON with exactly this structure (no markdown, no extra text):
{{
    "algorithm": "Name of the algorithm or technique used (e.g. Binary Search, BFS, Dynamic Programming, Brute Force, etc.)",
    "algorithmDescription": "One sentence explaining what the algorithm does in this code",
    "timeComplexity": {{
        "notation": "O(...)",
        "best": "O(...)",
        "average": "O(...)",
        "worst": "O(...)",
        "explanation": "2-3 sentences explaining why this is the time complexity"
    }},
    "spaceComplexity": {{
        "notation": "O(...)",
        "explanation": "2-3 sentences explaining the space usage"
    }},
    "tips": [
        "Specific actionable optimization tip 1",
        "Specific actionable optimization tip 2",
        "Specific actionable optimization tip 3"
    ],
    "rating": "efficient/moderate/inefficient"
}}

RULES:
1. Return ONLY valid JSON, no markdown fences, no explanations outside JSON
2. Be specific about the Big-O notation
3. Provide 3-5 practical optimization tips
4. The rating should be: "efficient", "moderate", or "inefficient"
5. If there are multiple functions, analyze the overall program complexity

Code:
{code}"""

        response = call_groq_with_fallback(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.2,
            max_tokens=4000
        )

        result = response.choices[0].message.content.strip()

        # Remove markdown code blocks if present
        if result.startswith('```'):
            lines = result.split('\n')
            if lines[0].startswith('```'):
                lines = lines[1:]
            if lines and lines[-1].strip() == '```':
                lines = lines[:-1]
            result = '\n'.join(lines)

        analysis = json.loads(result)
        return jsonify({'success': True, 'analysis': analysis})

    except json.JSONDecodeError:
        return jsonify({'success': True, 'analysis': None, 'raw': result, 'error': 'AI returned invalid JSON'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})


@app.route('/api/add-comments', methods=['POST'])
def add_comments():
    """API endpoint to add intelligent comments to code using Groq AI"""
    try:
        data = request.json
        code = data.get('code', '')
        language = data.get('language', '')
        has_comments = data.get('hasComments', False)

        if not code or not language:
            return jsonify({'success': False, 'error': 'Code and language are required'})

        if len(code) > 500000:
            return jsonify({'success': False, 'error': 'Code too large. Maximum 500KB allowed'})

        # Use different prompts based on whether code already has comments
        if has_comments:
            prompt = f"""Add intelligent comments to this {language} code where explanations are missing.

RULES:
1. Add comments for ALL functions, classes, methods, and complex logic
2. Explain algorithm logic, data transformations, and business rules
3. Comment non-obvious operations, edge cases, and important decisions
4. Do NOT comment simple variable declarations or obvious operations
5. Do NOT duplicate existing comments
6. Keep comments concise and meaningful
7. Return ONLY the code with comments, no explanations

Code:
{code}"""
        else:
            prompt = f"""Add comprehensive, intelligent comments to this {language} code.

RULES:
1. Add comments for EVERY function, class, method explaining purpose, parameters, and return values
2. Explain ALL algorithm logic, loops, conditionals, and data transformations
3. Comment complex expressions, calculations, and non-obvious operations
4. Explain WHY decisions are made, not just WHAT the code does
5. Add section headers for logical code blocks
6. Do NOT comment simple variable declarations like 'x = 5' or 'name = "John"'
7. Do NOT comment obvious operations like 'i++' or 'return result'
8. Keep comments professional and concise
9. Return ONLY the code with comments, no markdown, no explanations

Code:
{code}"""

        # Call Groq AI API with automatic key fallback
        response = call_groq_with_fallback(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            max_tokens=4000
        )

        commented_code = response.choices[0].message.content.strip()
        
        # Remove markdown code blocks if present
        if commented_code.startswith('```'):
            lines = commented_code.split('\n')
            commented_code = '\n'.join(lines[1:-1])

        return jsonify({'success': True, 'commented_code': commented_code})

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/remove-comments', methods=['POST'])
def remove_comments():
    """API endpoint to remove comments from code using hardcoded logic"""
    try:
        data = request.json
        code = data.get('code', '')
        language = data.get('language', '')

        if not code or not language:
            return jsonify({'success': False, 'error': 'Code and language are required'})

        if len(code) > 500000:
            return jsonify({'success': False, 'error': 'Code too large. Maximum 500KB allowed'})

        uncommented_code = remove_comments_logic(code, language)
        return jsonify({'success': True, 'uncommented_code': uncommented_code})

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

def remove_comments_logic(code, language):
    """Remove comments from Python or C code while preserving strings"""
    if language == 'python':
        result = []
        state = 'NORMAL'
        i = 0
        n = len(code)
        while i < n:
            if state == 'NORMAL':
                if code[i] == '#':
                    state = 'COMMENT'
                elif code[i:i+3] == '"""':
                    state = 'STR_MD'
                    result.append('"""')
                    i += 2
                elif code[i:i+3] == "'''":
                    state = 'STR_MS'
                    result.append("'''")
                    i += 2
                elif code[i] == '"':
                    state = 'STR_D'
                    result.append('"')
                elif code[i] == "'":
                    state = 'STR_S'
                    result.append("'")
                else:
                    result.append(code[i])
            elif state == 'COMMENT':
                if code[i] == '\n':
                    state = 'NORMAL'
                    result.append('\n')
            elif state == 'STR_S':
                result.append(code[i])
                if code[i] == '\\' and i + 1 < n:
                    result.append(code[i+1])
                    i += 1
                elif code[i] == "'":
                    state = 'NORMAL'
            elif state == 'STR_D':
                result.append(code[i])
                if code[i] == '\\' and i + 1 < n:
                    result.append(code[i+1])
                    i += 1
                elif code[i] == '"':
                    state = 'NORMAL'
            elif state == 'STR_MS':
                result.append(code[i])
                if code[i] == '\\' and i + 1 < n:
                    result.append(code[i+1])
                    i += 1
                elif code[i:i+3] == "'''":
                    result.append("''")
                    i += 2
                    state = 'NORMAL'
            elif state == 'STR_MD':
                result.append(code[i])
                if code[i] == '\\' and i + 1 < n:
                    result.append(code[i+1])
                    i += 1
                elif code[i:i+3] == '"""':
                    result.append('""')
                    i += 2
                    state = 'NORMAL'
            i += 1
            
        final_lines = []
        for line in "".join(result).split('\n'):
            if line.strip():
                final_lines.append(line.rstrip())
        return '\n'.join(final_lines)

    elif language == 'c':
        result = []
        state = 'NORMAL'
        i = 0
        n = len(code)
        while i < n:
            if state == 'NORMAL':
                if code[i:i+2] == '//':
                    state = 'LINE_COMMENT'
                    i += 1
                elif code[i:i+2] == '/*':
                    state = 'BLOCK_COMMENT'
                    i += 1
                elif code[i] == '"':
                    state = 'STR'
                    result.append('"')
                elif code[i] == "'":
                    state = 'CHAR'
                    result.append("'")
                else:
                    result.append(code[i])
            elif state == 'LINE_COMMENT':
                if code[i] == '\n':
                    state = 'NORMAL'
                    result.append('\n')
            elif state == 'BLOCK_COMMENT':
                if code[i:i+2] == '*/':
                    state = 'NORMAL'
                    i += 1
            elif state == 'STR':
                result.append(code[i])
                if code[i] == '\\' and i + 1 < n:
                    result.append(code[i+1])
                    i += 1
                elif code[i] == '"':
                    state = 'NORMAL'
            elif state == 'CHAR':
                result.append(code[i])
                if code[i] == '\\' and i + 1 < n:
                    result.append(code[i+1])
                    i += 1
                elif code[i] == "'":
                    state = 'NORMAL'
            i += 1
            
        final_lines = []
        for line in "".join(result).split('\n'):
            if line.strip():
                final_lines.append(line.rstrip())
        return '\n'.join(final_lines)

    return code

if __name__ == '__main__':
    app.run(debug=True)
