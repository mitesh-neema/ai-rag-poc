import axios from 'axios';
import { notebookLMMCPService } from './notebooklm-mcp.service.js';

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://localhost:3001';
const USE_REAL_NOTEBOOKLM = process.env.USE_REAL_NOTEBOOKLM === 'true';

interface ProposalContext {
  caseStudies: any[];
  rateCards: any[];
  techAccelerators: any[];
}

export class MCPClientService {
  // Fetch comprehensive context from MCP server
  async getProposalContext(requirements: string): Promise<ProposalContext> {
    // Try NotebookLM first if enabled
    if (USE_REAL_NOTEBOOKLM) {
      console.log('🔍 Using NotebookLM MCP for RAG context...');
      try {
        const isHealthy = await notebookLMMCPService.checkHealth();
        console.log(`NotebookLM MCP health check: ${isHealthy ? 'healthy' : 'unhealthy'}`);
        if (isHealthy) {
          const notebookContext = await notebookLMMCPService.getProposalContext(requirements);
          
          // If NotebookLM returns data, use it
          if (notebookContext.caseStudies.length > 0 || 
              notebookContext.rateCards.length > 0 || 
              notebookContext.techAccelerators.length > 0) {
            console.log('✅ Retrieved context from NotebookLM:', {
              caseStudies: notebookContext.caseStudies.length,
              rateCards: notebookContext.rateCards.length,
              techAccelerators: notebookContext.techAccelerators.length,
            });
            
            // Parse the text responses into structured format
            return {
              caseStudies: this.parseTextToArray(notebookContext.caseStudies),
              rateCards: this.parseTextToArray(notebookContext.rateCards),
              techAccelerators: this.parseTextToArray(notebookContext.techAccelerators),
            };
          }
        }
        console.log('⚠️ NotebookLM returned empty context, falling back to mock MCP');
      } catch (error: any) {
        console.error('⚠️ NotebookLM MCP failed, falling back to mock MCP:', error.message);
      }
    }

    // Fallback to mock MCP server
    console.log('📚 Using Mock MCP for RAG context...');
    try {
      const response = await axios.post(
        `${MCP_SERVER_URL}/mcp/tools/get-proposal-context`,
        { requirements }
      );

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error('Failed to retrieve context from MCP server');
    } catch (error) {
      console.error('MCP Client Error:', error);
      throw new Error('Unable to connect to MCP server');
    }
  }

  // Parse text responses from NotebookLM into structured format
  private parseTextToArray(textArray: string[]): any[] {
    if (!textArray || textArray.length === 0) {
      return [];
    }

    // Return text as-is wrapped in objects for Claude to process
    return textArray.map((text, index) => ({
      id: `notebooklm-${index}`,
      title: `Retrieved from NotebookLM`,
      content: text,
      source: 'NotebookLM',
    }));
  }

  // Fetch specific resources
  async getCaseStudies(query?: string): Promise<any[]> {
    try {
      const response = await axios.post(
        `${MCP_SERVER_URL}/mcp/resources/case-studies`,
        { query }
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching case studies:', error);
      return [];
    }
  }

  async getRateCards(query?: string): Promise<any[]> {
    try {
      const response = await axios.post(
        `${MCP_SERVER_URL}/mcp/resources/rate-cards`,
        { query }
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching rate cards:', error);
      return [];
    }
  }

  async getTechAccelerators(query?: string): Promise<any[]> {
    try {
      const response = await axios.post(
        `${MCP_SERVER_URL}/mcp/resources/tech-accelerators`,
        { query }
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching tech accelerators:', error);
      return [];
    }
  }

  // Health check
  async checkHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${MCP_SERVER_URL}/health`);
      return response.data.status === 'ok';
    } catch (error) {
      return false;
    }
  }
}

export const mcpClient = new MCPClientService();
