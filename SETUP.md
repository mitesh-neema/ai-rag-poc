# RAG Proposal Generator - Setup Guide

Complete setup guide for the RAG Proposal Generator demo.

## Prerequisites

- **Node.js** 18 or higher
- **npm** (comes with Node.js)
- **Claude API Key** from Anthropic

## Quick Start (3 Terminal Approach)

### Terminal 1: MCP Server

```bash
cd mcp-server
npm install
npm run dev
```

The MCP server will start on **http://localhost:3001**

### Terminal 2: Backend API

```bash
cd backend

# Setup environment
cp .env.example .env
# Edit .env and add your Claude API key:
# ANTHROPIC_API_KEY=your_api_key_here

npm install
npm run dev
```

The backend API will start on **http://localhost:3000**

### Terminal 3: Frontend

```bash
cd frontend
npm install
npm start
```

The frontend will start on **http://localhost:4200**

Open your browser and navigate to **http://localhost:4200**

## Detailed Setup Instructions

### 1. Get Your Claude API Key

1. Go to https://console.anthropic.com/
2. Sign in or create an account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (you'll need it in step 3)

### 2. Install Dependencies

#### MCP Server
```bash
cd mcp-server
npm install
```

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 3. Configure Environment Variables

#### Backend Configuration

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and add your Claude API key:

```env
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PORT=3000
NODE_ENV=development
MCP_SERVER_URL=http://localhost:3001
ALLOWED_ORIGINS=http://localhost:4200
```

### 4. Start All Services

You need to run all three services simultaneously. Use three separate terminal windows/tabs:

#### Terminal 1 - MCP Server
```bash
cd mcp-server
npm run dev
```

**Expected Output:**
```
🚀 MCP Server running on port 3001
📚 Resources loaded:
   - 5 case studies
   - 12 rate cards
   - 12 tech accelerators

✅ Ready to serve RAG context!
```

#### Terminal 2 - Backend API
```bash
cd backend
npm run dev
```

**Expected Output:**
```
🔍 Checking MCP server connectivity...
✅ MCP server is connected

🚀 Backend API server running on port 3000
📍 Health check: http://localhost:3000/health
📍 API endpoint: http://localhost:3000/api/proposal

✅ Ready to generate proposals!
```

#### Terminal 3 - Frontend
```bash
cd frontend
npm start
```

**Expected Output:**
```
** Angular Live Development Server is listening on localhost:4200 **
✔ Compiled successfully.
```

### 5. Access the Application

Open your browser and go to: **http://localhost:4200**

You should see the RAG Proposal Generator interface!

## Testing the Setup

### 1. Check Server Health

```bash
# MCP Server
curl http://localhost:3001/health

# Backend API
curl http://localhost:3000/health

# MCP Connectivity
curl http://localhost:3000/health/mcp
```

### 2. Test RAG Context Retrieval

```bash
curl -X POST http://localhost:3001/mcp/tools/get-proposal-context \
  -H "Content-Type: application/json" \
  -d '{"requirements": "e-commerce platform using React and AWS"}'
```

### 3. Generate a Test Proposal

Try one of the example prompts in the UI:
- "Create a proposal for building an e-commerce platform using React and AWS"
- "Build a mobile banking app with real-time notifications for a fintech client"
- "Develop an IoT dashboard for smart factory monitoring with predictive analytics"

## Troubleshooting

### MCP Server Not Starting

**Issue:** Port 3001 already in use
```bash
# Find and kill the process
lsof -ti:3001 | xargs kill -9
```

### Backend API Connection Issues

**Issue:** Cannot connect to MCP server
- Ensure MCP server is running on port 3001
- Check `MCP_SERVER_URL` in backend/.env

**Issue:** Claude API errors
- Verify your API key is correct in backend/.env
- Check your API key has sufficient credits
- Ensure there are no extra spaces in the .env file

### Frontend Build Errors

**Issue:** Module not found errors
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Issue:** Port 4200 already in use
```bash
# Kill existing Angular process
lsof -ti:4200 | xargs kill -9
```

### CORS Errors

If you see CORS errors in the browser console:
1. Check that backend is running on port 3000
2. Verify `ALLOWED_ORIGINS` in backend/.env includes `http://localhost:4200`
3. Restart the backend after any .env changes

## Production Build

### Build Frontend
```bash
cd frontend
npm run build
# Output will be in frontend/dist/
```

### Build Backend
```bash
cd backend
npm run build
npm start  # Run built version
```

### Build MCP Server
```bash
cd mcp-server
npm run build
npm start  # Run built version
```

## Architecture Overview

```
┌─────────────────┐
│  Browser        │ ← User opens http://localhost:4200
│  (Port 4200)    │
└────────┬────────┘
         │ HTTP Requests
         ▼
┌─────────────────┐
│  Backend API    │ ← Express server with Claude integration
│  (Port 3000)    │
└────────┬────────┘
         │ MCP Protocol
         ▼
┌─────────────────┐
│  MCP Server     │ ← RAG context (case studies, rate cards, etc.)
│  (Port 3001)    │
└─────────────────┘
```

## Data Flow

1. **User Input** → Frontend captures proposal requirements
2. **API Request** → Frontend sends to `/api/proposal/generate`
3. **Context Retrieval** → Backend calls MCP server for RAG context
4. **AI Generation** → Backend sends context + requirements to Claude
5. **Response** → Claude generates proposal in slide deck format
6. **Display** → Frontend renders markdown proposal

## Next Steps

### Extend to Real NotebookLM

The MCP server currently uses mock JSON data. To integrate with real NotebookLM:

1. Replace `mcp-server/src/services/data-service.ts` with NotebookLM API client
2. Update search methods to use NotebookLM's API
3. Keep the same MCP endpoint structure
4. No changes needed in backend or frontend!

### Add Features

- **Streaming responses** - Use `/api/proposal/generate-stream` endpoint
- **Proposal templates** - Add custom templates for different industries
- **Export formats** - Add PDF/PPTX export functionality
- **Proposal history** - Store and retrieve past proposals
- **User authentication** - Add user accounts and saved proposals

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review server logs in each terminal
3. Verify all environment variables are set correctly
4. Ensure all three services are running

## License

MIT
