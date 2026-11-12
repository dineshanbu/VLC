import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HomePageContentResponse, HomePageSection } from '../models/home-page.model';

@Injectable({ providedIn: 'root' })
export class HomePageService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/home-page`;

  getContent(): Observable<HomePageContentResponse> {
    return this.http.get<HomePageContentResponse>(`${this.apiUrl}/content`);
  }

  updateSection(section: HomePageSection, image?: File, cardImages: Record<number, File | undefined> = {}, video?: File, imageAr?: File): Observable<{ success: boolean; message: string; section: HomePageSection }> {
    const form = new FormData();
    form.append('title', section.title);
    form.append('title_ar', section.title_ar);
    form.append('title_line2', section.title_line2 || '');
    form.append('title_line2_ar', section.title_line2_ar || '');
    form.append('badge', section.badge);
    form.append('badge_ar', section.badge_ar);
    form.append('description', section.description);
    form.append('description_ar', section.description_ar);
    form.append('image_url', section.image_url);
    form.append('image_url_ar', section.image_url_ar || section.image_url);
    form.append('video_url', section.video_url || '');
    form.append('button_text', section.button_text || '');
    form.append('button_text_ar', section.button_text_ar || '');
    form.append('button_url', section.button_url || '');
    if (image) form.append('image', image);
    if (imageAr) form.append('image_ar', imageAr);
    if (video) form.append('video', video);
    if (section.section_key === 'platform') {
      form.append('content_json', JSON.stringify(section.content_json || []));
      Object.entries(cardImages).forEach(([index, file]) => { if (file) form.append(`card_image_${index}`, file); });
    }
    return this.http.put<{ success: boolean; message: string; section: HomePageSection }>(`${this.apiUrl}/content/${section.section_key}`, form);
  }

  updateCorporateVideo(video: File): Observable<{ success: boolean; message: string; corporate_video_url: string }> {
    const form = new FormData();
    form.append('corporate_video', video);
    return this.http.put<{ success: boolean; message: string; corporate_video_url: string }>(`${this.apiUrl}/corporate-video`, form);
  }
}
