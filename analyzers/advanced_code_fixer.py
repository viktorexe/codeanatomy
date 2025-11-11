"""
Advanced code error detection and fixing engine with deep analysis
"""
import ast
import re
from typing import List, Dict, Tuple, Optional, Set

class AdvancedCodeFixer:
    """Industrial-grade Python code fixer with comprehensive error detection"""
    
    @staticmethod
    def fix_python(code: str) -> Tuple[str, List[str]]:
        """Fix Python code with advanced error detection"""
        fixes = []
        fixed_code = code
        
        # Try parsing first
        try:
            ast.parse(code)
        except SyntaxError as e:
            fixed_code, syntax_fixes = AdvancedCodeFixer._fix_syntax_errors(code, e)
            fixes.extend(syntax_fixes)
        
        # Fix logical errors
        fixed_code, logic_fixes = AdvancedCodeFixer._fix_logic_errors(fixed_code)
        fixes.extend(logic_fixes)
        
        # Fix style and best practices
        fixed_code, style_fixes = AdvancedCodeFixer._fix_style_issues(fixed_code)
        fixes.extend(style_fixes)
        
        # Fix common mistakes
        fixed_code, mistake_fixes = AdvancedCodeFixer._fix_common_mistakes(fixed_code)
        fixes.extend(mistake_fixes)
        
        if not fixes:
            fixes.append("No errors found - code looks good!")
        
        return fixed_code, fixes
    
    @staticmethod
    def _fix_syntax_errors(code: str, error: SyntaxError) -> Tuple[str, List[str]]:
        """Fix Python syntax errors"""
        fixes = []
        lines = code.split('\n')
        
        # Missing colons
        for i, line in enumerate(lines):
            stripped = line.strip()
            if stripped and not stripped.startswith('#'):
                # Check for control structures without colons
                if re.match(r'^(if|elif|else|for|while|def|class|try|except|finally|with|async\s+def|async\s+for|async\s+with)\b', stripped):
                    if not stripped.endswith(':') and '{' not in stripped:
                        lines[i] = line.rstrip() + ':'
                        fixes.append(f"Added missing colon at line {i+1}")
        
        # Fix print statements (Python 2 to 3)
        for i, line in enumerate(lines):
            if re.search(r'\bprint\s+[^(]', line) and 'print(' not in line:
                lines[i] = re.sub(r'print\s+(.+)', r'print(\1)', line)
                fixes.append(f"Fixed print statement to Python 3 syntax at line {i+1}")
        
        # Fix indentation
        fixed_lines, indent_fixes = AdvancedCodeFixer._fix_indentation(lines)
        fixes.extend(indent_fixes)
        lines = fixed_lines
        
        # Fix missing parentheses in function calls
        for i, line in enumerate(lines):
            # Fix range without parentheses
            if 'range' in line and not 'range(' in line:
                lines[i] = re.sub(r'range\s+(\d+)', r'range(\1)', line)
                fixes.append(f"Added parentheses to range() at line {i+1}")
        
        # Fix string quotes mismatch
        for i, line in enumerate(lines):
            # Count quotes
            single_quotes = line.count("'") - line.count("\\'")
            double_quotes = line.count('"') - line.count('\\"')
            
            if single_quotes % 2 != 0 and '"' not in line:
                lines[i] = line + "'"
                fixes.append(f"Added missing closing quote at line {i+1}")
            elif double_quotes % 2 != 0 and "'" not in line:
                lines[i] = line + '"'
                fixes.append(f"Added missing closing quote at line {i+1}")
        
        # Fix missing parentheses in tuples
        for i, line in enumerate(lines):
            if 'return' in line and ',' in line and '(' not in line.split('return')[1]:
                lines[i] = re.sub(r'return\s+(.+)', r'return (\1)', line)
                fixes.append(f"Added parentheses to tuple return at line {i+1}")
        
        return '\n'.join(lines), fixes
    
    @staticmethod
    def _fix_indentation(lines: List[str]) -> Tuple[List[str], List[str]]:
        """Fix indentation errors"""
        fixes = []
        fixed_lines = []
        indent_level = 0
        expected_indent = 0
        
        for i, line in enumerate(lines):
            stripped = line.strip()
            
            # Skip empty lines and comments
            if not stripped or stripped.startswith('#'):
                fixed_lines.append(line)
                continue
            
            # Dedent for else, elif, except, finally
            if re.match(r'^(else|elif|except|finally)\b', stripped):
                expected_indent = max(0, indent_level - 1)
            
            # Check current indentation
            current_indent = len(line) - len(line.lstrip())
            spaces_per_indent = 4
            
            # Fix indentation if wrong
            if current_indent != expected_indent * spaces_per_indent:
                fixed_lines.append(' ' * (expected_indent * spaces_per_indent) + stripped)
                fixes.append(f"Fixed indentation at line {i+1}")
            else:
                fixed_lines.append(line)
            
            # Update indent level
            if stripped.endswith(':'):
                indent_level = expected_indent + 1
                expected_indent = indent_level
            elif re.match(r'^(return|break|continue|pass|raise)\b', stripped):
                expected_indent = max(0, indent_level - 1)
            else:
                expected_indent = indent_level
        
        return fixed_lines, fixes
    
    @staticmethod
    def _fix_logic_errors(code: str) -> Tuple[str, List[str]]:
        """Fix logical errors"""
        fixes = []
        lines = code.split('\n')
        
        for i, line in enumerate(lines):
            # Fix assignment in conditions (= instead of ==)
            if re.search(r'\bif\s+[^=]*\s=[^=]', line):
                lines[i] = re.sub(r'(\bif\s+[^=]*\s)=([^=])', r'\1==\2', line)
                fixes.append(f"Changed = to == in condition at line {i+1}")
            
            # Fix missing self in class methods
            if re.match(r'\s*def\s+\w+\s*\(\s*\)', line):
                # Check if inside class
                for j in range(max(0, i-20), i):
                    if 'class ' in lines[j]:
                        lines[i] = re.sub(r'(def\s+\w+)\s*\(\s*\)', r'\1(self)', line)
                        fixes.append(f"Added missing 'self' parameter at line {i+1}")
                        break
            
            # Fix is vs ==
            if re.search(r'\bis\s+\d+\b', line) or re.search(r'\bis\s+["\']', line):
                lines[i] = re.sub(r'\bis\s+', '== ', line)
                fixes.append(f"Changed 'is' to '==' for value comparison at line {i+1}")
            
            # Fix mutable default arguments
            if re.search(r'def\s+\w+\([^)]*=\s*\[\s*\]', line):
                lines[i] = re.sub(r'=\s*\[\s*\]', '=None', line)
                fixes.append(f"Fixed mutable default argument at line {i+1}")
            
            if re.search(r'def\s+\w+\([^)]*=\s*\{\s*\}', line):
                lines[i] = re.sub(r'=\s*\{\s*\}', '=None', line)
                fixes.append(f"Fixed mutable default argument at line {i+1}")
            
            # Fix except without exception type
            if re.match(r'\s*except\s*:', line):
                lines[i] = re.sub(r'except\s*:', 'except Exception:', line)
                fixes.append(f"Added Exception type to bare except at line {i+1}")
            
            # Fix == None to is None
            if '== None' in line:
                lines[i] = line.replace('== None', 'is None')
                fixes.append(f"Changed '== None' to 'is None' at line {i+1}")
            
            if '!= None' in line:
                lines[i] = line.replace('!= None', 'is not None')
                fixes.append(f"Changed '!= None' to 'is not None' at line {i+1}")
        
        return '\n'.join(lines), fixes
    
    @staticmethod
    def _fix_style_issues(code: str) -> Tuple[str, List[str]]:
        """Fix style issues and PEP 8 violations"""
        fixes = []
        lines = code.split('\n')
        
        for i, line in enumerate(lines):
            original = line
            
            # Fix spacing around operators
            if '=' in line and 'def ' not in line and '==' not in line:
                line = re.sub(r'(\w+)=(\w+)', r'\1 = \2', line)
                line = re.sub(r'(\w+)\s{2,}=\s{2,}(\w+)', r'\1 = \2', line)
            
            # Fix spacing after commas
            line = re.sub(r',(\S)', r', \1', line)
            
            # Fix multiple spaces
            if not line.strip().startswith('#'):
                line = re.sub(r'  +', ' ', line.rstrip())
            
            # Remove trailing whitespace
            line = line.rstrip()
            
            if line != original and original.strip():
                lines[i] = line
                fixes.append(f"Fixed spacing/formatting at line {i+1}")
        
        # Remove multiple blank lines
        cleaned_lines = []
        blank_count = 0
        for line in lines:
            if not line.strip():
                blank_count += 1
                if blank_count <= 2:
                    cleaned_lines.append(line)
            else:
                blank_count = 0
                cleaned_lines.append(line)
        
        if len(cleaned_lines) < len(lines):
            fixes.append("Removed excessive blank lines")
        
        return '\n'.join(cleaned_lines), fixes
    
    @staticmethod
    def _fix_common_mistakes(code: str) -> Tuple[str, List[str]]:
        """Fix common Python mistakes"""
        fixes = []
        lines = code.split('\n')
        
        for i, line in enumerate(lines):
            # Fix len() in boolean context
            if re.search(r'if\s+len\([^)]+\)\s*:', line):
                lines[i] = re.sub(r'if\s+len\(([^)]+)\)\s*:', r'if \1:', line)
                fixes.append(f"Simplified len() check at line {i+1}")
            
            # Fix type() comparison
            if 'type(' in line and '==' in line:
                match = re.search(r'type\(([^)]+)\)\s*==\s*(\w+)', line)
                if match:
                    lines[i] = re.sub(r'type\(([^)]+)\)\s*==\s*(\w+)', r'isinstance(\1, \2)', line)
                    fixes.append(f"Changed type() to isinstance() at line {i+1}")
            
            # Fix string concatenation in loops
            if '+=' in line and ('"' in line or "'" in line):
                for j in range(max(0, i-5), i):
                    if 'for ' in lines[j]:
                        fixes.append(f"Warning: String concatenation in loop at line {i+1} - consider using list")
                        break
            
            # Fix open() without with statement
            if re.search(r'\w+\s*=\s*open\(', line):
                fixes.append(f"Suggestion: Use 'with open()' context manager at line {i+1}")
            
            # Fix list() on list comprehension
            if 'list([' in line and 'for ' in line:
                lines[i] = line.replace('list([', '[').replace('])', ']')
                fixes.append(f"Removed unnecessary list() call at line {i+1}")
            
            # Fix dict() on dict comprehension
            if 'dict({' in line and 'for ' in line:
                lines[i] = line.replace('dict({', '{').replace('})', '}')
                fixes.append(f"Removed unnecessary dict() call at line {i+1}")
        
        return '\n'.join(lines), fixes
