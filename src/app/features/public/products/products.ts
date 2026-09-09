import { Component, signal, HostListener, OnInit, OnDestroy, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslationService } from '../../../core/services/translation.service';
import { ProductService } from '../../../core/services/product.service';
import { Product as ProductModel, ProductPageSettings } from '../../../core/models/product.model';
import { resolveImageUrl } from '../../../core/utils/image-url.util';

export interface ProductResource {
  name: string;
  type: string;
  size: string;
  icon: 'document' | 'prescribing' | 'patient' | 'certificate';
}

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  featuredImage?: string;
  description: string;
  features: string[];
  specs: { label: string; value: string }[];
  storage: { label: string; value: string }[];
  indication_desc?: string;
  indication_target?: string;
  indication_route?: string;
  indication_items?: { label: string; value: string }[];
  gallery: string[];
  resources: ProductResource[];
}

@Component({
  selector: 'app-products',
  imports: [RouterLink],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class ProductsComponent implements OnInit, OnDestroy {
  readonly translationService = inject(TranslationService);
  private readonly productService = inject(ProductService);

  resolveImg(path: string | undefined | null, fallback = 'flucelvax_featured.png'): string {
    if (!path || !path.trim() || path === 'prodcut_home.jpg') return fallback;
    const resolved = resolveImageUrl(path, fallback);
    return resolved || fallback;
  }

  onHeroImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img && !img.src.endsWith('home_banner.png')) {
      img.src = 'home_banner.png';
    }
  }

  readonly dynamicApiProducts = signal<ProductModel[]>([]);
  readonly dynamicPageResources = signal<ProductResource[]>([]);
  readonly dynamicPageSettings = signal<ProductPageSettings | null>(null);

  // Top Section Tabs: 'Our Products' vs 'Future Portfolio'
  readonly activeSectionTab = signal<'our-products' | 'future-portfolio'>('our-products');

  // Active Product Index in the Featured Showcase Carousel
  readonly activeProductIndex = signal(0);
  private autoplayTimer?: ReturnType<typeof setInterval>;
  private isUserInteracting = false;

  // Touch / Swipe State
  private touchStartX = 0;
  private touchEndX = 0;

  // Modal State (Preserved 100%)
  readonly isModalOpen = signal(false);
  readonly selectedProduct = signal<Product | null>(null);
  readonly activeThumbnailIndex = signal(0);
  readonly activeTab = signal('Overview');

  readonly tabs = computed(() => [
    this.translationService.translate('products.modal.tab.overview'),
    this.translationService.translate('products.modal.tab.specification'),
    this.translationService.translate('products.modal.tab.indication'),
    this.translationService.translate('products.modal.tab.storage'),
    this.translationService.translate('products.modal.tab.documents')
  ]);

  // Page Settings Dynamic Computeds with RTL / Arabic & English fallback
  readonly heroTitlePart1 = computed(() => {
    const s = this.dynamicPageSettings();
    const isAr = this.translationService.isRtl();
    if (s) {
      if (isAr && s.hero_title_part1_ar) return s.hero_title_part1_ar;
      if (s.hero_title_part1) return s.hero_title_part1;
    }
    return this.translationService.translate('products.hero.titlePart1');
  });

  readonly heroTitlePart2 = computed(() => {
    const s = this.dynamicPageSettings();
    const isAr = this.translationService.isRtl();
    if (s) {
      if (isAr && s.hero_title_part2_ar !== undefined) return s.hero_title_part2_ar;
      if (s.hero_title_part2 !== undefined) return s.hero_title_part2;
    }
    return this.translationService.translate('products.hero.titlePart2');
  });

  readonly heroTitleAccent = computed(() => {
    const s = this.dynamicPageSettings();
    const isAr = this.translationService.isRtl();
    if (s) {
      if (isAr && s.hero_title_accent_ar) return s.hero_title_accent_ar;
      if (s.hero_title_accent) return s.hero_title_accent;
    }
    return this.translationService.translate('products.hero.titleAccent');
  });

  readonly heroDescription = computed(() => {
    const s = this.dynamicPageSettings();
    const isAr = this.translationService.isRtl();
    if (s) {
      if (isAr && s.hero_description_ar) return s.hero_description_ar;
      if (s.hero_description) return s.hero_description;
    }
    return this.translationService.translate('products.hero.desc');
  });

  readonly sectionEyebrow = computed(() => {
    const s = this.dynamicPageSettings();
    const isAr = this.translationService.isRtl();
    if (s) {
      if (isAr && s.section_eyebrow_ar) return s.section_eyebrow_ar;
      if (s.section_eyebrow) return s.section_eyebrow;
    }
    return this.translationService.translate('products.section.eyebrow');
  });

  readonly ctaBadge = computed(() => {
    const s = this.dynamicPageSettings();
    const isAr = this.translationService.isRtl();
    if (s) {
      if (isAr && s.cta_badge_ar) return s.cta_badge_ar;
      if (s.cta_badge) return s.cta_badge;
    }
    return this.translationService.translate('products.cta.badge');
  });

  readonly ctaTitlePart1 = computed(() => {
    const s = this.dynamicPageSettings();
    const isAr = this.translationService.isRtl();
    if (s) {
      if (isAr && s.cta_title_part1_ar) return s.cta_title_part1_ar;
      if (s.cta_title_part1) return s.cta_title_part1;
    }
    return this.translationService.translate('products.cta.titlePart1');
  });

  readonly ctaTitleAccent = computed(() => {
    const s = this.dynamicPageSettings();
    const isAr = this.translationService.isRtl();
    if (s) {
      if (isAr && s.cta_title_accent_ar) return s.cta_title_accent_ar;
      if (s.cta_title_accent) return s.cta_title_accent;
    }
    return this.translationService.translate('products.cta.titleAccent');
  });

  readonly ctaDescription = computed(() => {
    const s = this.dynamicPageSettings();
    const isAr = this.translationService.isRtl();
    if (s) {
      if (isAr && s.cta_description_ar) return s.cta_description_ar;
      if (s.cta_description) return s.cta_description;
    }
    return this.translationService.translate('products.cta.desc');
  });

  readonly ctaBtnText = computed(() => {
    const s = this.dynamicPageSettings();
    const isAr = this.translationService.isRtl();
    if (s) {
      if (isAr && s.cta_btn_text_ar) return s.cta_btn_text_ar;
      if (s.cta_btn_text) return s.cta_btn_text;
    }
    return this.translationService.translate('products.cta.btn');
  });

  readonly ctaLink = computed(() => {
    const s = this.dynamicPageSettings();
    return s?.cta_link || '/partners';
  });

  // Page-level Resources & Downloads
  readonly pageResources = computed<ProductResource[]>(() => {
    if (this.dynamicPageResources().length > 0) {
      return this.dynamicPageResources();
    }
    return [
      { name: this.translationService.translate('products.resources.item1'), type: 'PDF', size: '1.2 MB', icon: 'document' },
      { name: this.translationService.translate('products.resources.item2'), type: 'PDF', size: '1.5 MB', icon: 'prescribing' },
      { name: this.translationService.translate('products.resources.item3'), type: 'PDF', size: '0.8 MB', icon: 'patient' },
      { name: this.translationService.translate('products.resources.item4'), type: 'PDF', size: '0.6 MB', icon: 'certificate' }
    ];
  });

  // Commercial Products List
  readonly products = computed<Product[]>(() => [
    {
      id: 'flucelvax',
      name: this.translationService.translate('products.flucelvax.name'),
      subtitle: this.translationService.translate('products.flucelvax.subtitle'),
      image: 'flucelvax_featured.png',
      featuredImage: 'flucelvax_featured.png',
      description: this.translationService.translate('products.flucelvax.desc'),
      features: [
        this.translationService.translate('products.flucelvax.feat1'),
        this.translationService.translate('products.flucelvax.feat2'),
        this.translationService.translate('products.flucelvax.feat3')
      ],
      specs: [
        { label: 'Product Name', value: 'Flucelvax®' },
        { label: 'Type', value: 'Seasonal Influenza Vaccine' },
        { label: 'Technology', value: 'Cell Culture (MDCK)' },
        { label: 'Formulation', value: 'Suspension for Injection' },
        { label: 'Pack Size', value: '0.5 mL pre-filled syringe' },
        { label: 'Route of Administration', value: 'Intramuscular use' },
        { label: 'Manufacturer', value: 'Vaccine Industrial Company (VIC)' }
      ],
      storage: [
        { label: 'Storage Temperature', value: '2°C to 8°C' },
        { label: 'Do Not Freeze', value: 'Yes' },
        { label: 'Shelf Life', value: '24 Months' },
        { label: 'Protect from Light', value: 'Yes' }
      ],
      gallery: [
        'flucelvax_featured.png',
        'p4.png',
        'flucelvax_modal_main.jpg',
        'thumb_vials1.jpg'
      ],
      resources: [
        { name: 'Product Information', type: 'PDF', size: '1.2 MB', icon: 'document' },
        { name: 'Prescribing Information', type: 'PDF', size: '1.5 MB', icon: 'prescribing' },
        { name: 'Patient Information Leaflet', type: 'PDF', size: '0.8 MB', icon: 'patient' },
        { name: 'Quality Certificate', type: 'PDF', size: '0.6 MB', icon: 'certificate' }
      ]
    },
    {
      id: 'vaxigrip',
      name: this.translationService.translate('products.vaxigrip.name'),
      subtitle: this.translationService.translate('products.vaxigrip.subtitle'),
      image: 'p3.jpg',
      featuredImage: 'p3.jpg',
      description: this.translationService.translate('products.vaxigrip.desc'),
      features: [
        this.translationService.translate('products.vaxigrip.feat1'),
        this.translationService.translate('products.vaxigrip.feat2'),
        this.translationService.translate('products.vaxigrip.feat3')
      ],
      specs: [
        { label: 'Product Name', value: 'Vaxigrip®' },
        { label: 'Type', value: 'Influenza Vaccine (Split Virion)' },
        { label: 'Technology', value: 'Inactivated Split Virion' },
        { label: 'Formulation', value: 'Injectable Suspension' },
        { label: 'Pack Size', value: '0.5 mL pre-filled syringe' },
        { label: 'Route of Administration', value: 'Intramuscular / Subcutaneous' },
        { label: 'Manufacturer', value: 'Vaccine Industrial Company (VIC)' }
      ],
      storage: [
        { label: 'Storage Temperature', value: '2°C to 8°C' },
        { label: 'Do Not Freeze', value: 'Yes' },
        { label: 'Shelf Life', value: '24 Months' },
        { label: 'Protect from Light', value: 'Yes' }
      ],
      gallery: [
        'p3.jpg',
        'thumb_vials1.jpg',
        'thumb_vials2.jpg',
        'thumb_scientist.jpg'
      ],
      resources: [
        { name: 'Product Information', type: 'PDF', size: '1.2 MB', icon: 'document' },
        { name: 'Prescribing Information', type: 'PDF', size: '1.5 MB', icon: 'prescribing' },
        { name: 'Patient Information Leaflet', type: 'PDF', size: '0.8 MB', icon: 'patient' },
        { name: 'Quality Certificate', type: 'PDF', size: '0.6 MB', icon: 'certificate' }
      ]
    },
    {
      id: 'pneumovax',
      name: this.translationService.translate('products.pneumovax.name'),
      subtitle: this.translationService.translate('products.pneumovax.subtitle'),
      image: 'p2.jpg',
      featuredImage: 'p2.jpg',
      description: this.translationService.translate('products.pneumovax.desc'),
      features: [
        this.translationService.translate('products.pneumovax.feat1'),
        this.translationService.translate('products.pneumovax.feat2'),
        this.translationService.translate('products.pneumovax.feat3')
      ],
      specs: [
        { label: 'Product Name', value: 'Pneumovax®' },
        { label: 'Type', value: 'Pneumococcal Polyvalent Vaccine' },
        { label: 'Technology', value: 'Purified Capsular Polysaccharide' },
        { label: 'Formulation', value: 'Solution for Injection' },
        { label: 'Pack Size', value: '0.5 mL single-dose vial / syringe' },
        { label: 'Route of Administration', value: 'Intramuscular / Subcutaneous' },
        { label: 'Manufacturer', value: 'Vaccine Industrial Company (VIC)' }
      ],
      storage: [
        { label: 'Storage Temperature', value: '2°C to 8°C' },
        { label: 'Do Not Freeze', value: 'Yes' },
        { label: 'Shelf Life', value: '24 Months' },
        { label: 'Protect from Light', value: 'Yes' }
      ],
      gallery: [
        'p2.jpg',
        'thumb_vials1.jpg',
        'thumb_vials2.jpg',
        'thumb_scientist.jpg'
      ],
      resources: [
        { name: 'Product Information', type: 'PDF', size: '1.2 MB', icon: 'document' },
        { name: 'Prescribing Information', type: 'PDF', size: '1.5 MB', icon: 'prescribing' },
        { name: 'Patient Information Leaflet', type: 'PDF', size: '0.8 MB', icon: 'patient' },
        { name: 'Quality Certificate', type: 'PDF', size: '0.6 MB', icon: 'certificate' }
      ]
    },
    {
      id: 'rotarix',
      name: this.translationService.translate('products.rotarix.name'),
      subtitle: this.translationService.translate('products.rotarix.subtitle'),
      image: 'p1.jpg',
      featuredImage: 'p1.jpg',
      description: this.translationService.translate('products.rotarix.desc'),
      features: [
        this.translationService.translate('products.rotarix.feat1'),
        this.translationService.translate('products.rotarix.feat2'),
        this.translationService.translate('products.rotarix.feat3')
      ],
      specs: [
        { label: 'Product Name', value: 'Rotarix®' },
        { label: 'Type', value: 'Live Attenuated Rotavirus Vaccine' },
        { label: 'Technology', value: 'Human Attenuated Strain' },
        { label: 'Formulation', value: 'Oral Suspension' },
        { label: 'Pack Size', value: '1.5 mL oral applicator' },
        { label: 'Route of Administration', value: 'Oral Use Only' },
        { label: 'Manufacturer', value: 'Vaccine Industrial Company (VIC)' }
      ],
      storage: [
        { label: 'Storage Temperature', value: '2°C to 8°C' },
        { label: 'Do Not Freeze', value: 'Yes' },
        { label: 'Shelf Life', value: '24 Months' },
        { label: 'Protect from Light', value: 'Yes' }
      ],
      gallery: [
        'p1.jpg',
        'thumb_vials1.jpg',
        'thumb_vials2.jpg',
        'thumb_scientist.jpg'
      ],
      resources: [
        { name: 'Product Information', type: 'PDF', size: '1.2 MB', icon: 'document' },
        { name: 'Prescribing Information', type: 'PDF', size: '1.5 MB', icon: 'prescribing' },
        { name: 'Patient Information Leaflet', type: 'PDF', size: '0.8 MB', icon: 'patient' },
        { name: 'Quality Certificate', type: 'PDF', size: '0.6 MB', icon: 'certificate' }
      ]
    }
  ]);

  // Future Portfolio Pipeline
  readonly futureProducts: Product[] = [
    {
      id: 'meningococcal-quad',
      name: 'MenACWY®',
      subtitle: 'Meningococcal Conjugate Vaccine',
      image: 'modal_vials_banner.jpg',
      featuredImage: 'modal_vials_banner.jpg',
      description: 'Next-generation conjugate vaccine targeting Neisseria meningitidis serogroups A, C, W-135, and Y to safeguard public health and pilgrims.',
      features: [
        'Comprehensive 4-strain meningococcal coverage',
        'Conjugate protein technology for extended immunity',
        'Formulated for national immunization schedules'
      ],
      specs: [
        { label: 'Pipeline Phase', value: 'Phase III Development / Technology Transfer' },
        { label: 'Target Indication', value: 'Meningococcal Disease Prevention' },
        { label: 'Target Age Group', value: 'Infants, Adolescents, and Travelers' },
        { label: 'Manufacturing Target', value: 'VIC Bio-Facility, Sudair, KSA' }
      ],
      storage: [
        { label: 'Storage Temperature', value: '2°C to 8°C' },
        { label: 'Do Not Freeze', value: 'Yes' },
        { label: 'Shelf Life', value: 'Target 24 Months' },
        { label: 'Protect from Light', value: 'Yes' }
      ],
      gallery: ['modal_vials_banner.jpg', 'thumb_vials1.jpg'],
      resources: []
    },
    {
      id: 'recombinant-hepb',
      name: 'HepB Recombinant',
      subtitle: 'Hepatitis B Recombinant Vaccine',
      image: 'thumb_vials2.jpg',
      featuredImage: 'thumb_vials2.jpg',
      description: 'Advanced recombinant hepatitis B surface antigen (HBsAg) vaccine providing durable lifetime immunity for newborns and adults.',
      features: [
        'Recombinant DNA technology platform',
        'High seroprotection rates across all demographics',
        'Localized manufacturing in Saudi Arabia'
      ],
      specs: [
        { label: 'Pipeline Phase', value: 'Development & Localization' },
        { label: 'Target Indication', value: 'Hepatitis B Infection' },
        { label: 'Formulation', value: 'Injectable Suspension' },
        { label: 'Manufacturing Target', value: 'VIC Bio-Facility, Sudair, KSA' }
      ],
      storage: [
        { label: 'Storage Temperature', value: '2°C to 8°C' },
        { label: 'Do Not Freeze', value: 'Yes' },
        { label: 'Shelf Life', value: 'Target 36 Months' },
        { label: 'Protect from Light', value: 'Yes' }
      ],
      gallery: ['thumb_vials2.jpg', 'thumb_vials1.jpg'],
      resources: []
    }
  ];


  get currentProductList(): Product[] {
    const apiList = this.dynamicApiProducts();
    const tab = this.activeSectionTab();
    const isAr = this.translationService.isRtl();

    if (apiList && apiList.length > 0) {
      const filtered = apiList.filter(p => p.category === tab && p.status === 'Active');
      if (filtered.length > 0) {
        return filtered.map(p => ({
          id: p.product_code || String(p.id),
          name: isAr && p.name_ar ? p.name_ar : p.name,
          subtitle: isAr && p.subtitle_ar ? p.subtitle_ar : p.subtitle,
          image: this.resolveImg(p.image),
          featuredImage: this.resolveImg(p.featured_image || p.image),
          description: isAr && p.description_ar ? p.description_ar : p.description,
          features: (isAr && p.features_ar && p.features_ar.length > 0) ? p.features_ar : (p.features || []),
          specs: (isAr && p.specs_ar && p.specs_ar.length > 0) ? p.specs_ar : (p.specs || []),
          storage: (isAr && p.storage_ar && p.storage_ar.length > 0) ? p.storage_ar : (p.storage || []),
          indication_desc: isAr && p.indication_desc_ar ? p.indication_desc_ar : p.indication_desc,
          indication_target: isAr && p.indication_target_ar ? p.indication_target_ar : p.indication_target,
          indication_route: isAr && p.indication_route_ar ? p.indication_route_ar : p.indication_route,
          indication_items: (isAr && p.indication_items_ar && p.indication_items_ar.length > 0) ? p.indication_items_ar : (p.indication_items || []),
          gallery: (p.gallery && p.gallery.length > 0)
            ? p.gallery.map(g => this.resolveImg(g))
            : [this.resolveImg(p.featured_image || p.image)],
          resources: ((isAr && p.resources_ar && p.resources_ar.length > 0) ? p.resources_ar : (p.resources || [])).map(r => ({
            name: isAr && r.name_ar ? r.name_ar : r.name,
            type: r.type,
            size: r.size,
            icon: r.icon
          }))
        }));
      }
    }

    return tab === 'our-products' ? this.products() : this.futureProducts;
  }

  get currentProduct(): Product {
    const list = this.currentProductList;
    const idx = this.activeProductIndex();
    return list[idx] || list[0];
  }

  ngOnInit(): void {
    this.startAutoplay();
    this.loadDynamicData();
  }

  loadDynamicData(): void {
    this.productService.getProducts({ status: 'Active' }).subscribe({
      next: res => {
        if (res && res.success && res.products && res.products.length > 0) {
          this.dynamicApiProducts.set(res.products);
        }
      },
      error: () => {}
    });

    this.productService.getPageSettings().subscribe({
      next: res => {
        if (res && res.success && res.settings) {
          this.dynamicPageSettings.set(res.settings);
          if (res.settings.page_resources && res.settings.page_resources.length > 0) {
            const isAr = this.translationService.isRtl();
            const mapped = res.settings.page_resources.map(r => ({
              name: isAr && r.name_ar ? r.name_ar : r.name,
              type: r.type,
              size: r.size,
              icon: r.icon
            }));
            this.dynamicPageResources.set(mapped);
          }
        }
      },
      error: () => {}
    });
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  setSectionTab(tab: 'our-products' | 'future-portfolio'): void {
    this.activeSectionTab.set(tab);
    this.activeProductIndex.set(0);
    this.startAutoplay();
  }

  private startAutoplay(): void {
    this.stopAutoplay();
    this.autoplayTimer = setInterval(() => {
      if (this.isUserInteracting || this.isModalOpen()) return;
      this.nextProduct();
    }, 5500);
  }

  private stopAutoplay(): void {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = undefined;
    }
  }

  pauseAutoplay(): void {
    this.isUserInteracting = true;
  }

  resumeAutoplay(): void {
    this.isUserInteracting = false;
  }

  nextProduct(): void {
    const list = this.currentProductList;
    const next = (this.activeProductIndex() + 1) % list.length;
    this.activeProductIndex.set(next);
  }

  prevProduct(): void {
    const list = this.currentProductList;
    const prev = (this.activeProductIndex() - 1 + list.length) % list.length;
    this.activeProductIndex.set(prev);
  }

  goToProduct(index: number): void {
    this.activeProductIndex.set(index);
    this.startAutoplay();
  }

  // Touch Swipe Support for Mobile
  onTouchStart(e: TouchEvent): void {
    this.pauseAutoplay();
    this.touchStartX = e.changedTouches[0].screenX;
  }

  onTouchEnd(e: TouchEvent): void {
    this.resumeAutoplay();
    this.touchEndX = e.changedTouches[0].screenX;
    this.handleSwipe();
  }

  private handleSwipe(): void {
    const diff = this.touchStartX - this.touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        this.nextProduct();
      } else {
        this.prevProduct();
      }
      this.startAutoplay();
    }
  }

  // Modal Methods (Preserved 100%)
  openProductModal(product: Product): void {
    this.selectedProduct.set(product);
    this.activeThumbnailIndex.set(0);
    this.activeTab.set('Overview');
    this.isModalOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedProduct.set(null);
    document.body.style.overflow = '';
  }

  selectThumbnail(index: number): void {
    this.activeThumbnailIndex.set(index);
  }

  setTab(tab: string): void {
    this.activeTab.set(tab);
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.isModalOpen()) {
      this.closeModal();
    }
  }
}
