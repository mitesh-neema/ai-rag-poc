export interface ProposalRequest {
  requirements: string;
}

export interface ProposalResponse {
  success: boolean;
  data: {
    proposal: string;
    context: {
      case_studies_count: number;
      rate_cards_count: number;
      tech_accelerators_count: number;
    };
  };
  error?: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
