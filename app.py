from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from analyzers import AdvancedPythonAnalyzer, AdvancedJavaScriptAnalyzer, AdvancedCAnalyzer
from analyzers.ultra_code_fixer import UltraCodeFixer
import logging

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    code = data.get('code', '')
    language = data.get('language', 'python')
    
    logger.info(f"Analyzing {language} code, length: {len(code)} characters")
    
    if not code.strip():
        return jsonify({'commented_code': '', 'error': 'No code provided', 'success': False})
    
    try:
        if language == 'python':
            analyzer = AdvancedPythonAnalyzer()
            commented_code = analyzer.analyze(code)
        elif language == 'javascript':
            analyzer = AdvancedJavaScriptAnalyzer()
            commented_code = analyzer.analyze(code)
        elif language == 'c':
            analyzer = AdvancedCAnalyzer()
            commented_code = analyzer.analyze(code)
        else:
            logger.warning(f"Unsupported language: {language}")
            return jsonify({'commented_code': code, 'error': 'Unsupported language', 'success': False})
        
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
