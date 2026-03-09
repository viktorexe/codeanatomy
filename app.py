from flask import Flask, render_template, request, jsonify
from groq import Groq
import os

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
    lines = code.split('\n')
    result = []
    
    if language == 'python':
        in_multiline = False
        for line in lines:
            stripped = line.lstrip()
            
            # Handle multiline strings/comments
            if '"""' in line or "'''" in line:
                quote = '"""' if '"""' in line else "'''"
                count = line.count(quote)
                if count == 2:  # Single line docstring
                    continue
                elif count == 1:
                    in_multiline = not in_multiline
                    continue
            
            if in_multiline:
                continue
            
            # Skip lines that are only comments
            if stripped.startswith('#'):
                continue
            
            # Handle inline comments (preserve strings with #)
            if '#' in line:
                in_string = False
                quote_char = None
                new_line = []
                i = 0
                while i < len(line):
                    char = line[i]
                    
                    # Track string state
                    if char in ['"', "'"] and (i == 0 or line[i-1] != '\\'):
                        if not in_string:
                            in_string = True
                            quote_char = char
                        elif char == quote_char:
                            in_string = False
                            quote_char = None
                    
                    # If we hit # outside string, stop
                    if char == '#' and not in_string:
                        break
                    
                    new_line.append(char)
                    i += 1
                
                line = ''.join(new_line).rstrip()
            
            if line.strip():  # Only add non-empty lines
                result.append(line)
    
    elif language == 'c':
        in_multiline = False
        for line in lines:
            stripped = line.lstrip()
            
            # Handle multiline comments
            if '/*' in line and '*/' in line:
                # Single line comment
                before = line.split('/*')[0]
                after = line.split('*/')[-1]
                line = before + after
            elif '/*' in line:
                in_multiline = True
                line = line.split('/*')[0]
            elif '*/' in line:
                in_multiline = False
                line = line.split('*/')[-1]
            elif in_multiline:
                continue
            
            # Handle single line comments (preserve strings with //)
            if '//' in line:
                in_string = False
                new_line = []
                i = 0
                while i < len(line):
                    char = line[i]
                    
                    # Track string state
                    if char == '"' and (i == 0 or line[i-1] != '\\'):
                        in_string = not in_string
                    
                    # If we hit // outside string, stop
                    if i < len(line) - 1 and char == '/' and line[i+1] == '/' and not in_string:
                        break
                    
                    new_line.append(char)
                    i += 1
                
                line = ''.join(new_line).rstrip()
            
            if line.strip():  # Only add non-empty lines
                result.append(line)
    
    return '\n'.join(result)

if __name__ == '__main__':
    app.run(debug=True)
