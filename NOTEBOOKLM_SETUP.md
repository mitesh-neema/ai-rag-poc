# NotebookLM MCP Integration Guide

## Overview

We're using the open-source **notebooklm-mcp** server from [PleasePrompto](https://github.com/PleasePrompto/notebooklm-mcp) to integrate real NotebookLM functionality into our RAG proposal generator.

## Architecture

```
NotebookLM (Google) 
    ↓
NotebookLM MCP Server (Port 3002, HTTP mode)
    ↓
Our Backend API (Port 3000)
    ↓
Frontend (Port 4200)
```

## Setup Steps

### 1. Install NotebookLM MCP Server

```bash
# Install globally
npm install -g notebooklm-mcp@latest

# Or run with npx (recommended)
npx notebooklm-mcp@latest
```

### 2. Authenticate with Google

First-time setup requires Google authentication:

```bash
# Run authentication setup
npx notebooklm-mcp@latest

# Then run the setup_auth tool (will open Chrome)
# The server will save your Google credentials securely
```

### 3. Start NotebookLM MCP Server in HTTP Mode

For our integration, we need to run it in HTTP mode:

```bash
# Start on port 3002 (to avoid conflict with our backend on 3000)
npx notebooklm-mcp@latest --transport http --port 3002

# Or with environment variables
NOTEBOOKLM_TRANSPORT=http NOTEBOOKLM_PORT=3002 npx notebooklm-mcp@latest
```

**Important**: Keep this running in a separate terminal.

### 4. Configure Your Backend

Update `backend/.env`:

```env
# Add NotebookLM MCP configuration
NOTEBOOKLM_MCP_URL=http://localhost:3002
USE_REAL_NOTEBOOKLM=true

# Keep existing settings
ANTHROPIC_API_KEY=your_key_here
PORT=3000
MCP_SERVER_URL=http://localhost:3001
```

### 5. Add a Notebook to Your Library

Before using the system, add at least one NotebookLM notebook:

```bash
# Option 1: Via the notebooklm-mcp CLI
npx notebooklm-mcp config add-notebook <your-notebook-share-url>

# Option 2: Via MCP tool call (from our backend)
# POST to http://localhost:3002/mcp
# Tool: add_notebook with your NotebookLM share URL
```

## Available NotebookLM Tools

Our backend can now use these NotebookLM MCP tools:

### Core Q&A
- `ask_question` - Ask questions against your notebooks
- `add_source` - Add URLs or text to notebooks
- `generate_audio` - Create audio overviews

### Library Management
- `list_notebooks` - See all your notebooks
- `select_notebook` - Set active notebook for queries
- `add_notebook` - Add notebook to library
- `search_notebooks` - Find notebooks by topic

### Sessions
- `list_sessions` - View active browser sessions
- `close_session` - Clean up sessions
- `reset_session` - Reset chat history

## Integration Options

### Option A: Use NotebookLM MCP Alongside Mock MCP (Recommended for Demo)

Keep both servers running:
- **Mock MCP** (Port 3001): Serves static case studies, rate cards, accelerators
- **NotebookLM MCP** (Port 3002): Real-time RAG from your NotebookLM documents

The backend can fetch from both and combine the context.

**Pros:**
- Best of both worlds
- Always have baseline data
- Real documents add richness

### Option B: Use Only NotebookLM MCP

Replace the mock MCP entirely with NotebookLM:
- Upload your case studies, rate cards to a NotebookLM notebook
- Use only the NotebookLM MCP for all RAG queries

**Pros:**
- Single source of truth
- Real RAG experience
- Cleaner architecture

### Option C: Hybrid with Fallback

Try NotebookLM first, fall back to mock data if unavailable:
- Attempts to query NotebookLM MCP
- If it fails/times out, uses mock MCP data
- Best for reliability

## Running the Complete System

### Terminal 1: NotebookLM MCP Server
```bash
NOTEBOOKLM_TRANSPORT=http NOTEBOOKLM_PORT=3002 npx notebooklm-mcp@latest
```

### Terminal 2: Mock MCP Server (optional)
```bash
cd mcp-server
npm run dev
```

### Terminal 3: Backend API
```bash
cd backend
npm run dev
```

### Terminal 4: Frontend
```bash
cd frontend
npm start
```

## Testing the Integration

### 1. Check NotebookLM MCP Health

```bash
curl http://localhost:3002/healthz
```

### 2. Test with MCP Tool Call

```bash
curl -X POST http://localhost:3002/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "list_notebooks"
    },
    "id": 1
  }'
```

### 3. Test from Frontend

1. Open http://localhost:4200
2. Ask: "What case studies do we have for e-commerce projects?"
3. The system should query NotebookLM and return real data from your notebooks

## Troubleshooting

### Authentication Issues
```bash
# Re-authenticate
npx notebooklm-mcp@latest
# Then manually call re_auth tool
```

### Port Conflicts
```bash
# Check what's running on ports
lsof -i :3002
lsof -i :3001
lsof -i :3000
lsof -i :4200
```

### NotebookLM MCP Not Responding
```bash
# Check server logs
# Restart with verbose logging
DEBUG=* npx notebooklm-mcp@latest --transport http --port 3002
```

### No Notebooks in Library
```bash
# List current notebooks
curl -X POST http://localhost:3002/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "list_notebooks"
    },
    "id": 1
  }'
```

## Environment Variables Reference

### NotebookLM MCP Server
```env
NOTEBOOKLM_TRANSPORT=http           # Use HTTP mode
NOTEBOOKLM_PORT=3002                # Port number
NOTEBOOKLM_HOST=127.0.0.1          # Bind address
HEADLESS=true                       # Run Chrome headless
ANSWER_TIMEOUT_MS=600000           # 10 minutes
MAX_SESSIONS=10                     # Concurrent sessions
```

### Our Backend
```env
NOTEBOOKLM_MCP_URL=http://localhost:3002   # NotebookLM MCP endpoint
USE_REAL_NOTEBOOKLM=true                   # Enable/disable integration
MCP_SERVER_URL=http://localhost:3001       # Mock MCP (fallback)
```

## Production Considerations

### Security
- NotebookLM MCP runs Chrome and stores Google credentials
- Only bind to `127.0.0.1` (localhost) for security
- Use `0.0.0.0` only on trusted networks
- Consider running in a containerized environment

### Performance
- Each query opens a browser session
- Set appropriate `MAX_SESSIONS` limit
- Configure `SESSION_TIMEOUT` for cleanup
- Monitor memory usage (Chrome can be heavy)

### Reliability
- Implement retry logic in backend
- Add fallback to mock data
- Set reasonable timeouts (`ANSWER_TIMEOUT_MS`)
- Monitor NotebookLM MCP health endpoint

## Next Steps

1. ✅ Install notebooklm-mcp
2. ✅ Authenticate with Google
3. ✅ Add your notebooks to the library
4. ⬜ Update backend to connect to NotebookLM MCP
5. ⬜ Test end-to-end RAG flow
6. ⬜ (Optional) Upload your case studies/rate cards to NotebookLM

## Resources

- [NotebookLM MCP GitHub](https://github.com/PleasePrompto/notebooklm-mcp)
- [Full Documentation](https://github.com/PleasePrompto/notebooklm-mcp/tree/main/docs)
- [Troubleshooting Guide](https://github.com/PleasePrompto/notebooklm-mcp/blob/main/docs/troubleshooting.md)
