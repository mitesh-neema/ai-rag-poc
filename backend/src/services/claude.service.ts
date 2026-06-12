import Anthropic from '@anthropic-ai/sdk';

interface ProposalContext {
  caseStudies: any[];
  rateCards: any[];
  techAccelerators: any[];
}

export class ClaudeService {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  // Generate proposal in slide deck format
  async generateProposal(
    requirements: string,
    context: ProposalContext
  ): Promise<string> {
    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(requirements, context);

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 8000,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      const content = message.content[0];
      if (content.type === 'text') {
        return content.text;
      }

      throw new Error('Unexpected response format from Claude');
    } catch (error) {
      console.error('Claude API Error:', error);
      throw new Error('Failed to generate proposal with Claude API');
    }
  }

  // Stream proposal generation
  async *streamProposal(
    requirements: string,
    context: ProposalContext
  ): AsyncGenerator<string> {
    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(requirements, context);

    try {
      const stream = await this.anthropic.messages.stream({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 8000,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      for await (const chunk of stream) {
        if (
          chunk.type === 'content_block_delta' &&
          chunk.delta.type === 'text_delta'
        ) {
          yield chunk.delta.text;
        }
      }
    } catch (error) {
      console.error('Claude Streaming Error:', error);
      throw new Error('Failed to stream proposal from Claude API');
    }
  }

  private buildSystemPrompt(): string {
    return `You are an expert proposal writer specializing in technology solutions. Your task is to create compelling, professional proposals in a slide deck format using markdown.

Your proposals should:
1. Be structured as presentation slides using markdown (use "---" to separate slides)
2. Include relevant case studies, tech accelerators, and accurate cost estimates based on the provided context
3. Be persuasive and client-focused, highlighting value and ROI
4. Include specific technical details and architecture recommendations
5. Provide realistic timelines and team compositions

Format each slide with:
- Clear headings using # or ##
- Bullet points for key information
- Relevant data and metrics from case studies
- Professional and concise language

Create a complete proposal with these sections as slides:
1. Title slide with project name
2. Executive Summary
3. Understanding Your Requirements
4. Proposed Solution & Architecture
5. Our Relevant Experience (with case studies)
6. Technology Stack & Accelerators
7. Project Timeline & Phases
8. Team Composition & Expertise
9. Investment & Pricing
10. Why Choose Us / Value Proposition
11. Next Steps`;
  }

  private buildUserPrompt(
    requirements: string,
    context: ProposalContext
  ): string {
    const { caseStudies, rateCards, techAccelerators } = context;

    let prompt = `Create a comprehensive proposal for the following client requirements:\n\n"${requirements}"\n\n`;

    prompt += `## Available Context for RAG:\n\n`;

    // Add case studies context
    if (caseStudies && caseStudies.length > 0) {
      prompt += `### Relevant Case Studies:\n`;
      caseStudies.forEach((cs) => {
        // Check if this is from NotebookLM (text format) or mock MCP (structured)
        if (cs.source === 'NotebookLM' && cs.content) {
          prompt += `\n${cs.content}\n\n`;
        } else {
          // Mock MCP structured format
          prompt += `\n**${cs.title}**\n`;
          prompt += `- Industry: ${cs.industry}\n`;
          prompt += `- Technologies: ${cs.technologies ? cs.technologies.join(', ') : 'N/A'}\n`;
          prompt += `- Duration: ${cs.duration}\n`;
          prompt += `- Team Size: ${cs.team_size}\n`;
          prompt += `- Budget: ${cs.budget}\n`;
          prompt += `- Summary: ${cs.summary}\n`;
          if (cs.results) {
            prompt += `- Key Results: ${JSON.stringify(cs.results)}\n`;
          }
        }
      });
      prompt += `\n`;
    }

    // Add rate cards context
    if (rateCards && rateCards.length > 0) {
      prompt += `### Available Team Resources & Rates:\n`;
      rateCards.forEach((rc) => {
        // Check if this is from NotebookLM (text format) or mock MCP (structured)
        if (rc.source === 'NotebookLM' && rc.content) {
          prompt += `\n${rc.content}\n\n`;
        } else {
          // Mock MCP structured format
          prompt += `\n**${rc.role}**\n`;
          prompt += `- Hourly Rate: $${rc.rate_per_hour}\n`;
          prompt += `- Monthly Rate: $${rc.monthly_rate}\n`;
          prompt += `- Skills: ${rc.skills ? rc.skills.join(', ') : 'N/A'}\n`;
          prompt += `- Experience: ${rc.experience_level}\n`;
        }
      });
      prompt += `\n`;
    }

    // Add tech accelerators context
    if (techAccelerators && techAccelerators.length > 0) {
      prompt += `### Available Tech Accelerators:\n`;
      techAccelerators.forEach((ta) => {
        // Check if this is from NotebookLM (text format) or mock MCP (structured)
        if (ta.source === 'NotebookLM' && ta.content) {
          prompt += `\n${ta.content}\n\n`;
        } else {
          // Mock MCP structured format
          prompt += `\n**${ta.name}** (${ta.category})\n`;
          prompt += `- Description: ${ta.description}\n`;
          prompt += `- Technologies: ${ta.technologies ? ta.technologies.join(', ') : 'N/A'}\n`;
          prompt += `- Time Saved: ${ta.time_saved}\n`;
          prompt += `- Cost Reduction: ${ta.cost_reduction}\n`;
          if (ta.features && ta.features.length > 0) {
            prompt += `- Key Features: ${ta.features.slice(0, 3).join(', ')}\n`;
          }
        }
      });
      prompt += `\n`;
    }

    prompt += `\n---\n\n`;
    prompt += `Using the above context, create a compelling proposal in slide deck format (markdown with "---" separating slides). 
Ensure you reference specific case studies, use appropriate tech accelerators, and provide accurate cost estimates based on the rate cards. 
Make the proposal specific to the client's requirements and highlight relevant experience and capabilities.`;

    return prompt;
  }
}

export const claudeService = new ClaudeService();
