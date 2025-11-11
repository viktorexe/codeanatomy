# Code Anatomy 🐍

> Intelligent Python code documentation tool that automatically generates meaningful comments using AST parsing.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://codeanatomy.vercel.app)
[![Python](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![Flask](https://img.shields.io/badge/flask-3.0.0-lightgrey.svg)](https://flask.palletsprojects.com/)

## 🚀 Live Demo

**Try it now:** [codeanatomy.vercel.app](https://codeanatomy.vercel.app)

## 📖 About

Code Anatomy automatically analyzes Python code and generates meaningful, context-aware comments. Using Abstract Syntax Tree (AST) parsing, it understands code structure deeply and produces documentation that explains what your code does in plain English.

## ✨ Features

- **AST-Based Analysis** - Deep understanding of Python code structure
- **Intelligent Comments** - Context-aware generation based on naming patterns
- **Language Detection** - Rejects non-Python code automatically
- **Real-time Syntax Highlighting** - Beautiful code editor with live highlighting
- **Split-screen View** - Compare original and commented code side-by-side
- **Fast Processing** - Optimized for large files
- **No API Keys** - Runs locally for privacy and speed

## 🛠️ Tech Stack

- **Backend:** Flask (Python)
- **Analysis:** Python AST Module
- **Frontend:** HTML5, CSS3, JavaScript
- **Deployment:** Vercel Serverless

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/viktorexe/codeanatomy.git
cd codeanatomy

# Install dependencies
pip install -r requirements.txt

# Run the application
python app.py
```

Visit `http://localhost:5000` to use the application.

## 📁 Project Structure

```
codeanatomy/
├── app.py                          # Flask application
├── analyzers/                      # Analysis modules
│   ├── advanced_python_analyzer.py # AST parser
│   ├── comment_generator.py        # Comment generation
│   └── intelligent_comment_engine.py # Pattern recognition
├── templates/index.html            # Web interface
├── static/                         # CSS, JS, assets
└── requirements.txt                # Dependencies
```

## 🎯 How It Works

1. Paste Python code into the editor
2. Click "Analyze" to process
3. AST parser identifies code structure
4. Pattern matcher generates contextual comments
5. View results with syntax highlighting

## 🔮 Future Plans

- Multi-language support (JavaScript, TypeScript, Java)
- Comment customization options
- IDE integration (VS Code, PyCharm)
- Batch file processing
- API for third-party tools

## 🤝 Contributing

Contributions are welcome! Fork the repository and submit a pull request.

## 📝 License

Open source and available for educational and personal use.

---

⭐ Star this repository if you find it helpful!
