import re

class JavaScriptAnalyzer:
    @staticmethod
    def analyze(code):
        lines = code.split('\n')
        result = []
        in_multiline_comment = False
        in_class = False
        
        for i, line in enumerate(lines):
            stripped = line.strip()
            comment = None
            
            if '/*' in stripped:
                in_multiline_comment = True
            if '*/' in stripped:
                in_multiline_comment = False
                
            if in_multiline_comment or stripped.startswith('//'):
                result.append(line)
                continue
            
            # Class declaration
            if re.match(r'class\s+(\w+)', stripped):
                match = re.search(r'class\s+(\w+)(?:\s+extends\s+(\w+))?', stripped)
                if match:
                    class_name = match.group(1)
                    extends = f" extends {match.group(2)}" if match.group(2) else ""
                    comment = f"// Class definition: {class_name}{extends}"
                    in_class = True
            
            # Function declarations
            elif re.match(r'function\s+(\w+)', stripped):
                match = re.search(r'function\s+(\w+)\s*\(([^)]*)\)', stripped)
                if match:
                    func_name = match.group(1)
                    params = match.group(2).strip() or "no parameters"
                    comment = f"// Function: {func_name}({params})"
            
            # Arrow functions
            elif re.search(r'(const|let|var)\s+(\w+)\s*=\s*\([^)]*\)\s*=>', stripped):
                match = re.search(r'(const|let|var)\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>', stripped)
                if match:
                    func_name = match.group(2)
                    params = match.group(3).strip() or "no parameters"
                    comment = f"// Arrow function: {func_name}({params})"
            
            # Async functions
            elif re.match(r'async\s+(function|const|let)', stripped):
                match = re.search(r'async\s+(?:function\s+)?(\w+)', stripped)
                if match:
                    func_name = match.group(1)
                    comment = f"// Async function: {func_name}"
            
            # Constructor
            elif stripped.startswith('constructor(') and in_class:
                match = re.search(r'constructor\s*\(([^)]*)\)', stripped)
                params = match.group(1).strip() if match else ""
                comment = f"// Constructor with parameters: {params or 'none'}"
            
            # Methods in class
            elif in_class and re.match(r'(\w+)\s*\([^)]*\)\s*\{', stripped):
                match = re.search(r'(\w+)\s*\(([^)]*)\)', stripped)
                if match:
                    method_name = match.group(1)
                    params = match.group(2).strip() or "no parameters"
                    comment = f"// Method: {method_name}({params})"
            
            # Variable declarations
            elif re.match(r'(const|let|var)\s+(\w+)', stripped):
                match = re.search(r'(const|let|var)\s+(\w+)\s*=\s*(.+)', stripped)
                if match:
                    var_type = match.group(1)
                    var_name = match.group(2)
                    value = match.group(3).rstrip(';')
                    if len(value) > 40:
                        value = value[:40] + "..."
                    comment = f"// Declare {var_type}: {var_name} = {value}"
            
            # If statements
            elif re.match(r'if\s*\(', stripped):
                match = re.search(r'if\s*\(([^)]+)\)', stripped)
                if match:
                    condition = match.group(1)
                    if len(condition) > 40:
                        condition = condition[:40] + "..."
                    comment = f"// Conditional: if ({condition})"
            
            # Else if
            elif re.match(r'else\s+if\s*\(', stripped):
                match = re.search(r'else\s+if\s*\(([^)]+)\)', stripped)
                if match:
                    condition = match.group(1)
                    comment = f"// Else if: ({condition})"
            
            # Else
            elif stripped == 'else' or stripped.startswith('else {'):
                comment = "// Else block"
            
            # For loops
            elif re.match(r'for\s*\(', stripped):
                match = re.search(r'for\s*\(([^)]+)\)', stripped)
                if match:
                    loop_def = match.group(1)
                    if 'of' in loop_def:
                        comment = "// For-of loop: iterate over iterable"
                    elif 'in' in loop_def:
                        comment = "// For-in loop: iterate over object keys"
                    else:
                        comment = "// For loop"
            
            # While loops
            elif re.match(r'while\s*\(', stripped):
                match = re.search(r'while\s*\(([^)]+)\)', stripped)
                if match:
                    condition = match.group(1)
                    comment = f"// While loop: condition ({condition})"
            
            # Switch statements
            elif stripped.startswith('switch'):
                match = re.search(r'switch\s*\(([^)]+)\)', stripped)
                if match:
                    expr = match.group(1)
                    comment = f"// Switch statement on: {expr}"
            
            # Try-catch
            elif stripped.startswith('try'):
                comment = "// Try block for error handling"
            elif re.match(r'catch\s*\(', stripped):
                match = re.search(r'catch\s*\(([^)]+)\)', stripped)
                error = match.group(1) if match else "error"
                comment = f"// Catch block: handle {error}"
            
            # Return statements
            elif stripped.startswith('return'):
                value = stripped[6:].strip().rstrip(';')
                if len(value) > 40:
                    value = value[:40] + "..."
                comment = f"// Return: {value or 'void'}"
            
            # Import/Export
            elif stripped.startswith('import'):
                comment = f"// {stripped[:60]}..." if len(stripped) > 60 else f"// {stripped}"
            elif stripped.startswith('export'):
                comment = "// Export module/component"
            
            # Promises
            elif '.then(' in stripped or '.catch(' in stripped:
                comment = "// Promise chain"
            elif 'await' in stripped:
                comment = "// Await async operation"
            
            if stripped == '}':
                in_class = False
            
            if comment:
                result.append(comment)
            result.append(line)
        
        return '\n'.join(result)
