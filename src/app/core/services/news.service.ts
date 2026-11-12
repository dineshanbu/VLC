import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminNewsArticle, NewsListResponse, NewsPageSettings } from '../models/news.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/news`;

  getPageSettings(): Observable<{ success: boolean; settings: NewsPageSettings }> {
    return this.http.get<{ success: boolean; settings: NewsPageSettings }>(`${this.API_URL}/settings`);
  }

  updatePageSettings(data: FormData): Observable<{ success: boolean; settings: NewsPageSettings }> {
    return this.http.put<{ success: boolean; settings: NewsPageSettings }>(`${this.API_URL}/settings`, data);
  }

  getNews(filters?: { category?: string; search?: string; status?: string }): Observable<NewsListResponse> {
    let params = new HttpParams();
    if (filters?.category && filters.category !== 'All') params = params.set('category', filters.category);
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.status && filters.status !== 'All') params = params.set('status', filters.status);

    return this.http.get<NewsListResponse>(this.API_URL, { params });
  }

  getNewsBySlugOrId(slugOrId: string | number): Observable<{ success: boolean; article: AdminNewsArticle }> {
    return this.http.get<{ success: boolean; article: AdminNewsArticle }>(`${this.API_URL}/${slugOrId}`);
  }

  createNews(formData: FormData): Observable<{ success: boolean; message: string; article: AdminNewsArticle }> {
    return this.http.post<{ success: boolean; message: string; article: AdminNewsArticle }>(this.API_URL, formData);
  }

  updateNews(id: number, formData: FormData): Observable<{ success: boolean; message: string; article: AdminNewsArticle }> {
    return this.http.put<{ success: boolean; message: string; article: AdminNewsArticle }>(`${this.API_URL}/${id}`, formData);
  }

  uploadInlineImage(formData: FormData): Observable<{ success: boolean; url: string }> {
    return this.http.post<{ success: boolean; url: string }>(`${this.API_URL}/inline-image`, formData);
  }

  translateNewsToArabic(content: { title: string; summary: string; content_html: string }): Observable<{
    success: boolean;
    translations: { title_ar: string; summary_ar: string; content_html_ar: string };
  }> {
    return this.http.post<{
      success: boolean;
      translations: { title_ar: string; summary_ar: string; content_html_ar: string };
    }>(`${this.API_URL}/translate-to-arabic`, content);
  }

  deleteNews(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.API_URL}/${id}`);
  }
}
