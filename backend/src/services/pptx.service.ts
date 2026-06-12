import pptxgen from 'pptxgenjs';
import Anthropic from '@anthropic-ai/sdk';

export class PPTXService {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Optimize markdown content for presentation slides using Claude
   */
  async optimizeForSlides(proposalMarkdown: string): Promise<string> {
    console.log('🎨 Optimizing content for executive presentation slides...');

    const prompt = `Transform the following proposal into an EXECUTIVE-READY presentation deck suitable for C-level stakeholders.

CRITICAL REQUIREMENTS:

1. **SLIDE STRUCTURE** (Use "---" to separate slides):
   - Each slide: Clear, compelling heading + 3-5 concise bullets
   - No long paragraphs - break into scannable bullets
   - Use power words and action verbs
   - Focus on business value and ROI

2. **MUST-HAVE SLIDES** (in this order):
   - Title Slide: Project name + compelling tagline
   - Executive Summary: 3-4 key value propositions
   - Business Challenge: Problem we're solving + impact
   - Our Solution: High-level approach + key differentiators
   - Technical Architecture: Core components (visual cues)
   - Success Stories: Relevant case studies with metrics
   - **Team Structure**: Roles, seniority levels, FTEs
   - Project Timeline: Phases with milestones
   - **Investment Summary**: Breakdown (team, infra, contingency) + Total
   - ROI & Business Value: Cost savings, revenue impact, metrics
   - Why Us: 3-4 compelling reasons
   - Next Steps: Clear action items

3. **EXECUTIVE LANGUAGE**:
   - Lead with business impact, not technical details
   - Include specific metrics and percentages
   - Use strategic framing: "Strategic advantage", "Market leadership"
   - Quantify everything: time saved, cost reduced, revenue generated

4. **TEAM STRUCTURE SLIDE** must include:
   - Role titles (Tech Lead, Senior Developers, etc.)
   - Number of FTEs per role
   - Key responsibilities for each role
   - Total team size

5. **INVESTMENT SLIDE** must include:
   - Team costs (by role, with rates if available)
   - Infrastructure costs
   - Licensing/Tools
   - Contingency (10-15%)
   - **Total Investment** (prominently displayed)
   - Payment terms if applicable

6. **VISUAL CUES**: Add notes like [CHART: Timeline], [ICON: Security], [METRIC: 45% faster] where visualizations would enhance the slide

Original Proposal:
${proposalMarkdown}

Please create a polished, executive-ready presentation deck.`;

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 4000,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = message.content[0];
      if (content.type === 'text') {
        console.log('✅ Content optimized for slides');
        return content.text;
      }

      throw new Error('Unexpected response format from Claude');
    } catch (error) {
      console.error('⚠️ Failed to optimize slides, using original content:', error);
      return proposalMarkdown; // Fallback to original if optimization fails
    }
  }

  /**
   * Convert markdown proposal to PPTX presentation
   */
  async generatePPTX(proposalMarkdown: string, filename?: string): Promise<Buffer> {
    console.log('📊 Generating PPTX presentation from markdown...');
    const pptx = new (pptxgen.default as any)();

    // Set presentation properties
    pptx.author = 'Proposal Generator';
    pptx.company = 'Your Company';
    pptx.subject = 'Project Proposal';
    pptx.title = 'Technical Proposal';

    // Define slide layout and styling
    pptx.defineLayout({ name: 'LAYOUT_16x9', width: 10, height: 5.625 });
    pptx.layout = 'LAYOUT_16x9';

    // Parse markdown into slides (separated by ---)
    const slides = proposalMarkdown.split('---').filter(s => s.trim());

    slides.forEach((slideContent, index) => {
      const slide = pptx.addSlide();

      // Parse slide content
      const lines = slideContent.trim().split('\n').filter(l => l.trim());
      
      if (lines.length === 0) return;

      let yPos = 0.5;
      const leftMargin = 0.5;
      const rightMargin = 9.5;

      lines.forEach((line, lineIndex) => {
        const trimmedLine = line.trim();
        
        if (!trimmedLine) {
          yPos += 0.2; // Add spacing for empty lines
          return;
        }

        // Title (# heading)
        if (trimmedLine.startsWith('# ')) {
          const title = trimmedLine.replace(/^#\s+/, '');
          slide.addText(title, {
            x: leftMargin,
            y: yPos,
            w: rightMargin - leftMargin,
            h: 0.6,
            fontSize: 32,
            bold: true,
            color: '1F4788',
            align: 'left',
          });
          yPos += 0.8;
        }
        // Subtitle (## heading)
        else if (trimmedLine.startsWith('## ')) {
          const subtitle = trimmedLine.replace(/^##\s+/, '');
          slide.addText(subtitle, {
            x: leftMargin,
            y: yPos,
            w: rightMargin - leftMargin,
            h: 0.5,
            fontSize: 24,
            bold: true,
            color: '2E5C8A',
            align: 'left',
          });
          yPos += 0.6;
        }
        // Bullet points
        else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
          const bulletText = trimmedLine.replace(/^[-*]\s+/, '');
          slide.addText(bulletText, {
            x: leftMargin + 0.3,
            y: yPos,
            w: rightMargin - leftMargin - 0.3,
            fontSize: 14,
            color: '333333',
            bullet: { code: '2022' },
            valign: 'top',
          });
          yPos += 0.35;
        }
        // Regular text
        else {
          slide.addText(trimmedLine, {
            x: leftMargin,
            y: yPos,
            w: rightMargin - leftMargin,
            fontSize: 14,
            color: '444444',
            align: 'left',
            valign: 'top',
          });
          yPos += 0.3;
        }

        // Prevent content overflow
        if (yPos > 5.0) {
          return; // Stop adding content to this slide
        }
      });

      // Add slide number
      slide.addText(`${index + 1}`, {
        x: 9.3,
        y: 5.2,
        w: 0.5,
        h: 0.3,
        fontSize: 10,
        color: '999999',
        align: 'right',
      });
    });

    // Generate PPTX buffer
    const buffer = await pptx.write({ outputType: 'nodebuffer' });
    return buffer as Buffer;
  }

  /**
   * Generate filename with timestamp
   */
  generateFilename(prefix: string = 'proposal'): string {
    const timestamp = Date.now();
    return `${prefix}-${timestamp}.pptx`;
  }
}

export const pptxService = new PPTXService();
