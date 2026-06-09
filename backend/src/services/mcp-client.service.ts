import axios from 'axios';

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://localhost:3001';

interface ProposalContext {
  caseStudies: any[];
  rateCards: any[];
  techAccelerators: any[];
}

export class MCPClientService {
  // Fetch comprehensive context from MCP server
  async getProposalContext(requirements: string): Promise<ProposalContext> {
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
