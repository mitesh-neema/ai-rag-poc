import { Router, Request, Response } from 'express';
import { claudeService } from '../services/claude.service.js';
import { mcpClient } from '../services/mcp-client.service.js';
import { pptxService } from '../services/pptx.service.js';

const router = Router();

// Generate proposal (non-streaming)
router.post('/generate', async (req: Request, res: Response) => {
  const { requirements } = req.body;

  if (!requirements) {
    return res.status(400).json({
      success: false,
      error: 'Requirements field is required',
    });
  }

  try {
    // Step 1: Fetch RAG context from MCP server
    console.log('📚 Fetching context from MCP server...');
    const context = await mcpClient.getProposalContext(requirements);

    console.log('✅ Context retrieved:', {
      caseStudies: context.caseStudies.length,
      rateCards: context.rateCards.length,
      techAccelerators: context.techAccelerators.length,
    });

    // Step 2: Generate proposal with Claude
    console.log('🤖 Generating proposal with Claude...');
    const proposal = await claudeService.generateProposal(requirements, context);

    console.log('✅ Proposal generated successfully');

    res.json({
      success: true,
      data: {
        proposal,
        context: {
          case_studies_count: context.caseStudies.length,
          rate_cards_count: context.rateCards.length,
          tech_accelerators_count: context.techAccelerators.length,
        },
      },
    });
  } catch (error: any) {
    console.error('❌ Error generating proposal:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate proposal',
    });
  }
});

// Generate proposal (streaming)
router.post('/generate-stream', async (req: Request, res: Response) => {
  const { requirements } = req.body;

  if (!requirements) {
    return res.status(400).json({
      success: false,
      error: 'Requirements field is required',
    });
  }

  try {
    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Step 1: Fetch RAG context from MCP server
    console.log('📚 Fetching context from MCP server...');
    const context = await mcpClient.getProposalContext(requirements);

    // Send context metadata
    res.write(
      `data: ${JSON.stringify({
        type: 'context',
        data: {
          case_studies_count: context.caseStudies.length,
          rate_cards_count: context.rateCards.length,
          tech_accelerators_count: context.techAccelerators.length,
        },
      })}\n\n`
    );

    // Step 2: Stream proposal generation from Claude
    console.log('🤖 Streaming proposal from Claude...');
    for await (const chunk of claudeService.streamProposal(
      requirements,
      context
    )) {
      res.write(
        `data: ${JSON.stringify({
          type: 'content',
          data: chunk,
        })}\n\n`
      );
    }

    // Send completion event
    res.write(
      `data: ${JSON.stringify({
        type: 'done',
      })}\n\n`
    );

    res.end();
  } catch (error: any) {
    console.error('❌ Error streaming proposal:', error.message);
    res.write(
      `data: ${JSON.stringify({
        type: 'error',
        error: error.message || 'Failed to generate proposal',
      })}\n\n`
    );
    res.end();
  }
});

// Get context preview (for debugging)
router.post('/context', async (req: Request, res: Response) => {
  const { requirements } = req.body;

  if (!requirements) {
    return res.status(400).json({
      success: false,
      error: 'Requirements field is required',
    });
  }

  try {
    const context = await mcpClient.getProposalContext(requirements);
    res.json({
      success: true,
      data: context,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve context',
    });
  }
});

// Download proposal as PPTX
router.post('/download', async (req: Request, res: Response) => {
  const { proposal } = req.body;

  if (!proposal) {
    return res.status(400).json({
      success: false,
      error: 'Proposal content is required',
    });
  }

  try {
    console.log('📊 Generating PPTX file...');
    
    // Step 1: Optimize content for slides using Claude
    const optimizedContent = await pptxService.optimizeForSlides(proposal);
    
    // Step 2: Generate PPTX from optimized content
    const buffer = await pptxService.generatePPTX(optimizedContent);
    const filename = pptxService.generateFilename('proposal');

    console.log('✅ PPTX generated:', filename);

    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length.toString());

    // Send file
    res.send(buffer);
  } catch (error: any) {
    console.error('❌ Error generating PPTX:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate PPTX',
    });
  }
});

export default router;
