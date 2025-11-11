"""
Ultra-intelligent comment generation engine for all programming languages
"""
from typing import Optional, List, Dict
import re

class IntelligentCommentEngine:
    """Advanced AI-like comment generation with deep code understanding"""
    
    # Common programming patterns across languages
    PATTERNS = {
        'api': ['api', 'endpoint', 'route', 'request', 'response'],
        'database': ['db', 'database', 'query', 'sql', 'insert', 'select', 'update', 'delete'],
        'file': ['file', 'read', 'write', 'open', 'close', 'stream'],
        'network': ['http', 'socket', 'connection', 'client', 'server'],
        'auth': ['auth', 'login', 'logout', 'token', 'password', 'credential'],
        'validation': ['valid', 'check', 'verify', 'ensure', 'assert'],
        'conversion': ['convert', 'transform', 'parse', 'serialize', 'deserialize'],
        'calculation': ['calculate', 'compute', 'sum', 'average', 'total'],
        'search': ['search', 'find', 'filter', 'query', 'lookup'],
        'sort': ['sort', 'order', 'arrange', 'organize'],
        'format': ['format', 'stringify', 'prettify', 'render'],
        'cache': ['cache', 'memoize', 'store', 'retrieve'],
        'async': ['async', 'await', 'promise', 'future', 'callback'],
        'error': ['error', 'exception', 'fail', 'catch', 'handle'],
        'log': ['log', 'debug', 'info', 'warn', 'error'],
        'test': ['test', 'spec', 'assert', 'expect', 'mock'],
        'init': ['init', 'setup', 'configure', 'initialize'],
        'cleanup': ['cleanup', 'dispose', 'destroy', 'close', 'free'],
        'event': ['event', 'listener', 'handler', 'trigger', 'emit'],
        'data': ['data', 'model', 'entity', 'record', 'object'],
    }
    
    @staticmethod
    def generate_function_comment(name: str, language: str = 'python') -> str:
        """Generate ultra-intelligent function comment"""
        
        name_lower = name.lower()
        
        # Special Python methods
        if language == 'python':
            if name == '__init__':
                return "# Set up the initial state and properties of this object"
            elif name == '__str__':
                return "# Define how this object appears when converted to string"
            elif name == '__repr__':
                return "# Define the official string representation for debugging"
            elif name == '__call__':
                return "# Make this object callable like a function"
            elif name == '__enter__':
                return "# Set up resources when entering a 'with' block"
            elif name == '__exit__':
                return "# Clean up resources when exiting a 'with' block"
            elif name == '__len__':
                return "# Return the length/size of this object"
            elif name == '__getitem__':
                return "# Enable accessing items using bracket notation [index]"
            elif name == '__setitem__':
                return "# Enable setting items using bracket notation [index] = value"
            elif name == '__iter__':
                return "# Make this object iterable in loops"
            elif name == '__next__':
                return "# Get the next item in iteration"
            elif name == '__eq__':
                return "# Define how to check if two objects are equal"
            elif name == '__lt__':
                return "# Define how to compare if this object is less than another"
            elif name == '__gt__':
                return "# Define how to compare if this object is greater than another"
            elif name == '__add__':
                return "# Define what happens when using the + operator"
            elif name == '__sub__':
                return "# Define what happens when using the - operator"
            elif name == '__mul__':
                return "# Define what happens when using the * operator"
            elif name == '__div__':
                return "# Define what happens when using the / operator"
        
        # JavaScript/TypeScript special methods
        if language == 'javascript':
            if name == 'constructor':
                return "# Initialize new instance with provided parameters"
            elif name == 'render':
                return "# Generate and return the visual representation of this component"
            elif name == 'componentDidMount':
                return "# Execute code after component is added to the page"
            elif name == 'componentWillUnmount':
                return "# Clean up before component is removed from the page"
            elif name == 'useState':
                return "# Create a state variable that triggers re-render when changed"
            elif name == 'useEffect':
                return "# Run side effects after render or when dependencies change"
        
        # C special functions
        if language == 'c':
            if name == 'main':
                return "# Program starts execution here - entry point"
            elif name == 'malloc':
                return "# Allocate memory dynamically on the heap"
            elif name == 'free':
                return "# Release previously allocated memory to prevent leaks"
            elif name == 'printf':
                return "# Print formatted output to console"
            elif name == 'scanf':
                return "# Read formatted input from user"
        
        # Detect purpose from name patterns
        purpose = IntelligentCommentEngine._detect_purpose(name_lower)
        if purpose:
            return f"# {purpose}"
        
        # Fallback
        return f"# Execute the {name} operation"
    
    @staticmethod
    def _detect_purpose(name: str) -> Optional[str]:
        """Detect function purpose with advanced pattern matching"""
        
        # Main entry point
        if name == 'main':
            return "Program starts here"
        
        # CRUD operations
        if re.match(r'(get|fetch|retrieve|load|read)_?', name):
            obj = re.sub(r'^(get|fetch|retrieve|load|read)_?', '', name)
            return f"Get {obj.replace('_', ' ')} data"
        
        if re.match(r'(set|update|modify|change|edit)_?', name):
            obj = re.sub(r'^(set|update|modify|change|edit)_?', '', name)
            return f"Update {obj.replace('_', ' ')}"
        
        if re.match(r'(create|add|insert|new|make)_?', name):
            obj = re.sub(r'^(create|add|insert|new|make)_?', '', name)
            return f"Create new {obj.replace('_', ' ')}"
        
        if re.match(r'(delete|remove|destroy|drop)_?', name):
            obj = re.sub(r'^(delete|remove|destroy|drop)_?', '', name)
            return f"Remove {obj.replace('_', ' ')}"
        
        # Validation and checking
        if re.match(r'(is|has|can|should)_?', name):
            condition = re.sub(r'^(is|has|can|should)_?', '', name)
            return f"Check if {condition.replace('_', ' ')}"
        
        if re.match(r'(validate|verify|check|ensure)_?', name):
            obj = re.sub(r'^(validate|verify|check|ensure)_?', '', name)
            return f"Validate {obj.replace('_', ' ')}"
        
        # Data processing
        if re.match(r'(process|handle|manage)_?', name):
            obj = re.sub(r'^(process|handle|manage)_?', '', name)
            return f"Process {obj.replace('_', ' ')}"
        
        if re.match(r'(parse|decode|extract)_?', name):
            obj = re.sub(r'^(parse|decode|extract)_?', '', name)
            return f"Parse {obj.replace('_', ' ')}"
        
        if re.match(r'(format|encode|serialize)_?', name):
            obj = re.sub(r'^(format|encode|serialize)_?', '', name)
            return f"Format {obj.replace('_', ' ')}"
        
        if re.match(r'(convert|transform|map)_?', name):
            obj = re.sub(r'^(convert|transform|map)_?', '', name)
            return f"Convert {obj.replace('_', ' ')}"
        
        # Calculation and computation
        if re.match(r'(calculate|compute|determine)_?', name):
            obj = re.sub(r'^(calculate|compute|determine)_?', '', name)
            return f"Calculate {obj.replace('_', ' ')}"
        
        if 'sum' in name or 'total' in name:
            return "Sum all values"
        
        if 'average' in name or 'mean' in name:
            return "Calculate average"
        
        if 'count' in name:
            return "Count the number of items"
        
        # Search and filter
        if re.match(r'(find|search|lookup|locate)_?', name):
            obj = re.sub(r'^(find|search|lookup|locate)_?', '', name)
            return f"Find {obj.replace('_', ' ')}"
        
        if re.match(r'(filter|select|query)_?', name):
            obj = re.sub(r'^(filter|select|query)_?', '', name)
            return f"Filter {obj.replace('_', ' ')}"
        
        # Sorting and ordering
        if re.match(r'(sort|order|arrange)_?', name):
            obj = re.sub(r'^(sort|order|arrange)_?', '', name)
            return f"Sort {obj.replace('_', ' ')}"
        
        # Building and generation
        if re.match(r'(build|generate|construct|compile)_?', name):
            obj = re.sub(r'^(build|generate|construct|compile)_?', '', name)
            return f"Build {obj.replace('_', ' ')}"
        
        # Rendering and display
        if re.match(r'(render|draw|display|show|print)_?', name):
            obj = re.sub(r'^(render|draw|display|show|print)_?', '', name)
            return f"Display {obj.replace('_', ' ')}"
        
        # File operations
        if re.match(r'(open|close)_?', name):
            obj = re.sub(r'^(open|close)_?', '', name)
            action = 'Open' if 'open' in name else 'Close'
            return f"{action} {obj.replace('_', ' ')}"
        
        if re.match(r'(save|write|export)_?', name):
            obj = re.sub(r'^(save|write|export)_?', '', name)
            return f"Save {obj.replace('_', ' ')}"
        
        # Network operations
        if re.match(r'(send|post|put|patch)_?', name):
            obj = re.sub(r'^(send|post|put|patch)_?', '', name)
            return f"Send {obj.replace('_', ' ')} to server"
        
        if re.match(r'(receive|get|download)_?', name):
            obj = re.sub(r'^(receive|get|download)_?', '', name)
            return f"Get {obj.replace('_', ' ')} from server"
        
        if re.match(r'(connect|establish)_?', name):
            obj = re.sub(r'^(connect|establish)_?', '', name)
            return f"Connect to {obj.replace('_', ' ')}"
        
        if re.match(r'(disconnect|close)_?connection', name):
            return "Close connection"
        
        # Authentication
        if 'login' in name or 'signin' in name:
            return "Log user in"
        
        if 'logout' in name or 'signout' in name:
            return "Log user out"
        
        if 'register' in name or 'signup' in name:
            return "Register new user"
        
        if 'authenticate' in name or 'authorize' in name:
            return "Verify user credentials"
        
        # Initialization and setup
        if re.match(r'(init|initialize|setup|configure)_?', name):
            obj = re.sub(r'^(init|initialize|setup|configure)_?', '', name)
            return f"Set up {obj.replace('_', ' ')}"
        
        # Cleanup
        if re.match(r'(cleanup|dispose|destroy|teardown)_?', name):
            obj = re.sub(r'^(cleanup|dispose|destroy|teardown)_?', '', name)
            return f"Clean up {obj.replace('_', ' ')}"
        
        # Event handling
        if re.match(r'(on|handle)_?', name):
            event = re.sub(r'^(on|handle)_?', '', name)
            return f"Handle {event.replace('_', ' ')} event"
        
        if 'trigger' in name or 'emit' in name or 'fire' in name:
            return "Trigger event"
        
        # Testing
        if name.startswith('test_'):
            test_name = name[5:].replace('_', ' ')
            return f"Test {test_name}"
        
        if name.startswith('mock_'):
            obj = name[5:].replace('_', ' ')
            return f"Mock {obj} for testing"
        
        # Utilities
        if 'helper' in name or 'util' in name:
            return "Helper function"
        
        if 'wrapper' in name:
            return "Wrap function with extra logic"
        
        if 'decorator' in name:
            return "Add functionality to function"
        
        return None
    
    @staticmethod
    def generate_loop_comment(loop_type: str, target: str, iter_expr: str, language: str = 'python') -> str:
        """Generate intelligent loop comment"""
        
        # Detect what's being iterated
        if 'range(' in iter_expr:
            if 'len(' in iter_expr:
                return f"# Loop through each index position in the collection"
            else:
                return f"# Repeat operation for each number in the range"
        
        if '.items()' in iter_expr or 'items()' in iter_expr:
            return f"# Process each key-value pair in the dictionary"
        
        if '.keys()' in iter_expr:
            return f"# Iterate through all dictionary keys"
        
        if '.values()' in iter_expr:
            return f"# Iterate through all dictionary values"
        
        if 'enumerate(' in iter_expr:
            return f"# Loop with both index number and value for each item"
        
        if 'zip(' in iter_expr:
            return f"# Process multiple lists together element by element"
        
        if 'reversed(' in iter_expr:
            return f"# Loop through items in reverse order"
        
        if 'sorted(' in iter_expr:
            return f"# Loop through items in sorted order"
        
        # File operations
        if 'readlines' in iter_expr or 'open(' in iter_expr:
            return f"# Read and process each line from the file"
        
        # Database/API results
        if 'query' in iter_expr or 'results' in iter_expr or 'rows' in iter_expr:
            return f"# Process each result from the query"
        
        # Generic based on variable name
        if 'user' in target.lower():
            return f"# Process each user in the collection"
        elif 'item' in target.lower():
            return f"# Process each item one by one"
        elif 'row' in target.lower():
            return f"# Process each row of data"
        elif 'file' in target.lower():
            return f"# Process each file in the directory"
        elif 'char' in target.lower() or 'letter' in target.lower():
            return f"# Process each character in the string"
        elif 'word' in target.lower():
            return f"# Process each word in the text"
        elif 'line' in target.lower():
            return f"# Process each line of text"
        elif 'element' in target.lower() or 'elem' in target.lower():
            return f"# Process each element in the collection"
        
        # While loops
        if loop_type == 'while':
            return f"# Keep repeating until the condition becomes false"
        
        return f"# Loop through each {target} and perform operations"
    
    @staticmethod
    def generate_conditional_comment(condition: str, language: str = 'python') -> str:
        """Generate intelligent conditional comment"""
        
        # Special patterns
        if '__name__' in condition and '__main__' in condition:
            return "# Execute this code only when script runs directly, not when imported as module"
        
        if 'None' in condition or 'null' in condition or 'NULL' in condition:
            if 'is not' in condition or '!=' in condition:
                return "# Proceed only if value exists and is not empty"
            else:
                return "# Handle case when value is empty or not set"
        
        if 'len(' in condition:
            if '>' in condition or '>=' in condition:
                return "# Check if collection has items before processing"
            elif '==' in condition and '0' in condition:
                return "# Check if collection is empty"
        
        if 'isinstance(' in condition:
            return "# Verify object is of correct type before using"
        
        if 'hasattr(' in condition:
            return "# Check if object has required attribute"
        
        if '.exists()' in condition or 'exists(' in condition:
            return "# Check if file or resource exists before accessing"
        
        if '.is_valid()' in condition or 'is_valid(' in condition:
            return "# Verify data passes validation rules"
        
        if 'error' in condition.lower() or 'exception' in condition.lower():
            return "# Handle error condition if it occurred"
        
        if 'success' in condition.lower():
            return "# Proceed if operation completed successfully"
        
        # Authentication/Authorization
        if 'authenticated' in condition.lower() or 'logged_in' in condition.lower():
            return "# Check if user is logged in before allowing access"
        
        if 'authorized' in condition.lower() or 'permission' in condition.lower():
            return "# Verify user has permission to perform action"
        
        # Comparison operators
        if '==' in condition:
            parts = condition.split('==')
            if len(parts) == 2:
                left = parts[0].strip()
                right = parts[1].strip().strip('"\'')
                return f"# Check if {left} matches expected value {right}"
        
        if '!=' in condition:
            parts = condition.split('!=')
            if len(parts) == 2:
                left = parts[0].strip()
                right = parts[1].strip().strip('"\'')
                return f"# Check if {left} is different from {right}"
        
        if '>' in condition:
            return "# Proceed if value exceeds threshold"
        
        if '<' in condition:
            return "# Proceed if value is below threshold"
        
        if '>=' in condition:
            return "# Proceed if value meets or exceeds minimum"
        
        if '<=' in condition:
            return "# Proceed if value is at or below maximum"
        
        # Logical operators
        if ' and ' in condition.lower():
            return "# Proceed only if all conditions are satisfied"
        
        if ' or ' in condition.lower():
            return "# Proceed if any of the conditions is true"
        
        if condition.startswith('not ') or '!' in condition:
            return "# Proceed if condition is false"
        
        # Boolean checks
        if condition.strip() in ['True', 'true', 'False', 'false']:
            return f"# Always {'execute' if 'true' in condition.lower() else 'skip'} this block"
        
        return f"# Check condition before proceeding with operation"
