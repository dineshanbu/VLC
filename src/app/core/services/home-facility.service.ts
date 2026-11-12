import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HomeFacilityContent, HomeFacilityImage, HomeFacilityResponse } from '../models/home-facility.model';

@Injectable({ providedIn: 'root' })
export class HomeFacilityService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/home-facilities`;
  getImages(): Observable<HomeFacilityResponse> { return this.http.get<HomeFacilityResponse>(this.apiUrl); }
  getContent(): Observable<{ success: boolean; content: HomeFacilityContent }> { return this.http.get<{ success: boolean; content: HomeFacilityContent }>(`${this.apiUrl}/content`); }
  getManageImages(): Observable<HomeFacilityResponse> { return this.http.get<HomeFacilityResponse>(`${this.apiUrl}/manage`); }
  updateContent(content: HomeFacilityContent): Observable<{ success: boolean; content: HomeFacilityContent }> { return this.http.put<{ success: boolean; content: HomeFacilityContent }>(`${this.apiUrl}/content`, content); }
  createImage(data: FormData): Observable<{ success: boolean; image: HomeFacilityImage }> { return this.http.post<{ success: boolean; image: HomeFacilityImage }>(this.apiUrl, data); }
  updateImage(id: number, data: FormData): Observable<{ success: boolean; image: HomeFacilityImage }> { return this.http.put<{ success: boolean; image: HomeFacilityImage }>(`${this.apiUrl}/${id}`, data); }
  reorder(items: Array<{ id: number; order_index: number }>): Observable<{ success: boolean }> { return this.http.post<{ success: boolean }>(`${this.apiUrl}/reorder`, { items }); }
  deleteImage(id: number): Observable<{ success: boolean }> { return this.http.delete<{ success: boolean }>(`${this.apiUrl}/${id}`); }
}
