"""
Intelligent code error detection and fixing engine
"""
import ast
import re
from typing import List, Dict, Tuple, Optional

class CodeFixer:
    """Fix common code errors across languages"""
    
    @staticmethod
    def fix_python(code: str) -> Tuple[str, List[str]]:
        """Fix Python code errors"""
        fixes = []
        fixed_code = code
        
        try:
            # Try to parse first
            ast.parse(code)
            fixes.append("No syntax errors found")
        except SyntaxError as e:
            # Fix common syntax errors
            fixed_code, error_fixes = CodeFixer._fix_python_syntax(code, e)
            fixes.extend(error_fixes)
        
        # Fix common logical errors
        fixed_code, logic_fixes = CodeFixer._fix_python_logic(fixed_code)
        fixes.extend(logic_fixes)
        
        return fixed_code, fixes
    
    @staticmethod
    def _fix_python_syntax(code: str, error: SyntaxError) -> Tuple[str, List[str]]:
        """Fix Python syntax errors"""
        fixes = []
        lines = code.split('\n')
        
        # Missing colons
        for i, line in enumerate(lines):
            stripped = line.strip()
            if stripped and not stripped.startswith('#'):
                if re.match(r'(if|elif|else|for|while|def|class|try|except|finally|with)\b', stripped):
                    if not stripped.endswith(':') and not stripped.endswith(':\\'):
                        lines[i] = line + ':'
                        fixes.append(f"Added missing colon at line {i+1}")
        
        # Missing parentheses in print (Python 3)
        for i, line in enumerate(lines):
            if 'print ' in line and 'print(' not in line:
                lines[i] = re.sub(r'print\s+(.+)', r'print(\1)', line)
                fixes.append(f"Fixed print statement at line {i+1}")
        
        # Indentation errors
        fixed_lines = []
        indent_level = 0
        for i, line in enumerate(lines):
            stripped = line.strip()
            if not stripped or stripped.startswith('#'):
                fixed_lines.append(line)
                continue
            
            # Decrease indent for else, elif, except, finally
            if re.match(r'(else|elif|except|finally)\b', stripped):
                indent_level = max(0, indent_level - 1)
            
            # Apply indent
            fixed_lines.append('    ' * indent_level + stripped)
            
            # Increase indent after colon
            if stripped.endswith(':'):
                indent_level += 1
            
            # Decrease indent after return, break, continue, pass
            if re.match(r'(return|break|continue|pass)\b', stripped):
                indent_level = max(0, indent_level - 1)
        
        return '\n'.join(fixed_lines), fixes
    
    @staticmethod
    def _fix_python_logic(code: str) -> Tuple[str, List[str]]:
        """Fix Python logical errors"""
        fixes = []
        lines = code.split('\n')
        
        for i, line in enumerate(lines):
            # Fix == vs =
            if re.search(r'if\s+\w+\s*=\s*[^=]', line):
                lines[i] = re.sub(r'(if\s+\w+\s*)=(\s*[^=])', r'\1==\2', line)
                fixes.append(f"Fixed assignment in condition at line {i+1}")
            
            # Fix missing self in class methods
            if re.match(r'\s*def\s+\w+\s*\(\s*\)', line) and i > 0:
                if any('class ' in lines[j] for j in range(max(0, i-10), i)):
                    lines[i] = re.sub(r'def\s+(\w+)\s*\(\s*\)', r'def \1(self)', line)
                    fixes.append(f"Added missing 'self' parameter at line {i+1}")
        
        return '\n'.join(lines), fixes
    
    @staticmethod
    def fix_javascript(code: str) -> Tuple[str, List[str]]:
        """Fix JavaScript code errors"""
        fixes = []
        lines = code.split('\n')
        
        for i, line in enumerate(lines):
            # Missing semicolons
            stripped = line.strip()
            if stripped and not stripped.startswith('//') and not stripped.startswith('/*'):
                if re.match(r'(var|let|const|return)\s+', stripped):
                    if not stripped.endswith((';', '{', '}')):
                        lines[i] = line + ';'
                        fixes.append(f"Added missing semicolon at line {i+1}")
            
            # Fix == to ===
            if '==' in line and '===' not in line:
                lines[i] = line.replace('==', '===')
                fixes.append(f"Changed == to === at line {i+1}")
            
            # Fix != to !==
            if '!=' in line and '!==' not in line:
                lines[i] = line.replace('!=', '!==')
                fixes.append(f"Changed != to !== at line {i+1}")
            
            # Missing var/let/const
            if re.match(r'^\s*[a-zA-Z_]\w*\s*=\s*', line):
                if not re.match(r'^\s*(var|let|const)\s+', line):
                    lines[i] = re.sub(r'^(\s*)([a-zA-Z_]\w*)', r'\1const \2', line)
                    fixes.append(f"Added const declaration at line {i+1}")
        
        return '\n'.join(lines), fixes
    
    @staticmethod
    def fix_c(code: str) -> Tuple[str, List[str]]:
        """Fix C code errors"""
        fixes = []
        lines = code.split('\n')
        
        for i, line in enumerate(lines):
            # Missing semicolons
            stripped = line.strip()
            if stripped and not stripped.startswith('//') and not stripped.startswith('/*'):
                if not stripped.endswith((';', '{', '}', ':')):
                    if re.match(r'(int|float|double|char|void|return|break|continue)', stripped):
                        lines[i] = line + ';'
                        fixes.append(f"Added missing semicolon at line {i+1}")
            
            # Missing #include <stdio.h> for printf/scanf
            if 'printf' in line or 'scanf' in line:
                if not any('#include' in l and 'stdio' in l for l in lines[:i]):
                    lines.insert(0, '#include <stdio.h>')
                    fixes.append("Added missing #include <stdio.h>")
                    break
            
            # Missing return 0 in main
            if 'int main' in line:
                # Check if there's a return statement
                has_return = any('return' in lines[j] for j in range(i, min(i+20, len(lines))))
                if not has_return:
                    # Find closing brace
                    for j in range(i, min(i+20, len(lines))):
                        if lines[j].strip() == '}':
                            lines.insert(j, '    return 0;')
                            fixes.append("Added missing return 0 in main")
                            break
        
        return '\n'.join(lines), fixes
