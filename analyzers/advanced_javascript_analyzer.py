import re
from typing import Dict, List, Optional, Tuple
from .base_analyzer import BaseAnalyzer
from .intelligent_comment_engine import IntelligentCommentEngine

class AdvancedJavaScriptAnalyzer(BaseAnalyzer):
    """Industrial-grade JavaScript/TypeScript analyzer"""
    
    def __init__(self):
        self.comments: Dict[int, str] = {}
        self.in_multiline_comment = False
        self.in_class = False
        self.in_function = False
        self.brace_depth = 0
        self.class_name = None
        
    def analyze(self, code: str) -> str:
        """Analyze JavaScript/TypeScript code"""
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
            self.brace_depth += stripped.count('{') - stripped.count('}')
            if self.brace_depth == 0:
                self.in_class = False
                self.in_function = False
        
        return '\n'.join(result)
    
    def _should_comment(self, stripped: str) -> bool:
        """Determine if line is significant enough to comment"""
        # Skip empty lines, existing comments, simple assignments
        if not stripped or stripped.startswith('//') or stripped.startswith('/*'):
            return False
        if stripped in ['{', '}', '};', ');', '];']:
            return False
        return True
    
    def _analyze_line(self, stripped: str, line_num: int, lines: List[str]) -> Optional[str]:
        """Analyze a single line"""
        
        # Skip comments
        if '/*' in stripped:
            self.in_multiline_comment = True
        if '*/' in stripped:
            self.in_multiline_comment = False
            return None
        if self.in_multiline_comment or stripped.startswith('//'):
            return None
        
        if not self._should_comment(stripped):
            return None
        
        # Class declarations
        if match := re.match(r'(export\s+)?(default\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+(.+?))?(?:\s*\{)?', stripped):
            export = "Exported " if match.group(1) else ""
            default = "default " if match.group(2) else ""
            class_name = match.group(3)
            extends = f" extends {match.group(4)}" if match.group(4) else ""
            implements = f" implements {match.group(5)}" if match.group(5) else ""
            self.in_class = True
            self.class_name = class_name
            return f"// {export}{default}Class: {class_name}{extends}{implements}"
        
        # Interface (TypeScript)
        if match := re.match(r'(export\s+)?interface\s+(\w+)(?:\s+extends\s+(.+?))?(?:\s*\{)?', stripped):
            export = "Exported " if match.group(1) else ""
            interface_name = match.group(2)
            extends = f" extends {match.group(3)}" if match.group(3) else ""
            return f"// {export}Interface: {interface_name}{extends}"
        
        # Type alias (TypeScript)
        if match := re.match(r'(export\s+)?type\s+(\w+)\s*=\s*(.+)', stripped):
            export = "Exported " if match.group(1) else ""
            type_name = match.group(2)
            definition = match.group(3).rstrip(';')
            if len(definition) > 50:
                definition = definition[:50] + "..."
            return f"// {export}Type alias: {type_name} = {definition}"
        
        # Enum (TypeScript)
        if match := re.match(r'(export\s+)?enum\s+(\w+)', stripped):
            export = "Exported " if match.group(1) else ""
            enum_name = match.group(2)
            return f"// {export}Enum: {enum_name}"
        
        # Function declarations
        if match := re.match(r'(export\s+)?(async\s+)?function\s+(\w+)\s*(<[^>]+>)?\s*\(([^)]*)\)(?:\s*:\s*([^{]+))?', stripped):
            func_name = match.group(3)
            self.in_function = True
            return IntelligentCommentEngine.generate_function_comment(func_name, 'javascript')
        
        # Arrow functions with const/let/var
        if match := re.search(r'(export\s+)?(const|let|var)\s+(\w+)\s*:\s*([^=]+)?\s*=\s*(async\s+)?\(([^)]*)\)\s*(?::\s*([^=]+?))?\s*=>', stripped):
            export = "Exported " if match.group(1) else ""
            var_type = match.group(2)
            func_name = match.group(3)
            type_annotation = match.group(4)
            async_prefix = "async " if match.group(5) else ""
            params = match.group(6).strip() or "no parameters"
            return_type = f" -> {match.group(7).strip()}" if match.group(7) else ""
            return f"// {export}{async_prefix}Arrow function: {func_name}({params}){return_type}"
        
        # Simple arrow functions
        if match := re.search(r'(const|let|var)\s+(\w+)\s*=\s*(async\s+)?\(([^)]*)\)\s*=>', stripped):
            var_type = match.group(1)
            func_name = match.group(2)
            async_prefix = "async " if match.group(3) else ""
            params = match.group(4).strip() or "no parameters"
            return f"// {async_prefix}Arrow function: {func_name}({params})"
        
        # Constructor
        if self.in_class and (match := re.match(r'constructor\s*\(([^)]*)\)', stripped)):
            params = match.group(1).strip() or "no parameters"
            return f"// Constructor of {self.class_name}: ({params})"
        
        # Class methods
        if self.in_class and (match := re.match(r'(static\s+)?(async\s+)?(get|set\s+)?(\w+)\s*(<[^>]+>)?\s*\(([^)]*)\)(?:\s*:\s*([^{]+))?', stripped)):
            static = "static " if match.group(1) else ""
            async_prefix = "async " if match.group(2) else ""
            accessor = match.group(3) or ""
            method_name = match.group(4)
            generics = match.group(5) or ""
            params = match.group(6).strip() or "no parameters"
            return_type = f" -> {match.group(7).strip()}" if match.group(7) else ""
            
            if method_name not in ['if', 'for', 'while', 'switch', 'catch']:
                return f"// {static}{async_prefix}{accessor}Method: {method_name}{generics}({params}){return_type}"
        
        # Skip simple variable declarations unless they're complex
        if match := re.match(r'(const|let|var)\s+(\w+)\s*=\s*(.+)', stripped):
            value = match.group(3).rstrip(';')
            # Only comment if it's a complex initialization
            if not (value.startswith('[') or value.startswith('{') or value.startswith('new ') or 'require(' in value or 'import(' in value or '=>' in value):
                return None
        
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
            if ' of ' in loop_def:
                parts = loop_def.split(' of ')
                iterator = parts[0].strip()
                iterable = parts[1].strip()
                return f"// For-of loop: iterate {iterator} over {iterable}"
            elif ' in ' in loop_def:
                parts = loop_def.split(' in ')
                key = parts[0].strip()
                obj = parts[1].strip()
                return f"// For-in loop: iterate {key} in {obj}"
            else:
                return f"// For loop: {loop_def[:50]}..."
        
        # While loops
        if match := re.match(r'while\s*\((.+?)\)(?:\s*\{)?', stripped):
            condition = match.group(1)
            return f"// While loop: condition ({condition})"
        
        # Do-while
        if stripped.startswith('do') and stripped.endswith('{'):
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
        
        # Try-catch-finally
        if stripped.startswith('try'):
            return "// Try block for error handling"
        
        if match := re.match(r'catch\s*\(([^)]+)\)', stripped):
            error = match.group(1)
            return f"// Catch block: handle {error}"
        
        if stripped.startswith('finally'):
            return "// Finally block: cleanup"
        
        # Return statements
        if match := re.match(r'return\s+(.+)', stripped):
            value = match.group(1).rstrip(';')
            if len(value) > 50:
                value = value[:50] + "..."
            return f"// Return: {value}"
        elif stripped == 'return;':
            return "// Return: void"
        
        # Throw statements
        if match := re.match(r'throw\s+(.+)', stripped):
            error = match.group(1).rstrip(';')
            return f"// Throw error: {error}"
        
        # Import statements
        if match := re.match(r'import\s+(.+?)\s+from\s+[\'"](.+?)[\'"]', stripped):
            imports = match.group(1)
            module = match.group(2)
            return f"// Import {imports} from '{module}'"
        
        if match := re.match(r'import\s+[\'"](.+?)[\'"]', stripped):
            module = match.group(1)
            return f"// Import module: '{module}'"
        
        # Export statements
        if match := re.match(r'export\s+default\s+(.+)', stripped):
            export_item = match.group(1).rstrip(';')
            return f"// Export default: {export_item}"
        
        if match := re.match(r'export\s+\{(.+?)\}', stripped):
            exports = match.group(1)
            return f"// Export: {exports}"
        
        # Async/await
        if 'await ' in stripped and not stripped.startswith('async'):
            match = re.search(r'await\s+(\w+)', stripped)
            if match:
                operation = match.group(1)
                return f"// Await async operation: {operation}"
        
        # Promise chains
        if '.then(' in stripped:
            return "// Promise then handler"
        
        if '.catch(' in stripped:
            return "// Promise catch handler"
        
        if '.finally(' in stripped:
            return "// Promise finally handler"
        
        # Destructuring
        if match := re.match(r'(const|let|var)\s*\{(.+?)\}\s*=', stripped):
            var_type = match.group(1)
            props = match.group(2)
            return f"// Destructure {var_type}: extract {props}"
        
        if match := re.match(r'(const|let|var)\s*\[(.+?)\]\s*=', stripped):
            var_type = match.group(1)
            items = match.group(2)
            return f"// Array destructure {var_type}: extract {items}"
        
        # Spread operator
        if '...' in stripped and '=' in stripped:
            return "// Spread/rest operator usage"
        
        # Template literals with expressions
        if '${' in stripped:
            return "// Template literal with expressions"
        
        return None
