# Code Anatomy

Intelligent code documentation system powered by Groq AI.

## Features
- Syntax highlighting for Python and C
- Smart comment detection
- Professional code editor with auto-indentation
- Real-time syntax highlighting

## Local Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Copy `.env.example` to `.env` and add your Groq API key:
   ```bash
   cp .env.example .env
   ```
4. Run the application:
   ```bash
   python app.py
   ```

## Vercel Deployment

1. Push your code to GitHub (`.env` will be ignored)
2. Import project in Vercel
3. Add environment variable in Vercel dashboard:
   - Key: `GROQ_API_KEY`
   - Value: Your Groq API key
4. Deploy

## Environment Variables

- `GROQ_API_KEY` - Your Groq API key (required)
