import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AboutLeader,
  AboutContentResponse,
  AboutLeadersResponse,
  AboutSectionContent
} from '../models/about.model';

@Injectable({
  providedIn: 'root'
})
export class AboutService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:5000/api/about';

  // 1. Page Content (Hero, Overview modal, Vision/Mission, Vision 2030)
  getAboutContent(): Observable<AboutContentResponse> {
    return this.http.get<AboutContentResponse>(`${this.API_URL}/content`);
  }

  updateAboutSection(sectionKey: string, formData: FormData): Observable<{ success: boolean; message: string; section: AboutSectionContent }> {
    return this.http.put<{ success: boolean; message: string; section: AboutSectionContent }>(`${this.API_URL}/content/${sectionKey}`, formData);
  }

  // 2. Leaders & Founding Team
  getLeaders(filters?: { status?: string; badge?: string; search?: string }): Observable<AboutLeadersResponse> {
    let params = new HttpParams();
    if (filters?.status && filters.status !== 'All') params = params.set('status', filters.status);
    if (filters?.badge && filters.badge !== 'All') params = params.set('badge', filters.badge);
    if (filters?.search) params = params.set('search', filters.search);

    return this.http.get<AboutLeadersResponse>(`${this.API_URL}/leaders`, { params });
  }

  getLeaderById(id: number): Observable<{ success: boolean; leader: AboutLeader }> {
    return this.http.get<{ success: boolean; leader: AboutLeader }>(`${this.API_URL}/leaders/${id}`);
  }

  createLeader(formData: FormData): Observable<{ success: boolean; message: string; leader: AboutLeader }> {
    return this.http.post<{ success: boolean; message: string; leader: AboutLeader }>(`${this.API_URL}/leaders`, formData);
  }

  updateLeader(id: number, formData: FormData): Observable<{ success: boolean; message: string; leader: AboutLeader }> {
    return this.http.put<{ success: boolean; message: string; leader: AboutLeader }>(`${this.API_URL}/leaders/${id}`, formData);
  }

  deleteLeader(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.API_URL}/leaders/${id}`);
  }

  reorderLeaders(items: Array<{ id: number; order_index: number }>): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.API_URL}/leaders/reorder`, { items });
  }

  // 3. Restore / Sync Official Defaults
  seedDefaults(): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.API_URL}/seed`, {});
  }
}
