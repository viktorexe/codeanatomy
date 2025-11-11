# Code Anatomy

Code Anatomy is an intelligent web-based tool that automatically generates meaningful comments for Python code. Built as a Project Based Learning initiative, this application uses Abstract Syntax Tree (AST) parsing to deeply understand code structure and produce context-aware documentation that explains what your code does in plain English.

## About the Project

This tool addresses a common challenge in software development: understanding and documenting code efficiently. Instead of manually writing comments for every function, class, and control structure, Code Anatomy analyzes your Python code automatically and generates intelligent comments based on naming patterns, code structure, and context. The application helps developers maintain better documentation standards, understand unfamiliar codebases faster, and save time on manual commenting tasks.

The system works by parsing Python code into an Abstract Syntax Tree, which represents the code's syntactic structure. It then traverses this tree to identify functions, classes, loops, conditionals, exception handling, and other code elements. For each element, it analyzes the naming conventions, parameters, return types, and context to generate appropriate comments. The comment generation engine recognizes common patterns like "get_" for retrieval operations, "set_" for modifications, "is_" for boolean checks, and many others to produce meaningful explanations.

## Key Features

Code Anatomy provides deep code analysis using Python's AST module to understand code at a fundamental level. It identifies functions, classes, loops, conditionals, and variable declarations while maintaining awareness of code context and relationships. The intelligent comment generation system produces contextual comments based on naming conventions and code patterns, explaining not just what the code is but why it exists and how it fits into the larger program.

The application includes automatic language detection that rejects non-Python code submissions, ensuring accurate analysis. It features real-time syntax highlighting for both input and output code, making it easy to read and compare. The split-screen editor design allows side-by-side viewing of original and commented code with copy-to-clipboard functionality for easy use of the results.

Performance optimization ensures efficient processing even for large Python files, with most files processing in just a few seconds. The tool runs entirely in your browser and on the server without requiring API keys or external services, ensuring privacy and speed.

## Technology Stack

The backend is built with Flask, a Python web framework that provides RESTful APIs for code processing. The core analysis engine uses Python's built-in AST module for parsing and the intelligent comment generation system for pattern recognition. The frontend uses HTML5, CSS3, and vanilla JavaScript without framework dependencies, featuring modern design with gradient themes and smooth animations.

Deployment is handled through Vercel's serverless platform, which provides automatic scaling, global CDN distribution, and zero-configuration deployment. The application includes comprehensive SEO optimization with meta tags, Open Graph properties, structured data, and sitemap for discoverability.

## How It Works

When you paste Python code into the application, it first validates that the code is actually Python by checking for language-specific indicators. The system looks for Python keywords like "def", "class", and "import" while checking for non-Python patterns like curly braces and semicolons. If the code passes validation, it's parsed into an Abstract Syntax Tree.

The parser then traverses this tree recursively, visiting every node and identifying code elements. For each function, it extracts the name, parameters, return type, decorators, and any existing docstrings. For classes, it identifies the name, base classes, and methods. For control structures, it analyzes the conditions and loop variables.

This information feeds into the comment generation system, which uses pattern matching to infer the purpose of each code element. Function names starting with "get_" are recognized as retrieval operations, "set_" as modifications, "create_" as object creation, and so on. The system also recognizes special Python methods like "__init__" and generates appropriate explanations for their role in the Python object model.

The generated comments are then inserted into the code at appropriate locations, maintaining a minimum gap between comments to avoid cluttering. The result is displayed in a split-screen view with syntax highlighting, allowing you to see the original and commented versions side by side.

## Installation and Usage

To run Code Anatomy locally, clone the repository and install the required dependencies listed in requirements.txt. The main dependencies are Flask for the web framework and Flask-CORS for handling cross-origin requests. Start the application by running the Flask server, which will make it available at localhost on port 5000.

For production deployment, the application is configured for Vercel's serverless platform. The vercel.json configuration file specifies the Python runtime and route mappings. Simply connect your GitHub repository to Vercel, and it will automatically deploy on every commit with zero configuration needed.

To use the application, visit the website and paste your Python code into the left panel. Click the "Analyze" button to process the code. The system will validate that it's Python code, parse it using AST, generate intelligent comments, and display the result in the right panel with syntax highlighting. You can then copy the commented code to your clipboard with a single click.

## Project Structure

The application follows a modular architecture with clear separation of concerns. The main application file handles routing and request processing, while the analyzers directory contains all code analysis logic. The advanced_python_analyzer module implements AST-based parsing, the comment_generator creates contextual comments, and the intelligent_comment_engine handles pattern recognition.

The templates directory contains the HTML interface with comprehensive SEO optimization including meta tags, Open Graph properties, and structured data. The static directory holds CSS styling with modern effects and animations, JavaScript for frontend logic and syntax highlighting, and SEO resources like sitemap.xml and robots.txt.

## Team

This project was developed as a Project Based Learning initiative by Vansh Sharma, Manya Gupta, and Priyanshu Bagaria, students in the B.Tech CSE AI & ML program. The collaborative effort demonstrates full-stack development skills, algorithm design, and production deployment practices.

## Future Enhancements

Future development plans include extending support to additional programming languages like JavaScript, TypeScript, and Java. We plan to add comment customization options allowing users to control style and verbosity levels. Batch processing capabilities will enable uploading and processing multiple files simultaneously.

Integration with popular IDEs like VS Code and PyCharm is planned to bring the commenting functionality directly into developers' workflows. Advanced analysis features will include code complexity metrics, code smell detection, and refactoring suggestions. An API will be developed for third-party integration, enabling other tools to leverage the commenting engine.

Long-term goals include machine learning integration to improve comment quality based on feedback and learn project-specific commenting styles. Collaborative features will support team accounts and shared projects. Documentation generation capabilities will automatically create README files and API documentation with export to multiple formats.

## License

This project is open source and available for educational and personal use. Feel free to fork, modify, and use it for your own projects while maintaining attribution to the original authors.

## Links

Live Demo: https://codeanatomy.vercel.app
GitHub Repository: https://github.com/viktorexe/codeanatomy

For questions, suggestions, or contributions, please open an issue on GitHub or submit a pull request. We welcome feedback and contributions from the community to make Code Anatomy even better.
