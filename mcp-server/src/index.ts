import express from 'express';
import cors from 'cors';
import { dataService } from './services/data-service.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'RAG MCP Server' });
});

// MCP-style endpoints for RAG context retrieval

// Get case studies
app.post('/mcp/resources/case-studies', (req, res) => {
  const { query } = req.body;
  
  try {
    const results = query 
      ? dataService.searchCaseStudies(query)
      : dataService.getAllCaseStudies();
    
    res.json({
      success: true,
      data: results,
      count: results.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve case studies'
    });
  }
});

// Get rate cards
app.post('/mcp/resources/rate-cards', (req, res) => {
  const { query } = req.body;
  
  try {
    const results = query
      ? dataService.searchRateCards(query)
      : dataService.getAllRateCards();
    
    res.json({
      success: true,
      data: results,
      count: results.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve rate cards'
    });
  }
});

// Get tech accelerators
app.post('/mcp/resources/tech-accelerators', (req, res) => {
  const { query } = req.body;
  
  try {
    const results = query
      ? dataService.searchTechAccelerators(query)
      : dataService.getAllTechAccelerators();
    
    res.json({
      success: true,
      data: results,
      count: results.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve tech accelerators'
    });
  }
});

// Comprehensive context retrieval for proposal generation
app.post('/mcp/tools/get-proposal-context', (req, res) => {
  const { requirements } = req.body;
  
  if (!requirements) {
    return res.status(400).json({
      success: false,
      error: 'Requirements parameter is required'
    });
  }
  
  try {
    const context = dataService.getProposalContext(requirements);
    
    res.json({
      success: true,
      data: context,
      metadata: {
        case_studies_found: context.caseStudies.length,
        rate_cards_found: context.rateCards.length,
        tech_accelerators_found: context.techAccelerators.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve proposal context'
    });
  }
});

// List available resources (MCP protocol)
app.get('/mcp/resources', (req, res) => {
  res.json({
    resources: [
      {
        uri: 'case-studies',
        name: 'Case Studies',
        description: 'Previous project case studies and success stories',
        mimeType: 'application/json'
      },
      {
        uri: 'rate-cards',
        name: 'Rate Cards',
        description: 'Team member roles and rate information',
        mimeType: 'application/json'
      },
      {
        uri: 'tech-accelerators',
        name: 'Tech Accelerators',
        description: 'Reusable technology accelerators and frameworks',
        mimeType: 'application/json'
      }
    ]
  });
});

// List available tools (MCP protocol)
app.get('/mcp/tools', (req, res) => {
  res.json({
    tools: [
      {
        name: 'get-proposal-context',
        description: 'Retrieve comprehensive context for proposal generation including relevant case studies, rate cards, and tech accelerators',
        inputSchema: {
          type: 'object',
          properties: {
            requirements: {
              type: 'string',
              description: 'Client requirements or proposal description'
            }
          },
          required: ['requirements']
        }
      }
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MCP Server running on port ${PORT}`);
  console.log(`📚 Resources loaded:`);
  console.log(`   - ${dataService.getAllCaseStudies().length} case studies`);
  console.log(`   - ${dataService.getAllRateCards().length} rate cards`);
  console.log(`   - ${dataService.getAllTechAccelerators().length} tech accelerators`);
  console.log(`\n✅ Ready to serve RAG context!`);
});

export default app;
