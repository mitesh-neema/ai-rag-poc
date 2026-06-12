import { claudeService } from './claude.service.js';
import { notebookLMMCPService } from './notebooklm-mcp.service.js';

interface ModernizationContext {
  polarisInfo: string[];
  meridianInfo: string[];
  industryTrends: string[];
  accelerators: string[];
}

export class ModernizationService {
  /**
   * Get context from NotebookLM about legacy systems
   */
  async getLegacySystemContext(): Promise<ModernizationContext> {
    try {
      console.log('📚 Retrieving legacy system information from NotebookLM...');

      // Query for Polaris system information
      const polarisQuery = 'What are all the features, capabilities, and technical details of the Polaris system?';
      const polarisResult = await notebookLMMCPService.askQuestion(polarisQuery);

      // Query for Meridian system information
      const meridianQuery = 'What are all the features, capabilities, and technical details of the Meridian system?';
      const meridianResult = await notebookLMMCPService.askQuestion(meridianQuery);

      // Query for industry trends
      const trendsQuery = 'What are the current industry trends and best practices for insurance policy management systems?';
      const trendsResult = await notebookLMMCPService.askQuestion(trendsQuery);

      // Query for available accelerators
      const acceleratorsQuery = 'What technology accelerators and reusable components are available for modernization projects?';
      const acceleratorsResult = await notebookLMMCPService.askQuestion(acceleratorsQuery);

      console.log('✅ Legacy system context retrieved');

      return {
        polarisInfo: polarisResult.answer ? [polarisResult.answer] : [],
        meridianInfo: meridianResult.answer ? [meridianResult.answer] : [],
        industryTrends: trendsResult.answer ? [trendsResult.answer] : [],
        accelerators: acceleratorsResult.answer ? [acceleratorsResult.answer] : [],
      };
    } catch (error: any) {
      console.error('⚠️ Failed to retrieve legacy system context:', error.message);
      return {
        polarisInfo: [],
        meridianInfo: [],
        industryTrends: [],
        accelerators: [],
      };
    }
  }

  /**
   * Generate modernization roadmap
   */
  async generateRoadmap(context: ModernizationContext): Promise<string> {
    console.log('🗺️ Generating modernization roadmap...');

    const prompt = `You are a legacy modernization expert analyzing the Polaris and Meridian insurance policy management systems.

CONTEXT:
Polaris System: ${context.polarisInfo.join('\n')}
Meridian System: ${context.meridianInfo.join('\n')}
Industry Trends: ${context.industryTrends.join('\n')}

TASK: Create a comprehensive modernization roadmap that:

1. **Current State Analysis**
   - Key features of Polaris
   - Key features of Meridian
   - Overlapping capabilities
   - Unique capabilities in each system

2. **Unified System Vision**
   - Proposed unified architecture
   - Combined feature set
   - Enhanced capabilities beyond current systems

3. **Gap Analysis**
   - Missing features compared to industry standards
   - Technical debt areas
   - Integration challenges

4. **Industry Trend Recommendations**
   - Modern features to add (AI, automation, etc.)
   - Cloud-native capabilities
   - Enhanced user experience
   - Compliance and security improvements

5. **Pros & Cons Analysis**
   PROS:
   - Business benefits
   - Technical advantages
   - Cost savings over time
   
   CONS:
   - Migration risks
   - Temporary disruption
   - Training requirements
   - Initial investment

6. **Risk Assessment**
   - High-risk areas
   - Mitigation strategies
   - Dependencies

Format as a markdown document with clear sections and bullet points.`;

    const response = await this.callClaude(prompt);
    console.log('✅ Modernization roadmap generated');
    return response;
  }

  /**
   * Generate technical solution recommendation
   */
  async generateTechSolution(context: ModernizationContext): Promise<string> {
    console.log('⚙️ Generating technical solution...');

    const prompt = `You are a solutions architect recommending technology for modernizing Polaris and Meridian systems.

CONTEXT:
Polaris System: ${context.polarisInfo.join('\n')}
Meridian System: ${context.meridianInfo.join('\n')}
Available Accelerators: ${context.accelerators.join('\n')}
Industry Trends: ${context.industryTrends.join('\n')}

TASK: Provide a detailed technical solution that:

1. **Recommended Tech Stack**
   - Frontend: Framework and libraries
   - Backend: Languages and frameworks
   - Database: Primary and caching solutions
   - Cloud Platform: AWS/Azure/GCP with specific services
   - Integration: APIs, message queues, event streaming

2. **Architecture Approach**
   - Microservices vs Monolith
   - Data architecture
   - API design
   - Security framework
   - [DIAGRAM: High-level architecture blocks]

3. **Accelerators to Leverage**
   - Which specific accelerators from our catalog to use
   - How each accelerator speeds up development
   - Customization required for each
   - Time/cost savings per accelerator

4. **Why This Solution Works**
   - Alignment with current system capabilities
   - Scalability for future growth
   - Cost-effectiveness
   - Risk mitigation
   - Team skill availability

5. **Success Stories**
   - Similar projects we've completed
   - Metrics and outcomes
   - Lessons learned applied here

6. **Implementation Strategy**
   - Phased approach
   - Parallel run period
   - Data migration strategy
   - Rollback plan

Format as markdown with clear sections, technical details, and business justification.`;

    const response = await this.callClaude(prompt);
    console.log('✅ Technical solution generated');
    return response;
  }

  /**
   * Generate estimation and timeline
   */
  async generateEstimation(context: ModernizationContext): Promise<string> {
    console.log('📊 Generating estimations and timeline...');

    const prompt = `You are a project manager creating a detailed delivery plan for modernizing Polaris and Meridian systems.

CONTEXT:
Polaris System: ${context.polarisInfo.join('\n')}
Meridian System: ${context.meridianInfo.join('\n')}
Available Accelerators: ${context.accelerators.join('\n')}

TASK: Create a phased delivery plan with:

1. **Phase 1: Foundation (Months 1-3)**
   Quick Wins:
   - [List 3-4 early deliverables]
   
   Deliverables:
   - [Key outputs]
   
   Team Structure:
   - Tech Lead (1 FTE)
   - Senior Developers (X FTEs)
   - [Other roles]
   
   Cost Estimate:
   - Team: $XXX,XXX
   - Infrastructure: $XX,XXX
   - Total: $XXX,XXX

2. **Phase 2: Core Migration (Months 4-7)**
   Quick Wins:
   - [List 3-4 mid-term deliverables]
   
   Deliverables:
   - [Key outputs]
   
   Team Structure:
   - [Roles and FTEs - likely larger team]
   
   Cost Estimate:
   - Team: $XXX,XXX
   - Infrastructure: $XX,XXX
   - Total: $XXX,XXX

3. **Phase 3: Enhancement & Optimization (Months 8-9)**
   Quick Wins:
   - [List final deliverables]
   
   Deliverables:
   - [Key outputs]
   
   Team Structure:
   - [Roles and FTEs - smaller team]
   
   Cost Estimate:
   - Team: $XXX,XXX
   - Infrastructure: $XX,XXX
   - Total: $XXX,XXX

4. **Overall Summary**
   - Total Duration: X months
   - Total Team Size: Peak of X FTEs
   - Total Investment: $X,XXX,XXX
   - ROI Timeline: Break-even in X months
   - Annual Savings: $XXX,XXX

5. **Key Milestones & Gates**
   - [Critical decision points]
   - [Go/No-go criteria]

6. **Value Delivery Timeline**
   [CHART: Timeline showing value delivery points]
   - Month 3: First features live
   - Month 6: 50% migration complete
   - Month 9: Full go-live

Format as markdown with clear phase breakdowns, realistic estimates, and business value emphasis.`;

    const response = await this.callClaude(prompt);
    console.log('✅ Estimations and timeline generated');
    return response;
  }

  /**
   * Answer questions about legacy systems
   */
  async answerQuestion(question: string): Promise<{ answer: string; sources?: any[] }> {
    console.log('💬 Answering question about legacy systems...');

    try {
      // Query NotebookLM for information
      const result = await notebookLMMCPService.askQuestion(question);

      if (!result.answer) {
        return {
          answer: 'I could not find specific information about that in the legacy system documentation. Please try rephrasing your question or ask about specific features of Polaris or Meridian systems.',
          sources: [],
        };
      }

      // Enhance answer with Claude for better formatting
      const enhancedPrompt = `The user asked: "${question}"

Raw answer from documentation:
${result.answer}

Please format this answer in a clear, professional way with:
- Brief summary at the top
- Detailed explanation with bullet points
- Technical details if applicable
- Any relevant considerations or notes

Keep all factual information from the source, but make it more readable.`;

      const enhanced = await this.callClaude(enhancedPrompt);

      console.log('✅ Question answered');
      return {
        answer: enhanced,
        sources: result.sources,
      };
    } catch (error: any) {
      console.error('❌ Error answering question:', error.message);
      return {
        answer: 'I encountered an error while searching the documentation. Please try again.',
        sources: [],
      };
    }
  }

  /**
   * Helper method to call Claude API
   */
  private async callClaude(prompt: string): Promise<string> {
    const response = await claudeService.generateProposal(prompt, {
      caseStudies: [],
      rateCards: [],
      techAccelerators: [],
    });
    return response;
  }
}

export const modernizationService = new ModernizationService();
