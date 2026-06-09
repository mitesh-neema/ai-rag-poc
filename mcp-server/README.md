# MCP Server for RAG Context

Mock implementation of NotebookLM-style MCP server for retrieving context data.

## Features

- **Case Studies**: Retrieve relevant previous projects and success stories
- **Rate Cards**: Get team member roles and pricing information
- **Tech Accelerators**: Find reusable frameworks and components
- **Comprehensive Context**: Get all relevant information in one call

## API Endpoints

### Health Check
```
GET /health
```

### MCP Resources

#### Get Case Studies
```
POST /mcp/resources/case-studies
Body: { "query": "e-commerce react aws" }
```

#### Get Rate Cards
```
POST /mcp/resources/rate-cards
Body: { "query": "react node" }
```

#### Get Tech Accelerators
```
POST /mcp/resources/tech-accelerators
Body: { "query": "authentication oauth" }
```

### MCP Tools

#### Get Proposal Context (Main Tool)
```
POST /mcp/tools/get-proposal-context
Body: { "requirements": "Build an e-commerce platform with React and AWS" }

Response includes:
- Relevant case studies
- Matching rate cards
- Applicable tech accelerators
```

### Metadata Endpoints

```
GET /mcp/resources  # List available resources
GET /mcp/tools      # List available tools
```

## Running the Server

```bash
npm install
npm run dev
```

Server will start on http://localhost:3001

## Data Files

Mock data is stored in `src/data/`:
- `case-studies.json` - 5 case studies
- `rate-cards.json` - 12 role rate cards
- `tech-accelerators.json` - 12 reusable accelerators

## Extending to Real NotebookLM

To integrate with real NotebookLM:

1. Replace `data-service.ts` with NotebookLM API client
2. Update search logic to use NotebookLM's semantic search
3. Keep the same MCP endpoint structure
4. No changes needed in backend or frontend!
