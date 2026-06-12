# NotebookLM Data Files - Upload Guide

This folder contains three text files converted from our JSON mock data for use with NotebookLM. These files will serve as the knowledge base for the RAG Proposal Generator.

## 📁 Files Included

1. **case-studies.txt** (9.2 KB)
   - 5 detailed case studies across different industries
   - Includes client names, budgets, technologies, results
   - Covers Retail, Fintech, Healthcare, Manufacturing, SaaS

2. **rate-cards.txt** (7.8 KB)
   - 12 team member roles with hourly/daily/monthly rates
   - Skill sets and experience levels
   - Team composition recommendations

3. **tech-accelerators.txt** (11.5 KB)
   - 12 reusable technology accelerators
   - Time and cost savings estimates
   - Implementation details and use cases

## 🚀 Quick Start Guide

### Step 1: Access NotebookLM
1. Go to [https://notebooklm.google.com](https://notebooklm.google.com)
2. Sign in with your Google account
3. Click "New notebook" to create a notebook

### Step 2: Create a Notebook for Proposals
1. Name your notebook: **"Proposal Generator Knowledge Base"**
2. Add a description: "Case studies, rate cards, and tech accelerators for AI-powered proposal generation"

### Step 3: Upload the Data Files
1. Click on **"Sources"** in the left sidebar
2. Click **"Upload"** or drag and drop files
3. Upload all three files:
   - `case-studies.txt`
   - `rate-cards.txt`
   - `tech-accelerators.txt`

4. Wait for NotebookLM to process the files (usually 10-30 seconds per file)

### Step 4: Verify Upload
Check that all three sources appear in your notebook:
- ✅ case-studies.txt
- ✅ rate-cards.txt  
- ✅ tech-accelerators.txt

### Step 5: Get Your Notebook Share URL
1. Click the **"Share"** button in the top-right
2. Click **"Create share link"**
3. Copy the notebook URL (looks like: `https://notebooklm.google.com/notebook/...`)
4. **Save this URL** - you'll need it for the MCP integration

## 🧪 Testing NotebookLM Directly

Before integrating with our system, test NotebookLM directly:

### Test Query 1: Case Studies
**Ask:** "What case studies do we have for e-commerce projects?"

**Expected Response:** Should mention RetailCo case study with React, Node.js, AWS, and the 45% performance improvement.

### Test Query 2: Pricing
**Ask:** "What is the hourly rate for a Senior Full-Stack Developer?"

**Expected Response:** Should return $120/hour.

### Test Query 3: Tech Accelerators
**Ask:** "What technology accelerators can help with payment processing?"

**Expected Response:** Should mention the Payment Processing Integration accelerator (TA-006) with Stripe, PayPal, and fraud detection features.

### Test Query 4: Combined
**Ask:** "Create a proposal for building an e-commerce platform. Include relevant case studies, team rates, and accelerators."

**Expected Response:** Should reference:
- RetailCo case study
- E-commerce Starter Kit accelerator
- Senior/Mid-Level Developer rates
- Estimated timeline and costs

## 🔗 Integrating with Our System

### Option 1: Using NotebookLM MCP Server

1. **Install the MCP Server:**
   ```bash
   npm install -g notebooklm-mcp@latest
   ```

2. **Start the MCP Server:**
   ```bash
   NOTEBOOKLM_TRANSPORT=http NOTEBOOKLM_PORT=3002 npx notebooklm-mcp@latest
   ```

3. **Authenticate (First Time):**
   - The server will open Chrome
   - Log in to your Google account
   - Complete authentication

4. **Add Your Notebook to the Library:**
   ```bash
   # Use the share URL you copied earlier
   curl -X POST http://localhost:3002/mcp \
     -H "Content-Type: application/json" \
     -d '{
       "jsonrpc": "2.0",
       "method": "tools/call",
       "params": {
         "name": "add_notebook",
         "arguments": {
           "url": "YOUR_NOTEBOOK_SHARE_URL_HERE",
           "name": "Proposal Generator KB",
           "description": "Knowledge base for proposal generation"
         }
       },
       "id": 1
     }'
   ```

5. **Test the Integration:**
   ```bash
   curl -X POST http://localhost:3002/mcp \
     -H "Content-Type: application/json" \
     -d '{
       "jsonrpc": "2.0",
       "method": "tools/call",
       "params": {
         "name": "list_notebooks"
       },
       "id": 2
     }'
   ```

6. **Enable in Backend:**
   Edit `backend/.env`:
   ```env
   USE_REAL_NOTEBOOKLM=true
   NOTEBOOKLM_MCP_URL=http://localhost:3002
   ```

### Option 2: Manual Testing Flow

1. **Start All Services:**
   ```bash
   # Terminal 1: NotebookLM MCP
   NOTEBOOKLM_TRANSPORT=http NOTEBOOKLM_PORT=3002 npx notebooklm-mcp@latest

   # Terminal 2: Backend
   cd backend && npm run dev

   # Terminal 3: Frontend
   cd frontend && npm start
   ```

2. **Test from Frontend:**
   - Open http://localhost:4200
   - Type: "Create a proposal for an e-commerce platform with React and AWS"
   - Click Send
   - The system should query NotebookLM and return a proposal using your uploaded data

## 📊 Expected Results

When everything is working correctly:

1. **Frontend sends request** to Backend (Port 3000)
2. **Backend queries NotebookLM MCP** (Port 3002)
3. **NotebookLM MCP asks Google's NotebookLM** via Chrome automation
4. **NotebookLM searches** your uploaded files (case studies, rate cards, accelerators)
5. **Returns relevant context** with citations
6. **Backend sends context + requirements** to Claude API
7. **Claude generates proposal** using the RAG context
8. **Frontend displays** the proposal with proper formatting

## 🎯 Validation Checklist

- [ ] All 3 files uploaded to NotebookLM
- [ ] Files processed successfully (no errors)
- [ ] Test queries work in NotebookLM UI
- [ ] Share link obtained
- [ ] NotebookLM MCP server running
- [ ] Notebook added to MCP library
- [ ] Backend configured with USE_REAL_NOTEBOOKLM=true
- [ ] Frontend can generate proposals using NotebookLM data

## 🐛 Troubleshooting

### Issue: Files not uploading
**Solution:** Check file size (should be under 10MB each). Try uploading one at a time.

### Issue: NotebookLM not finding relevant information
**Solution:** Try more specific queries. NotebookLM works best with natural language questions.

### Issue: MCP server can't connect to NotebookLM
**Solution:** 
```bash
# Re-authenticate
npx notebooklm-mcp@latest
# Then call re_auth tool
```

### Issue: Backend not getting NotebookLM data
**Solution:**
1. Check `backend/.env` has `USE_REAL_NOTEBOOKLM=true`
2. Verify NotebookLM MCP is running on port 3002
3. Test MCP endpoint: `curl http://localhost:3002/healthz`

### Issue: Empty or generic proposals
**Solution:** Make sure:
- Notebook is properly shared
- Notebook is added to MCP library
- Files are fully processed in NotebookLM

## 📝 Sample Queries to Try

Once integrated, test these queries from the frontend:

1. **E-commerce Project:**
   "Build an e-commerce platform for a retail client using React and AWS. Include case studies, team composition, and budget estimate."

2. **Mobile Banking:**
   "Create a proposal for a secure mobile banking app with real-time notifications. Reference similar projects and provide cost estimates."

3. **Healthcare System:**
   "Develop a healthcare management system with HIPAA compliance. What's our experience and what tech accelerators can we use?"

4. **IoT Dashboard:**
   "Build a real-time IoT monitoring dashboard for a smart factory. Include relevant experience and estimated timeline."

5. **AI Chatbot:**
   "Create a proposal for an AI-powered customer support platform using RAG. What accelerators and team members do we need?"

## 🎉 Success Indicators

You'll know it's working when:

1. **Specific References:** Proposals mention actual case study names (RetailCo, FinanceFirst, etc.)
2. **Accurate Rates:** Cost estimates use real rates ($120/hr for senior devs)
3. **Relevant Accelerators:** Recommends specific accelerators by name and ID
4. **Realistic Timelines:** Based on actual case study durations
5. **Citations:** NotebookLM provides source citations

## 🔄 Updating Data

To update the knowledge base:

1. Edit the `.txt` files in this folder
2. Re-upload to NotebookLM (replaces old versions)
3. Wait for processing
4. Test with a new query
5. No code changes needed!

## 💡 Tips for Best Results

1. **Be Specific:** "E-commerce project with React and AWS" works better than just "e-commerce"
2. **Ask for Details:** Include "with case studies" or "with pricing" to get context
3. **Use Examples:** Reference technologies or industries from the files
4. **Iterate:** If first response lacks detail, ask follow-up questions

## 📚 Additional Resources

- [NotebookLM Official Site](https://notebooklm.google.com)
- [NotebookLM MCP Server](https://github.com/PleasePrompto/notebooklm-mcp)
- [Our Integration Guide](../NOTEBOOKLM_SETUP.md)
- [MCP Protocol Docs](https://modelcontextprotocol.io)

## ✅ Quick Reference

**NotebookLM MCP Server:**
- URL: http://localhost:3002
- Health Check: http://localhost:3002/healthz
- API Endpoint: http://localhost:3002/mcp

**Key Files:**
- Setup Guide: `../NOTEBOOKLM_SETUP.md`
- Integration Code: `../backend/src/services/notebooklm-mcp.service.ts`
- Environment Config: `../backend/.env`

**Next Steps:**
1. Upload files to NotebookLM ✓
2. Get share URL ✓
3. Run MCP server
4. Add notebook to library
5. Enable in backend
6. Test end-to-end flow

---

Happy testing! Your RAG Proposal Generator is ready to use real NotebookLM data! 🚀
