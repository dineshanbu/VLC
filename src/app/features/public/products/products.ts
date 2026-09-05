import { Component, signal, HostListener, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';

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

  readonly tabs = [
    'Overview',
    'Specification',
    'Indication',
    'Storage & Handling',
    'Documents'
  ];

  // Page-level Resources & Downloads
  readonly pageResources: ProductResource[] = [
    { name: 'Product Information', type: 'PDF', size: '1.2 MB', icon: 'document' },
    { name: 'Prescribing Information', type: 'PDF', size: '1.5 MB', icon: 'prescribing' },
    { name: 'Patient Information Leaflet', type: 'PDF', size: '0.8 MB', icon: 'patient' },
    { name: 'Quality Certificate', type: 'PDF', size: '0.6 MB', icon: 'certificate' }
  ];

  // Commercial Products List
  readonly products: Product[] = [
    {
      id: 'flucelvax',
      name: 'Flucelvax®',
      subtitle: 'Seasonal Influenza Vaccine',
      image: 'flucelvax_featured.png',
      featuredImage: 'flucelvax_featured.png',
      description: 'Flucelvax® is a next-generation, cell culture-based influenza vaccine designed to help protect against seasonal flu.',
      features: [
        'Produced in MDCK cell culture',
        'Egg-free manufacturing process',
        'High purity and consistent quality'
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
        'p4.jpg',
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
      name: 'Vaxigrip®',
      subtitle: 'Influenza Vaccine (Split Virion)',
      image: 'p3.jpg',
      featuredImage: 'p3.jpg',
      description: 'Vaxigrip® is formulated to provide robust seasonal protection against circulating influenza viruses, backed by proven clinical efficacy.',
      features: [
        'Quadrivalent broad protection against circulating flu strains',
        'High batch-to-batch consistency and purity',
        'Compliant with international WHO recommendations'
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
      name: 'Pneumovax®',
      subtitle: 'Pneumococcal Polyvalent Vaccine',
      image: 'p2.jpg',
      featuredImage: 'p2.jpg',
      description: 'Pneumovax® is a polyvalent vaccine formulated to protect against invasive pneumococcal infections in vulnerable and high-risk populations.',
      features: [
        'Broad 23-serotype pneumococcal coverage',
        'Elevated and durable immune response',
        'Produced under strict GMP quality standards'
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
      name: 'Rotarix®',
      subtitle: 'Rotavirus Oral Vaccine',
      image: 'p1.jpg',
      featuredImage: 'p1.jpg',
      description: 'Rotarix® is an oral vaccine offering early and robust protection against severe rotavirus gastroenteritis in infants.',
      features: [
        'Gentle oral drop administration for infants',
        'High clinical efficacy against severe rotavirus diarrhea',
        'Extensively validated across global clinical trials'
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
  ];

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
    return this.activeSectionTab() === 'our-products' ? this.products : this.futureProducts;
  }

  get currentProduct(): Product {
    const list = this.currentProductList;
    const idx = this.activeProductIndex();
    return list[idx] || list[0];
  }

  ngOnInit(): void {
    this.startAutoplay();
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
