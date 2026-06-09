import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { marked } from 'marked';
import { ApiService } from './services/api.service';
import { Message } from './models/proposal.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private readonly apiService = inject(ApiService);

  title = 'RAG Proposal Generator';
  userInput = signal('');
  messages = signal<Message[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  contextInfo = signal<string>('');

  examplePrompts = [
    'Create a proposal for building an e-commerce platform using React and AWS',
    'Build a mobile banking app with real-time notifications for a fintech client',
    'Develop an IoT dashboard for smart factory monitoring with predictive analytics'
  ];

  get userInputValue(): string {
    return this.userInput();
  }

  set userInputValue(value: string) {
    this.userInput.set(value);
  }

  get hasAssistantMessages(): boolean {
    return this.messages().some(m => m.role === 'assistant');
  }

  useExample(prompt: string): void {
    this.userInput.set(prompt);
  }

  handleKeyDown(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (!keyboardEvent.shiftKey) {
      keyboardEvent.preventDefault();
      this.sendMessage();
    }
  }

  async sendMessage(): Promise<void> {
    const input = this.userInput().trim();
    
    if (!input || this.isLoading()) {
      return;
    }

    // Add user message
    this.messages.update(msgs => [
      ...msgs,
      { role: 'user', content: input, timestamp: new Date() }
    ]);

    this.userInput.set('');
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const response = await this.apiService.generateProposal(input).toPromise();

      if (response?.success && response.data) {
        // Set context info
        const ctx = response.data.context;
        this.contextInfo.set(
          `Retrieved ${ctx.case_studies_count} case studies, ${ctx.rate_cards_count} rate cards, ${ctx.tech_accelerators_count} tech accelerators`
        );

        // Add assistant message
        this.messages.update(msgs => [
          ...msgs,
          {
            role: 'assistant',
            content: response.data.proposal,
            timestamp: new Date()
          }
        ]);
      } else {
        throw new Error(response?.error || 'Failed to generate proposal');
      }
    } catch (err: any) {
      console.error('Error generating proposal:', err);
      this.error.set(err.message || 'An error occurred while generating the proposal');
    } finally {
      this.isLoading.set(false);
    }
  }

  parseMarkdown(content: string): string {
    try {
      return marked.parse(content) as string;
    } catch (err) {
      console.error('Markdown parsing error:', err);
      return content;
    }
  }

  clearChat(): void {
    this.messages.set([]);
    this.error.set(null);
    this.contextInfo.set('');
  }

  downloadProposal(): void {
    const lastMessage = this.messages().filter(m => m.role === 'assistant').pop();
    if (!lastMessage) return;

    const blob = new Blob([lastMessage.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proposal-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
