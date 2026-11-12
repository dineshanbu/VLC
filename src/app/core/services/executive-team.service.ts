import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ExecutiveTeamContent, ExecutiveTeamMember, ExecutiveTeamMembersResponse } from '../models/executive-team.model';

@Injectable({ providedIn: 'root' })
export class ExecutiveTeamService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/executive-team/members`;
  private readonly contentUrl = `${environment.apiUrl}/executive-team/content`;

  getContent(): Observable<{ success: boolean; content: ExecutiveTeamContent }> {
    return this.http.get<{ success: boolean; content: ExecutiveTeamContent }>(this.contentUrl);
  }

  saveHero(formData: FormData): Observable<{ success: boolean; content: ExecutiveTeamContent }> {
    return this.http.put<{ success: boolean; content: ExecutiveTeamContent }>(`${this.contentUrl}/hero`, formData);
  }

  savePage(page: Record<string, any>): Observable<{ success: boolean; content: ExecutiveTeamContent }> {
    return this.http.put<{ success: boolean; content: ExecutiveTeamContent }>(`${this.contentUrl}/page`, page);
  }

  getMembers(status?: 'Active' | 'Inactive'): Observable<ExecutiveTeamMembersResponse> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<ExecutiveTeamMembersResponse>(this.apiUrl, { params });
  }

  createMember(formData: FormData): Observable<{ success: boolean; member: ExecutiveTeamMember }> {
    return this.http.post<{ success: boolean; member: ExecutiveTeamMember }>(this.apiUrl, formData);
  }

  updateMember(id: number, formData: FormData): Observable<{ success: boolean; member: ExecutiveTeamMember }> {
    return this.http.put<{ success: boolean; member: ExecutiveTeamMember }>(`${this.apiUrl}/${id}`, formData);
  }

  deleteMember(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/${id}`);
  }

  reorderMembers(items: Array<{ id: number; order_index: number }>): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/reorder`, { items });
  }
}
