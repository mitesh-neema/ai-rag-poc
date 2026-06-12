// Load environment variables FIRST before any other imports

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import proposalRoutes from './routes/proposal.routes.js';
import modernizationRoutes from './routes/modernization.routes.js';
import { mcpClient } from './services/mcp-client.service.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:4200',
  credentials: true,
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'RAG Proposal Backend',
    timestamp: new Date().toISOString(),
  });
});

// Check MCP server connectivity
app.get('/health/mcp', async (req, res) => {
  const isHealthy = await mcpClient.checkHealth();
  res.json({
    status: isHealthy ? 'ok' : 'error',
    mcp_server: isHealthy ? 'connected' : 'disconnected',
  });
});

// Routes
app.use('/api/proposal', proposalRoutes);
app.use('/api/modernization', modernizationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// Start server
async function startServer() {
  // Verify environment
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY is not set in environment variables');
    console.error('Please copy .env.example to .env and add your API key');
    process.exit(1);
  }

  // Check MCP server connectivity
  console.log('🔍 Checking MCP server connectivity...');
  const mcpHealthy = await mcpClient.checkHealth();
  
  if (!mcpHealthy) {
    console.warn('⚠️  Warning: MCP server is not responding');
    console.warn('   Make sure the MCP server is running on port 3001');
  } else {
    console.log('✅ MCP server is connected');
  }

  app.listen(PORT, () => {
    console.log(`\n🚀 Backend API server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`📍 API endpoint: http://localhost:${PORT}/api/proposal`);
    console.log(`\n✅ Ready to generate proposals!\n`);
  });
}

startServer();

export default app;
