import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface ModernizationResponse {
  success: boolean;
  data?: {
    roadmap?: string;
    solution?: string;
    estimation?: string;
    answer?: string;
    sources?: any[];
    has_sources?: boolean;
    context?: any;
  };
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ModernizationApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  // Generate modernization roadmap
  generateRoadmap(): Observable<ModernizationResponse> {
    return this.http.post<ModernizationResponse>(
      `${this.apiUrl}/api/modernization/roadmap`,
      {}
    );
  }

  // Generate technical solution
  generateTechSolution(): Observable<ModernizationResponse> {
    return this.http.post<ModernizationResponse>(
      `${this.apiUrl}/api/modernization/tech-solution`,
      {}
    );
  }

  // Generate estimation and timeline
  generateEstimation(): Observable<ModernizationResponse> {
    return this.http.post<ModernizationResponse>(
      `${this.apiUrl}/api/modernization/estimation`,
      {}
    );
  }

  // Ask question about legacy systems
  askQuestion(question: string): Observable<ModernizationResponse> {
    return this.http.post<ModernizationResponse>(
      `${this.apiUrl}/api/modernization/ask`,
      { question }
    );
  }

  // Download content as PPTX
  downloadPPTX(content: string): Observable<Blob> {
    return this.http.post(
      `${this.apiUrl}/api/modernization/download`,
      { content },
      { responseType: 'blob' }
    );
  }
}
