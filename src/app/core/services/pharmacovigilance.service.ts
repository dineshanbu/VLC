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
  ppv_title: string; ppv_title_ar: string; ppv_mobile: string; ppv_mobile_ar: string; ppv_telephone: string; ppv_telephone_ar: string; ppv_extension: string; ppv_extension_ar: string; ppv_email: string; ppv_email_ar: string;
  deputy_title: string; deputy_title_ar: string; deputy_mobile: string; deputy_mobile_ar: string; deputy_telephone: string; deputy_telephone_ar: string; deputy_extension: string; deputy_extension_ar: string; deputy_email: string; deputy_email_ar: string;
  form_prompt: string; form_prompt_ar: string;
  form_eyebrow: string; form_eyebrow_ar: string; form_title: string; form_title_ar: string;
  form_subtitle: string; form_subtitle_ar: string; success_title: string; success_title_ar: string;
  success_text: string; success_text_ar: string; security_note: string; security_note_ar: string;
}

export const DEFAULT_PHARMACOVIGILANCE_CONTACTS = {
  ppv_title: 'PPV', ppv_title_ar: 'مسؤول اليقظة الدوائية',
  ppv_mobile: '+966 558927904', ppv_mobile_ar: '+966 558927904', ppv_telephone: '011 491 7984', ppv_telephone_ar: '011 491 7984', ppv_extension: '105', ppv_extension_ar: '105', ppv_email: 'Narmeen.pv@vaccine.com.sa', ppv_email_ar: 'Narmeen.pv@vaccine.com.sa',
  deputy_title: 'Deputy', deputy_title_ar: 'نائب مسؤول اليقظة الدوائية',
  deputy_mobile: '+966 570062533', deputy_mobile_ar: '+966 570062533', deputy_telephone: '011 491 7984', deputy_telephone_ar: '011 491 7984', deputy_extension: '134', deputy_extension_ar: '134', deputy_email: 'Afaf.pv@vaccine.com.sa', deputy_email_ar: 'Afaf.pv@vaccine.com.sa',
};

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
