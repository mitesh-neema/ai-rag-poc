import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { marked } from 'marked';
import { ModernizationApiService } from './services/modernization-api.service';
import { Message } from './models/proposal.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private readonly modernizationService = inject(ModernizationApiService);

  title = 'Legacy Modernization Agent';
  selectedMode = signal<string>(''); // 'roadmap', 'tech-solution', 'estimation', 'qa'
  userInput = signal('');
  messages = signal<Message[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  contextInfo = signal<string>('');

  get userInputValue(): string {
    return this.userInput();
  }

  set userInputValue(value: string) {
    this.userInput.set(value);
  }

  get hasAssistantMessages(): boolean {
    return this.messages().some(m => m.role === 'assistant');
  }

  get showWelcomeScreen(): boolean {
    return this.messages().length === 0 && !this.selectedMode();
  }

  get showQAMode(): boolean {
    return this.selectedMode() === 'qa';
  }

  // Select a modernization mode
  selectMode(mode: string): void {
    this.selectedMode.set(mode);
    this.messages.set([]);
    this.error.set(null);
    this.contextInfo.set('');
    
    if (mode !== 'qa') {
      // Auto-generate for non-QA modes
      this.generateContent(mode);
    }
  }

  // Generate content based on selected mode
  async generateContent(mode: string): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    this.contextInfo.set('Analyzing Polaris & Meridian systems from NotebookLM...');

    try {
      let response;
      let content = '';
      let modeLabel = '';

      switch (mode) {
        case 'roadmap':
          modeLabel = 'Modernization Roadmap';
          response = await this.modernizationService.generateRoadmap().toPromise();
          content = response?.data?.roadmap || '';
          break;
        
        case 'tech-solution':
          modeLabel = 'Technical Solution';
          response = await this.modernizationService.generateTechSolution().toPromise();
          content = response?.data?.solution || '';
          break;
        
        case 'estimation':
          modeLabel = 'Estimations & Timeline';
          response = await this.modernizationService.generateEstimation().toPromise();
          content = response?.data?.estimation || '';
          break;
      }

      if (response?.success && content) {
        const ctx = response.data?.context;
        if (ctx) {
          const parts = [];
          if (ctx.polaris_info_retrieved) parts.push('Polaris system analyzed');
          if (ctx.meridian_info_retrieved) parts.push('Meridian system analyzed');
          if (ctx.trends_retrieved) parts.push('Industry trends included');
          if (ctx.accelerators_retrieved) parts.push('Accelerators evaluated');
          this.contextInfo.set(parts.join(' • '));
        }

        this.messages.set([{
          role: 'assistant',
          content,
          timestamp: new Date()
        }]);
      } else {
        throw new Error(response?.error || `Failed to generate ${modeLabel.toLowerCase()}`);
      }
    } catch (err: any) {
      console.error('Error generating content:', err);
      this.error.set(err.message || 'An error occurred while generating the content');
    } finally {
      this.isLoading.set(false);
    }
  }

  // Ask a question in QA mode
  async askQuestion(): Promise<void> {
    const question = this.userInput().trim();
    
    if (!question || this.isLoading()) {
      return;
    }

    // Add user question
    this.messages.update(msgs => [
      ...msgs,
      { role: 'user', content: question, timestamp: new Date() }
    ]);

    this.userInput.set('');
    this.isLoading.set(true);
    this.error.set(null);
    this.contextInfo.set('Searching Polaris & Meridian documentation...');

    try {
      const response = await this.modernizationService.askQuestion(question).toPromise();

      if (response?.success && response.data?.answer) {
        this.contextInfo.set(
          response.data.has_sources 
            ? `Answer from ${response.data.sources?.length || 0} documentation sources`
            : 'Answer generated from available documentation'
        );

        this.messages.update(msgs => [
          ...msgs,
          {
            role: 'assistant',
            content: response.data?.answer || 'No answer received',
            timestamp: new Date()
          }
        ]);
      } else {
        throw new Error(response?.error || 'Failed to answer question');
      }
    } catch (err: any) {
      console.error('Error asking question:', err);
      this.error.set(err.message || 'An error occurred while answering the question');
    } finally {
      this.isLoading.set(false);
    }
  }

  handleKeyDown(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (!keyboardEvent.shiftKey) {
      keyboardEvent.preventDefault();
      this.askQuestion();
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

  goBack(): void {
    this.selectedMode.set('');
    this.messages.set([]);
    this.error.set(null);
    this.contextInfo.set('');
    this.userInput.set('');
  }

  clearChat(): void {
    this.messages.set([]);
    this.error.set(null);
    this.contextInfo.set('');
    this.userInput.set('');
  }

  regenerate(): void {
    const mode = this.selectedMode();
    if (mode && mode !== 'qa') {
      this.messages.set([]);
      this.generateContent(mode);
    }
  }

  downloadMarkdown(): void {
    const lastMessage = this.messages().filter(m => m.role === 'assistant').pop();
    if (!lastMessage) return;

    const blob = new Blob([lastMessage.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `modernization-${this.selectedMode()}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async downloadPPTX(): Promise<void> {
    const lastMessage = this.messages().filter(m => m.role === 'assistant').pop();
    if (!lastMessage) return;

    this.isLoading.set(true);
    this.error.set(null);

    try {
      const blob = await this.modernizationService.downloadPPTX(lastMessage.content).toPromise();
      
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `modernization-${this.selectedMode()}-${Date.now()}.pptx`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err: any) {
      console.error('Error downloading PPTX:', err);
      this.error.set(err.message || 'Failed to download PPTX');
    } finally {
      this.isLoading.set(false);
    }
  }
}
