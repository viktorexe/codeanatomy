import re
from typing import Dict, List, Optional, Set
from .base_analyzer import BaseAnalyzer
from .intelligent_comment_engine import IntelligentCommentEngine

class AdvancedCAnalyzer(BaseAnalyzer):
    """Industrial-grade C/C++ analyzer"""
    
    def __init__(self):
        self.comments: Dict[int, str] = {}
        self.in_multiline_comment = False
        self.in_struct = False
        self.in_function = False
        self.in_class = False
        self.brace_depth = 0
        self.current_context = None
        
    def analyze(self, code: str) -> str:
        """Analyze C/C++ code"""
        lines = code.split('\n')
        result = []
        
        for i, line in enumerate(lines):
            stripped = line.strip()
            comment = self._analyze_line(stripped, i, lines)
            
            if comment:
                indent = self._get_indent(line)
                result.append(indent + comment)
            
            result.append(line)
            
            # Track braces
            if not self.in_multiline_comment:
                self.brace_depth += stripped.count('{') - stripped.count('}')
                if self.brace_depth == 0:
                    self.in_function = False
                    self.in_struct = False
                    self.in_class = False
        
        return '\n'.join(result)
    
    def _should_comment(self, stripped: str) -> bool:
        """Determine if line is significant enough to comment"""
        if not stripped or stripped.startswith('//') or stripped in ['{', '}', '};']:
            return False
        return True
    
    def _analyze_line(self, stripped: str, line_num: int, lines: List[str]) -> Optional[str]:
        """Analyze a single line"""
        
        # Handle multiline comments
        if '/*' in stripped:
            self.in_multiline_comment = True
        if '*/' in stripped:
            self.in_multiline_comment = False
            return None
        if self.in_multiline_comment or stripped.startswith('//'):
            return None
        
        if not self._should_comment(stripped):
            return None
        
        # Preprocessor directives
        if match := re.match(r'#include\s*[<"]([^>"]+)[>"]', stripped):
            header = match.group(1)
            header_type = "system" if '<' in stripped else "local"
            return f"// Include {header_type} header: {header}"
        
        if match := re.match(r'#define\s+(\w+)(?:\(([^)]+)\))?\s*(.*)', stripped):
            macro = match.group(1)
            params = match.group(2)
            value = match.group(3)
            if params:
                return f"// Define macro function: {macro}({params})"
            elif value:
                return f"// Define macro: {macro} = {value[:40]}"
            else:
                return f"// Define macro: {macro}"
        
        if match := re.match(r'#ifdef\s+(\w+)', stripped):
            return f"// Conditional compilation: if {match.group(1)} is defined"
        
        if match := re.match(r'#ifndef\s+(\w+)', stripped):
            return f"// Conditional compilation: if {match.group(1)} is not defined"
        
        if stripped.startswith('#if '):
            condition = stripped[4:]
            return f"// Conditional compilation: if {condition}"
        
        if stripped.startswith('#elif '):
            condition = stripped[6:]
            return f"// Conditional compilation: else if {condition}"
        
        if stripped == '#else':
            return "// Conditional compilation: else"
        
        if stripped == '#endif':
            return "// End conditional compilation"
        
        if match := re.match(r'#pragma\s+(.+)', stripped):
            directive = match.group(1)
            return f"// Compiler directive: pragma {directive}"
        
        # Namespace (C++)
        if match := re.match(r'namespace\s+(\w+)', stripped):
            namespace = match.group(1)
            return f"// Namespace: {namespace}"
        
        if stripped.startswith('using namespace'):
            match = re.search(r'using namespace\s+(\w+)', stripped)
            if match:
                return f"// Using namespace: {match.group(1)}"
        
        # Class (C++)
        if match := re.match(r'class\s+(\w+)(?:\s*:\s*(public|private|protected)\s+(\w+))?', stripped):
            class_name = match.group(1)
            access = match.group(2)
            base = match.group(3)
            inheritance = f" {access} inherits from {base}" if base else ""
            self.in_class = True
            self.current_context = class_name
            return f"// Class definition: {class_name}{inheritance}"
        
        # Struct/Union/Enum
        if match := re.match(r'(struct|union|enum)\s+(\w+)', stripped):
            type_name = match.group(1)
            name = match.group(2)
            self.in_struct = True
            self.current_context = name
            return f"// {type_name.capitalize()} definition: {name}"
        
        # Typedef
        if match := re.match(r'typedef\s+struct\s+(\w+)', stripped):
            struct_name = match.group(1)
            return f"// Type definition for struct: {struct_name}"
        
        if match := re.match(r'typedef\s+(.+?)\s+(\w+);', stripped):
            old_type = match.group(1)
            new_type = match.group(2)
            return f"// Type alias: {new_type} for {old_type}"
        
        # Template (C++)
        if match := re.match(r'template\s*<(.+?)>', stripped):
            params = match.group(1)
            return f"// Template with parameters: {params}"
        
        # Function declarations and definitions
        if match := re.match(r'(static\s+)?(inline\s+)?(virtual\s+)?(const\s+)?(\w+)\s+(\**)(\w+)\s*\(([^)]*)\)\s*(const)?\s*[{;]', stripped):
            static = "static " if match.group(1) else ""
            inline = "inline " if match.group(2) else ""
            virtual = "virtual " if match.group(3) else ""
            const_ret = "const " if match.group(4) else ""
            return_type = match.group(5)
            pointer = match.group(6)
            func_name = match.group(7)
            params = match.group(8).strip() or "void"
            const_method = " const" if match.group(9) else ""
            
            if func_name not in ['if', 'for', 'while', 'switch', 'return', 'sizeof']:
                if '{' in stripped:
                    self.in_function = True
                    return f"// {static}{inline}{virtual}Function: {const_ret}{return_type}{pointer} {func_name}({params}){const_method}"
                else:
                    return f"// Function declaration: {const_ret}{return_type}{pointer} {func_name}({params}){const_method}"
        
        # Constructor/Destructor (C++)
        if self.in_class and (match := re.match(r'(\w+)\s*\(([^)]*)\)', stripped)):
            name = match.group(1)
            params = match.group(2).strip() or "no parameters"
            if name == self.current_context:
                return f"// Constructor: {name}({params})"
            elif name == f"~{self.current_context}":
                return f"// Destructor: {name}()"
        
        # Main function
        if 'int main' in stripped:
            match = re.search(r'int\s+main\s*\(([^)]*)\)', stripped)
            params = match.group(1) if match else ""
            self.in_function = True
            return f"// Program entry point: int main({params})"
        
        # Variable declarations (global/local)
        if match := re.match(r'(extern\s+)?(static\s+)?(const\s+)?(volatile\s+)?(unsigned\s+|signed\s+)?(int|float|double|char|long|short|void|bool|size_t|uint8_t|uint16_t|uint32_t|uint64_t)\s+(\**)(\w+)(?:\[([^\]]+)\])?\s*(?:=\s*(.+))?', stripped):
            extern = "extern " if match.group(1) else ""
            static = "static " if match.group(2) else ""
            const = "const " if match.group(3) else ""
            volatile = "volatile " if match.group(4) else ""
            unsigned = match.group(5) or ""
            var_type = match.group(6)
            pointer = match.group(7)
            var_name = match.group(8)
            array_size = match.group(9)
            value = match.group(10)
            
            if not self.in_function:
                array_notation = f"[{array_size}]" if array_size else ""
                type_str = f"{extern}{static}{const}{volatile}{unsigned}{var_type}{pointer}{array_notation}"
                
                if value:
                    value = value.rstrip(';').strip()
                    if len(value) > 40:
                        value = value[:40] + "..."
                    return f"// Global variable: {type_str} {var_name} = {value}"
                else:
                    return f"// Global variable declaration: {type_str} {var_name}"
        
        # Pointer declarations
        if match := re.match(r'(\w+)\s*(\*+)\s*(\w+)\s*=', stripped):
            type_name = match.group(1)
            pointer_level = len(match.group(2))
            var_name = match.group(3)
            return f"// Pointer declaration: {type_name}{'*' * pointer_level} {var_name}"
        
        # If statements
        if match := re.match(r'if\s*\((.+?)\)(?:\s*\{)?', stripped):
            condition = match.group(1)
            if len(condition) > 50:
                condition = condition[:50] + "..."
            return f"// Conditional: if ({condition})"
        
        # Else if
        if match := re.match(r'else\s+if\s*\((.+?)\)(?:\s*\{)?', stripped):
            condition = match.group(1)
            return f"// Else if: ({condition})"
        
        # Else
        if stripped == 'else' or stripped.startswith('else {'):
            return "// Else block"
        
        # For loops
        if match := re.match(r'for\s*\((.+?)\)(?:\s*\{)?', stripped):
            loop_def = match.group(1)
            if len(loop_def) > 60:
                loop_def = loop_def[:60] + "..."
            return f"// For loop: ({loop_def})"
        
        # While loops
        if match := re.match(r'while\s*\((.+?)\)(?:\s*\{)?', stripped):
            condition = match.group(1)
            return f"// While loop: condition ({condition})"
        
        # Do-while
        if stripped.startswith('do') and (stripped.endswith('{') or stripped == 'do'):
            return "// Do-while loop"
        
        # Switch statements
        if match := re.match(r'switch\s*\((.+?)\)(?:\s*\{)?', stripped):
            expr = match.group(1)
            return f"// Switch statement on: {expr}"
        
        # Case statements
        if match := re.match(r'case\s+(.+?):', stripped):
            value = match.group(1)
            return f"// Case: {value}"
        
        # Default case
        if stripped.startswith('default:'):
            return "// Default case"
        
        # Return statements
        if match := re.match(r'return\s+(.+)', stripped):
            value = match.group(1).rstrip(';')
            if len(value) > 50:
                value = value[:50] + "..."
            return f"// Return: {value}"
        elif stripped == 'return;':
            return "// Return: void"
        
        # Break/Continue
        if stripped == 'break;':
            return "// Break from loop/switch"
        
        if stripped == 'continue;':
            return "// Continue to next iteration"
        
        # Goto
        if match := re.match(r'goto\s+(\w+);', stripped):
            label = match.group(1)
            return f"// Jump to label: {label}"
        
        # Label
        if match := re.match(r'(\w+):', stripped) and not stripped.startswith('case') and not stripped.startswith('default'):
            label = match.group(1)
            return f"// Label: {label}"
        
        # Memory allocation
        if 'malloc(' in stripped:
            match = re.search(r'malloc\s*\(([^)]+)\)', stripped)
            size = match.group(1) if match else "size"
            return f"// Allocate memory: malloc({size})"
        
        if 'calloc(' in stripped:
            match = re.search(r'calloc\s*\(([^)]+)\)', stripped)
            args = match.group(1) if match else "count, size"
            return f"// Allocate and zero memory: calloc({args})"
        
        if 'realloc(' in stripped:
            return "// Reallocate memory block"
        
        if 'free(' in stripped:
            match = re.search(r'free\s*\(([^)]+)\)', stripped)
            ptr = match.group(1) if match else "pointer"
            return f"// Free allocated memory: free({ptr})"
        
        # Memory operations
        if 'memcpy(' in stripped:
            return "// Copy memory block"
        
        if 'memset(' in stripped:
            return "// Set memory block"
        
        if 'memmove(' in stripped:
            return "// Move memory block"
        
        if 'memcmp(' in stripped:
            return "// Compare memory blocks"
        
        # String operations
        if 'strcpy(' in stripped or 'strncpy(' in stripped:
            return "// Copy string"
        
        if 'strcat(' in stripped or 'strncat(' in stripped:
            return "// Concatenate strings"
        
        if 'strcmp(' in stripped or 'strncmp(' in stripped:
            return "// Compare strings"
        
        if 'strlen(' in stripped:
            return "// Get string length"
        
        # File operations
        if 'fopen(' in stripped:
            return "// Open file"
        
        if 'fclose(' in stripped:
            return "// Close file"
        
        if 'fread(' in stripped:
            return "// Read from file"
        
        if 'fwrite(' in stripped:
            return "// Write to file"
        
        if 'fprintf(' in stripped:
            return "// Formatted write to file"
        
        if 'fscanf(' in stripped:
            return "// Formatted read from file"
        
        # I/O operations
        if 'printf(' in stripped:
            return "// Print formatted output"
        
        if 'scanf(' in stripped:
            return "// Read formatted input"
        
        if 'puts(' in stripped:
            return "// Print string with newline"
        
        if 'gets(' in stripped:
            return "// Read string (unsafe)"
        
        # Pointer operations
        if match := re.match(r'\*(\w+)\s*=', stripped):
            ptr = match.group(1)
            return f"// Dereference pointer: *{ptr}"
        
        if match := re.match(r'&(\w+)', stripped):
            var = match.group(1)
            return f"// Get address of: &{var}"
        
        # Sizeof
        if 'sizeof(' in stripped:
            match = re.search(r'sizeof\s*\(([^)]+)\)', stripped)
            operand = match.group(1) if match else "type"
            return f"// Get size of: sizeof({operand})"
        
        # Type casting
        if match := re.search(r'\((\w+\s*\**)\)\s*(\w+)', stripped):
            cast_type = match.group(1)
            var = match.group(2)
            return f"// Type cast: ({cast_type}){var}"
        
        # New/Delete (C++)
        if 'new ' in stripped:
            match = re.search(r'new\s+(\w+)', stripped)
            type_name = match.group(1) if match else "object"
            return f"// Allocate object: new {type_name}"
        
        if 'delete ' in stripped:
            return "// Delete object"
        
        if 'delete[] ' in stripped:
            return "// Delete array"
        
        return None
