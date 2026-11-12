import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ManufacturingPlatformContent } from '../models/manufacturing-platform.model';

@Injectable({ providedIn: 'root' })
export class ManufacturingPlatformService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/manufacturing-platform/content`;

  getContent(): Observable<{ success: boolean; content: ManufacturingPlatformContent }> {
    return this.http.get<{ success: boolean; content: ManufacturingPlatformContent }>(this.apiUrl);
  }

  saveContent(form: FormData): Observable<{ success: boolean; content: ManufacturingPlatformContent }> {
    return this.http.put<{ success: boolean; content: ManufacturingPlatformContent }>(this.apiUrl, form);
  }
}
