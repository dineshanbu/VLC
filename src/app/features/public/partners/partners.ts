import { Component, HostListener, OnInit, OnDestroy, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PartnerService } from '../../../core/services/partner.service';
import { PartnerPageSettings } from '../../../core/models/partner.model';
import { environment } from '../../../../environments/environment';
import { TranslationService } from '../../../core/services/translation.service';
import { SectionHeadingsService } from '../../../core/services/section-headings.service';
import { SectionHeadingPipe } from '../../../shared/pipes/section-heading.pipe';
export interface EcosystemItem {
  icon: string;
  titleLine1: string;
  titleLine2: string;
  desc: string;
}

export interface StrategicPartner {
  id: string | number;
  name: string;
  name_ar?: string;
  category: string;
  category_ar?: string;
  tier?: string;
  logo: string;
  website?: string;
  description: string;
  description_ar?: string;
}

@Component({
  selector: 'app-partners',
  standalone: true,
  imports: [CommonModule, FormsModule, SectionHeadingPipe],
  templateUrl: './partners.html',
  styleUrls: ['./partners.css', '../public-theme.css', '../mobile-hero.css']
})
export class PartnersComponent implements OnInit, OnDestroy {
  private partnerService = inject(PartnerService);
  readonly translationService = inject(TranslationService);
  private readonly sectionHeadingsService = inject(SectionHeadingsService);
  pageSettings: PartnerPageSettings = {
    hero_badge: 'GLOBAL PARTNERSHIPS', hero_title: 'Stronger Together.', hero_title_line2: 'Building a Better ', hero_accent: 'Future.',
    hero_description: 'Collaborating with global leaders to expand access to innovative vaccines and drive a healthier, more resilient tomorrow.',
    hero_image: '', cta_text: 'Partner With Us'
  };
  heroSettingsLoaded = false;
  @ViewChild('strategicPartnerTrack') private strategicPartnerTrack?: ElementRef<HTMLElement>;

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

  // Ecosystem Carousel State & Mobile Autoplay
  isMobileView = false;
  ecosystemIndex = 0;
  ecosystemCardsPerView = 6;
  private ecosystemAutoPlayTimer: any = null;
  activeStrategicPartnerIndex = 0;
  private strategicPartnerAutoPlayTimer?: ReturnType<typeof setInterval>;
  private ecosystemTouchStartX = 0;
  private ecosystemTouchEndX = 0;

  // 10 Strategic Partners (Dynamic from API with default fallback)
  strategicPartners: StrategicPartner[] = [
    {
      id: 'csl',
      name: 'CSL Seqirus',
      category: 'Technology Transfers Partner',
      logo: 'cslseqirus_1_logo-e1761739712420.webp',
      description: 'Technology transfer partner for full localization of seasonal influenza and pandemic response.'
    },
    {
      id: 'uhlmann',
      name: 'Uhlmann Pac-Systems',
      category: 'Production Lines Partner',
      logo: 'uhlmann-logo.webp',
      description: 'Uhlmann Pac-Systems, Germany is the world’s leading system provider for the packaging of pharmaceuticals with state of art AI driven technology.'
    },
    {
      id: 'rota',
      name: 'ROTA',
      category: 'Production Lines Partner',
      logo: 'rota-logo-large-e1779129484988.webp',
      description: 'ROTA, Germany is a 100-year-old evolved from a simple ampoule machine into a full portfolio of advanced systems.'
    },
    {
      id: 'bcm',
      name: 'Baylor College of Medicine',
      category: 'Vaccine development, Research & Training',
      logo: 'bcm.webp',
      description: 'Baylor College of Medicine and VIC-RDI have signed Academic and R&D agreement for vaccine development.'
    },
    {
      id: 'kacst',
      name: 'KACST',
      category: 'Academic Research & Developments',
      logo: 'vaccine-website-design-06.webp',
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
      logo: 'dvs.jpeg',
      description: 'DVS Proposes a strategic business development collaboration and commits to build a strong sustainable Vaccine portfolio.'
    },
    {
      id: 'zyme',
      name: 'Zyme',
      category: 'Project Management Partners',
      logo: 'zyme-logo-big.webp',
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
      logo: 'atc-1.webp',
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
    this.sectionHeadingsService.load().subscribe();
    this.heroSettingsLoaded = false;
    this.partnerService.getPageSettings().subscribe({
      next: response => { if (response.success && response.settings) this.pageSettings = { ...this.pageSettings, ...response.settings }; this.heroSettingsLoaded = true; },
      error: () => { this.heroSettingsLoaded = true; }
    });
    this.loadPartnersFromBackend();
    this.startEcosystemAutoPlay();
    this.startStrategicPartnerAutoPlay();
  }

  @HostListener('window:storage', ['$event'])
  onPartnerStorageChange(event: StorageEvent): void {
    if (event.key === 'vic_partners_updated') this.loadPartnersFromBackend();
    if (event.key === 'vic_partner_settings_updated') {
      this.heroSettingsLoaded = false;
      this.partnerService.getPageSettings().subscribe({
        next: response => {
          if (response.success && response.settings) this.pageSettings = { ...this.pageSettings, ...response.settings };
          this.heroSettingsLoaded = true;
        },
        error: () => { this.heroSettingsLoaded = true; }
      });
    }
  }

  ngOnDestroy(): void {
    this.stopEcosystemAutoPlay();
    this.stopStrategicPartnerAutoPlay();
  }

  heroText(field: 'badge' | 'title' | 'titleLine2' | 'accent' | 'description'): string {
    const isArabic = this.translationService.currentLang() === 'ar';
    const headingDefaults = {
      badge: { key: 'partners.hero.badge', en: 'GLOBAL PARTNERSHIPS', ar: 'شراكات عالمية', oldEn: 'OUR PARTNERS', oldAr: 'شركاؤنا', pageEn: this.pageSettings.hero_badge, pageAr: this.pageSettings.hero_badge_ar },
      title: { key: 'partners.hero.title', en: 'Stronger Together.', ar: 'معاً أقوى.', oldEn: 'Stronger Together.', oldAr: 'معاً نصنع القوة.', pageEn: this.pageSettings.hero_title, pageAr: this.pageSettings.hero_title_ar },
      titleLine2: { key: 'partners.hero.titleLine2', en: 'Building a Better ', ar: 'نبني مستقبلاً أفضل ', oldEn: 'Building a Better ', oldAr: '', pageEn: this.pageSettings.hero_title_line2, pageAr: this.pageSettings.hero_title_line2_ar },
      accent: { key: 'partners.hero.accent', en: 'Future.', ar: 'للجميع.', oldEn: 'Future.', oldAr: 'المستقبل.', pageEn: this.pageSettings.hero_accent, pageAr: this.pageSettings.hero_accent_ar }
    } as const;
    if (field !== 'description') {
      const heading = headingDefaults[field];
      const saved = this.sectionHeadingsService.headings()[heading.key];
      const savedText = isArabic ? saved?.ar : saved?.en;
      const defaultText = isArabic ? heading.ar : heading.en;
      const oldDefaultText = isArabic ? heading.oldAr : heading.oldEn;
      if (typeof savedText !== 'string' || savedText === defaultText || savedText === oldDefaultText) {
        const existingPageText = isArabic ? heading.pageAr : heading.pageEn;
        return typeof existingPageText === 'string' && existingPageText.length
          ? existingPageText
          : (isArabic ? heading.ar : heading.en);
      }
      return savedText;
    }

    if (!isArabic) {
      return this.pageSettings.hero_description || this.translationService.translate('partners.hero.description');
    }

    const localizedValue = this.pageSettings.hero_description_ar;
    return typeof localizedValue === 'string' && localizedValue.trim()
      ? localizedValue
      : this.translationService.translate('partners.hero.description');
  }

  get heroImageUrl(): string {
    const path = this.translationService.currentLang() === 'ar'
      ? (this.pageSettings.hero_image_ar || this.pageSettings.hero_image)
      : this.pageSettings.hero_image;
    return path ? this.resolveImg(path, '') : '';
  }

  onHeroImageError(event: Event): void {
    (event.currentTarget as HTMLImageElement).style.display = 'none';
  }

  partnerCategory(partner: StrategicPartner): string {
    return this.translationService.currentLang() === 'ar'
      ? partner.category_ar ?? ''
      : partner.category ?? '';
  }

  partnerDisplayName(partner: StrategicPartner): string {
    return this.translationService.currentLang() === 'ar'
      ? partner.name_ar ?? ''
      : partner.name ?? '';
  }

  partnerDescription(partner: StrategicPartner): string {
    return this.translationService.currentLang() === 'ar'
      ? partner.description_ar ?? ''
      : partner.description ?? '';
  }

  // Resolve upload or static image
  resolveImg(path: string | undefined | null, fallback = 'logo_navbar.webp'): string {
    if (!path) return fallback;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/backend/uploads/')) return `${(environment.serverUrl || '').replace(/\/backend\/?$/, '')}${path}`;
    if (path.startsWith('/uploads/')) return `${environment.serverUrl}${path}`;
    return path;
  }

  partnerLogoClass(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  // Load partners dynamically from database
  loadPartnersFromBackend(): void {
    this.partnerService.getPartners({ status: 'Active' }).subscribe({
      next: (res) => {
        if (res.success && res.partners && res.partners.length > 0) {
          const partners: StrategicPartner[] = res.partners.map(p => ({
            id: p.code || p.id || p.name,
            name: p.name,
            name_ar: p.name_ar,
            category: p.category,
            category_ar: p.category_ar,
            logo: p.logo,
            website: p.website,
            description: p.description,
            description_ar: p.description_ar
          }));
          this.strategicPartners = partners;
          this.activeStrategicPartnerIndex = 0;
          this.scrollToStrategicPartner(0);
        }
      },
      error: () => {
        // Fallback default array preserved
      }
    });
  }

  get displayedPartners(): StrategicPartner[] {
    return this.strategicPartners;
  }

  partnerWebsiteUrl(partner: StrategicPartner): string | null {
    const fallbackSites: Record<string, string> = {
      zyme: 'https://www.zymebiotech.com/',
      'arabian trade house': 'https://www.ath.com.sa/'
    };
    const website = partner.website?.trim() || fallbackSites[partner.name.trim().toLowerCase()];
    if (!website) return null;
    return /^https?:\/\//i.test(website) ? website : `https://${website}`;
  }

  toggleViewAllPartners(): void {
    this.showAllPartners = !this.showAllPartners;
  }

  moveStrategicPartner(direction: -1 | 1): void {
    const total = this.strategicPartners.length;
    if (!total) return;
    this.activeStrategicPartnerIndex = (this.activeStrategicPartnerIndex + direction + total) % total;
    this.scrollToStrategicPartner(this.activeStrategicPartnerIndex);
    this.restartStrategicPartnerAutoPlay();
  }

  goToStrategicPartner(index: number): void {
    this.activeStrategicPartnerIndex = Math.min(Math.max(index, 0), this.strategicPartners.length - 1);
    this.scrollToStrategicPartner(this.activeStrategicPartnerIndex);
    this.restartStrategicPartnerAutoPlay();
  }

  onStrategicPartnerScroll(): void {
    const track = this.strategicPartnerTrack?.nativeElement;
    if (!track || !this.isMobileView) return;
    const first = track.querySelector<HTMLElement>('.partner-strategic__item');
    if (!first) return;
    const step = first.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || '0');
    if (step > 0) this.activeStrategicPartnerIndex = Math.max(0, Math.min(this.strategicPartners.length - 1, Math.round(track.scrollLeft / step)));
  }

  private scrollToStrategicPartner(index: number): void {
    const track = this.strategicPartnerTrack?.nativeElement;
    const card = track?.querySelectorAll<HTMLElement>('.partner-strategic__item')[index];
    if (track && card && this.isMobileView) track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: 'smooth' });
  }

  private startStrategicPartnerAutoPlay(): void {
    this.stopStrategicPartnerAutoPlay();
    this.strategicPartnerAutoPlayTimer = setInterval(() => {
      if (this.isMobileView && !this.isInquiryModalOpen && this.strategicPartners.length > 1) this.moveStrategicPartner(1);
    }, 4000);
  }

  private restartStrategicPartnerAutoPlay(): void {
    if (this.strategicPartnerAutoPlayTimer) this.startStrategicPartnerAutoPlay();
  }

  private stopStrategicPartnerAutoPlay(): void {
    if (this.strategicPartnerAutoPlayTimer) clearInterval(this.strategicPartnerAutoPlayTimer);
    this.strategicPartnerAutoPlayTimer = undefined;
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
        if (!this.isInquiryModalOpen) {
          this.nextEcosystem();
        }
      }, 4000);
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
