import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface PharmacovigilanceReport {
  id?: number; reporter_name: string | null; patient_name?: string | null; contact_number: string; email?: string; product_name: string; batch_number?: string | null; expiration_date?: string | null; occupation?: string;
  side_effect_description: string; other_info?: string; status: 'New' | 'Under Review' | 'Follow-up Required' | 'Closed'; notes?: string; created_at?: string;
}

export interface PharmacovigilancePageSettings {
  hero_eyebrow: string; hero_eyebrow_ar: string;
  hero_title_line1: string; hero_title_line1_ar: string; hero_title_line2: string; hero_title_line2_ar: string;
  hero_description: string; hero_description_ar: string; hero_cta: string; hero_cta_ar: string; hero_image: string; hero_image_ar?: string;
  channels_eyebrow: string; channels_eyebrow_ar: string; channels_title: string; channels_title_ar: string;
  channels_intro: string; channels_intro_ar: string;
  email_title: string; email_title_ar: string; email_address: string; email_note: string; email_note_ar: string;
  phone1_title: string; phone1_title_ar: string; phone1_number: string; phone1_note: string; phone1_note_ar: string;
  phone2_title: string; phone2_title_ar: string; phone2_number: string; phone2_note: string; phone2_note_ar: string;
  form_prompt: string; form_prompt_ar: string;
  form_eyebrow: string; form_eyebrow_ar: string; form_title: string; form_title_ar: string;
  form_subtitle: string; form_subtitle_ar: string; success_title: string; success_title_ar: string;
  success_text: string; success_text_ar: string; security_note: string; security_note_ar: string;
}

@Injectable({ providedIn: 'root' })
export class PharmacovigilanceService {
  private http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/pharmacovigilance`;
  getPageSettings() {
    return this.http.get<{ success: boolean; settings: PharmacovigilancePageSettings }>(`${this.url}/settings`);
  }
  updatePageSettings(data: FormData) {
    return this.http.put<{ success: boolean; settings: PharmacovigilancePageSettings }>(`${this.url}/settings`, data);
  }
  submitReport(report: { reporterName: string; patientName: string; contactNumber: string; email: string; productName: string; batchNumber: string; expirationDate: string; occupation: string; sideEffectDescription: string; otherInfo: string }) {
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
  deleteReport(id: number) {
    return this.http.delete<{ success: boolean; message: string }>(`${this.url}/${id}`);
  }
}
