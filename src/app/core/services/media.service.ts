import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MediaItem, MediaListResponse } from '../models/media.model';

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:5000/api/media';

  getMedia(filters?: { category?: string; format?: string; search?: string }): Observable<MediaListResponse> {
    let params = new HttpParams();
    if (filters?.category && filters.category !== 'All') params = params.set('category', filters.category);
    if (filters?.format && filters.format !== 'All') params = params.set('format', filters.format);
    if (filters?.search) params = params.set('search', filters.search);

    return this.http.get<MediaListResponse>(this.API_URL, { params });
  }

  uploadMedia(formData: FormData): Observable<{ success: boolean; message: string; media: MediaItem }> {
    return this.http.post<{ success: boolean; message: string; media: MediaItem }>(`${this.API_URL}/upload`, formData);
  }

  deleteMedia(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.API_URL}/${id}`);
  }
}
