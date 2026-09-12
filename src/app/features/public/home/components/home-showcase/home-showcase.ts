import { Component, ElementRef, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../../../../core/models/product.model';
import { Partner } from '../../../../../core/models/partner.model';
import { ProductService } from '../../../../../core/services/product.service';
import { PartnerService } from '../../../../../core/services/partner.service';
import { TranslationService } from '../../../../../core/services/translation.service';
import { resolveImageUrl } from '../../../../../core/utils/image-url.util';

@Component({
  selector: 'app-home-showcase',
  imports: [RouterLink],
  templateUrl: './home-showcase.html',
  styleUrl: './home-showcase.css'
})
export class HomeShowcaseComponent implements OnInit {
  @ViewChild('partnerCarousel') private partnerCarousel?: ElementRef<HTMLElement>;

  readonly translationService = inject(TranslationService);
  private readonly productService = inject(ProductService);
  private readonly partnerService = inject(PartnerService);

  readonly product = signal<Product | null>({
    id: 0, product_code: 'flucelvax', category: 'our-products', name: 'Flucelvax®', name_ar: 'فلوسيلفاكس®',
    subtitle: 'Influenza vaccine', image: 'flucelvax_featured-cutout.png',
    description: 'Flucelvax® is a next-generation, cell culture-based influenza vaccine designed to help protect against seasonal flu.',
    description_ar: 'فلوسيلفاكس® لقاح إنفلونزا من الجيل الجديد قائم على زراعة الخلايا للمساعدة في الحماية من الإنفلونزا الموسمية.',
    features: ['Produced in MDCK cell culture', 'Egg-free manufacturing process', 'High purity and consistent quality'],
    features_ar: ['يُنتج في خلايا MDCK', 'عملية تصنيع خالية من البيض', 'نقاء عالٍ وجودة متسقة'],
    specs: [], storage: [], gallery: [], resources: [], order_index: 0, status: 'Active'
  });
  readonly partners = signal<Partner[]>([
    { name: 'Uhlmann Group', logo: 'uhlmann-logo.png', category: 'Technology', tier: 'Partner', description: '', order_index: 0, status: 'Active' },
    { name: 'CSL Seqirus', logo: 'CSLSeqirus_1_logo-e1761739712420.png', category: 'Vaccine', tier: 'Partner', description: '', order_index: 1, status: 'Active' },
    { name: 'Baylor College of Medicine', logo: 'bcm.png', category: 'Research', tier: 'Partner', description: '', order_index: 2, status: 'Active' }
  ]);
  readonly activePartnerIndex = signal(0);

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
    return (features || []).slice(0, 3);
  });

  ngOnInit(): void {
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
