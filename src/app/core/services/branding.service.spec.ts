import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { BrandingService, DEFAULT_FOOTER_SETTINGS } from './branding.service';

describe('BrandingService footer settings', () => {
  let service: BrandingService;
  let http: HttpTestingController;
  const endpoint = `${environment.apiUrl}/branding/footer`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(BrandingService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads the footer email and both language versions from the API', () => {
    service.loadFooterSettings().subscribe();
    http.expectOne(endpoint).flush({
      success: true,
      settings: { email: 'info@vaccine.com.sa', copyright_en: 'English note', copyright_ar: 'النص العربي' }
    });

    expect(service.footerSettings()).toEqual({
      ...DEFAULT_FOOTER_SETTINGS,
      email: 'info@vaccine.com.sa', copyright_en: 'English note', copyright_ar: 'النص العربي'
    });
  });

  it('saves footer settings and updates the shared footer state', () => {
    const settings = { ...DEFAULT_FOOTER_SETTINGS, copyright_en: 'New English note', copyright_ar: 'ملاحظة جديدة' };
    service.saveFooterSettings(settings).subscribe();
    const request = http.expectOne(endpoint);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(settings);
    request.flush({ success: true, message: 'Footer content saved.', settings });

    expect(service.footerSettings()).toEqual(settings);
  });
});
