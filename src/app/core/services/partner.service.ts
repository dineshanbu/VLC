import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  PartnerPageSettings,
  Partner,
  PartnershipSection,
  PartnershipInquiry,
  PartnerListResponse,
  SectionListResponse
} from '../models/partner.model';

@Injectable({
  providedIn: 'root'
})
export class PartnerService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:5000/api/partners';

  // 1. Page Settings
  getPageSettings(): Observable<{ success: boolean; settings: PartnerPageSettings }> {
    return this.http.get<{ success: boolean; settings: PartnerPageSettings }>(`${this.API_URL}/settings`);
  }

  updatePageSettings(formData: FormData): Observable<{ success: boolean; message: string; settings: PartnerPageSettings }> {
    return this.http.put<{ success: boolean; message: string; settings: PartnerPageSettings }>(`${this.API_URL}/settings`, formData);
  }

  // 2. Strategic Partners
  getPartners(filters?: { tier?: string; category?: string; status?: string; search?: string }): Observable<PartnerListResponse> {
    let params = new HttpParams();
    if (filters?.tier && filters.tier !== 'All') params = params.set('tier', filters.tier);
    if (filters?.category && filters.category !== 'All') params = params.set('category', filters.category);
    if (filters?.status && filters.status !== 'All') params = params.set('status', filters.status);
    if (filters?.search) params = params.set('search', filters.search);

    return this.http.get<PartnerListResponse>(this.API_URL, { params });
  }

  getPartnerById(id: number): Observable<{ success: boolean; partner: Partner }> {
    return this.http.get<{ success: boolean; partner: Partner }>(`${this.API_URL}/${id}`);
  }

  createPartner(formData: FormData): Observable<{ success: boolean; message: string; partner: Partner }> {
    return this.http.post<{ success: boolean; message: string; partner: Partner }>(this.API_URL, formData);
  }

  updatePartner(id: number, formData: FormData): Observable<{ success: boolean; message: string; partner: Partner }> {
    return this.http.put<{ success: boolean; message: string; partner: Partner }>(`${this.API_URL}/${id}`, formData);
  }

  deletePartner(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.API_URL}/${id}`);
  }

  reorderPartners(items: Array<{ id: number; order_index: number }>): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.API_URL}/reorder`, { items });
  }

  // 3. Dynamic Sections
  getSections(filters?: { status?: string; section_key?: string }): Observable<SectionListResponse> {
    let params = new HttpParams();
    if (filters?.status && filters.status !== 'All') params = params.set('status', filters.status);
    if (filters?.section_key) params = params.set('section_key', filters.section_key);

    return this.http.get<SectionListResponse>(`${this.API_URL}/sections`, { params });
  }

  createSection(formData: FormData): Observable<{ success: boolean; message: string; section: PartnershipSection }> {
    return this.http.post<{ success: boolean; message: string; section: PartnershipSection }>(`${this.API_URL}/sections`, formData);
  }

  updateSection(id: number, formData: FormData): Observable<{ success: boolean; message: string; section: PartnershipSection }> {
    return this.http.put<{ success: boolean; message: string; section: PartnershipSection }>(`${this.API_URL}/sections/${id}`, formData);
  }

  deleteSection(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.API_URL}/sections/${id}`);
  }

  // 4. Partnership Inquiries
  submitInquiry(data: Partial<PartnershipInquiry>): Observable<{ success: boolean; message: string; inquiry_id: number }> {
    return this.http.post<{ success: boolean; message: string; inquiry_id: number }>(`${this.API_URL}/inquiries`, data);
  }

  getInquiries(filters?: { status?: string; category?: string; search?: string }): Observable<{ success: boolean; count: number; inquiries: PartnershipInquiry[] }> {
    let params = new HttpParams();
    if (filters?.status && filters.status !== 'All') params = params.set('status', filters.status);
    if (filters?.category && filters.category !== 'All') params = params.set('category', filters.category);
    if (filters?.search) params = params.set('search', filters.search);

    return this.http.get<{ success: boolean; count: number; inquiries: PartnershipInquiry[] }>(`${this.API_URL}/inquiries/all`, { params });
  }

  updateInquiryStatus(id: number, status: string, notes?: string): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.API_URL}/inquiries/${id}/status`, { status, notes });
  }

  deleteInquiry(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.API_URL}/inquiries/${id}`);
  }

  // 5. Seed / Sync Defaults
  seedDefaults(): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.API_URL}/seed`, {});
  }
}
