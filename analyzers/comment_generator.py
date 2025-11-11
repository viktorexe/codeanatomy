from typing import Dict, List, Optional
import ast
from .intelligent_comment_engine import IntelligentCommentEngine

class CommentGenerator:
    """Generates meaningful, context-aware comments"""
    
    @staticmethod
    def generate_function_comment(name: str, args: List[str], returns: Optional[str], 
                                   decorators: List[str], is_async: bool, docstring: Optional[str]) -> str:
        """Generate intelligent function comment"""
        return IntelligentCommentEngine.generate_function_comment(name, 'python')
    
    @staticmethod
    def generate_class_comment(name: str, bases: List[str], decorators: List[str]) -> str:
        """Generate intelligent class comment"""
        
        purpose = CommentGenerator._infer_class_purpose(name)
        
        if purpose:
            return f"# Define {purpose} class for {name}"
        elif bases:
            return f"# Create {name} class that extends {bases[0]}"
        else:
            return f"# Define the {name} class structure and behavior"
    
    @staticmethod
    def generate_loop_comment(loop_type: str, target: str, iter_expr: str, 
                              condition: Optional[str] = None) -> str:
        """Generate intelligent loop comment"""
        return IntelligentCommentEngine.generate_loop_comment(loop_type, target, iter_expr, 'python')
    
    @staticmethod
    def generate_conditional_comment(condition: str, is_elif: bool = False) -> str:
        """Generate intelligent conditional comment"""
        return IntelligentCommentEngine.generate_conditional_comment(condition, 'python')
    
    @staticmethod
    def generate_assignment_comment(targets: List[str], value: str, value_type: str) -> str:
        """Generate intelligent assignment comment"""
        
        target = ", ".join(targets)
        
        # Detect assignment patterns
        if value_type == "function call result":
            return f"# Store result of function call in {target}"
        elif value_type.startswith("list"):
            return f"# Initialize {target} as list"
        elif value_type.startswith("dict"):
            return f"# Initialize {target} as dictionary"
        elif value_type == "lambda function":
            return f"# Define inline function {target}"
        elif value_type == "list comprehension":
            return f"# Build list {target} using comprehension"
        elif "[]" in value or "list()" in value:
            return f"# Initialize empty list {target}"
        elif "{}" in value or "dict()" in value:
            return f"# Initialize empty dictionary {target}"
        elif value in ["None", "null", "NULL"]:
            return f"# Set {target} to null/none"
        elif value in ["True", "False", "true", "false"]:
            return f"# Set {target} to boolean value"
        elif value.isdigit():
            return f"# Initialize {target} with numeric value"
        else:
            return f"# Assign value to {target}"
    
    @staticmethod
    def generate_import_comment(module: str, items: List[str], is_from: bool) -> str:
        """Generate intelligent import comment"""
        
        if is_from:
            if len(items) == 1:
                return f"# Bring in {items[0]} functionality from {module}"
            else:
                return f"# Load multiple tools from the {module} library"
        else:
            return f"# Load the {module} library for use in this code"
    
    @staticmethod
    def generate_exception_comment(handlers: List[str], has_finally: bool, has_else: bool) -> str:
        """Generate intelligent exception handling comment"""
        
        if handlers and len(handlers) == 1:
            return f"# Try to run code and catch {handlers[0]} errors if they occur"
        elif handlers:
            return f"# Try to run code and handle any errors that might happen"
        else:
            return "# Try to run code and catch any errors"
    
    @staticmethod
    def generate_return_comment(value: str, in_function: Optional[str]) -> str:
        """Generate intelligent return comment"""
        
        if value == "None" or value == "null":
            return "# Return without value"
        elif value == "True" or value == "False":
            return f"# Return boolean: {value}"
        elif value == "self":
            return "# Return instance for method chaining"
        elif value.startswith("{") or value.startswith("["):
            return "# Return collection/data structure"
        else:
            return f"# Return computed value"
    
    @staticmethod
    def _infer_purpose_from_name(name: str) -> Optional[str]:
        """Infer function purpose from name"""
        
        name_lower = name.lower()
        
        # Special cases
        if name_lower == "main":
            return "start the program execution"
        elif name_lower == "__init__":
            return "initialize the object"
        elif name_lower.startswith("test_"):
            return "test " + name[5:].replace("_", " ")
        
        # Common patterns
        if name_lower.startswith("get_"):
            return "retrieve " + name[4:].replace("_", " ")
        elif name_lower.startswith("set_"):
            return "set " + name[4:].replace("_", " ")
        elif name_lower.startswith("is_") or name_lower.startswith("has_"):
            return "check if " + name[3:].replace("_", " ")
        elif name_lower.startswith("create_") or name_lower.startswith("make_"):
            return "create " + name.split("_", 1)[1].replace("_", " ")
        elif name_lower.startswith("delete_") or name_lower.startswith("remove_"):
            return "delete " + name.split("_", 1)[1].replace("_", " ")
        elif name_lower.startswith("update_"):
            return "update " + name[7:].replace("_", " ")
        elif name_lower.startswith("find_") or name_lower.startswith("search_"):
            return "find " + name.split("_", 1)[1].replace("_", " ")
        elif name_lower.startswith("calculate_") or name_lower.startswith("compute_"):
            return "calculate " + name.split("_", 1)[1].replace("_", " ")
        elif name_lower.startswith("validate_") or name_lower.startswith("check_"):
            return "validate " + name.split("_", 1)[1].replace("_", " ")
        elif name_lower.startswith("process_"):
            return "process " + name[8:].replace("_", " ")
        elif name_lower.startswith("handle_"):
            return "handle " + name[7:].replace("_", " ")
        elif name_lower.startswith("parse_"):
            return "parse " + name[6:].replace("_", " ")
        elif name_lower.startswith("build_") or name_lower.startswith("generate_"):
            return "build " + name.split("_", 1)[1].replace("_", " ")
        elif name_lower.startswith("load_") or name_lower.startswith("read_"):
            return "load " + name.split("_", 1)[1].replace("_", " ")
        elif name_lower.startswith("save_") or name_lower.startswith("write_"):
            return "save " + name.split("_", 1)[1].replace("_", " ")
        elif name_lower.startswith("send_"):
            return "send " + name[5:].replace("_", " ")
        elif name_lower.startswith("fetch_"):
            return "fetch " + name[6:].replace("_", " ")
        elif name_lower.startswith("render_") or name_lower.startswith("draw_"):
            return "render " + name.split("_", 1)[1].replace("_", " ")
        elif name_lower.startswith("connect_"):
            return "connect to " + name[8:].replace("_", " ")
        elif name_lower.startswith("disconnect_"):
            return "disconnect from " + name[11:].replace("_", " ")
        elif name_lower.startswith("open_"):
            return "open " + name[5:].replace("_", " ")
        elif name_lower.startswith("close_"):
            return "close " + name[6:].replace("_", " ")
        
        return None
    
    @staticmethod
    def _infer_class_purpose(name: str) -> Optional[str]:
        """Infer class purpose from name"""
        
        name_lower = name.lower()
        
        if name_lower.endswith("manager"):
            return "a manager"
        elif name_lower.endswith("handler"):
            return "a handler"
        elif name_lower.endswith("controller"):
            return "a controller"
        elif name_lower.endswith("service"):
            return "a service"
        elif name_lower.endswith("model"):
            return "a data model"
        elif name_lower.endswith("view"):
            return "a view"
        elif name_lower.endswith("factory"):
            return "a factory"
        elif name_lower.endswith("builder"):
            return "a builder"
        elif name_lower.endswith("adapter"):
            return "an adapter"
        elif name_lower.endswith("exception") or name_lower.endswith("error"):
            return "an exception"
        elif name_lower.endswith("interface"):
            return "an interface"
        
        return None
    
    @staticmethod
    def _describe_parameters(args: List[str]) -> Optional[str]:
        """Describe parameters meaningfully"""
        
        if not args:
            return None
        
        # Filter out self, cls
        filtered = [arg for arg in args if arg not in ['self', 'cls']]
        
        if not filtered:
            return None
        
        if len(filtered) == 1:
            return filtered[0]
        elif len(filtered) <= 3:
            return ", ".join(filtered)
        else:
            return f"{len(filtered)} parameters"
    
    @staticmethod
    def _describe_decorators(decorators: List[str]) -> Optional[str]:
        """Describe decorators meaningfully"""
        
        if not decorators:
            return None
        
        descriptions = []
        for dec in decorators:
            if dec == "staticmethod":
                descriptions.append("Static method")
            elif dec == "classmethod":
                descriptions.append("Class method")
            elif dec == "property":
                descriptions.append("Property accessor")
            elif dec.startswith("lru_cache"):
                descriptions.append("Cached")
            elif dec == "abstractmethod":
                descriptions.append("Abstract")
            else:
                descriptions.append(f"@{dec}")
        
        return ", ".join(descriptions)
