import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BrandingService, DEFAULT_FOOTER_SETTINGS } from '../../../core/services/branding.service';
import { TranslationService } from '../../../core/services/translation.service';
import { FooterComponent } from './footer';

describe('FooterComponent editable bilingual content', () => {
  let fixture: ComponentFixture<FooterComponent>;
  let rtl = false;

  beforeEach(async () => {
    const branding = {
      footerSettings: signal({
        ...DEFAULT_FOOTER_SETTINGS,
        quick_links: DEFAULT_FOOTER_SETTINGS.quick_links.map(link => ({ ...link }))
      }),
      load: jasmine.createSpy('load'),
      logo: () => 'logo_navbar_white.webp'
    };
    rtl = false;

    await TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [
        provideRouter([]),
        { provide: BrandingService, useValue: branding },
        { provide: TranslationService, useValue: { isRtl: () => rtl } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    fixture.detectChanges();
  });

  afterEach(() => fixture?.destroy());

  it('renders all eight default quick links and English footer settings', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll('.footer__list--nav .footer__link').length).toBe(8);
    expect(element.textContent).toContain('Quick Links');
    expect(element.textContent).toContain('How we can help');
    expect(element.textContent).toContain('For Query:');
    expect(element.textContent).toContain('info@vaccine.com.sa');
    expect(element.textContent).toContain(DEFAULT_FOOTER_SETTINGS.address_en);
    expect(element.textContent).toContain(DEFAULT_FOOTER_SETTINGS.copyright_en);
  });

  it('renders Arabic labels, links, address and copyright when the site language is Arabic', () => {
    rtl = true;
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('روابط سريعة');
    expect(element.textContent).toContain('كيف يمكننا مساعدتك');
    expect(element.textContent).toContain('للاستفسارات:');
    expect(element.textContent).toContain('الرئيسية');
    expect(element.textContent).toContain(DEFAULT_FOOTER_SETTINGS.address_ar);
    expect(element.textContent).toContain(DEFAULT_FOOTER_SETTINGS.copyright_ar);
  });
});
