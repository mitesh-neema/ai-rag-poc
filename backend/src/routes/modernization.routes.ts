import { Router, Request, Response } from 'express';
import { modernizationService } from '../services/modernization.service.js';
import { pptxService } from '../services/pptx.service.js';

const router = Router();

// Generate modernization roadmap
router.post('/roadmap', async (req: Request, res: Response) => {
  try {
    console.log('🗺️ Generating modernization roadmap...');
    
    // Step 1: Get legacy system context from NotebookLM
    const context = await modernizationService.getLegacySystemContext();
    
    // Step 2: Generate roadmap using Claude
    const roadmap = await modernizationService.generateRoadmap(context);
    
    console.log('✅ Modernization roadmap generated');
    
    res.json({
      success: true,
      data: {
        roadmap,
        context: {
          polaris_info_retrieved: context.polarisInfo.length > 0,
          meridian_info_retrieved: context.meridianInfo.length > 0,
          trends_retrieved: context.industryTrends.length > 0,
        },
      },
    });
  } catch (error: any) {
    console.error('❌ Error generating roadmap:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate modernization roadmap',
    });
  }
});

// Generate technical solution
router.post('/tech-solution', async (req: Request, res: Response) => {
  try {
    console.log('⚙️ Generating technical solution...');
    
    // Step 1: Get legacy system context from NotebookLM
    const context = await modernizationService.getLegacySystemContext();
    
    // Step 2: Generate tech solution using Claude
    const solution = await modernizationService.generateTechSolution(context);
    
    console.log('✅ Technical solution generated');
    
    res.json({
      success: true,
      data: {
        solution,
        context: {
          polaris_info_retrieved: context.polarisInfo.length > 0,
          meridian_info_retrieved: context.meridianInfo.length > 0,
          accelerators_retrieved: context.accelerators.length > 0,
        },
      },
    });
  } catch (error: any) {
    console.error('❌ Error generating tech solution:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate technical solution',
    });
  }
});

// Generate estimation and timeline
router.post('/estimation', async (req: Request, res: Response) => {
  try {
    console.log('📊 Generating estimation and timeline...');
    
    // Step 1: Get legacy system context from NotebookLM
    const context = await modernizationService.getLegacySystemContext();
    
    // Step 2: Generate estimation using Claude
    const estimation = await modernizationService.generateEstimation(context);
    
    console.log('✅ Estimation and timeline generated');
    
    res.json({
      success: true,
      data: {
        estimation,
        context: {
          polaris_info_retrieved: context.polarisInfo.length > 0,
          meridian_info_retrieved: context.meridianInfo.length > 0,
          accelerators_retrieved: context.accelerators.length > 0,
        },
      },
    });
  } catch (error: any) {
    console.error('❌ Error generating estimation:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate estimation and timeline',
    });
  }
});

// Answer questions about legacy systems
router.post('/ask', async (req: Request, res: Response) => {
  const { question } = req.body;
  
  if (!question) {
    return res.status(400).json({
      success: false,
      error: 'Question is required',
    });
  }
  
  try {
    console.log('💬 Answering question:', question);
    
    const result = await modernizationService.answerQuestion(question);
    
    console.log('✅ Question answered');
    
    res.json({
      success: true,
      data: {
        answer: result.answer,
        sources: result.sources || [],
        has_sources: (result.sources && result.sources.length > 0),
      },
    });
  } catch (error: any) {
    console.error('❌ Error answering question:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to answer question',
    });
  }
});

// Download any modernization output as PPTX
router.post('/download', async (req: Request, res: Response) => {
  const { content } = req.body;
  
  if (!content) {
    return res.status(400).json({
      success: false,
      error: 'Content is required',
    });
  }
  
  try {
    console.log('📊 Generating PPTX for modernization output...');
    
    // Optimize content for slides
    const optimizedContent = await pptxService.optimizeForSlides(content);
    
    // Generate PPTX
    const buffer = await pptxService.generatePPTX(optimizedContent);
    const filename = pptxService.generateFilename('modernization');
    
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
