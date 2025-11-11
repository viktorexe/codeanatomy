import re

class CAnalyzer:
    @staticmethod
    def analyze(code):
        lines = code.split('\n')
        result = []
        in_multiline_comment = False
        in_struct = False
        in_function = False
        brace_count = 0
        
        for i, line in enumerate(lines):
            stripped = line.strip()
            comment = None
            
            if '/*' in stripped:
                in_multiline_comment = True
            if '*/' in stripped:
                in_multiline_comment = False
                result.append(line)
                continue
                
            if in_multiline_comment or stripped.startswith('//'):
                result.append(line)
                continue
            
            # Preprocessor directives
            if stripped.startswith('#include'):
                match = re.search(r'#include\s*[<"]([^>"]+)[>"]', stripped)
                if match:
                    header = match.group(1)
                    comment = f"// Include header: {header}"
            elif stripped.startswith('#define'):
                match = re.search(r'#define\s+(\w+)', stripped)
                if match:
                    macro = match.group(1)
                    comment = f"// Define macro: {macro}"
            elif stripped.startswith('#ifdef') or stripped.startswith('#ifndef'):
                comment = "// Conditional compilation"
            
            # Struct/Union/Enum declarations
            elif re.match(r'(struct|union|enum)\s+(\w+)', stripped):
                match = re.search(r'(struct|union|enum)\s+(\w+)', stripped)
                if match:
                    type_name = match.group(1)
                    name = match.group(2)
                    comment = f"// {type_name.capitalize()} definition: {name}"
                    in_struct = True
            
            # Typedef
            elif stripped.startswith('typedef'):
                match = re.search(r'typedef\s+(.+?)\s+(\w+);', stripped)
                if match:
                    old_type = match.group(1)
                    new_type = match.group(2)
                    comment = f"// Type alias: {new_type} for {old_type}"
            
            # Function declarations and definitions
            elif re.match(r'(static\s+)?(inline\s+)?(\w+)\s+(\**)(\w+)\s*\([^)]*\)\s*[{;]', stripped):
                match = re.search(r'(static\s+)?(inline\s+)?(\w+)\s+(\**)(\w+)\s*\(([^)]*)\)', stripped)
                if match:
                    static = "static " if match.group(1) else ""
                    inline = "inline " if match.group(2) else ""
                    return_type = match.group(3)
                    pointer = match.group(4)
                    func_name = match.group(5)
                    params = match.group(6).strip() or "void"
                    
                    if func_name not in ['if', 'for', 'while', 'switch', 'return']:
                        if '{' in stripped:
                            comment = f"// {static}{inline}Function: {return_type}{pointer} {func_name}({params})"
                            in_function = True
                        else:
                            comment = f"// Function declaration: {return_type}{pointer} {func_name}({params})"
            
            # Main function
            elif 'int main' in stripped:
                match = re.search(r'int\s+main\s*\(([^)]*)\)', stripped)
                params = match.group(1) if match else ""
                comment = f"// Main entry point: int main({params})"
                in_function = True
            
            # Variable declarations
            elif re.match(r'(static\s+)?(const\s+)?(int|float|double|char|long|short|void|unsigned|signed)\s+(\**)(\w+)', stripped):
                match = re.search(r'(static\s+)?(const\s+)?(int|float|double|char|long|short|void|unsigned|signed)\s+(\**)(\w+)\s*=?\s*(.+)?', stripped)
                if match and not in_function:
                    static = "static " if match.group(1) else ""
                    const = "const " if match.group(2) else ""
                    var_type = match.group(3)
                    pointer = match.group(4)
                    var_name = match.group(5)
                    value = match.group(6)
                    
                    if value:
                        value = value.rstrip(';').strip()
                        if len(value) > 40:
                            value = value[:40] + "..."
                        comment = f"// {static}{const}Variable: {var_type}{pointer} {var_name} = {value}"
                    else:
                        comment = f"// {static}{const}Variable declaration: {var_type}{pointer} {var_name}"
            
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
                    if len(loop_def) > 50:
                        loop_def = loop_def[:50] + "..."
                    comment = f"// For loop: ({loop_def})"
            
            # While loops
            elif re.match(r'while\s*\(', stripped):
                match = re.search(r'while\s*\(([^)]+)\)', stripped)
                if match:
                    condition = match.group(1)
                    comment = f"// While loop: condition ({condition})"
            
            # Do-while
            elif stripped.startswith('do'):
                comment = "// Do-while loop"
            
            # Switch statements
            elif re.match(r'switch\s*\(', stripped):
                match = re.search(r'switch\s*\(([^)]+)\)', stripped)
                if match:
                    expr = match.group(1)
                    comment = f"// Switch statement on: {expr}"
            
            # Case statements
            elif re.match(r'case\s+', stripped):
                match = re.search(r'case\s+(.+?):', stripped)
                if match:
                    value = match.group(1)
                    comment = f"// Case: {value}"
            
            # Default case
            elif stripped.startswith('default:'):
                comment = "// Default case"
            
            # Return statements
            elif stripped.startswith('return'):
                value = stripped[6:].strip().rstrip(';')
                if len(value) > 40:
                    value = value[:40] + "..."
                comment = f"// Return: {value or 'void'}"
            
            # Break/Continue
            elif stripped == 'break;':
                comment = "// Break loop"
            elif stripped == 'continue;':
                comment = "// Continue to next iteration"
            
            # Memory operations
            elif 'malloc' in stripped or 'calloc' in stripped:
                comment = "// Allocate memory"
            elif 'free(' in stripped:
                comment = "// Free allocated memory"
            elif 'realloc' in stripped:
                comment = "// Reallocate memory"
            
            # Pointer operations
            elif stripped.startswith('*') and '=' in stripped:
                comment = "// Dereference and assign"
            elif stripped.startswith('&') and '=' in stripped:
                comment = "// Get address and assign"
            
            # Track braces for context
            if '{' in stripped:
                brace_count += stripped.count('{')
            if '}' in stripped:
                brace_count -= stripped.count('}')
                if brace_count == 0:
                    in_function = False
                    in_struct = False
            
            if comment:
                result.append(comment)
            result.append(line)
        
        return '\n'.join(result)
