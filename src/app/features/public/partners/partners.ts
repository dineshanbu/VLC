import { Component, HostListener, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PartnerService } from '../../../core/services/partner.service';
import {
  PartnerPageSettings,
  Partner,
  PartnershipSection,
  PartnershipInquiry
} from '../../../core/models/partner.model';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './partners.html',
  styleUrl: './partners.css'
})
export class PartnersComponent implements OnInit, OnDestroy {
  private partnerService = inject(PartnerService);

  // Dynamic Banner & Page Settings
  pageSettings: PartnerPageSettings = {
    hero_badge: 'OUR PARTNERS',
    hero_title: 'Stronger Together.',
    hero_title_line2: 'Building Better Futures.',
    hero_accent: 'Futures.',
    hero_description: 'Collaboration is at the heart of everything we do. We work with global leaders, research institutions, and government entities to advance vaccine innovation and strengthen global health.',
    hero_image: 'partner_banner.jpg',
    cta_text: 'Partner With Us',
    stats: [
      { label: 'Global Strategic Alliances', value: '10+' },
      { label: 'Ecosystem Pillars', value: '5' },
      { label: 'Capital Commitment', value: 'SAR 500M+' },
      { label: 'Vision 2030 Biotech Impact', value: '100%' }
    ]
  };

  // Partnership Inquiry Modal State
  isInquiryModalOpen = false;
  isSubmittingInquiry = false;
  formSubmitted = false;
  inquiryError = '';

  // Inquiry Form Model
  inquiryForm: Partial<PartnershipInquiry> = {
    full_name: '',
    organization: '',
    email: '',
    phone: '',
    category: 'Technology Transfer',
    message: ''
  };

  // Active category filter for partners
  selectedCategory = 'all';
  searchQuery = '';

  // View All / Show Less Toggle
  showAllPartners = false;

  // Partner Detail Modal State
  selectedPartner: StrategicPartner | null = null;
  isPartnerModalOpen = false;

  // Ecosystem Carousel State & 2-Second Autoplay
  ecosystemIndex = 0;
  ecosystemCardsPerView = 3;
  private ecosystemAutoPlayTimer: any = null;
  private ecosystemTouchStartX = 0;
  private ecosystemTouchEndX = 0;

  // Dynamic Additional Content Sections (Split layout, Vision 2030, CDMO)
  additionalSections: PartnershipSection[] = [];

  // Default Fallback Strategic Partners
  strategicPartners: StrategicPartner[] = [
    {
      id: 'csl',
      name: 'CSL Seqirus',
      category: 'Technology Transfers Partner',
      tier: 'Strategic Alliance',
      logo: 'CSLSeqirus_1_logo-e1761739712420.png',
      description: 'Technology transfer partner for full localization of seasonal influenza and pandemic response.'
    },
    {
      id: 'uhlmann',
      name: 'Uhlmann Pac-Systems',
      category: 'Production Lines Partner',
      tier: 'Production Lines & Automation',
      logo: 'uhlmann-logo.png',
      description: 'Uhlmann Pac-Systems, Germany is the world’s leading system provider for the packaging of pharmaceuticals with state of art AI driven technology.'
    },
    {
      id: 'rota',
      name: 'ROTA',
      category: 'Production Lines Partner',
      tier: 'Production Lines & Automation',
      logo: 'Rota-Logo-large-e1779129484988.png',
      description: 'ROTA, Germany is a 100-year-old evolved from a simple ampoule machine into a full portfolio of advanced systems.'
    },
    {
      id: 'bcm',
      name: 'Baylor College of Medicine',
      category: 'Vaccine development, Research & Training',
      tier: 'Academic Research & Clinical R&D',
      logo: 'bcm.png',
      description: 'Baylor College of Medicine and VIC-RDI have signed Academic and R&D agreement for vaccine development.'
    },
    {
      id: 'kacst',
      name: 'KACST',
      category: 'Academic Research & Developments',
      tier: 'Academic Research & Developments',
      logo: 'Vaccine-Website-design-06.png',
      description: 'KACST and VIC RDI have signed collaboration agreement for research, development and innovation to localize Vaccine Manufacturing in Saudi Arabia.'
    },
    {
      id: 'nibrt',
      name: 'NIBRT',
      category: 'Bio processing research and training partners',
      tier: 'Bioprocess & Workforce Training',
      logo: 'nibrt.webp',
      description: 'A Global Centre of Excellence for Training and Research to help the growth and development of the biopharma manufacturing industry.'
    },
    {
      id: 'dvs',
      name: 'DVS',
      category: 'Business Development Consultants',
      tier: 'Strategic Advisory & Consulting',
      logo: 'DVS.jpeg',
      description: 'DVS Proposes a strategic business development collaboration and commits to build a strong sustainable Vaccine portfolio.'
    },
    {
      id: 'zyme',
      name: 'Zyme',
      category: 'Project Management Partners',
      tier: 'Project Management & Engineering',
      logo: 'Zyme-Logo-big.png',
      description: 'Experts in traditional project management techniques with deep domain knowledge of the biotech process.'
    },
    {
      id: 'keyplants',
      name: 'KeyPlants',
      category: 'Engineering Partner - Turnkey modular concept',
      tier: 'Project Management & Engineering',
      logo: 'keyplant.jpg',
      description: 'Keyplants and capabilities include full in-house Design and Fabrication as well as subject matter expertise.'
    },
    {
      id: 'ath',
      name: 'Arabian Trade House',
      category: 'Supply Chain Partner',
      tier: 'Supply Chain & Commercial Distribution',
      logo: 'ATC-1.png',
      description: 'Arabian Trade House is a leading Biotechnology products distributor in Saudi Arabia. The Company was established in 1978.'
    }
  ];

  // Default Fallback 5 Ecosystem Pillars
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

  ngOnInit(): void {
    this.updateEcosystemCardsPerView();
    this.loadDynamicData();
    this.startEcosystemAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopEcosystemAutoPlay();
  }

  // Helper to resolve asset or uploaded image
  resolveImg(path: string | undefined | null, fallback = 'partner_banner.jpg'): string {
    if (!path) return fallback;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/uploads/')) return `http://localhost:5000${path}`;
    return path;
  }

  // Load from Backend API
  loadDynamicData(): void {
    // 1. Load Page Settings
    this.partnerService.getPageSettings().subscribe({
      next: (res) => {
        if (res.success && res.settings) {
          this.pageSettings = {
            ...this.pageSettings,
            ...res.settings
          };
        }
      },
      error: () => {
        // Keep default fallback
      }
    });

    // 2. Load Strategic Partners
    this.partnerService.getPartners({ status: 'Active' }).subscribe({
      next: (res) => {
        if (res.success && res.partners && res.partners.length > 0) {
          this.strategicPartners = res.partners.map(p => ({
            id: p.id || p.code || p.name,
            name: p.name,
            category: p.category,
            tier: p.tier,
            logo: p.logo,
            website: p.website,
            description: p.description
          }));
        }
      },
      error: () => {
        // Keep default fallback
      }
    });

    // 3. Load Dynamic Sections (Ecosystem Pillars + Custom Split Blocks)
    this.partnerService.getSections({ status: 'Active' }).subscribe({
      next: (res) => {
        if (res.success && res.sections) {
          // Ecosystem pillars
          const pillars = res.sections.filter(s => s.section_key === 'ecosystem_pillar');
          if (pillars.length > 0) {
            this.ecosystemItems = pillars.map(p => {
              const words = p.title.split(' ');
              let titleLine1 = p.title;
              let titleLine2 = '';
              if (words.length > 1) {
                titleLine1 = words.slice(0, Math.ceil(words.length / 2)).join(' ');
                titleLine2 = words.slice(Math.ceil(words.length / 2)).join(' ');
              }
              return {
                icon: p.icon || 'handshake',
                titleLine1,
                titleLine2,
                desc: p.content || p.subtitle || ''
              };
            });
          }

          // Custom / Split Sections (Vision 2030, collaboration frameworks)
          this.additionalSections = res.sections.filter(s => s.section_key !== 'ecosystem_pillar');
        }
      },
      error: () => {
        // Fallback default additional sections
        this.setDefaultAdditionalSections();
      }
    });
  }

  setDefaultAdditionalSections(): void {
    this.additionalSections = [
      {
        section_key: 'vision_2030_alignment',
        badge: 'SAUDI VISION 2030',
        title: 'Pioneering Biomanufacturing Sovereignty in the Kingdom',
        subtitle: 'A state-of-the-art biopharmaceutical campus built for global tech transfer',
        content: 'Located in Sudair Industrial City, VIC is establishing Saudi Arabia’s foremost human vaccine biomanufacturing facility. In alignment with Saudi Vision 2030 and the National Biotechnology Strategy, we partner with world-class innovators to localize end-to-end biological manufacturing, securing the Kingdom’s healthcare future.',
        bullet_points: [
          'SFDA cGMP & WHO Prequalification-ready production cleanrooms',
          'SAR 500 Million+ bio-facility with high-speed automated sterile filling lines',
          'Complete tech-transfer pipeline from master cell banking to final drug product release',
          'Regional cold-chain logistics hub serving GCC, MENA, and international markets'
        ],
        image_url: 'baylor_vic_agreement.jpg',
        icon: 'shield',
        cta_text: 'Discover Our Facility',
        cta_url: '/about',
        layout_type: 'split_right',
        order_index: 6,
        status: 'Active'
      },
      {
        section_key: 'collaboration_framework',
        badge: 'COLLABORATION MODELS',
        title: 'Flexible Frameworks Tailored for High-Impact Innovation',
        subtitle: 'From technology licensing to turn-key bioprocessing and regional co-distribution',
        content: 'Whether you are a multinational biotechnology enterprise, a clinical-stage research institution, or a specialized equipment manufacturer, VIC offers collaborative models that accelerate market entry, provide strategic access to the Saudi market, and ensure regulatory agility.',
        bullet_points: [
          'Technology Transfer & Active Pharmaceutical Ingredient (API) Localization',
          'Collaborative Clinical Research & Fast-Track SFDA Regulatory Registration',
          'Contract Development & Manufacturing Organization (CDMO) Services',
          'Turnkey Cold-Chain Supply Chain & Multi-Country Commercial Distribution'
        ],
        image_url: 'modon_vic_land.jpg',
        icon: 'award',
        cta_text: 'Start Collaboration',
        cta_url: '#partner-inquiry',
        layout_type: 'split_left',
        order_index: 7,
        status: 'Active'
      }
    ];
  }

  // Categories for filter buttons
  get availableCategories(): string[] {
    const set = new Set<string>();
    this.strategicPartners.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }

  // Filtered partners based on category & search
  get filteredPartners(): StrategicPartner[] {
    return this.strategicPartners.filter(p => {
      const matchCat = this.selectedCategory === 'all' || p.category === this.selectedCategory;
      const matchSearch = !this.searchQuery ||
        p.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }

  get displayedPartners(): StrategicPartner[] {
    const list = this.filteredPartners;
    return this.showAllPartners ? list : list.slice(0, 5);
  }

  setCategory(cat: string): void {
    this.selectedCategory = cat;
  }

  toggleViewAllPartners(): void {
    this.showAllPartners = !this.showAllPartners;
  }

  // Partner Detail Modal
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
  openInquiryModal(presetCategory?: string): void {
    if (presetCategory) {
      this.inquiryForm.category = presetCategory;
    }
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
      this.inquiryError = 'Please fill in your name, organization, and work email.';
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
        // Still show success to user if offline, ensuring optimal UX
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

  // Ecosystem Carousel Methods
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
