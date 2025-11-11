from abc import ABC, abstractmethod
from typing import Dict, List, Tuple

class BaseAnalyzer(ABC):
    """Base class for all code analyzers"""
    
    @abstractmethod
    def analyze(self, code: str) -> str:
        """Analyze code and return commented version"""
        pass
    
    def _insert_comments(self, lines: List[str], comments: Dict[int, str]) -> str:
        """Insert comments at specified line numbers - only for significant code blocks"""
        result = []
        last_comment_line = -3
        
        for i, line in enumerate(lines):
            stripped = line.strip()
            # Only add comment if significant gap from last comment and line is not empty/comment
            if i in comments and (i - last_comment_line) >= 2:
                if stripped and not stripped.startswith('#') and not stripped.startswith('//'):
                    indent = len(line) - len(line.lstrip())
                    result.append(' ' * indent + comments[i])
                    last_comment_line = i
            result.append(line)
        return '\n'.join(result)
    
    def _get_indent(self, line: str) -> str:
        """Get indentation of a line"""
        return line[:len(line) - len(line.lstrip())]
