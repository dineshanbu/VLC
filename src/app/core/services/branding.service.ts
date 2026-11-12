import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, finalize, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { resolveImageUrl } from '../utils/image-url.util';

export type SiteLogoKey = 'header_logo' | 'footer_logo' | 'home_banner_logo';
export type SiteLogos = Record<SiteLogoKey, string>;
export type LogoDimensions = Record<SiteLogoKey, { width: number; height: number }>;

export type BrandingSettingsResponse = {
  success: boolean;
  logos: Partial<SiteLogos>;
  dimensions: LogoDimensions;
};

export type FooterQuickLink = {
  label_en: string;
  label_ar: string;
  url: string;
};

export type FooterSiteSettings = {
  email: string;
  copyright_en: string;
  copyright_ar: string;
  quick_links_title_en: string;
  quick_links_title_ar: string;
  how_we_can_help_en: string;
  how_we_can_help_ar: string;
  query_label_en: string;
  query_label_ar: string;
  address_en: string;
  address_ar: string;
  quick_links: FooterQuickLink[];
};

export type FooterSettingsResponse = { success: boolean; message?: string; settings: FooterSiteSettings };

const DEFAULT_LOGOS: SiteLogos = {
  header_logo: 'logo_navbar_white.webp',
  footer_logo: 'logo_navbar_white.webp',
  home_banner_logo: 'logo_navbar_white.webp'
};

const DEFAULT_DIMENSIONS: LogoDimensions = {
  header_logo: { width: 200, height: 50 },
  footer_logo: { width: 206, height: 80 },
  home_banner_logo: { width: 300, height: 116 }
};

export const DEFAULT_FOOTER_SETTINGS: FooterSiteSettings = {
  email: 'info@vaccine.com.sa',
  copyright_en: 'Vaccine Industrial Company (VIC). All Rights Reserved.',
  copyright_ar: 'شركة لقاح للصناعة (VIC). جميع الحقوق محفوظة.',
  quick_links_title_en: 'Quick Links',
  quick_links_title_ar: 'روابط سريعة',
  how_we_can_help_en: 'How we can help',
  how_we_can_help_ar: 'كيف يمكننا مساعدتك',
  query_label_en: 'For Query:',
  query_label_ar: 'للاستفسارات:',
  address_en: 'Building No 4180, Unit 6708, Northern Ring Branch Road, Al Wadi, Riyadh-13313, Saudi Arabia',
  address_ar: 'مبنى 4180، وحدة 6708، طريق الدائري الشمالي الفرعي، الوادي، الرياض 13313، المملكة العربية السعودية',
  quick_links: [
    { label_en: 'Home', label_ar: 'الرئيسية', url: '/' },
    { label_en: 'About Us', label_ar: 'من نحن', url: '/about' },
    { label_en: 'Products', label_ar: 'منتجاتنا', url: '/products' },
    { label_en: 'Partners', label_ar: 'شركاؤنا', url: '/partners' },
    { label_en: 'News & Media', label_ar: 'الأخبار والإعلام', url: '/news' },
    { label_en: 'Careers', label_ar: 'الوظائف', url: '/careers' },
    { label_en: 'Pharmacovigilance', label_ar: 'اليقظة الدوائية', url: '/pharmacovigilance' },
    { label_en: 'Contact Us', label_ar: 'اتصل بنا', url: '/contact' }
  ]
};

function copyFooterSettings(settings: Partial<FooterSiteSettings> = {}): FooterSiteSettings {
  return {
    ...DEFAULT_FOOTER_SETTINGS,
    ...settings,
    quick_links: (settings.quick_links ?? DEFAULT_FOOTER_SETTINGS.quick_links).map(link => ({ ...link }))
  };
}

@Injectable({ providedIn: 'root' })
export class BrandingService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiUrl}/branding/logos`;
  private readonly footerEndpoint = `${environment.apiUrl}/branding/footer`;
  readonly logos = signal<SiteLogos>({ ...DEFAULT_LOGOS });
  readonly dimensions = signal<LogoDimensions>({
    header_logo: { ...DEFAULT_DIMENSIONS.header_logo },
    footer_logo: { ...DEFAULT_DIMENSIONS.footer_logo },
    home_banner_logo: { ...DEFAULT_DIMENSIONS.home_banner_logo }
  });
  readonly isLoading = signal(false);
  readonly footerSettings = signal<FooterSiteSettings>(copyFooterSettings());
  private loaded = false;
  private footerLoaded = false;

  load(force = false): void {
    if (!this.loaded || force) this.loadSettings(force).subscribe({ error: () => undefined });
    if (!this.footerLoaded || force) this.loadFooterSettings(force).subscribe({ error: () => undefined });
  }

  loadFooterSettings(force = false): Observable<FooterSettingsResponse> {
    if (this.footerLoaded && !force) {
      return of({ success: true, settings: this.footerSettings() });
    }
    return this.http.get<FooterSettingsResponse>(this.footerEndpoint).pipe(
      tap(response => {
        this.footerSettings.set(copyFooterSettings(response.settings));
        this.footerLoaded = true;
      })
    );
  }

  saveFooterSettings(settings: FooterSiteSettings): Observable<FooterSettingsResponse> {
    return this.http.put<FooterSettingsResponse>(this.footerEndpoint, settings).pipe(
      tap(response => this.acceptSavedFooterSettings(response.settings))
    );
  }

  acceptSavedFooterSettings(settings: FooterSiteSettings): void {
    this.footerSettings.set(copyFooterSettings(settings));
    this.footerLoaded = true;
  }

  loadSettings(force = false): Observable<BrandingSettingsResponse> {
    if (this.loaded && !force) {
      return of({ success: true, logos: this.logos(), dimensions: this.dimensions() });
    }
    this.isLoading.set(true);
    return this.http.get<BrandingSettingsResponse>(this.endpoint).pipe(
      tap(response => {
        this.logos.set({ ...DEFAULT_LOGOS, ...response.logos });
        this.dimensions.set({
          header_logo: { ...DEFAULT_DIMENSIONS.header_logo, ...response.dimensions?.header_logo },
          footer_logo: { ...DEFAULT_DIMENSIONS.footer_logo, ...response.dimensions?.footer_logo },
          home_banner_logo: { ...DEFAULT_DIMENSIONS.home_banner_logo, ...response.dimensions?.home_banner_logo }
        });
        this.loaded = true;
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  save(formData: FormData) {
    return this.http.put<{ success: boolean; message: string; logos: SiteLogos; dimensions: LogoDimensions }>(this.endpoint, formData);
  }

  acceptSavedLogos(logos: SiteLogos): void {
    this.acceptSavedSettings(logos, this.dimensions());
  }

  acceptSavedSettings(logos: SiteLogos, dimensions: LogoDimensions): void {
    this.logos.set({ ...DEFAULT_LOGOS, ...logos });
    this.dimensions.set({
      header_logo: { ...DEFAULT_DIMENSIONS.header_logo, ...dimensions.header_logo },
      footer_logo: { ...DEFAULT_DIMENSIONS.footer_logo, ...dimensions.footer_logo },
      home_banner_logo: { ...DEFAULT_DIMENSIONS.home_banner_logo, ...dimensions.home_banner_logo }
    });
    this.loaded = true;
  }

  logoDimensions(key: SiteLogoKey): { width: number; height: number } {
    return this.dimensions()[key];
  }

  logo(key: SiteLogoKey): string {
    return resolveImageUrl(this.logos()[key] || DEFAULT_LOGOS[key], DEFAULT_LOGOS[key]);
  }
}
