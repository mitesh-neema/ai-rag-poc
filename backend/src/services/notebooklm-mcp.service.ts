import axios from 'axios';

interface NotebookLMMCPConfig {
  url: string;
  timeout: number;
}

interface MCPRequest {
  jsonrpc: string;
  method: string;
  params: any;
  id: number | string;
}

interface MCPResponse {
  jsonrpc: string;
  result?: any;
  data?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  id: number | string;
}

export class NotebookLMMCPService {
  private config: NotebookLMMCPConfig;
  private sessionId: string | null = null;

  constructor() {
    this.config = {
      url: process.env.NOTEBOOKLM_MCP_URL || 'http://localhost:3002',
      timeout: parseInt(process.env.NOTEBOOKLM_TIMEOUT || '60000', 10),
    };
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.config.url}/healthz`, {
        timeout: 5000,
      });
      return response.status === 200;
    } catch (error) {
      console.error('NotebookLM MCP health check failed:', error);
      return false;
    }
  }

  private async ensureSession(): Promise<void> {
    if (this.sessionId) {
      return; // Already have a session
    }

    console.log('🔗 Initializing NotebookLM MCP session...');
    
    try {
      const response = await axios.post<MCPResponse>(
        `${this.config.url}/mcp`,
        {
          jsonrpc: '2.0',
          method: 'initialize',
          params: {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: {
              name: 'rag-proposal-backend',
              version: '1.0.0',
            },
          },
          id: Date.now(),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/event-stream',
          },
          timeout: 10000,
        }
      );

      // Extract session ID from response headers
      const sessionId = response.headers['mcp-session-id'];
      if (sessionId) {
        this.sessionId = sessionId;
        console.log('✅ NotebookLM MCP session initialized');
      } else {
        throw new Error('No session ID returned from initialize');
      }
    } catch (error: any) {
      console.error('Failed to initialize NotebookLM MCP session:', error.message);
      throw error;
    }
  }

  private async callTool(toolName: string, params: any = {}): Promise<any> {
    // Ensure we have a session before making tool calls
    await this.ensureSession();
    const request: MCPRequest = {
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: params,
      },
      id: Date.now(),
    };

    const headers: any = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
    };

    if (this.sessionId) {
      headers['Mcp-Session-Id'] = this.sessionId;
    }

    console.log(`Calling NotebookLM MCP tool: ${toolName} with params:`, params);

    try {
      const response = await axios.post(
        `${this.config.url}/mcp`,
        request,
        {
          headers,
          timeout: this.config.timeout,
          responseType: 'text', // Get raw text to parse SSE format
        }
      );
      
      // Store session ID if returned
      const newSessionId = response.headers['mcp-session-id'];
      if (newSessionId) {
        this.sessionId = newSessionId;
      }

      // Parse SSE response format
      // Response comes as: "event: message\ndata: {json}\n\n"
      const responseText = response.data;
      
      // Extract JSON from SSE format
      const dataMatch = responseText.match(/data: ({.*})/);
      if (!dataMatch) {
        console.error('Failed to parse SSE response:', responseText);
        throw new Error('Invalid SSE response format');
      }

      const parsedResponse = JSON.parse(dataMatch[1]);
      
      if (parsedResponse.error) {
        throw new Error(
          `MCP Error: ${parsedResponse.error.message} (${parsedResponse.error.code})`
        );
      }

      console.log(`✅ Received response from NotebookLM MCP tool (${toolName})`);
      
      return parsedResponse.result;
    } catch (error: any) {
      console.error(`❌ NotebookLM MCP tool call failed (${toolName}):`, error.message);
      throw error;
    }
  }

  async listNotebooks(): Promise<any[]> {
    const result = await this.callTool('list_notebooks');
    return result?.notebooks || [];
  }

  async selectNotebook(notebookId: string): Promise<void> {
    await this.callTool('select_notebook', { id: notebookId });
  }

  async askQuestion(
    question: string,
    notebookId?: string,
    sourceFormat: 'none' | 'inline' | 'footnotes' | 'json' = 'json'
  ): Promise<{ answer: string; sources?: any[]; _provenance?: any }> {
    const params: any = {
      question,
      source_format: sourceFormat,
    };

    if (notebookId) {
      params.notebook_id = notebookId;
    }

    const result = await this.callTool('ask_question', params);
    
    // NotebookLM MCP returns data as: result.content[0].text (which is a JSON string)
    // We need to parse this JSON to get the actual data
    try {
      if (result?.content?.[0]?.text) {
        const textContent = result.content[0].text;
        
        // Parse the JSON string
        const parsedData = JSON.parse(textContent);
        
        console.log('✅ Parsed NotebookLM response:', {
          success: parsedData.success,
          hasAnswer: !!parsedData.data?.answer,
          sourcesCount: parsedData.data?.sources?.length || 0,
        });
        
        return {
          answer: parsedData.data?.answer || '',
          sources: parsedData.data?.sources || [],
          _provenance: parsedData.data?._provenance,
        };
      }
      
      // Fallback to direct access (in case format changes)
      return {
        answer: result?.answer || '',
        sources: result?.sources || [],
        _provenance: result?._provenance,
      };
    } catch (error: any) {
      console.error('Failed to parse NotebookLM response:', error.message);
      console.error('Raw result:', result);
      
      // Return empty response on parse error
      return {
        answer: '',
        sources: [],
        _provenance: undefined,
      };
    }
  }

  async searchNotebooks(query: string): Promise<any[]> {
    const result = await this.callTool('search_notebooks', { query });
    return result?.notebooks || [];
  }

  async getNotebook(notebookId: string): Promise<any> {
    const result = await this.callTool('get_notebook', { id: notebookId });
    return result?.notebook;
  }

  async addSource(url: string, type: 'url' | 'text' = 'url', notebookId?: string): Promise<any> {
    const params: any = { url, type };
    if (notebookId) {
      params.notebook_id = notebookId;
    }
    return await this.callTool('add_source', params);
  }

  /**
   * Query NotebookLM for RAG context relevant to proposal requirements
   * Uses the default selected notebook (no need to search since user has one notebook)
   */
  async getProposalContext(requirements: string): Promise<{
    caseStudies: string[];
    rateCards: string[];
    techAccelerators: string[];
    rawAnswer?: string;
  }> {
    try {
      console.log('🔍 Querying NotebookLM for proposal context...');
      
      // Ask for case studies - uses default selected notebook
      const caseStudiesQuery = `Based on the requirements "${requirements}", list all relevant case studies, past projects, or examples that match. Include industry, technologies used, and outcomes.`;
      console.log('📚 Asking for case studies...');
      const caseStudiesResult = await this.askQuestion(caseStudiesQuery);

      // Ask for rate cards
      const rateCardsQuery = `What are the standard rates, pricing information, or cost structures that apply to projects like "${requirements}"? Include roles and their rates.`;
      console.log('💰 Asking for rate cards...');
      const rateCardsResult = await this.askQuestion(rateCardsQuery);

      // Ask for tech accelerators with Thoughtworks sensible defaults and tech radar
      const techAcceleratorsQuery = `What technology accelerators, frameworks, reusable components, Thoughtworks sensible defaults, and Tech Radar recommendations are available for "${requirements}"? Include:
- Pre-built accelerators and their time savings
- Thoughtworks recommended technology choices
- Tech Radar adopt/trial technologies
- Industry-standard frameworks and libraries
- Sensible default configurations and best practices`;
      console.log('⚡ Asking for tech accelerators and sensible defaults...');
      const techAcceleratorsResult = await this.askQuestion(techAcceleratorsQuery);

      console.log('✅ NotebookLM context retrieved successfully');

      return {
        caseStudies: caseStudiesResult.answer ? [caseStudiesResult.answer] : [],
        rateCards: rateCardsResult.answer ? [rateCardsResult.answer] : [],
        techAccelerators: techAcceleratorsResult.answer ? [techAcceleratorsResult.answer] : [],
        rawAnswer: [
          caseStudiesResult.answer,
          rateCardsResult.answer,
          techAcceleratorsResult.answer,
        ].filter(Boolean).join('\n\n'),
      };
    } catch (error: any) {
      console.error('❌ NotebookLM context retrieval failed:', error.message);
      return {
        caseStudies: [],
        rateCards: [],
        techAccelerators: [],
      };
    }
  }

  async closeSession(): Promise<void> {
    if (this.sessionId) {
      try {
        await axios.delete(`${this.config.url}/mcp`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/event-stream',
            'Mcp-Session-Id': this.sessionId,
          },
        });
        this.sessionId = null;
        console.log('✅ NotebookLM MCP session closed');
      } catch (error) {
        console.error('Failed to close NotebookLM session:', error);
      }
    }
  }

  async resetSession(): Promise<void> {
    await this.closeSession();
    this.sessionId = null;
  }
}

export const notebookLMMCPService = new NotebookLMMCPService();
