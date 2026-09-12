import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface PharmacovigilanceReport {
  id?: number; reporter_name: string; contact_number: string; email?: string; product_name: string; occupation?: string;
  side_effect_description: string; other_info?: string; status: 'New' | 'Under Review' | 'Follow-up Required' | 'Closed'; notes?: string; created_at?: string;
}

@Injectable({ providedIn: 'root' })
export class PharmacovigilanceService {
  private http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/pharmacovigilance`;
  submitReport(report: { reporterName: string; contactNumber: string; email: string; productName: string; occupation: string; sideEffectDescription: string; otherInfo: string }) {
    return this.http.post<{ success: boolean; reportId: number }>(this.url, report);
  }
  getReports(filters?: { status?: string; search?: string }) {
    let params = new HttpParams();
    if (filters?.status && filters.status !== 'All') params = params.set('status', filters.status);
    if (filters?.search) params = params.set('search', filters.search);
    return this.http.get<{ success: boolean; count: number; reports: PharmacovigilanceReport[] }>(this.url, { params });
  }
  updateReport(id: number, data: Partial<PharmacovigilanceReport>) {
    return this.http.put<{ success: boolean }>(`${this.url}/${id}`, data);
  }
}
