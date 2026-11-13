import { Component, ElementRef, HostListener, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product, ProductPageSettings } from '../../../../../core/models/product.model';
import { Partner } from '../../../../../core/models/partner.model';
import { ProductService } from '../../../../../core/services/product.service';
import { PartnerService } from '../../../../../core/services/partner.service';
import { TranslationService } from '../../../../../core/services/translation.service';
import { resolveImageUrl } from '../../../../../core/utils/image-url.util';
import { SectionHeadingPipe } from '../../../../../shared/pipes/section-heading.pipe';

@Component({
  selector: 'app-home-showcase',
  imports: [RouterLink, SectionHeadingPipe],
  templateUrl: './home-showcase.html',
  styleUrl: './home-showcase.css'
})
export class HomeShowcaseComponent implements OnInit {
  @ViewChild('partnerCarousel') private partnerCarousel?: ElementRef<HTMLElement>;
  @ViewChild('cslIntroVideoPlayer') private cslIntroVideoPlayer?: ElementRef<HTMLVideoElement>;

  readonly translationService = inject(TranslationService);
  private readonly productService = inject(ProductService);
  private readonly partnerService = inject(PartnerService);

  readonly product = signal<Product | null>({
    id: 0, product_code: 'flucelvax', category: 'our-products', name: 'Flucelvax®', name_ar: 'فلوسيلفاكس®',
    subtitle: 'Influenza vaccine', image: 'flucelvax_featured-cutout.webp',
    description: 'Flucelvax® is a next-generation, cell culture-based influenza vaccine designed to help protect against seasonal flu.',
    description_ar: 'فلوسيلفاكس® لقاح إنفلونزا من الجيل الجديد قائم على زراعة الخلايا للمساعدة في الحماية من الإنفلونزا الموسمية.',
    features: ['Cell culture-based vaccine', 'Egg-free manufacturing process', 'High purity and consistent quality'],
    features_ar: ['لقاح قائم على زراعة الخلايا', 'عملية تصنيع خالية من البيض', 'نقاء عالٍ وجودة متسقة'],
    specs: [], storage: [], gallery: [], resources: [], order_index: 0, status: 'Active'
  });
  readonly partners = signal<Partner[]>([
    { name: 'Uhlmann Group', logo: 'uhlmann-logo.webp', category: 'Technology', tier: 'Partner', description: '', order_index: 0, status: 'Active' },
    { name: 'CSL Seqirus', logo: 'cslseqirus_1_logo-e1761739712420.webp', category: 'Vaccine', tier: 'Partner', description: '', order_index: 1, status: 'Active' },
    { name: 'Baylor College of Medicine', logo: 'bcm.webp', category: 'Research', tier: 'Partner', description: '', order_index: 2, status: 'Active' }
  ]);
  readonly activePartnerIndex = signal(0);
  readonly pageSettings = signal<ProductPageSettings | null>(null);
  readonly cslIntroVideoUrl = signal('');
  readonly isCslIntroVideoOpen = signal(false);
  readonly cslIntroVideoModalUrl = signal('');

  get cslPartnerLogo(): string {
    const s = this.pageSettings();
    if (s?.csl_logo === '') return '';
    return resolveImageUrl(s?.csl_logo || 'cslseqirus_1_logo-e1761739712420.webp');
  }

  get cslPartnerTitle(): string {
    const s = this.pageSettings();
    const isAr = this.translationService.isRtl();
    if (!s) return isAr ? 'شريك نقل التقنية' : 'Technology Transfer Partner';
    const val = isAr ? s.csl_partner_title_ar : s.csl_partner_title;
    return val !== undefined && val !== null ? val : (isAr ? 'شريك نقل التقنية' : 'Technology Transfer Partner');
  }

  get cslPartnerDescription(): string {
    const s = this.pageSettings();
    const isAr = this.translationService.isRtl();
    if (!s) return isAr ? 'شريك نقل التقنية للتوطين الكامل للقاح الإنفلونزا الموسمية والاستجابة للأوبئة.' : 'Technology transfer partner for full localization of seasonal influenza and pandemic response.';
    const val = isAr ? s.csl_partner_description_ar : s.csl_partner_description;
    return val !== undefined && val !== null ? val : (isAr ? 'شريك نقل التقنية للتوطين الكامل للقاح الإنفلونزا الموسمية والاستجابة للأوبئة.' : 'Technology transfer partner for full localization of seasonal influenza and pandemic response.');
  }

  get cslBtnAboutLabel(): string {
    const s = this.pageSettings();
    const isAr = this.translationService.isRtl();
    if (s) {
      const val = isAr ? s.csl_btn_about_ar : s.csl_btn_about_en;
      if (val !== undefined && val !== null) return val;
    }
    return isAr ? 'مصانع CSL' : 'About CSL';
  }

  get cslBtnFacilityLabel(): string {
    const s = this.pageSettings();
    const isAr = this.translationService.isRtl();
    if (s) {
      const val = isAr ? s.csl_btn_facility_ar : s.csl_btn_facility_en;
      if (val !== undefined && val !== null) return val;
    }
    return isAr ? 'CSL مصانع' : 'CSL Facility';
  }

  readonly productName = computed(() => {
    const product = this.product();
    return this.translationService.isRtl() && product?.name_ar ? product.name_ar : product?.name || '';
  });

  readonly productDescription = computed(() => {
    const product = this.product();
    return this.translationService.isRtl() && product?.description_ar
      ? product.description_ar
      : product?.description || '';
  });

  readonly productFeatures = computed(() => {
    const product = this.product();
    const features = this.translationService.isRtl() && product?.features_ar?.length
      ? product.features_ar
      : product?.features;
    return (features || []).slice(0, 3).map(feature => feature.replace(/\bMDCK\b/gi, '').replace(/\s{2,}/g, ' ').trim());
  });
  readonly cslAboutVideoUrl = signal('');
  readonly isAboutCslVideoOpen = signal(false);

  ngOnInit(): void {
    this.loadCslIntroVideo();
    this.productService.getProducts({ category: 'our-products', status: 'Active' }).subscribe({
      next: response => {
        const apiProduct = response.products?.[0];
        if (response.success && apiProduct) {
          const fallbackProduct = this.product();
          this.product.set({
            ...apiProduct,
            // Keep the homepage checklist visible when its API record has no points configured.
            features: apiProduct.features?.length ? apiProduct.features : (fallbackProduct?.features || []),
            features_ar: apiProduct.features_ar?.length ? apiProduct.features_ar : fallbackProduct?.features_ar
          });
        }
      },
      error: () => { /* Keep the reference content available when the API is unreachable. */ }
    });

    this.partnerService.getPartners({ status: 'Active' }).subscribe({
      next: response => {
        if (response.success) this.partners.set((response.partners || []).slice(0, 3));
      },
      error: () => { /* Keep the reference partners during a network outage. */ }
    });
  }

  @HostListener('window:storage', ['$event'])
  onPartnerStorageChange(event: StorageEvent): void {
    if (event.key === 'vic_partners_updated') {
      this.partnerService.getPartners({ status: 'Active' }).subscribe({
        next: response => {
          if (response.success) this.partners.set((response.partners || []).slice(0, 3));
        }
      });
    }
    if (event.key === 'vic_products_page_updated') this.loadCslIntroVideo();
  }

  loadCslIntroVideo(): void {
    this.productService.getPageSettings().subscribe({
      next: response => {
        const s = response.settings;
        this.pageSettings.set(s);
        this.cslIntroVideoUrl.set(resolveImageUrl(s?.csl_intro_video || ''));
        this.cslAboutVideoUrl.set(resolveImageUrl(s?.csl_about_video || ''));
      },
      error: () => {
        this.pageSettings.set(null);
        this.cslIntroVideoUrl.set('');
        this.cslAboutVideoUrl.set('');
      }
    });
  }

  openCslIntroVideo(): void {
    this.isAboutCslVideoOpen.set(false);
    this.cslIntroVideoModalUrl.set(this.cslIntroVideoUrl());
    this.isCslIntroVideoOpen.set(true);
    if (!this.cslIntroVideoUrl()) return;
    setTimeout(() => {
      const player = this.cslIntroVideoPlayer?.nativeElement;
      if (!player) return;
      player.currentTime = 0;
      player.play().catch(() => undefined);
    });
  }

  openAboutCslVideo(): void {
    this.isAboutCslVideoOpen.set(true);
    this.cslIntroVideoModalUrl.set(this.cslAboutVideoUrl());
    this.isCslIntroVideoOpen.set(true);
    if (!this.cslAboutVideoUrl()) return;
    setTimeout(() => {
      const player = this.cslIntroVideoPlayer?.nativeElement;
      if (!player) return;
      player.currentTime = 0;
      player.play().catch(() => undefined);
    });
  }

  closeCslIntroVideo(): void {
    this.isCslIntroVideoOpen.set(false);
    this.isAboutCslVideoOpen.set(false);
    this.cslIntroVideoPlayer?.nativeElement.pause();
  }

  @HostListener('document:keydown', ['$event'])
  onCslIntroVideoKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isCslIntroVideoOpen()) this.closeCslIntroVideo();
  }

  image(path?: string | null, fallback = ''): string {
    return resolveImageUrl(path, fallback);
  }

  onPartnerScroll(event: Event): void {
    const track = event.currentTarget as HTMLElement;
    const card = track.querySelector<HTMLElement>('.home-partners__logo');
    if (!card) return;

    const styles = getComputedStyle(track);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || '0');
    const step = card.offsetWidth + gap;
    const index = Math.round(Math.abs(track.scrollLeft) / step);
    this.activePartnerIndex.set(Math.min(index, this.partners().length - 1));
  }

  movePartner(direction: -1 | 1): void {
    const total = this.partners().length;
    if (!total) return;

    const next = (this.activePartnerIndex() + direction + total) % total;
    this.scrollToPartner(next);
  }

  scrollToPartner(index: number): void {
    const track = this.partnerCarousel?.nativeElement;
    const cards = track?.querySelectorAll<HTMLElement>('.home-partners__logo');
    const card = cards?.item(index);
    if (!card) return;

    this.activePartnerIndex.set(index);
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
}
