Code Anatomy is an intelligent web-based tool that automatically generates meaningful comments for Python code. Built as a Project Based Learning initiative by Vansh Sharma, Manya Gupta, and Priyanshu Bagaria from B.Tech CSE AI & ML program, this application uses Abstract Syntax Tree (AST) parsing to deeply understand code structure and produce context-aware documentation that explains what your code does in plain English. The tool addresses a common challenge in software development by helping developers maintain better documentation standards, understand unfamiliar codebases faster, and save time on manual commenting tasks. The system works by parsing Python code into an Abstract Syntax Tree, traversing it to identify functions, classes, loops, conditionals, and other code elements, then analyzing naming conventions, parameters, and context to generate appropriate comments. The comment generation engine recognizes common patterns like "get_" for retrieval operations, "set_" for modifications, "is_" for boolean checks, and many others to produce meaningful explanations.

Key Features:

- Deep code analysis using Python's AST module to understand code at a fundamental level
- Intelligent comment generation based on naming conventions and code patterns
- Automatic language detection that rejects non-Python code submissions
- Real-time syntax highlighting for both input and output code
- Split-screen editor design for side-by-side viewing of original and commented code
- Copy-to-clipboard functionality for easy use of results
- Performance optimization for efficient processing of large Python files
- No API keys or external services required, ensuring privacy and speed
- Modern web interface with gradient themes and smooth animations
- Comprehensive SEO optimization for discoverability

Technology Stack:

- Backend: Flask (Python web framework) providing RESTful APIs
- Analysis Engine: Python's built-in AST module for parsing
- Comment Generation: Intelligent pattern recognition system
- Frontend: HTML5, CSS3, and vanilla JavaScript
- Deployment: Vercel's serverless platform with automatic scaling
- Features: Global CDN distribution and zero-configuration deployment

How It Works:

When you paste Python code into the application, it first validates that the code is actually Python by checking for language-specific indicators. The system looks for Python keywords like "def", "class", and "import" while checking for non-Python patterns like curly braces and semicolons. If the code passes validation, it's parsed into an Abstract Syntax Tree. The parser then traverses this tree recursively, visiting every node and identifying code elements. For each function, it extracts the name, parameters, return type, decorators, and any existing docstrings. For classes, it identifies the name, base classes, and methods. For control structures, it analyzes the conditions and loop variables. This information feeds into the comment generation system, which uses pattern matching to infer the purpose of each code element. The generated comments are then inserted into the code at appropriate locations, maintaining a minimum gap between comments to avoid cluttering. The result is displayed in a split-screen view with syntax highlighting.

Installation and Usage:

- Clone the repository from GitHub
- Install required dependencies: Flask and Flask-CORS
- Run the Flask server to start the application locally on port 5000
- For production, deploy to Vercel using the included vercel.json configuration
- Visit the website and paste your Python code into the left panel
- Click the "Analyze" button to process the code
- View the commented code in the right panel with syntax highlighting
- Copy the result to your clipboard with a single click

Project Structure:

- Main application file handles routing and request processing
- Analyzers directory contains all code analysis logic
- Advanced Python analyzer implements AST-based parsing
- Comment generator creates contextual comments
- Intelligent comment engine handles pattern recognition
- Templates directory contains HTML interface with SEO optimization
- Static directory holds CSS styling, JavaScript logic, and SEO resources

Future Enhancements:

- Support for additional programming languages (JavaScript, TypeScript, Java)
- Comment customization options for style and verbosity control
- Batch processing for multiple files simultaneously
- IDE integration with VS Code and PyCharm
- Advanced analysis features including complexity metrics and code smell detection
- RESTful API for third-party integration
- Machine learning integration to improve comment quality
- Collaborative features with team accounts and shared projects
- Documentation generation for README files and API documentation

Links:

Live Demo: https://codeanatomy.vercel.app
GitHub Repository: https://github.com/viktorexe/codeanatomy

This project is open source and available for educational and personal use. For questions, suggestions, or contributions, please open an issue on GitHub or submit a pull request. We welcome feedback and contributions from the community to make Code Anatomy even better.
