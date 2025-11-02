# CodeAnatomy - C Program Visualizer

A web-based interactive visualizer that reveals the internal mechanics of C programs, from beginner concepts like pointers and arrays to advanced data structures and system-level behavior.

## Features

- **Memory Visualization**: Stack and heap memory evolution with real-time tracking
- **Data Structure Animation**: Live visualization of linked lists, trees, graphs, and hash tables
- **Performance Analysis**: Runtime complexity hints and memory usage dashboard
- **System Programming**: Pointer arithmetic, memory leaks detection, and system calls insight
- **Interactive Debugging**: Step-through execution with visual feedback

## Tech Stack

- **Frontend**: TypeScript, React.js, Next.js
- **Styling**: HTML, CSS, JavaScript (separate files)
- **Hosting**: Vercel

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Architecture

- HTML templates are stored in separate `.html` files in `/public/templates/`
- TypeScript files handle pure logic and state management
- CSS files provide styling and animations
- React components manage the application state and user interactions

## Usage

1. Enter your C code in the editor
2. Click "Run" to parse and execute the code
3. Watch the memory visualization update in real-time
4. Switch between Memory, Stack, and Heap views
5. Monitor console output and performance metrics

## Development

The project follows a clean separation of concerns:
- `/app/` - Next.js app directory structure
- `/components/` - React components
- `/utils/` - Utility classes (MemoryManager, CParser)
- `/public/templates/` - HTML templates
- `/public/styles/` - CSS stylesheets