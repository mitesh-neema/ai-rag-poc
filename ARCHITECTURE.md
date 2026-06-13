# Legacy Modernization Agent - System Architecture

## High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                  USER                                        │
│                            (Business Analyst/                                │
│                             Solutions Architect)                             │
└────────────────────────────┬────────────────────────────────────────────────┘
                             │
                             │ 1. Select Mode
                             │ (Roadmap/Tech/Estimation/Q&A)
                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    Angular Frontend (Port 4200)                      │   │
│  │                                                                       │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │   │
│  │  │ Welcome  │  │ Roadmap  │  │   Tech   │  │    Q&A   │            │   │
│  │  │  Screen  │  │   View   │  │ Solution │  │   Chat   │            │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │   │
│  │                                                                       │   │
│  │  Components: app.component.ts, modernization-api.service.ts         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────┬───────────────────────────────────────────────┘
                              │
                              │ 2. HTTP REST API Call
                              │ POST /api/modernization/{action}
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          APPLICATION LAYER                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │              Node.js/Express Backend (Port 3000)                     │   │
│  │                                                                       │   │
│  │  API Routes (modernization.routes.ts)                               │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │   │
│  │  │ /roadmap │  │ /tech-   │  │/estimation│  │   /ask   │            │   │
│  │  │          │  │ solution │  │           │  │          │            │   │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘            │   │
│  │       │             │              │             │                   │   │
│  │       └─────────────┴──────────────┴─────────────┘                   │   │
│  │                            │                                          │   │
│  │                            ▼                                          │   │
│  │              ┌──────────────────────────────┐                        │   │
│  │              │ Modernization Service        │                        │   │
│  │              │ (modernization.service.ts)   │                        │   │
│  │              │                               │                        │   │
│  │              │ • Orchestrates AI workflow   │                        │   │
│  │              │ • Manages RAG queries        │                        │   │
│  │              │ • Formats responses          │                        │   │
│  │              └────────┬─────────────────────┘                        │   │
│  └───────────────────────┼──────────────────────────────────────────────┘   │
└────────────────────────────┼───────────────────────────────────────────────┘
                             │
                 ┌───────────┴────────────┐
                 │                        │
       3. Query NotebookLM       4. Generate with Claude
                 │                        │
                 ▼                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          INTELLIGENCE LAYER                                  │
│                                                                               │
│  ┌─────────────────────────────────┐   ┌──────────────────────────────────┐ │
│  │    RAG AGENT (NotebookLM)       │   │   GENERATION AGENT (Claude AI)   │ │
│  │         (Port 3002)              │   │                                  │ │
│  │                                  │   │                                  │ │
│  │  ┌───────────────────────────┐  │   │  ┌────────────────────────────┐ │ │
│  │  │  NotebookLM MCP Service   │  │   │  │   Claude Service           │ │ │
│  │  │ (notebooklm-mcp.service)  │  │   │  │  (claude.service.ts)       │ │ │
│  │  │                            │  │   │  │                            │ │ │
│  │  │ • Session Management      │  │   │  │ • API Integration          │ │ │
│  │  │ • Tool Invocation (MCP)   │  │   │  │ • Prompt Engineering       │ │ │
│  │  │ • SSE Response Parsing    │  │   │  │ • Streaming Support        │ │ │
│  │  └───────────┬───────────────┘  │   │  └────────────┬───────────────┘ │ │
│  │              │                   │   │               │                 │ │
│  │              │ 5. MCP Protocol   │   │               │ 6. Claude API   │ │
│  │              │ (JSON-RPC 2.0)    │   │               │ (Anthropic SDK) │ │
│  │              ▼                   │   │               ▼                 │ │
│  │  ┌───────────────────────────┐  │   │  ┌────────────────────────────┐ │ │
│  │  │   NotebookLM Platform     │  │   │  │    Claude API              │ │ │
│  │  │                            │  │   │  │  (Anthropic Cloud)         │ │ │
│  │  │ • Document Storage        │  │   │  │                            │ │ │
│  │  │ • Vector Search           │  │   │  │ Model: claude-sonnet-4-5   │ │ │
│  │  │ • Context Retrieval       │  │   │  │ Max Tokens: 4000           │ │ │
│  │  │ • Source Citations        │  │   │  │ Temperature: 0.3           │ │ │
│  │  └───────────────────────────┘  │   │  └────────────────────────────┘ │ │
│  └─────────────────────────────────┘   └──────────────────────────────────┘ │
└────────────────────────────┬────────────────────────────────────────────────┘
                             │
                             │ 7. Combine RAG Context + AI Response
                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PROCESSING LAYER                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │              Response Processing Pipeline                            │   │
│  │                                                                       │   │
│  │  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │   │
│  │  │   Markdown   │    │  Executive   │    │     PPTX     │          │   │
│  │  │  Formatting  │───▶│ Optimization │───▶│  Generation  │          │   │
│  │  └──────────────┘    └──────────────┘    └──────────────┘          │   │
│  │                                                                       │   │
│  │  pptx.service.ts:                                                    │   │
│  │  • optimizeForSlides() - Claude optimizes for presentation          │   │
│  │  • generatePPTX() - Converts markdown to PowerPoint                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────┬───────────────────────────────────────────────┘
                              │
                              │ 8. Return Response
                              │ (Markdown + Context Info)
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          OUTPUT LAYER                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        User Interface                                │   │
│  │                                                                       │   │
│  │  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │   │
│  │  │   Markdown   │    │  Download    │    │  Download    │          │   │
│  │  │   Display    │    │   as .md     │    │  as .pptx    │          │   │
│  │  └──────────────┘    └──────────────┘    └──────────────┘          │   │
│  │                                                                       │   │
│  │  • Rendered HTML with syntax highlighting                           │   │
│  │  • Context metadata (sources, retrieval info)                       │   │
│  │  • Action buttons for regenerate/download                           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Multi-Agent Workflow Details

### Agent 1: RAG Retrieval Agent (NotebookLM)

**Purpose:** Context retrieval from legacy system documentation

```
┌─────────────────────────────────────────────┐
│         NotebookLM RAG Agent                │
│                                              │
│  Input: Natural language query              │
│  ┌────────────────────────────────────────┐ │
│  │ "What features does Polaris support?" │ │
│  └─────────────┬──────────────────────────┘ │
│                │                             │
│                ▼                             │
│  ┌────────────────────────────────────────┐ │
│  │  1. Parse Query                        │ │
│  │  2. Vector Search in Documents         │ │
│  │  3. Rank by Relevance                  │ │
│  │  4. Extract Context Chunks             │ │
│  │  5. Add Source Citations               │ │
│  └─────────────┬──────────────────────────┘ │
│                │                             │
│                ▼                             │
│  Output: Contextual answer + sources        │
│  ┌────────────────────────────────────────┐ │
│  │ {                                      │ │
│  │   answer: "Polaris supports...",      │ │
│  │   sources: [doc1, doc2],              │ │
│  │   _provenance: {...}                  │ │
│  │ }                                      │ │
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Agent 2: Analysis & Generation Agent (Claude)

**Purpose:** Intelligent analysis and content generation

```
┌─────────────────────────────────────────────┐
│         Claude Generation Agent             │
│                                              │
│  Input: Context + Prompt                    │
│  ┌────────────────────────────────────────┐ │
│  │ System Context:                        │ │
│  │ - Polaris info: [from NotebookLM]     │ │
│  │ - Meridian info: [from NotebookLM]    │ │
│  │ - Tech Radar: [from NotebookLM]       │ │
│  │                                        │ │
│  │ Task: Generate modernization roadmap  │ │
│  └─────────────┬──────────────────────────┘ │
│                │                             │
│                ▼                             │
│  ┌────────────────────────────────────────┐ │
│  │  1. Analyze Legacy Systems             │ │
│  │  2. Apply Tech Radar Guidance          │ │
│  │  3. Generate Recommendations           │ │
│  │  4. Structure as Markdown              │ │
│  │  5. Include Metrics & Estimates        │ │
│  └─────────────┬──────────────────────────┘ │
│                │                             │
│                ▼                             │
│  Output: Comprehensive analysis             │
│  ┌────────────────────────────────────────┐ │
│  │ # Modernization Roadmap                │ │
│  │ ## Current State...                    │ │
│  │ ## Unified Vision...                   │ │
│  │ ## Technical Solution...               │ │
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Agent 3: Presentation Optimization Agent (Claude)

**Purpose:** Transform content for executive presentations

```
┌─────────────────────────────────────────────┐
│      Presentation Optimization Agent        │
│                                              │
│  Input: Raw markdown content                │
│  ┌────────────────────────────────────────┐ │
│  │ Long paragraphs, technical details     │ │
│  └─────────────┬──────────────────────────┘ │
│                │                             │
│                ▼                             │
│  ┌────────────────────────────────────────┐ │
│  │  1. Break into slide-sized chunks      │ │
│  │  2. Convert to bullet points           │ │
│  │  3. Add visual cue markers             │ │
│  │  4. Optimize for scannability          │ │
│  │  5. Ensure 3-5 points per slide        │ │
│  └─────────────┬──────────────────────────┘ │
│                │                             │
│                ▼                             │
│  Output: Presentation-ready markdown        │
│  ┌────────────────────────────────────────┐ │
│  │ ---                                    │ │
│  │ # Executive Summary                    │ │
│  │ - Point 1                              │ │
│  │ - Point 2                              │ │
│  │ - Point 3                              │ │
│  │ ---                                    │ │
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

## Data Flow Sequence

### Scenario: User Requests Tech Solution

```
┌──────┐      ┌─────────┐      ┌──────────┐      ┌───────────┐      ┌────────┐
│User  │      │Frontend │      │ Backend  │      │NotebookLM │      │Claude  │
└───┬──┘      └────┬────┘      └────┬─────┘      └─────┬─────┘      └───┬────┘
    │              │                │                    │                │
    │ Click "Tech  │                │                    │                │
    │  Solution"   │                │                    │                │
    │─────────────▶│                │                    │                │
    │              │                │                    │                │
    │              │ POST /api/     │                    │                │
    │              │ modernization/ │                    │                │
    │              │ tech-solution  │                    │                │
    │              │───────────────▶│                    │                │
    │              │                │                    │                │
    │              │                │ Query: Polaris    │                │
    │              │                │ system info        │                │
    │              │                │───────────────────▶│                │
    │              │                │                    │                │
    │              │                │ Return: Features,  │                │
    │              │                │ tech stack, APIs   │                │
    │              │                │◀───────────────────│                │
    │              │                │                    │                │
    │              │                │ Query: Meridian   │                │
    │              │                │ system info        │                │
    │              │                │───────────────────▶│                │
    │              │                │                    │                │
    │              │                │ Return: Features,  │                │
    │              │                │ integrations       │                │
    │              │                │◀───────────────────│                │
    │              │                │                    │                │
    │              │                │ Query: Tech Radar │                │
    │              │                │ & accelerators     │                │
    │              │                │───────────────────▶│                │
    │              │                │                    │                │
    │              │                │ Return: Recommended│                │
    │              │                │ stack, defaults    │                │
    │              │                │◀───────────────────│                │
    │              │                │                                     │
    │              │                │ Generate solution with context      │
    │              │                │────────────────────────────────────▶│
    │              │                │                                     │
    │              │                │ Return: Comprehensive tech solution│
    │              │                │◀────────────────────────────────────│
    │              │                │                                     │
    │              │ Response:      │                                     │
    │              │ { solution,    │                                     │
    │              │   context }    │                                     │
    │              │◀───────────────│                                     │
    │              │                │                                     │
    │ Display      │                │                                     │
    │ markdown +   │                │                                     │
    │ context info │                │                                     │
    │◀─────────────│                │                                     │
    │              │                │                                     │
    │ Click        │                │                                     │
    │ "Download    │                │                                     │
    │  PPTX"       │                │                                     │
    │─────────────▶│                │                                     │
    │              │                │                                     │
    │              │ POST /api/     │                                     │
    │              │ modernization/ │                                     │
    │              │ download       │                                     │
    │              │───────────────▶│                                     │
    │              │                │                                     │
    │              │                │ Optimize for slides                │
    │              │                │────────────────────────────────────▶│
    │              │                │                                     │
    │              │                │ Return: Slide-optimized markdown   │
    │              │                │◀────────────────────────────────────│
    │              │                │                                     │
    │              │                │ Generate PPTX                       │
    │              │                │ (local processing)                  │
    │              │                │                                     │
    │              │ Response:      │                                     │
    │              │ Binary PPTX    │                                     │
    │              │ file           │                                     │
    │              │◀───────────────│                                     │
    │              │                │                                     │
    │ Download     │                │                                     │
    │ file         │                │                                     │
    │◀─────────────│                │                                     │
    │              │                │                                     │
```

---

## Technology Stack

### Frontend Layer
- **Framework:** Angular 17+
- **Language:** TypeScript 5.0+
- **State Management:** Signals (Angular built-in)
- **HTTP Client:** Angular HttpClient
- **Styling:** Tailwind CSS / Custom CSS

### Backend Layer
- **Runtime:** Node.js 20 LTS
- **Framework:** Express.js
- **Language:** TypeScript
- **API Style:** RESTful

### Intelligence Layer
- **RAG Engine:** NotebookLM (Google)
- **LLM:** Claude 3.5 Sonnet (Anthropic)
- **Protocol:** MCP (Model Context Protocol)
- **Communication:** JSON-RPC 2.0, SSE

### Processing Layer
- **Markdown Parser:** marked.js
- **PPTX Generator:** pptxgenjs
- **Document Processing:** Node.js streams

---

## Key Features of Multi-Agent Architecture

### 1. **Separation of Concerns**
- Each agent has a specific responsibility
- RAG agent: Context retrieval
- Generation agent: Content creation
- Optimization agent: Presentation formatting

### 2. **Scalability**
- Agents can be scaled independently
- Caching strategies per agent
- Load balancing for high concurrency

### 3. **Reliability**
- Fallback mechanisms for each agent
- Graceful degradation if one agent fails
- Circuit breaker patterns

### 4. **Observability**
- Logging at each agent interaction
- Performance metrics per agent
- End-to-end tracing

### 5. **Extensibility**
- Easy to add new agents (e.g., Code Analysis Agent)
- Pluggable architecture
- Agent orchestration layer

---

## Deployment Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    Production Environment                   │
│                                                              │
│  ┌──────────────┐      ┌──────────────┐                    │
│  │   Frontend   │      │   Backend    │                    │
│  │  (Angular)   │      │  (Node.js)   │                    │
│  │              │      │              │                    │
│  │  Container   │      │  Container   │                    │
│  │  Port: 80    │      │  Port: 3000  │                    │
│  └──────┬───────┘      └──────┬───────┘                    │
│         │                     │                             │
│         └──────────┬──────────┘                             │
│                    │                                        │
│              ┌─────▼─────┐                                  │
│              │   Nginx   │                                  │
│              │  Reverse  │                                  │
│              │   Proxy   │                                  │
│              └─────┬─────┘                                  │
└────────────────────┼────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌──────────────────┐    ┌──────────────────┐
│  NotebookLM API  │    │   Claude API     │
│  (Google Cloud)  │    │  (Anthropic)     │
└──────────────────┘    └──────────────────┘
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────┐
│              Security Layers                     │
│                                                   │
│  1. Frontend Security                            │
│     • Content Security Policy (CSP)              │
│     • XSS Protection                             │
│     • CORS Configuration                         │
│                                                   │
│  2. API Security                                 │
│     • JWT Authentication (future)                │
│     • Rate Limiting                              │
│     • Input Validation                           │
│                                                   │
│  3. Integration Security                         │
│     • API Key Management (env variables)         │
│     • HTTPS/TLS for all external calls           │
│     • Secrets rotation                           │
│                                                   │
│  4. Data Security                                │
│     • No persistent storage of queries           │
│     • Encryption in transit                      │
│     • Privacy-preserving RAG                     │
└─────────────────────────────────────────────────┘
```

---

## Performance Optimization

### Caching Strategy
- NotebookLM responses: 5-minute TTL
- Claude responses: No caching (dynamic)
- Static assets: CDN with 1-year TTL

### Parallel Processing
```
┌──────────────────────────────────────┐
│  Parallel RAG Queries                 │
│                                        │
│  ┌────────────┐  ┌────────────┐      │
│  │  Polaris   │  │  Meridian  │      │
│  │   Query    │  │   Query    │      │
│  └─────┬──────┘  └─────┬──────┘      │
│        │                │             │
│        └────────┬───────┘             │
│                 │                     │
│        Sequential Execution           │
│                 ▼                     │
│        ┌────────────────┐             │
│        │  Tech Radar    │             │
│        │     Query      │             │
│        └────────────────┘             │
└──────────────────────────────────────┘
```

---

This architecture provides a **scalable, maintainable, and extensible** foundation for the Legacy Modernization Agent!
