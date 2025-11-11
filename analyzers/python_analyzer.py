import ast
import re
from typing import Dict, List, Set, Optional
from .base_analyzer import BaseAnalyzer

class PythonAnalyzer(BaseAnalyzer):
    @staticmethod
    def analyze(code):
        try:
            tree = ast.parse(code)
            lines = code.split('\n')
            comments = {}
            
            for node in ast.walk(tree):
                line = node.lineno - 1 if hasattr(node, 'lineno') else None
                if line is None:
                    continue
                
                if isinstance(node, ast.FunctionDef):
                    args = ', '.join(arg.arg for arg in node.args.args)
                    returns = f" -> {ast.unparse(node.returns)}" if node.returns else ""
                    decorators = f"@{', @'.join(ast.unparse(d) for d in node.decorator_list)} " if node.decorator_list else ""
                    comments[line] = f"# {decorators}Function '{node.name}' with parameters ({args}){returns}"
                    
                elif isinstance(node, ast.AsyncFunctionDef):
                    args = ', '.join(arg.arg for arg in node.args.args)
                    comments[line] = f"# Async function '{node.name}' with parameters ({args})"
                    
                elif isinstance(node, ast.ClassDef):
                    bases = f" inherits from {', '.join(ast.unparse(b) for b in node.bases)}" if node.bases else ""
                    comments[line] = f"# Class definition: {node.name}{bases}"
                    
                elif isinstance(node, ast.For):
                    target = ast.unparse(node.target)
                    iter_val = ast.unparse(node.iter)
                    comments[line] = f"# Loop: iterate {target} over {iter_val}"
                    
                elif isinstance(node, ast.While):
                    condition = ast.unparse(node.test)
                    comments[line] = f"# While loop: condition ({condition})"
                    
                elif isinstance(node, ast.If) and line not in comments:
                    condition = ast.unparse(node.test)
                    comments[line] = f"# Conditional: if ({condition})"
                    
                elif isinstance(node, ast.With):
                    items = ', '.join(ast.unparse(item.context_expr) for item in node.items)
                    comments[line] = f"# Context manager: with {items}"
                    
                elif isinstance(node, ast.Try):
                    comments[line] = "# Try-except block for error handling"
                    
                elif isinstance(node, ast.Assign) and line not in comments:
                    targets = ', '.join(ast.unparse(t) for t in node.targets)
                    value = ast.unparse(node.value)
                    if len(value) > 50:
                        value = value[:50] + "..."
                    comments[line] = f"# Assign: {targets} = {value}"
                    
                elif isinstance(node, ast.AugAssign) and line not in comments:
                    target = ast.unparse(node.target)
                    op = ast.unparse(node.op)
                    comments[line] = f"# Augmented assignment: {target} {op}= ..."
                    
                elif isinstance(node, ast.Return) and line not in comments:
                    value = ast.unparse(node.value) if node.value else "None"
                    if len(value) > 40:
                        value = value[:40] + "..."
                    comments[line] = f"# Return: {value}"
                    
                elif isinstance(node, ast.Import):
                    modules = ', '.join(alias.name for alias in node.names)
                    comments[line] = f"# Import modules: {modules}"
                    
                elif isinstance(node, ast.ImportFrom):
                    module = node.module or ""
                    names = ', '.join(alias.name for alias in node.names)
                    comments[line] = f"# Import from {module}: {names}"
                    
                elif isinstance(node, ast.Raise) and line not in comments:
                    exc = ast.unparse(node.exc) if node.exc else "exception"
                    comments[line] = f"# Raise exception: {exc}"
                    
                elif isinstance(node, ast.Assert) and line not in comments:
                    test = ast.unparse(node.test)
                    comments[line] = f"# Assert: {test}"
                    
                elif isinstance(node, ast.Lambda) and line not in comments:
                    args = ', '.join(arg.arg for arg in node.args.args)
                    comments[line] = f"# Lambda function with args ({args})"
                    
                elif isinstance(node, ast.ListComp) and line not in comments:
                    comments[line] = "# List comprehension"
                    
                elif isinstance(node, ast.DictComp) and line not in comments:
                    comments[line] = "# Dictionary comprehension"
            
            result = []
            for i, line in enumerate(lines):
                if i in comments:
                    result.append(comments[i])
                result.append(line)
            
            return '\n'.join(result)
        except Exception as e:
            return f"# Error analyzing code: {str(e)}\n{code}"
