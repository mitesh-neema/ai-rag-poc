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

      // Query for industry trends with specific focus on tech radar and sensible defaults
      const trendsQuery = `What are the current industry trends, Thoughtworks Tech Radar recommendations, and sensible defaults for insurance policy management systems? Include:
- Modern technology choices (frameworks, languages, cloud platforms)
- Industry best practices and standards
- Proven architecture patterns
- Security and compliance requirements
- DevOps and deployment strategies`;
      const trendsResult = await notebookLMMCPService.askQuestion(trendsQuery);

      // Query for available accelerators with sensible defaults
      const acceleratorsQuery = `What technology accelerators, reusable components, and Thoughtworks sensible defaults are available for modernization projects? Include:
- Pre-built frameworks and libraries
- Reference architectures
- Recommended tech stacks
- Time-saving tools and platforms
- Configuration best practices`;
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
    console.log('⚙️ Generating comprehensive technical solution...');

    const prompt = `You are a principal solutions architect creating a comprehensive technical solution for modernizing Polaris and Meridian insurance systems.

CONTEXT:
Polaris System: ${context.polarisInfo.join('\n')}
Meridian System: ${context.meridianInfo.join('\n')}
Available Accelerators: ${context.accelerators.join('\n')}
Industry Trends & Tech Radar: ${context.industryTrends.join('\n')}

TASK: Create an executive and technical comprehensive solution document with:

## 1. EXECUTIVE SUMMARY
- Solution overview in 3-4 bullets
- Key technology decisions with rationale
- Expected business outcomes

## 2. SENSIBLE DEFAULTS & TECH RADAR RECOMMENDATIONS

### Modern Tech Stack (Based on Tech Radar & Industry Standards)
**Frontend:**
- Framework: React 18+ / Angular 17+ (with reasoning)
- State Management: Redux Toolkit / NgRx (best fit)
- UI Library: Material-UI / Ant Design / Tailwind CSS
- Build Tool: Vite / Webpack 5
- **Sensible Default**: [Choose and justify based on team skills & requirements]

**Backend:**
- Language & Runtime: Node.js 20 LTS / .NET 8 / Java 21 LTS
- Framework: NestJS / Spring Boot / ASP.NET Core
- API Style: REST + GraphQL federation
- **Sensible Default**: [Choose with clear rationale]

**Data Layer:**
- Primary DB: PostgreSQL 16 / MongoDB 7
- Caching: Redis 7 (with clustering)
- Search: Elasticsearch 8 / OpenSearch
- Message Queue: RabbitMQ / Apache Kafka
- **Sensible Defaults**: [Specific choices with reasoning]

**Cloud & Infrastructure (DevOps Sensible Defaults):**
- Cloud: AWS / Azure / GCP (with specific reasoning)
- Container: Docker + Kubernetes (EKS/AKS/GKE)
- CI/CD: GitHub Actions / GitLab CI / Jenkins X
- IaC: Terraform / Pulumi
- Monitoring: Datadog / New Relic / Prometheus+Grafana
- **Sensible Defaults**: [Recommended stack]

## 3. DETAILED ARCHITECTURE DIAGRAM

### High-Level Architecture
\`\`\`
[TEXT DIAGRAM showing]:
- Presentation Layer (Web, Mobile)
- API Gateway
- Microservices (Policy, Claims, Customer, etc.)
- Data Layer
- Integration Layer
- Security Layer
\`\`\`

### Component Architecture
- List each microservice with responsibility
- Data flow between components
- Communication patterns (sync/async)
- [DIAGRAM: Component interactions]

### Data Architecture
- Database per service pattern
- Event sourcing where applicable
- CQRS for read-heavy operations
- Data replication strategy
- [DIAGRAM: Data flow and storage]

## 4. DEPLOYMENT ARCHITECTURE

### Infrastructure Design
\`\`\`
[TEXT DIAGRAM showing]:
- Multiple Availability Zones
- Load Balancers
- Auto-scaling groups
- Database clusters (primary/replica)
- Cache layers
- CDN
- Security zones
\`\`\`

### Deployment Strategy
- Blue-Green deployment
- Canary releases
- Feature flags
- Database migration approach
- Zero-downtime strategy

### Environment Structure
- Dev → QA → Staging → Production
- Environment parity
- Configuration management
- Secrets management (AWS Secrets Manager / Vault)

## 5. TECHNOLOGY ACCELERATORS & SENSIBLE DEFAULTS

### Accelerators to Use
1. **[Accelerator Name]**
   - Purpose: [What it does]
   - Customization: [What needs tailoring]
   - Time Saved: [Specific estimate]
   - Integration Complexity: Low/Medium/High

2. **[Repeat for each accelerator]**

### Sensible Default Configurations
- Authentication: OAuth 2.0 + OIDC (Auth0 / Okta)
- API Rate Limiting: 1000 req/min per user
- Cache TTL: 5 minutes (customizable per endpoint)
- Session timeout: 30 minutes
- Max file upload: 50MB
- Database connection pool: 20-50 connections

## 6. TESTING STRATEGY & QUALITY CONTROL

### Testing Pyramid
**Unit Tests (70%)**
- Coverage Target: 85% minimum
- Tools: Jest / xUnit / JUnit
- Automated in CI/CD

**Integration Tests (20%)**
- API contract testing
- Database integration tests
- Message queue integration
- Tools: Postman / REST Assured / Pact

**E2E Tests (10%)**
- Critical user journeys
- Tools: Cypress / Playwright / Selenium
- Run on every deployment

### Quality Metrics & Objectives
**Code Quality:**
- Code Coverage: ≥85%
- Cyclomatic Complexity: ≤10 per function
- Technical Debt Ratio: <5%
- Code Duplication: <3%
- Tools: SonarQube / CodeClimate

**Performance Metrics:**
- API Response Time: p95 <200ms
- Page Load Time: <2 seconds
- Database Query Time: p99 <100ms
- Error Rate: <0.1%

**Reliability Metrics:**
- Uptime SLA: 99.9% (43.2 min downtime/month)
- MTTR (Mean Time To Recovery): <15 minutes
- MTBF (Mean Time Between Failures): >720 hours

**Security Metrics:**
- Security Scan Coverage: 100%
- Critical Vulnerabilities: 0 tolerance
- Dependency Updates: Weekly scan
- Penetration Testing: Quarterly

### Continuous Quality Practices
- Pre-commit hooks (Husky)
- Automated code review (CodeRabbit)
- Static analysis on every PR
- Performance testing in CI/CD
- Security scanning (Snyk / Trivy)

## 7. CROSS-FUNCTIONAL REQUIREMENTS (NFRs)

### Performance
- Concurrent Users: Support 10,000+
- Response Time: 95th percentile <200ms
- Throughput: 1000 TPS
- Batch Processing: Handle 1M records/hour

### Scalability
- Horizontal scaling: Auto-scale based on CPU/Memory
- Database: Read replicas + sharding strategy
- Cache: Distributed Redis cluster
- CDN: CloudFront / Cloudflare for static assets

### Security
- Authentication: Multi-factor authentication (MFA)
- Authorization: Role-based access control (RBAC)
- Data Encryption: At rest (AES-256) & in transit (TLS 1.3)
- Audit Logging: All actions logged
- Compliance: SOC 2, GDPR, HIPAA ready
- Penetration Testing: Annual + after major releases

### Reliability & Resilience
- Disaster Recovery: RPO <1 hour, RTO <4 hours
- Backup Strategy: Daily full + hourly incremental
- Circuit Breakers: Hystrix / Resilience4j
- Retry Logic: Exponential backoff
- Health Checks: Kubernetes liveness/readiness probes

### Observability
- Logging: Structured JSON logs → ELK/Splunk
- Metrics: Prometheus + Grafana dashboards
- Tracing: Distributed tracing with Jaeger/Zipkin
- Alerting: PagerDuty integration
- SLIs/SLOs: Define and track

### Compliance & Governance
- Data Residency: Region-specific storage
- Data Retention: 7-year policy archive
- Access Controls: Principle of least privilege
- Change Management: ITSM integration
- Audit Trail: Immutable logs

## 8. MIGRATION & IMPLEMENTATION STRATEGY

### Migration Approach
1. **Strangler Fig Pattern**
   - Incrementally replace legacy features
   - Maintain both systems in parallel
   - Route traffic based on feature readiness

2. **Data Migration**
   - ETL pipeline design
   - Data validation & reconciliation
   - Rollback strategy

3. **Cutover Plan**
   - Feature-by-feature migration
   - User cohort approach
   - Rollback criteria

## 9. WHY THIS SOLUTION WORKS

### Technical Alignment
- Matches current team skills (list technologies)
- Proven at scale (reference similar projects)
- Modern but stable technology choices
- Strong community & vendor support

### Business Alignment
- Faster time-to-market: 40% reduction
- Lower TCO: 30% cost savings over 3 years
- Improved reliability: 99.9% vs current 99.5%
- Better developer experience: 2x productivity

### Risk Mitigation
- Gradual migration reduces risk
- Proven technology stack
- Strong DevOps practices
- Comprehensive testing strategy

## 10. SUCCESS METRICS

### Technical KPIs (6-month targets)
- Deployment Frequency: 10+ per day
- Lead Time: <1 hour
- MTTR: <15 minutes
- Change Failure Rate: <5%

### Business KPIs
- Policy Processing Time: 50% faster
- Customer Satisfaction: +20 NPS points
- Operational Cost: -30%
- Revenue Impact: +$XM annually

Format this as a detailed, executive-ready markdown document with clear sections, technical depth, and business justification.`;

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
