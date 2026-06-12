# NotebookLM MCP - Correct Setup Commands

## Step-by-Step MCP Integration

### Step 1: Initialize MCP Session

First, you need to establish a session with the MCP server:

```bash
curl -X POST http://localhost:3002/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {
        "roots": {
          "listChanged": true
        }
      },
      "clientInfo": {
        "name": "rag-proposal-client",
        "version": "1.0.0"
      }
    },
    "id": 1
  }'
```

**Important:** Save the `Mcp-Session-Id` from the response headers! You'll need it for all subsequent requests.

Example response headers:
```
mcp-session-id: abc123xyz...
```

### Step 2: Add Your Notebook

Use the session ID from Step 1 in the header:

```bash
# Replace SESSION_ID_HERE with the actual session ID from Step 1
curl -X POST http://localhost:3002/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Mcp-Session-Id: SESSION_ID_HERE" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "add_notebook",
      "arguments": {
        "url": "https://notebooklm.google.com/notebook/6fe13c9c-4ab9-416f-85f9-45999046fc8b",
        "name": "Proposal Generator KB",
        "description": "Knowledge base for proposal generation"
      }
    },
    "id": 2
  }'
```

### Step 3: List Notebooks (Verify)

```bash
curl -X POST http://localhost:3002/mcp \
  -H "Content-Type: application/json" \
  -H "Mcp-Session-Id: SESSION_ID_HERE" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "list_notebooks"
    },
    "id": 3
  }'
```

### Step 4: Select Your Notebook as Default

```bash
# Get the notebook ID from the list_notebooks response
curl -X POST http://localhost:3002/mcp \
  -H "Content-Type: application/json" \
  -H "Mcp-Session-Id: SESSION_ID_HERE" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "select_notebook",
      "arguments": {
        "id": "NOTEBOOK_ID_FROM_LIST"
      }
    },
    "id": 4
  }'
```

### Step 5: Test a Query

```bash
curl -X POST http://localhost:3002/mcp \
  -H "Content-Type: application/json" \
  -H "Mcp-Session-Id: SESSION_ID_HERE" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "ask_question",
      "arguments": {
        "question": "What case studies do we have for e-commerce projects?",
        "source_format": "json"
      }
    },
    "id": 5
  }'
```

## Alternative: Use a Script

Save this as `test-notebooklm.sh`:

```bash
#!/bin/bash

# Step 1: Initialize and capture session ID
RESPONSE=$(curl -s -i -X POST http://localhost:3002/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {"name": "test-client", "version": "1.0.0"}
    },
    "id": 1
  }')

# Extract session ID
SESSION_ID=$(echo "$RESPONSE" | grep -i "mcp-session-id:" | cut -d' ' -f2 | tr -d '\r')

echo "Session ID: $SESSION_ID"

# Step 2: Add notebook
echo "Adding notebook..."
curl -X POST http://localhost:3002/mcp \
  -H "Content-Type: application/json" \
  -H "Mcp-Session-Id: $SESSION_ID" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "add_notebook",
      "arguments": {
        "url": "https://notebooklm.google.com/notebook/6fe13c9c-4ab9-416f-85f9-45999046fc8b",
        "name": "Proposal Generator KB",
        "description": "Knowledge base for proposal generation"
      }
    },
    "id": 2
  }'

echo -e "\n\nListing notebooks..."
# Step 3: List notebooks
curl -X POST http://localhost:3002/mcp \
  -H "Content-Type: application/json" \
  -H "Mcp-Session-Id: $SESSION_ID" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "list_notebooks"
    },
    "id": 3
  }'
```

Run it:
```bash
chmod +x test-notebooklm.sh
./test-notebooklm.sh
```

## Common Issues & Solutions

### Issue 1: "no transport for request"
**Cause:** Missing session initialization or session ID
**Solution:** Always initialize first, then use the session ID in all subsequent calls

### Issue 2: Session expired
**Cause:** Sessions timeout after inactivity
**Solution:** Re-initialize to get a new session ID

### Issue 3: Notebook not found
**Cause:** Notebook URL not properly shared or invalid
**Solution:** 
1. Go to NotebookLM
2. Click Share → Create share link
3. Make sure it's a public share link
4. Copy the complete URL

### Issue 4: Authentication errors
**Cause:** NotebookLM MCP needs Google authentication
**Solution:**
```bash
# Stop the server (Ctrl+C)
# Start with visible browser for first-time auth
HEADLESS=false npx notebooklm-mcp@latest --transport http --port 3002
# Complete Google login
# Then restart in headless mode
```

## Testing from Backend

Once the notebook is added, your backend service will handle sessions automatically. Just make sure:

1. **Backend `.env` is configured:**
   ```env
   USE_REAL_NOTEBOOKLM=true
   NOTEBOOKLM_MCP_URL=http://localhost:3002
   NOTEBOOKLM_TIMEOUT=60000
   ```

2. **NotebookLM MCP server is running:**
   ```bash
   NOTEBOOKLM_TRANSPORT=http NOTEBOOKLM_PORT=3002 npx notebooklm-mcp@latest
   ```

3. **Test from Frontend:**
   - Open http://localhost:4200
   - Ask: "Create a proposal for an e-commerce platform"
   - Should get response using NotebookLM data

## Quick Reference: MCP Protocol Flow

```
1. Initialize Session
   ↓
2. Receive Session ID
   ↓
3. Add Notebook (with Session ID)
   ↓
4. List/Select Notebooks (with Session ID)
   ↓
5. Ask Questions (with Session ID)
   ↓
6. Get Answers with Citations
```

## Full Example with jq (for pretty output)

```bash
# 1. Initialize (save session ID)
SESSION_ID=$(curl -s -i -X POST http://localhost:3002/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}},"id":1}' \
  | grep -i "mcp-session-id:" | cut -d' ' -f2 | tr -d '\r')

echo "Session: $SESSION_ID"

# 2. Add notebook
curl -s -X POST http://localhost:3002/mcp \
  -H "Content-Type: application/json" \
  -H "Mcp-Session-Id: $SESSION_ID" \
  -d '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"add_notebook","arguments":{"url":"https://notebooklm.google.com/notebook/6fe13c9c-4ab9-416f-85f9-45999046fc8b","name":"Proposal KB"}},"id":2}' \
  | jq .

# 3. List notebooks
curl -s -X POST http://localhost:3002/mcp \
  -H "Content-Type: application/json" \
  -H "Mcp-Session-Id: $SESSION_ID" \
  -d '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"list_notebooks"},"id":3}' \
  | jq .

# 4. Ask question
curl -s -X POST http://localhost:3002/mcp \
  -H "Content-Type: application/json" \
  -H "Mcp-Session-Id: $SESSION_ID" \
  -d '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"ask_question","arguments":{"question":"What is the hourly rate for a Senior Full-Stack Developer?"}},"id":4}' \
  | jq .
```

## Success Checklist

- [ ] NotebookLM MCP server is running (http://localhost:3002)
- [ ] Health check passes (`curl http://localhost:3002/healthz`)
- [ ] Session initialized successfully
- [ ] Session ID captured
- [ ] Notebook added to library
- [ ] Notebooks list shows your notebook
- [ ] Test question returns relevant answer
- [ ] Backend `.env` configured
- [ ] Frontend can generate proposals

---

**Need Help?**
- Check server logs for detailed error messages
- Verify Google authentication is complete
- Ensure NotebookLM notebook is properly shared
- Test queries directly in NotebookLM UI first
