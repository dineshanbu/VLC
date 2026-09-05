import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface PartnerPillar {
  icon: string;
  badge: string;
  title: string;
  description: string;
  highlights: string[];
}

export interface Alliance {
  name: string;
  category: string;
  scope: string;
  tag: string;
}

export interface EcosystemItem {
  icon: string;
  titleLine1: string;
  titleLine2: string;
  desc: string;
}

export interface StrategicPartner {
  id: string;
  name: string;
  category: string;
  logo: string;
  description: string;
}


@Component({
  selector: 'app-partners',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './partners.html',
  styleUrl: './partners.css'
})
export class PartnersComponent implements OnInit, OnDestroy {
  // Partnership Inquiry Modal State
  isInquiryModalOpen = false;

  // Active category filter for alliances
  selectedCategory = 'all';

  // Ecosystem Carousel State & 2-Second Autoplay
  ecosystemIndex = 0;
  ecosystemCardsPerView = 3;
  private ecosystemAutoPlayTimer: any = null;
  private ecosystemTouchStartX = 0;
  private ecosystemTouchEndX = 0;

  ngOnInit(): void {
    this.updateEcosystemCardsPerView();
    this.startEcosystemAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopEcosystemAutoPlay();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateEcosystemCardsPerView();
  }

  private updateEcosystemCardsPerView(): void {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width <= 640) {
        this.ecosystemCardsPerView = 1;
      } else if (width <= 1024) {
        this.ecosystemCardsPerView = 2;
      } else {
        this.ecosystemCardsPerView = 3;
      }
      if (this.ecosystemIndex > this.maxEcosystemIndex) {
        this.ecosystemIndex = this.maxEcosystemIndex;
      }
    }
  }

  get maxEcosystemIndex(): number {
    return Math.max(0, this.ecosystemItems.length - this.ecosystemCardsPerView);
  }

  get ecosystemPages(): number[] {
    return Array.from({ length: this.maxEcosystemIndex + 1 }, (_, i) => i);
  }

  startEcosystemAutoPlay(): void {
    this.stopEcosystemAutoPlay();
    if (typeof window !== 'undefined') {
      this.ecosystemAutoPlayTimer = setInterval(() => {
        if (!this.isInquiryModalOpen && !this.isPartnerModalOpen) {
          this.nextEcosystem();
        }
      }, 2000);
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

  // Inquiry Form Model
  inquiryForm = {
    fullName: '',
    organization: '',
    email: '',
    category: 'Technology Transfer',
    message: ''
  };

  formSubmitted = false;

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isPartnerModalOpen) {
      this.closePartnerModal();
    }
    if (this.isInquiryModalOpen) {
      this.closeInquiryModal();
    }
  }


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

  // 5 Ecosystem Categories (Exact match to reference design)
  ecosystemItems: EcosystemItem[] = [

    {
      icon: 'handshake',
      titleLine1: 'Technology',
      titleLine2: 'Partners',
      desc: 'Global innovators driving advanced solutions.'
    },
    {
      icon: 'microscope',
      titleLine1: 'Research & Academic',
      titleLine2: 'Partners',
      desc: 'Collaborating for scientific excellence.'
    },
    {
      icon: 'building',
      titleLine1: 'Government',
      titleLine2: 'Partners',
      desc: 'Aligned with national health priorities.'
    },
    {
      icon: 'factory',
      titleLine1: 'Manufacturing',
      titleLine2: 'Partners',
      desc: 'Ensuring scale, quality and reliability.'
    },
    {
      icon: 'globe',
      titleLine1: 'Distribution &',
      titleLine2: 'Commercial Partners',
      desc: 'Delivering vaccines worldwide.'
    }
  ];

  // 10 Strategic Partners (with exact logos and descriptions)
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

  // View All / Show Less Toggle
  showAllPartners = false;

  toggleViewAllPartners(): void {
    this.showAllPartners = !this.showAllPartners;
  }

  get displayedPartners(): StrategicPartner[] {
    return this.showAllPartners ? this.strategicPartners : this.strategicPartners.slice(0, 5);
  }

  // Partner Detail Modal State
  selectedPartner: StrategicPartner | null = null;
  isPartnerModalOpen = false;

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


  scrollToInquiry(): void {
    if (typeof document !== 'undefined') {
      const el = document.getElementById('partner-inquiry');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  submitInquiry(): void {
    if (this.inquiryForm.fullName && this.inquiryForm.email && this.inquiryForm.organization) {
      this.formSubmitted = true;
    }
  }

  resetInquiry(): void {
    this.formSubmitted = false;
    this.inquiryForm = {
      fullName: '',
      organization: '',
      email: '',
      category: 'Technology Transfer',
      message: ''
    };
  }
}

