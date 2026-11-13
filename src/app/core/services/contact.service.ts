import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ContactInquiry, ContactListResponse, ContactSubmissionPayload } from '../models/contact.model';
import { environment } from '../../../environments/environment';

const OFFICIAL_OFFICE_MAP_URL = 'https://www.google.com/maps?cid=13164615357253241384';
const LEGACY_OFFICE_MAP_URL = 'https://maps.google.com/?q=Building+No+4180,+Unit+6708,+Northern+Ring+Branch+Road,+Al+Wadi,+Riyadh+13313,+Saudi+Arabia';
const PREVIOUS_SHORT_OFFICE_MAP_URL = 'https://maps.app.goo.gl/3CUKTyr1EzHr7JSG7';

export interface ContactPageSettings {
  hero_eyebrow: string; hero_eyebrow_ar: string; hero_title: string; hero_title_ar: string;
  hero_title_accent: string; hero_title_accent_ar: string; hero_description: string; hero_description_ar: string;
  hero_email: string; hero_phone: string; hero_phone_ar?: string; hero_image: string; hero_image_ar?: string;
  form_eyebrow: string; form_eyebrow_ar: string; form_title: string; form_title_ar: string;
  success_title: string; success_title_ar: string; success_text: string; success_text_ar: string;
  security_note: string; security_note_ar: string;
  locations_eyebrow: string; locations_eyebrow_ar: string; office_eyebrow: string; office_eyebrow_ar: string;
  office_title: string; office_title_ar: string; office_address: string; office_address_ar: string;
  office_map_url: string; office_phone: string; office_image: string;
  facility_eyebrow: string; facility_eyebrow_ar: string; facility_title: string; facility_title_ar: string; facility_address: string; facility_address_ar: string;
  facility_map_url: string; facility_image: string; facility_directions_text: string; facility_directions_text_ar: string;
  inquiries_title: string; inquiries_title_ar: string;
  inquiries_email: string; inquiries_note: string; inquiries_note_ar: string; directions_text: string; directions_text_ar: string;
}

export const DEFAULT_CONTACT_PAGE_SETTINGS: ContactPageSettings = {
  hero_eyebrow: 'Connect with VIC', hero_eyebrow_ar: 'تواصل مع VIC',
  hero_title: "Let's Connect.", hero_title_ar: 'لنتواصل.',
  hero_title_accent: "Let's Create Impact.", hero_title_accent_ar: 'لنصنع أثراً معاً.',
  hero_description: "We are always open to conversations, collaborations, and opportunities to advance global health together. Reach out to our team — we'd love to hear from you.",
  hero_description_ar: 'نحن نرحب دائمًا بالحوار والتعاون والفرص المشتركة للنهوض بالصحة العالمية معًا. تواصل مع فريقنا - يسعدنا أن نسمع منك.',
  hero_email: 'admin@vaccine.com.sa', hero_phone: '+966 11 491 7984', hero_phone_ar: '+966 11 491 7984', hero_image: 'banner_for_all2.webp', hero_image_ar: 'banner_for_all2.webp',
  form_eyebrow: 'SEND US A MESSAGE', form_eyebrow_ar: 'أرسل لنا رسالة', form_title: 'How can we help you?', form_title_ar: 'كيف يمكننا مساعدتك؟',
  success_title: 'Message Sent Successfully', success_title_ar: 'تم إرسال الرسالة بنجاح',
  success_text: 'Our team has received your message and will respond within one business day.', success_text_ar: 'لقد استلم فريقنا رسالتك وسنرد عليك خلال يوم عمل واحد.',
  security_note: 'Your information is secure and will only be used to respond to your inquiry.', security_note_ar: 'معلوماتك آمنة ولن تُستخدم إلا للرد على استفسارك.',
  locations_eyebrow: 'OUR LOCATIONS', locations_eyebrow_ar: 'مواقعنا', office_eyebrow: 'VISIT VIC', office_eyebrow_ar: 'قم بزيارة VIC',
  office_title: 'Vaccine Industrial Company (Head Office)', office_title_ar: 'شركة اللقاحات الصناعية (المكتب الرئيسي)',
  office_address: 'Building No 4180, Unit 6708, Northern Ring Branch Road, Al Wadi, Riyadh 13313, Saudi Arabia',
  office_address_ar: 'مبنى رقم 4180، وحدة 6708، طريق الدائري الشمالي الفرعي، حي الوادي، الرياض 13313، المملكة العربية السعودية',
  office_map_url: OFFICIAL_OFFICE_MAP_URL,
  office_image: 'layered-glass-vaccine-building-card.png',
  facility_eyebrow: 'SUDAIR CITY, RIYADH REGION', facility_eyebrow_ar: 'مدينة سدير، منطقة الرياض',
  facility_title: 'VIC (Manufacturing Facility)', facility_title_ar: 'منشأة VIC للتصنيع',
  facility_address: 'Location: Sudair City for Industry and Businesses\nCity: Sudair – Riyadh Region\nCountry: Kingdom of Saudi Arabia',
  facility_address_ar: 'الموقع: مدينة سدير للصناعة والأعمال\nالمدينة: سدير – منطقة الرياض\nالمملكة العربية السعودية',
  facility_map_url: 'https://www.google.com/maps/search/?api=1&query=Sudair+City+for+Industry+and+Businesses',
  facility_image: 'layered-glass-vaccine-building-card.png',
  facility_directions_text: 'View Location', facility_directions_text_ar: 'عرض رابط الموقع',
  office_phone: '+966 11 491 7984', inquiries_title: 'General Inquiries', inquiries_title_ar: 'الاستفسارات العامة',
  inquiries_email: 'admin@vaccine.com.sa', inquiries_note: 'Corporate Communications Desk', inquiries_note_ar: 'مكتب الاتصالات المؤسسية',
  directions_text: 'Open directions', directions_text_ar: 'افتح الاتجاهات'
};

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/contacts`;

  getPageSettings(): Observable<{ success: boolean; settings: ContactPageSettings }> {
    return this.http.get<{ success: boolean; settings: ContactPageSettings }>(`${this.API_URL}/settings`).pipe(
      map(response => {
        const settings = { ...DEFAULT_CONTACT_PAGE_SETTINGS, ...response.settings };
        if (!settings.office_map_url || [LEGACY_OFFICE_MAP_URL, PREVIOUS_SHORT_OFFICE_MAP_URL].includes(settings.office_map_url)) {
          settings.office_map_url = OFFICIAL_OFFICE_MAP_URL;
        }
        return { ...response, settings };
      })
    );
  }

  updatePageSettings(data: FormData): Observable<{ success: boolean; settings: ContactPageSettings }> {
    return this.http.put<{ success: boolean; settings: ContactPageSettings }>(`${this.API_URL}/settings`, data);
  }

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
