import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContactInquiry, ContactListResponse, ContactSubmissionPayload } from '../models/contact.model';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:5000/api/contacts';

  // Public submission method (used on main website /contact)
  submitInquiry(payload: ContactSubmissionPayload): Observable<{ success: boolean; message: string; inquiryId?: number }> {
    return this.http.post<{ success: boolean; message: string; inquiryId?: number }>(this.API_URL, payload);
  }

  // Admin query inquiries
  getInquiries(filters?: { status?: string; starred?: boolean; search?: string }): Observable<ContactListResponse> {
    let params = new HttpParams();
    if (filters?.status && filters.status !== 'All') params = params.set('status', filters.status);
    if (filters?.starred) params = params.set('starred', '1');
    if (filters?.search) params = params.set('search', filters.search);

    return this.http.get<ContactListResponse>(this.API_URL, { params });
  }

  getInquiryById(id: number): Observable<{ success: boolean; inquiry: ContactInquiry }> {
    return this.http.get<{ success: boolean; inquiry: ContactInquiry }>(`${this.API_URL}/${id}`);
  }

  updateInquiry(id: number, data: Partial<ContactInquiry>): Observable<{ success: boolean; message: string; inquiry: ContactInquiry }> {
    return this.http.put<{ success: boolean; message: string; inquiry: ContactInquiry }>(`${this.API_URL}/${id}`, data);
  }

  deleteInquiry(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.API_URL}/${id}`);
  }
}
