from flask import Flask, render_template, request, jsonify
from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

app = Flask(__name__)
client = Groq(api_key=os.getenv('GROQ_API_KEY'))  # Initialize Groq AI client

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

        if len(code) > 500000:  # 500KB limit
            return jsonify({'success': False, 'error': 'Code too large. Maximum 500KB allowed'})

        # Use different prompts based on whether code already has comments
        if has_comments:
            prompt = f"""This {language} code already has some comments. Add comments ONLY where needed:
1. Add comments only to complex logic that lacks explanation
2. Do NOT duplicate or modify existing comments
3. Focus on algorithm-level explanations, not line-by-line descriptions
4. Return ONLY the code with added comments, no explanations

Code:
{code}"""
        else:
            prompt = f"""Add meaningful comments to this {language} code following these strict rules:
1. Comment ONLY complex logic, algorithms, and non-obvious sections
2. Do NOT comment obvious code (simple assignments, variable initialization, basic loops)
3. Focus on WHY and HOW algorithms work, not WHAT each line does
4. Use high-level summaries for functions/blocks instead of line-by-line comments
5. Avoid generic comments like "Initialize variable" or "Loop through array"
6. Keep comments concise and meaningful
7. Return ONLY the commented code, no explanations

Code:
{code}"""

        # Call Groq AI API
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
    """API endpoint to remove comments from code (not yet implemented)"""
    return jsonify({'success': False, 'error': 'Not implemented yet'})

# Vercel serverless function handler
app = app
