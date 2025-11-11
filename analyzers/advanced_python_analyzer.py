import ast
from typing import Dict, List, Set, Optional, Any
from .base_analyzer import BaseAnalyzer
from .comment_generator import CommentGenerator

class AdvancedPythonAnalyzer(BaseAnalyzer):
    """Industrial-grade Python code analyzer using AST"""
    
    def __init__(self):
        self.comments: Dict[int, str] = {}
        self.scope_stack: List[str] = []
        self.class_context: Optional[str] = None
        self.function_context: Optional[str] = None
        
    def analyze(self, code: str) -> str:
        """Analyze Python code with deep AST traversal"""
        try:
            tree = ast.parse(code)
            self.comments = {}
            self._analyze_node(tree)
            
            lines = code.split('\n')
            return self._insert_comments(lines, self.comments)
        except SyntaxError as e:
            return f"# Syntax Error at line {e.lineno}: {e.msg}\n{code}"
        except Exception as e:
            return f"# Analysis Error: {str(e)}\n{code}"
    
    def _analyze_node(self, node: ast.AST, parent: Optional[ast.AST] = None):
        """Recursively analyze AST nodes - only major structures"""
        
        # Only comment on significant code structures
        if isinstance(node, ast.FunctionDef) or isinstance(node, ast.AsyncFunctionDef):
            self._analyze_function(node)
        
        elif isinstance(node, ast.ClassDef):
            self._analyze_class(node)
        
        elif isinstance(node, ast.For) or isinstance(node, ast.AsyncFor):
            self._analyze_for_loop(node)
        
        elif isinstance(node, ast.While):
            self._analyze_while_loop(node)
        
        elif isinstance(node, ast.If) and not isinstance(parent, (ast.If, ast.For, ast.While)):
            # Only main if statements, not nested ones
            self._analyze_if_statement(node)
        
        elif isinstance(node, ast.With) or isinstance(node, ast.AsyncWith):
            self._analyze_with_statement(node)
        
        elif isinstance(node, ast.Try):
            self._analyze_try_except(node)
        
        elif isinstance(node, ast.Import) or isinstance(node, ast.ImportFrom):
            # Only comment imports at module level
            if isinstance(parent, ast.Module):
                self._analyze_import(node)
        
        for child in ast.iter_child_nodes(node):
            self._analyze_node(child, node)
    
    def _analyze_function(self, node: ast.FunctionDef):
        """Analyze function definitions"""
        line = node.lineno - 1
        
        is_async = isinstance(node, ast.AsyncFunctionDef)
        
        # Decorators
        decorators = [ast.unparse(dec) for dec in node.decorator_list]
        
        # Arguments
        args = []
        for arg in node.args.args:
            args.append(arg.arg)
        
        # Return type
        return_type = ast.unparse(node.returns) if node.returns else None
        
        # Docstring
        docstring = None
        if node.body and isinstance(node.body[0], ast.Expr) and isinstance(node.body[0].value, ast.Constant):
            doc = node.body[0].value.value
            if isinstance(doc, str):
                docstring = doc
        
        comment = CommentGenerator.generate_function_comment(
            node.name, args, return_type, decorators, is_async, docstring
        )
        self.comments[line] = comment
        
        self.function_context = node.name
    
    def _analyze_class(self, node: ast.ClassDef):
        """Analyze class definitions"""
        line = node.lineno - 1
        
        bases = [ast.unparse(base) for base in node.bases]
        decorators = [ast.unparse(dec) for dec in node.decorator_list]
        
        comment = CommentGenerator.generate_class_comment(node.name, bases, decorators)
        self.comments[line] = comment
        
        self.class_context = node.name
    
    def _analyze_for_loop(self, node: ast.For):
        """Analyze for loops"""
        line = node.lineno - 1
        
        target = ast.unparse(node.target)
        iter_expr = ast.unparse(node.iter)
        
        comment = CommentGenerator.generate_loop_comment("for", target, iter_expr)
        self.comments[line] = comment
    
    def _analyze_while_loop(self, node: ast.While):
        """Analyze while loops"""
        line = node.lineno - 1
        condition = ast.unparse(node.test)
        
        comment = CommentGenerator.generate_loop_comment("while", "", "", condition)
        self.comments[line] = comment
    
    def _analyze_if_statement(self, node: ast.If):
        """Analyze if statements"""
        line = node.lineno - 1
        condition = ast.unparse(node.test)
        
        comment = CommentGenerator.generate_conditional_comment(condition)
        self.comments[line] = comment
    
    def _analyze_with_statement(self, node: ast.With):
        """Analyze with statements"""
        line = node.lineno - 1
        
        is_async = isinstance(node, ast.AsyncWith)
        async_prefix = "Async " if is_async else ""
        
        contexts = []
        for item in node.items:
            ctx = ast.unparse(item.context_expr)
            if item.optional_vars:
                ctx += f" as {ast.unparse(item.optional_vars)}"
            contexts.append(ctx)
        
        comment = f"# {async_prefix}Context manager: with {', '.join(contexts)}"
        self.comments[line] = comment
    
    def _analyze_try_except(self, node: ast.Try):
        """Analyze try-except blocks"""
        line = node.lineno - 1
        
        handlers = []
        for handler in node.handlers:
            if handler.type:
                handlers.append(ast.unparse(handler.type))
            else:
                handlers.append("all exceptions")
        
        has_finally = bool(node.finalbody)
        has_else = bool(node.orelse)
        
        comment = CommentGenerator.generate_exception_comment(handlers, has_finally, has_else)
        self.comments[line] = comment
    
    def _analyze_assignment(self, node: ast.Assign):
        """Analyze assignments"""
        line = node.lineno - 1
        
        if line in self.comments:
            return
        
        targets = [ast.unparse(target) for target in node.targets]
        value = ast.unparse(node.value)
        
        # Detect assignment type
        assign_type = ""
        if isinstance(node.value, ast.Call):
            assign_type = "function call result"
        elif isinstance(node.value, ast.List):
            assign_type = f"list with {len(node.value.elts)} elements"
        elif isinstance(node.value, ast.Dict):
            assign_type = f"dict with {len(node.value.keys)} items"
        elif isinstance(node.value, ast.Lambda):
            assign_type = "lambda function"
        elif isinstance(node.value, ast.ListComp):
            assign_type = "list comprehension"
        
        comment = CommentGenerator.generate_assignment_comment(targets, value, assign_type)
        self.comments[line] = comment
    
    def _analyze_annotated_assignment(self, node: ast.AnnAssign):
        """Analyze annotated assignments"""
        line = node.lineno - 1
        
        target = ast.unparse(node.target)
        annotation = ast.unparse(node.annotation)
        
        if node.value:
            value = ast.unparse(node.value)
            if len(value) > 40:
                value = value[:40] + "..."
            comment = f"# Typed assign: {target}: {annotation} = {value}"
        else:
            comment = f"# Type annotation: {target}: {annotation}"
        
        self.comments[line] = comment
    
    def _analyze_augmented_assignment(self, node: ast.AugAssign):
        """Analyze augmented assignments"""
        line = node.lineno - 1
        
        target = ast.unparse(node.target)
        op = ast.unparse(node.op)
        value = ast.unparse(node.value)
        
        comment = f"# Augmented assign: {target} {op}= {value}"
        self.comments[line] = comment
    
    def _analyze_return(self, node: ast.Return):
        """Analyze return statements"""
        line = node.lineno - 1
        
        value = ast.unparse(node.value) if node.value else "None"
        comment = CommentGenerator.generate_return_comment(value, self.function_context)
        self.comments[line] = comment
    
    def _analyze_yield(self, node):
        """Analyze yield statements"""
        line = node.lineno - 1
        
        if isinstance(node, ast.YieldFrom):
            value = ast.unparse(node.value)
            comment = f"# Yield from: {value}"
        else:
            value = ast.unparse(node.value) if node.value else "None"
            comment = f"# Yield: {value}"
        
        self.comments[line] = comment
    
    def _analyze_raise(self, node: ast.Raise):
        """Analyze raise statements"""
        line = node.lineno - 1
        
        if node.exc:
            exc = ast.unparse(node.exc)
            comment = f"# Raise exception: {exc}"
        else:
            comment = "# Re-raise current exception"
        
        self.comments[line] = comment
    
    def _analyze_assert(self, node: ast.Assert):
        """Analyze assert statements"""
        line = node.lineno - 1
        
        test = ast.unparse(node.test)
        msg = f" with message: {ast.unparse(node.msg)}" if node.msg else ""
        
        comment = f"# Assert: {test}{msg}"
        self.comments[line] = comment
    
    def _analyze_import(self, node):
        """Analyze import statements"""
        line = node.lineno - 1
        
        if isinstance(node, ast.Import):
            modules = [alias.name for alias in node.names]
            comment = CommentGenerator.generate_import_comment(modules[0], [], False)
        else:
            module = node.module or ""
            names = [alias.name for alias in node.names]
            comment = CommentGenerator.generate_import_comment(module, names, True)
        
        self.comments[line] = comment
    
    def _analyze_global(self, node: ast.Global):
        """Analyze global declarations"""
        line = node.lineno - 1
        comment = f"# Global variables: {', '.join(node.names)}"
        self.comments[line] = comment
    
    def _analyze_nonlocal(self, node: ast.Nonlocal):
        """Analyze nonlocal declarations"""
        line = node.lineno - 1
        comment = f"# Nonlocal variables: {', '.join(node.names)}"
        self.comments[line] = comment
    
    def _analyze_delete(self, node: ast.Delete):
        """Analyze delete statements"""
        line = node.lineno - 1
        targets = [ast.unparse(t) for t in node.targets]
        comment = f"# Delete: {', '.join(targets)}"
        self.comments[line] = comment
    
    def _analyze_match(self, node: ast.Match):
        """Analyze match statements (Python 3.10+)"""
        line = node.lineno - 1
        subject = ast.unparse(node.subject)
        comment = f"# Match statement on: {subject}"
        self.comments[line] = comment
    
    def _analyze_comprehension(self, node, comp_type: str):
        """Analyze comprehensions"""
        line = node.lineno - 1
        
        if line not in self.comments:
            comment = f"# {comp_type.capitalize()} comprehension"
            self.comments[line] = comment
