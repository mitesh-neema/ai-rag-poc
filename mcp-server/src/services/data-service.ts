import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface CaseStudy {
  id: string;
  title: string;
  client: string;
  industry: string;
  technologies: string[];
  duration: string;
  team_size: string;
  budget: string;
  summary: string;
  tags: string[];
}

interface RateCard {
  id: string;
  role: string;
  rate_per_hour: number;
  rate_per_day: number;
  monthly_rate: number;
  skills: string[];
  experience_level: string;
}

interface TechAccelerator {
  id: string;
  name: string;
  category: string;
  description: string;
  technologies: string[];
  features: string[];
  time_saved: string;
  cost_reduction: string;
}

class DataService {
  private caseStudies: CaseStudy[];
  private rateCards: RateCard[];
  private techAccelerators: TechAccelerator[];

  constructor() {
    // Load data from JSON files
    const dataPath = join(__dirname, '../data');
    
    this.caseStudies = JSON.parse(
      readFileSync(join(dataPath, 'case-studies.json'), 'utf-8')
    );
    this.rateCards = JSON.parse(
      readFileSync(join(dataPath, 'rate-cards.json'), 'utf-8')
    );
    this.techAccelerators = JSON.parse(
      readFileSync(join(dataPath, 'tech-accelerators.json'), 'utf-8')
    );
  }

  // Search case studies by keywords (technologies, industry, tags)
  searchCaseStudies(query: string): CaseStudy[] {
    const keywords = query.toLowerCase().split(' ');
    
    return this.caseStudies.filter(cs => {
      const searchText = [
        cs.title,
        cs.industry,
        cs.summary,
        ...cs.technologies,
        ...cs.tags
      ].join(' ').toLowerCase();
      
      return keywords.some(keyword => searchText.includes(keyword));
    });
  }

  // Get all case studies
  getAllCaseStudies(): CaseStudy[] {
    return this.caseStudies;
  }

  // Get rate cards by role or skills
  searchRateCards(query: string): RateCard[] {
    const keywords = query.toLowerCase().split(' ');
    
    return this.rateCards.filter(rc => {
      const searchText = [
        rc.role,
        ...rc.skills
      ].join(' ').toLowerCase();
      
      return keywords.some(keyword => searchText.includes(keyword));
    });
  }

  // Get all rate cards
  getAllRateCards(): RateCard[] {
    return this.rateCards;
  }

  // Search tech accelerators by keywords
  searchTechAccelerators(query: string): TechAccelerator[] {
    const keywords = query.toLowerCase().split(' ');
    
    return this.techAccelerators.filter(ta => {
      const searchText = [
        ta.name,
        ta.category,
        ta.description,
        ...ta.technologies,
        ...ta.features
      ].join(' ').toLowerCase();
      
      return keywords.some(keyword => searchText.includes(keyword));
    });
  }

  // Get all tech accelerators
  getAllTechAccelerators(): TechAccelerator[] {
    return this.techAccelerators;
  }

  // Get comprehensive RAG context for a proposal request
  getProposalContext(requirements: string): {
    caseStudies: CaseStudy[];
    rateCards: RateCard[];
    techAccelerators: TechAccelerator[];
  } {
    return {
      caseStudies: this.searchCaseStudies(requirements),
      rateCards: this.searchRateCards(requirements),
      techAccelerators: this.searchTechAccelerators(requirements)
    };
  }
}

export const dataService = new DataService();
export type { CaseStudy, RateCard, TechAccelerator };
