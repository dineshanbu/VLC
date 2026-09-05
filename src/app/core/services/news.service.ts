import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminNewsArticle, NewsListResponse } from '../models/news.model';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:5000/api/news';

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

  deleteNews(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.API_URL}/${id}`);
  }
}
