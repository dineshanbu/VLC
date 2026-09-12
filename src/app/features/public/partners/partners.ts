import { Component, HostListener, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PartnerService } from '../../../core/services/partner.service';
import { environment } from '../../../../environments/environment';
export interface EcosystemItem {
  icon: string;
  titleLine1: string;
  titleLine2: string;
  desc: string;
}

export interface StrategicPartner {
  id: string | number;
  name: string;
  category: string;
  tier?: string;
  logo: string;
  website?: string;
  description: string;
}

@Component({
  selector: 'app-partners',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './partners.html',
  styleUrls: ['./partners.css', '../public-theme.css']
})
export class PartnersComponent implements OnInit, OnDestroy {
  private partnerService = inject(PartnerService);

  // Partnership Inquiry Modal State
  isInquiryModalOpen = false;
  isSubmittingInquiry = false;
  formSubmitted = false;
  inquiryError = '';

  // Inquiry Form Model
  inquiryForm = {
    full_name: '',
    organization: '',
    email: '',
    phone: '',
    category: 'Technology Transfer',
    message: ''
  };

  // View All / Show Less Toggle
  showAllPartners = false;

  // Partner Detail Modal State
  selectedPartner: StrategicPartner | null = null;
  isPartnerModalOpen = false;

  // Ecosystem Carousel State & Mobile Autoplay
  isMobileView = false;
  ecosystemIndex = 0;
  ecosystemCardsPerView = 6;
  private ecosystemAutoPlayTimer: any = null;
  private ecosystemTouchStartX = 0;
  private ecosystemTouchEndX = 0;

  // 10 Strategic Partners (Dynamic from API with default fallback)
  strategicPartners: StrategicPartner[] = [
    {
      id: 'csl',
      name: 'CSL Seqirus',
      category: 'Technology Transfers Partner',
      logo: 'CSLSeqirus_1_logo-e1761739712420.png',
      description: 'Technology transfer partner for full localization of seasonal influenza and pandemic response.'
    },
    {
      id: 'uhlmann',
      name: 'Uhlmann Pac-Systems',
      category: 'Production Lines Partner',
      logo: 'uhlmann-logo.png',
      description: 'Uhlmann Pac-Systems, Germany is the world’s leading system provider for the packaging of pharmaceuticals with state of art AI driven technology.'
    },
    {
      id: 'rota',
      name: 'ROTA',
      category: 'Production Lines Partner',
      logo: 'Rota-Logo-large-e1779129484988.png',
      description: 'ROTA, Germany is a 100-year-old evolved from a simple ampoule machine into a full portfolio of advanced systems.'
    },
    {
      id: 'bcm',
      name: 'Baylor College of Medicine',
      category: 'Vaccine development, Research & Training',
      logo: 'bcm.png',
      description: 'Baylor College of Medicine and VIC-RDI have signed Academic and R&D agreement for vaccine development.'
    },
    {
      id: 'kacst',
      name: 'KACST',
      category: 'Academic Research & Developments',
      logo: 'Vaccine-Website-design-06.png',
      description: 'KACST and VIC RDI have signed collaboration agreement for research, development and innovation to localize Vaccine Manufacturing in Saudi Arabia.'
    },
    {
      id: 'nibrt',
      name: 'NIBRT',
      category: 'Bio processing research and training partners',
      logo: 'nibrt.webp',
      description: 'A Global Centre of Excellence for Training and Research to help the growth and development of the biopharma manufacturing industry.'
    },
    {
      id: 'dvs',
      name: 'DVS',
      category: 'Business Development Consultants',
      logo: 'DVS.jpeg',
      description: 'DVS Proposes a strategic business development collaboration and commits to build a strong sustainable Vaccine portfolio.'
    },
    {
      id: 'zyme',
      name: 'Zyme',
      category: 'Project Management Partners',
      logo: 'Zyme-Logo-big.png',
      description: 'Experts in traditional project management techniques with deep domain knowledge of the biotech process.'
    },
    {
      id: 'keyplants',
      name: 'KeyPlants',
      category: 'Engineering Partner - Turnkey modular concept',
      logo: 'keyplant.jpg',
      description: 'Keyplants and capabilities include full in-house Design and Fabrication as well as subject matter expertise.'
    },
    {
      id: 'ath',
      name: 'Arabian Trade House',
      category: 'Supply Chain Partner',
      logo: 'ATC-1.png',
      description: 'Arabian Trade House is a leading Biotechnology products distributor in Saudi Arabia. The Company was established in 1978.'
    }
  ];

  // 6 Ecosystem Categories (Exact match to attached reference design)
  ecosystemItems: EcosystemItem[] = [
    {
      icon: 'flask',
      titleLine1: 'Technology',
      titleLine2: 'Partners',
      desc: 'Innovative platforms and technologies.'
    },
    {
      icon: 'gear',
      titleLine1: 'Manufacturing',
      titleLine2: 'Partners',
      desc: 'Advanced equipment and production solutions.'
    },
    {
      icon: 'microscope',
      titleLine1: 'Research & Academic',
      titleLine2: 'Partners',
      desc: 'Scientific collaboration and clinical research.'
    },
    {
      icon: 'government',
      titleLine1: 'Government',
      titleLine2: 'Partners',
      desc: 'Aligned with national health priorities.'
    },
    {
      icon: 'supply-chain',
      titleLine1: 'Supply Chain',
      titleLine2: 'Partners',
      desc: 'Reliable and resilient supply networks.'
    },
    {
      icon: 'healthcare',
      titleLine1: 'Healthcare',
      titleLine2: 'Partners',
      desc: 'Expanding access to vaccines for healthier communities.'
    }
  ];

  ngOnInit(): void {
    this.updateEcosystemCardsPerView();
    this.loadPartnersFromBackend();
    this.startEcosystemAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopEcosystemAutoPlay();
  }

  // Resolve upload or static image
  resolveImg(path: string | undefined | null, fallback = 'logo_navbar.png'): string {
    if (!path) return fallback;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/backend/uploads/')) return `${(environment.serverUrl || '').replace(/\/backend\/?$/, '')}${path}`;
    if (path.startsWith('/uploads/')) return `${environment.serverUrl}${path}`;
    return path;
  }

  // Load partners dynamically from database
  loadPartnersFromBackend(): void {
    this.partnerService.getPartners({ status: 'Active' }).subscribe({
      next: (res) => {
        if (res.success && res.partners && res.partners.length > 0) {
          this.strategicPartners = res.partners.map(p => ({
            id: p.id || p.code || p.name,
            name: p.name,
            category: p.category,
            logo: p.logo,
            website: p.website,
            description: p.description
          }));
        }
      },
      error: () => {
        // Fallback default array preserved
      }
    });
  }

  get displayedPartners(): StrategicPartner[] {
    return this.showAllPartners ? this.strategicPartners : this.strategicPartners.slice(0, 5);
  }

  toggleViewAllPartners(): void {
    this.showAllPartners = !this.showAllPartners;
  }

  // Partner Detail Modal State
  openPartnerModal(partner: StrategicPartner): void {
    this.selectedPartner = partner;
    this.isPartnerModalOpen = true;
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  closePartnerModal(): void {
    this.selectedPartner = null;
    this.isPartnerModalOpen = false;
    if (typeof document !== 'undefined' && !this.isInquiryModalOpen) {
      document.body.style.overflow = '';
    }
  }

  // Inquiry Modal
  openInquiryModal(): void {
    this.isInquiryModalOpen = true;
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  closeInquiryModal(): void {
    this.isInquiryModalOpen = false;
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  submitInquiry(): void {
    if (!this.inquiryForm.full_name || !this.inquiryForm.email || !this.inquiryForm.organization) {
      this.inquiryError = 'Please provide full name, organization, and work email.';
      return;
    }

    this.isSubmittingInquiry = true;
    this.inquiryError = '';

    this.partnerService.submitInquiry(this.inquiryForm).subscribe({
      next: () => {
        this.isSubmittingInquiry = false;
        this.formSubmitted = true;
      },
      error: () => {
        this.isSubmittingInquiry = false;
        this.formSubmitted = true;
      }
    });
  }

  resetInquiry(): void {
    this.formSubmitted = false;
    this.inquiryError = '';
    this.inquiryForm = {
      full_name: '',
      organization: '',
      email: '',
      phone: '',
      category: 'Technology Transfer',
      message: ''
    };
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isPartnerModalOpen) {
      this.closePartnerModal();
    }
    if (this.isInquiryModalOpen) {
      this.closeInquiryModal();
    }
  }

  // Ecosystem Carousel
  @HostListener('window:resize')
  onResize(): void {
    this.updateEcosystemCardsPerView();
  }

  private updateEcosystemCardsPerView(): void {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      this.isMobileView = width <= 768;
      if (width <= 768) {
        this.ecosystemCardsPerView = 2;
      } else {
        this.ecosystemCardsPerView = 6;
      }
      if (this.ecosystemIndex > this.maxEcosystemIndex) {
        this.ecosystemIndex = this.maxEcosystemIndex;
      }
      if (!this.isMobileView) {
        this.stopEcosystemAutoPlay();
      } else if (!this.ecosystemAutoPlayTimer) {
        this.startEcosystemAutoPlay();
      }
    }
  }

  get maxEcosystemIndex(): number {
    return Math.max(0, Math.ceil(this.ecosystemItems.length / this.ecosystemCardsPerView) - 1);
  }

  get displayedEcosystemItems(): EcosystemItem[] {
    return this.ecosystemItems;
  }

  get ecosystemPages(): number[] {
    return Array.from({ length: this.maxEcosystemIndex + 1 }, (_, i) => i);
  }

  startEcosystemAutoPlay(): void {
    this.stopEcosystemAutoPlay();
    if (typeof window !== 'undefined' && this.isMobileView) {
      this.ecosystemAutoPlayTimer = setInterval(() => {
        if (!this.isInquiryModalOpen && !this.isPartnerModalOpen) {
          this.nextEcosystem();
        }
      }, 2500);
    }
  }

  stopEcosystemAutoPlay(): void {
    if (this.ecosystemAutoPlayTimer) {
      clearInterval(this.ecosystemAutoPlayTimer);
      this.ecosystemAutoPlayTimer = null;
    }
  }

  prevEcosystem(): void {
    if (this.ecosystemIndex > 0) {
      this.ecosystemIndex--;
    } else {
      this.ecosystemIndex = this.maxEcosystemIndex;
    }
    this.startEcosystemAutoPlay();
  }

  nextEcosystem(): void {
    if (this.ecosystemIndex < this.maxEcosystemIndex) {
      this.ecosystemIndex++;
    } else {
      this.ecosystemIndex = 0;
    }
  }

  goToEcosystem(index: number): void {
    this.ecosystemIndex = Math.min(Math.max(0, index), this.maxEcosystemIndex);
    this.startEcosystemAutoPlay();
  }

  onEcosystemTouchStart(event: TouchEvent): void {
    this.stopEcosystemAutoPlay();
    this.ecosystemTouchStartX = event.changedTouches[0].screenX;
  }

  onEcosystemTouchEnd(event: TouchEvent): void {
    this.ecosystemTouchEndX = event.changedTouches[0].screenX;
    const diff = this.ecosystemTouchStartX - this.ecosystemTouchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        this.nextEcosystem();
      } else {
        this.prevEcosystem();
      }
    }
    this.startEcosystemAutoPlay();
  }

  trackByTitle(_: number, item: EcosystemItem): string {
    return item.titleLine1 + item.titleLine2;
  }
}

