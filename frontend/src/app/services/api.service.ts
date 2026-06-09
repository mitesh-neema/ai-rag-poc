import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProposalRequest, ProposalResponse } from '../models/proposal.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  generateProposal(requirements: string): Observable<ProposalResponse> {
    const request: ProposalRequest = { requirements };
    return this.http.post<ProposalResponse>(
      `${this.apiUrl}/api/proposal/generate`,
      request
    );
  }

  checkHealth(): Observable<{ status: string }> {
    return this.http.get<{ status: string }>(`${this.apiUrl}/health`);
  }
}
