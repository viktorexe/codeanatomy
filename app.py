from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
from analyzers import AdvancedPythonAnalyzer
from analyzers.ultra_code_fixer import UltraCodeFixer
import logging
import os

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/sitemap.xml')
def sitemap():
    return send_from_directory('static', 'sitemap.xml', mimetype='application/xml')

@app.route('/robots.txt')
def robots():
    return send_from_directory('static', 'robots.txt', mimetype='text/plain')

def detect_python_code(code):
    """Detect if code is likely Python"""
    # Python-specific indicators
    python_keywords = ['def ', 'class ', 'import ', 'from ', 'if __name__', 'elif ', 'print(', 'self.', 'return ', '__init__']
    non_python_indicators = ['{', '}', ';\n', 'function ', 'var ', 'let ', 'const ', 'console.', '#include', 'int main', 'void ', 'printf(', 'malloc(', 'public class', 'private ', 'public ']
    
    # Count indicators
    python_score = sum(1 for keyword in python_keywords if keyword in code)
    non_python_score = sum(1 for indicator in non_python_indicators if indicator in code)
    
    # Check for common non-Python patterns
    lines = code.strip().split('\n')
    semicolon_lines = sum(1 for line in lines if line.strip().endswith(';'))
    
    # If more than 30% of lines end with semicolons, likely not Python
    if len(lines) > 3 and semicolon_lines / len(lines) > 0.3:
        return False
    
    # If non-Python indicators dominate, reject
    if non_python_score > python_score and non_python_score > 2:
        return False
    
    return True

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    code = data.get('code', '')
    language = data.get('language', 'python')
    
    logger.info(f"Analyzing {language} code, length: {len(code)} characters")
    
    if not code.strip():
        return jsonify({'commented_code': '', 'error': 'No code provided', 'success': False})
    
    # Detect if code is Python
    if not detect_python_code(code):
        logger.warning("Non-Python code detected")
        return jsonify({
            'commented_code': '', 
            'error': 'Only Python code is supported. Please paste valid Python code.', 
            'success': False
        })
    
    try:
        analyzer = AdvancedPythonAnalyzer()
        commented_code = analyzer.analyze(code)
        
        logger.info(f"Analysis completed successfully for {language}")
        return jsonify({'commented_code': commented_code, 'success': True})
    except Exception as e:
        logger.error(f"Error analyzing {language} code: {str(e)}")
        return jsonify({'commented_code': code, 'error': str(e), 'success': False})

@app.route('/fix', methods=['POST'])
def fix():
    data = request.json
    code = data.get('code', '')
    language = data.get('language', 'python')
    
    logger.info(f"Fixing {language} code, length: {len(code)} characters")
    
    if not code.strip():
        return jsonify({'fixed_code': '', 'fixes': [], 'error': 'No code provided', 'success': False})
    
    try:
        if language == 'python':
            fixed_code, fixes = UltraCodeFixer.fix_python(code)
        else:
            logger.warning(f"Unsupported language: {language}")
            return jsonify({'fixed_code': code, 'fixes': [], 'error': 'Only Python is supported', 'success': False})
        
        logger.info(f"Fixed {len(fixes)} issues in {language} code")
        return jsonify({'fixed_code': fixed_code, 'fixes': fixes, 'success': True})
    except Exception as e:
        logger.error(f"Error fixing {language} code: {str(e)}")
        return jsonify({'fixed_code': code, 'fixes': [], 'error': str(e), 'success': False})

if __name__ == '__main__':
    app.run(debug=True)
