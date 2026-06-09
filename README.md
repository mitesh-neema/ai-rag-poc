# RAG Proposal Generator Demo

A comprehensive demo showcasing AI-powered proposal generation using Claude API with Retrieval-Augmented Generation (RAG) through MCP protocol.

## Architecture

```
┌─────────────────┐
│  Angular Chat   │ ← User Interface (Port 4200)
│   Frontend      │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│   Node.js API   │ ← Backend Server (Port 3000)
│   + Claude SDK  │
└────────┬────────┘
         │ MCP Protocol
         ▼
┌─────────────────┐
│   MCP Server    │ ← Document Retrieval (Port 3001)
│  (Mock Data)    │
└─────────────────┘
```

## Features

- 💬 Real-time chat interface for proposal requests
- 🤖 Claude AI integration for intelligent proposal generation
- 📚 RAG implementation via MCP protocol
- 📊 Slide deck format output (Markdown slides)
- 🔄 Modular design for easy NotebookLM integration

## Project Structure

```
ai-works/
├── frontend/          # Angular chat application
├── backend/           # Node.js API server
├── mcp-server/        # MCP server for RAG context
└── README.md
```

## Quick Start

### Prerequisites

- **Node.js** 18+ installed
- **Claude API Key** from Anthropic (https://console.anthropic.com/)

### 3-Step Setup

1. **Get Your Claude API Key**
   - Visit https://console.anthropic.com/
   - Create an account and generate an API key

2. **Configure Backend**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env and add: ANTHROPIC_API_KEY=your_key_here
   ```

3. **Start All Services** (3 terminals)

   **Terminal 1 - MCP Server:**
   ```bash
   cd mcp-server
   npm install
   npm run dev
   # Runs on port 3001
   ```

   **Terminal 2 - Backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   # Runs on port 3000
   ```

   **Terminal 3 - Frontend:**
   ```bash
   cd frontend
   npm install
   npm start
   # Runs on port 4200
   ```

4. **Access the Application**
   - Open browser: **http://localhost:4200**
   - Try example prompts or create custom proposals!

📖 **Detailed setup guide**: See [SETUP.md](./SETUP.md)

## Usage

1. Open the chat interface
2. Enter a proposal request, e.g., "Create a proposal for an e-commerce platform using React and AWS"
3. The system will:
   - Retrieve relevant context from MCP server (case studies, rate cards, tech accelerators)
   - Send to Claude API with RAG context
   - Generate a comprehensive proposal in slide deck format
4. View and interact with the generated proposal

## Extending to Real NotebookLM

The MCP server is designed to be modular. To integrate with real NotebookLM:

1. Replace mock data retrieval in `mcp-server/src/services/` with NotebookLM API calls
2. Update MCP server configuration
3. No changes needed in frontend or backend!

## Technologies

- **Frontend**: Angular 17+, Tailwind CSS, TypeScript
- **Backend**: Node.js, Express, TypeScript, Anthropic SDK
- **MCP Server**: TypeScript, Express, MCP Protocol
- **AI**: Claude 3.5 Sonnet

## License

MIT
