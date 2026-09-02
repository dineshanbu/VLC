import { Component, signal, HostListener } from '@angular/core';
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
export class ProductsComponent {
  // Carousel State
  readonly currentIndex = signal(0);
  readonly itemsPerView = signal(4);

  // Touch / Swipe State
  private touchStartX = 0;
  private touchEndX = 0;

  // Modal State
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

  // 6 Product Cards Matching User Requirement with Correct Images (p4=Flucelvax, p3=Vaxigrip, p2=Pneumovax, p1=Rotarix)
  readonly products: Product[] = [
    {
      id: 'flucelvax-1',
      name: 'Flucelvax®',
      subtitle: 'Seasonal Influenza Vaccine',
      image: 'p4.jpg',
      description: 'Flucelvax® is a next-generation, cell culture-based influenza vaccine designed to help protect against seasonal flu.',
      features: [
        'Produced in MDCK cell culture',
        'Egg-free manufacturing process',
        'High purity and consistent quality',
        'Suitable for individuals 6 months and older'
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
        'flucelvax_modal_main.jpg',
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
      id: 'vaxigrip-1',
      name: 'Vaxigrip®',
      subtitle: 'Influenza Vaccine',
      image: 'p3.jpg',
      description: 'Vaxigrip® is formulated to provide robust seasonal protection against circulating influenza viruses, backed by proven clinical efficacy.',
      features: [
        'Quadrivalent influenza protection',
        'Compliant with international standards',
        'High batch-to-batch consistency',
        'Recommended for broad population immunization'
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
      id: 'pneumovax-1',
      name: 'Pneumovax®',
      subtitle: 'Pneumococcal Vaccine',
      image: 'p2.jpg',
      description: 'Pneumovax® is a polyvalent vaccine formulated to protect against invasive pneumococcal infections in vulnerable and high-risk populations.',
      features: [
        'Broad serotype pneumococcal coverage',
        'Elevated and durable immune response',
        'Produced under strict GMP conditions',
        'Proven global safety profile'
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
      id: 'rotarix-1',
      name: 'Rotarix®',
      subtitle: 'Rotavirus Vaccine',
      image: 'p1.jpg',
      description: 'Rotarix® is an oral vaccine offering early and robust protection against severe rotavirus gastroenteritis in infants.',
      features: [
        'Oral drop administration',
        'High clinical protection against severe diarrhea',
        'Early infant immunization schedule',
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
    },
    {
      id: 'flucelvax-2',
      name: 'Flucelvax®',
      subtitle: 'Seasonal Influenza Vaccine',
      image: 'p4.jpg',
      description: 'Flucelvax® is a next-generation, cell culture-based influenza vaccine designed to help protect against seasonal flu.',
      features: [
        'Produced in MDCK cell culture',
        'Egg-free manufacturing process',
        'High purity and consistent quality',
        'Suitable for individuals 6 months and older'
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
        'flucelvax_modal_main.jpg',
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
      id: 'vaxigrip-2',
      name: 'Vaxigrip®',
      subtitle: 'Influenza Vaccine',
      image: 'p3.jpg',
      description: 'Vaxigrip® is formulated to provide robust seasonal protection against circulating influenza viruses, backed by proven clinical efficacy.',
      features: [
        'Quadrivalent influenza protection',
        'Compliant with international standards',
        'High batch-to-batch consistency',
        'Recommended for broad population immunization'
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
    }
  ];

  constructor() {
    this.updateItemsPerView();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateItemsPerView();
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.isModalOpen()) {
      this.closeModal();
    }
  }

  private updateItemsPerView(): void {
    const width = window.innerWidth;
    if (width <= 640) {
      this.itemsPerView.set(1);
    } else if (width <= 1024) {
      this.itemsPerView.set(2);
    } else {
      this.itemsPerView.set(4);
    }

    if (this.currentIndex() > this.maxIndex) {
      this.currentIndex.set(this.maxIndex);
    }
  }

  get maxIndex(): number {
    return Math.max(0, this.products.length - this.itemsPerView());
  }

  get totalDots(): number[] {
    const count = Math.max(1, this.products.length - this.itemsPerView() + 1);
    return Array.from({ length: count }, (_, i) => i);
  }

  prevSlide(): void {
    if (this.currentIndex() > 0) {
      this.currentIndex.update(i => i - 1);
    } else {
      this.currentIndex.set(this.maxIndex);
    }
  }

  nextSlide(): void {
    if (this.currentIndex() < this.maxIndex) {
      this.currentIndex.update(i => i + 1);
    } else {
      this.currentIndex.set(0);
    }
  }

  goToSlide(index: number): void {
    const target = Math.min(index, this.maxIndex);
    this.currentIndex.set(target);
  }

  // Touch Swipe Support for Mobile
  onTouchStart(e: TouchEvent): void {
    this.touchStartX = e.changedTouches[0].screenX;
  }

  onTouchEnd(e: TouchEvent): void {
    this.touchEndX = e.changedTouches[0].screenX;
    this.handleSwipe();
  }

  private handleSwipe(): void {
    const diff = this.touchStartX - this.touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        this.nextSlide();
      } else {
        this.prevSlide();
      }
    }
  }

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
}
