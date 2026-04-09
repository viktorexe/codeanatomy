from flask import Flask, render_template, request, jsonify
from groq import Groq
import os
import json

app = Flask(__name__)

def get_groq_client():
    api_key = os.environ.get('GROQ_API_KEY')
    if not api_key:
        raise ValueError("GROQ_API_KEY environment variable is not set")
    return Groq(api_key=api_key, max_retries=2)

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
    """API endpoint to analyze code and generate a Mermaid flowchart"""
    try:
        data = request.json
        code = data.get('code', '')
        language = data.get('language', '')

        if not code or not language:
            return jsonify({'success': False, 'error': 'Code and language are required'})

        if len(code) > 500000:
            return jsonify({'success': False, 'error': 'Code too large. Maximum 500KB allowed'})

        prompt = f"""Analyze this {language} code and return a JSON object (no markdown fences, no extra text) with exactly these two fields:

{{
  "mermaid": "<Mermaid flowchart code here>",
  "algorithm": "<Step-by-step algorithm here>"
}}

MERMAID RULES:
1. First line MUST be: flowchart TD
2. Node IDs must be simple alphanumeric: A, B, C1, D2 etc.
3. ALL labels MUST be in double quotes inside brackets:
   - Process: A["Process description"]
   - Decision: B{{"Is condition true?"}}
   - Start: S(("Start"))
   - End: E(("End"))
4. Connections: A --> B or A -->|"label"| B
5. Maximum 20 nodes for readability
6. No special characters outside of quotes

ALGORITHM RULES:
Write a clear numbered step-by-step algorithm in plain English. Format like:
Algorithm: <Name of Algorithm>

Step 1: <what happens>
Step 2: <what happens>
  Step 2.1: <sub-step if needed>
  Step 2.2: <sub-step if needed>
Step 3: <what happens>
...

Be specific, concise, and cover the full logic of the code.

Code:
{code}"""

        client = get_groq_client()
        response = client.chat.completions.create(
            messages=[{
                "role": "user",
                "content": prompt
            }],
            model="llama-3.3-70b-versatile",
            temperature=0.2,
            max_tokens=4000
        )

        raw = response.choices[0].message.content.strip()

        # Remove markdown code blocks if present
        if raw.startswith('```'):
            lines = raw.split('\n')
            if lines[0].startswith('```'):
                lines = lines[1:]
            if lines and lines[-1].strip() == '```':
                lines = lines[:-1]
            raw = '\n'.join(lines)

        try:
            parsed = json.loads(raw)
            mermaid_code = parsed.get('mermaid', '').strip()
            algorithm_steps = parsed.get('algorithm', '').strip()
        except json.JSONDecodeError:
            # Fallback: treat entire response as mermaid code
            mermaid_code = raw
            algorithm_steps = ''

        return jsonify({'success': True, 'mermaid_code': mermaid_code, 'algorithm_steps': algorithm_steps})

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

        client = get_groq_client()
        response = client.chat.completions.create(
            messages=[{
                "role": "user",
                "content": prompt
            }],
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

        # Call Groq AI API
        client = get_groq_client()
        response = client.chat.completions.create(
            messages=[{
                "role": "user",
                "content": prompt
            }],
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
