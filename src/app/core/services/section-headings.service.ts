import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, shareReplay, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LocalizedSectionHeading } from '../models/section-heading.model';

@Injectable({ providedIn: 'root' })
export class SectionHeadingsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/section-headings`;
  readonly headings = signal<Record<string, LocalizedSectionHeading>>({});
  private loaded = false;
  private request?: Observable<Record<string, LocalizedSectionHeading>>;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', event => {
        if (event.key === 'vic_section_headings_updated') this.load(true).subscribe();
      });
    }
  }

  load(force = false): Observable<Record<string, LocalizedSectionHeading>> {
    if (this.loaded && !force) return of(this.headings());
    if (this.request && !force) return this.request;
    this.request = this.http.get<{ success: boolean; headings: Record<string, LocalizedSectionHeading> }>(this.apiUrl).pipe(
      map(response => response.headings || {}),
      tap(headings => { this.headings.set(headings); this.loaded = true; }),
      catchError(() => { this.loaded = true; return of(this.headings()); }),
      shareReplay(1)
    );
    return this.request;
  }

  save(headings: Record<string, LocalizedSectionHeading>): Observable<{ success: boolean; headings: Record<string, LocalizedSectionHeading> }> {
    return this.http.put<{ success: boolean; headings: Record<string, LocalizedSectionHeading> }>(this.apiUrl, { headings }).pipe(
      tap(response => { this.headings.set(response.headings || headings); this.loaded = true; })
    );
  }

  get(key: string, englishFallback: string, arabicFallback: string, isArabic: boolean): string {
    const saved = this.headings()[key];
    const localized = isArabic ? saved?.ar : saved?.en;
    return typeof localized === 'string' ? localized : (isArabic ? arabicFallback : englishFallback);
  }
}
