# Backend API - RAG Proposal Generator

Express.js backend with Claude API integration and MCP client for RAG context retrieval.

## Features

- 🤖 Claude 3.5 Sonnet API integration
- 📚 RAG context retrieval via MCP protocol
- 🌊 Streaming and non-streaming proposal generation
- 🔄 Modular architecture for easy extension
- 🛡️ Error handling and validation

## API Endpoints

### Health Checks

```
GET /health              # Server health
GET /health/mcp          # MCP server connectivity
```

### Proposal Generation

```
POST /api/proposal/generate
Body: { "requirements": "Build an e-commerce platform..." }
Response: Complete proposal in markdown slide format
```

```
POST /api/proposal/generate-stream
Body: { "requirements": "Build an e-commerce platform..." }
Response: Server-Sent Events (SSE) stream of proposal content
```

```
POST /api/proposal/context
Body: { "requirements": "Build an e-commerce platform..." }
Response: RAG context (case studies, rate cards, accelerators)
```

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env and add your Claude API key
   ```

3. **Start the server**
   ```bash
   npm run dev
   ```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Claude API key (required) | - |
| `PORT` | Server port | 3000 |
| `MCP_SERVER_URL` | MCP server endpoint | http://localhost:3001 |
| `ALLOWED_ORIGINS` | CORS allowed origins | http://localhost:4200 |

## Architecture

```
src/
├── index.ts                    # Server entry point
├── routes/
│   └── proposal.routes.ts      # Proposal endpoints
└── services/
    ├── claude.service.ts       # Claude API integration
    └── mcp-client.service.ts   # MCP server client
```

## Dependencies

- `express` - Web framework
- `@anthropic-ai/sdk` - Claude API client
- `axios` - HTTP client for MCP
- `cors` - CORS middleware
- `dotenv` - Environment configuration

## Workflow

1. Client sends proposal requirements to `/api/proposal/generate`
2. Backend calls MCP server to retrieve RAG context:
   - Relevant case studies
   - Matching rate cards
   - Applicable tech accelerators
3. Backend sends requirements + context to Claude API
4. Claude generates comprehensive proposal in slide deck format
5. Backend returns proposal to client

## Extending to Real NotebookLM

The MCP client service (`mcp-client.service.ts`) is designed to be modular:

1. Keep the same interface
2. Update the `getProposalContext()` method to call real NotebookLM API
3. No changes needed in routes or Claude service!
