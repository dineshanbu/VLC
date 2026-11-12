import { AfterViewInit, Component, ElementRef, HostListener, OnInit, OnDestroy, ViewChild, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AboutService } from '../../../core/services/about.service';
import { resolveImageUrl } from '../../../core/utils/image-url.util';
import { TranslationService } from '../../../core/services/translation.service';
import { AboutGroupCompany, AboutPageContentMap } from '../../../core/models/about.model';
import { environment } from '../../../../environments/environment';
import { HomeFacilityContent, HomeFacilityImage } from '../../../core/models/home-facility.model';
import { HomeFacilityService } from '../../../core/services/home-facility.service';
import { SectionHeadingPipe } from '../../../shared/pipes/section-heading.pipe';
import { LeaderProfileModalComponent, LeaderProfileModalData } from '../../../shared/components/leader-profile-modal/leader-profile-modal';
import { localizeLeaderBadge, localizeLeaderBioSections, localizeLeaderName, localizeLeaderProfile, localizeLeaderRole, localizeLeaderTitle } from '../../../shared/utils/leader-profile-localization';

export interface LeaderSection {
  heading: string;
  items?: string[];
  paragraphs?: string[];
}

export interface Leader {
  id?: number;
  name: string;
  name_ar?: string;
  title: string;
  title_ar?: string;
  role: string;
  role_ar?: string;
  badge: string;
  badge_ar?: string;
  initials: string;
  image: string;
  bioSections?: LeaderSection[];
  bioSectionsAr?: LeaderSection[];
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule, SectionHeadingPipe, LeaderProfileModalComponent],
  templateUrl: './about.html',
  styleUrls: ['./about.css', '../public-theme.css']
})
export class AboutComponent implements AfterViewInit, OnInit, OnDestroy {
  private aboutService = inject(AboutService);
  private homeFacilityService = inject(HomeFacilityService);
  public translationService = inject(TranslationService);
  heroContentLoaded = false;
  facilityImages: HomeFacilityImage[] = [];
  facilityContent: HomeFacilityContent = {
    title: 'State-of-the-Art Facility: Pioneering Excellence in Vaccine Manufacturing', title_ar: '',
    lead: 'Welcome to our cutting-edge facility, where innovation meets precision in the pursuit of safeguarding global health. Our state-of-the-art manufacturing hub is designed to push the boundaries of vaccine production, setting new benchmarks for quality, efficiency, and reliability.', lead_ar: '',
    paragraph_one: 'Discover a facility that blends advanced technology with meticulous attention to detail, ensuring the seamless execution of every stage in the vaccine manufacturing process. From research and development laboratories to manufacturing suites equipped with the latest advancements, our facility is a testament to our commitment to excellence.', paragraph_one_ar: '',
    paragraph_two: 'At the heart of our operations is a team of dedicated professionals, experts in their respective fields, working collaboratively to bring forth groundbreaking vaccines. Explore our facility to witness the convergence of expertise, cutting-edge technology, and a shared passion for advancing healthcare.', paragraph_two_ar: ''
  };

  readonly defaultGroupCompanies: AboutGroupCompany[] = [
    { name: 'Saudi Bio', name_ar: 'السعودية الحيوية', description: 'Insulin manufacturing (70% acquired by Lifera-PIF)', description_ar: 'تصنيع الإنسولين (استحوذت شركة ليفيرا التابعة لصندوق الاستثمارات العامة على 70٪)', logo_url: '' },
    { name: 'VIC', name_ar: 'شركة اللقاحات الصناعية', description: 'Human vaccine manufacturing', description_ar: 'تصنيع لقاحات بشرية', logo_url: 'logo_navbar.webp' },
    { name: 'BIC', name_ar: 'شركة ابتكارات التقنية الحيوية', description: 'Research and Development', description_ar: 'البحث والتطوير', logo_url: 'bic-partner.svg' },
    { name: 'BIOERA', name_ar: 'بيوإيرا', description: 'Biotech industrial engineering', description_ar: 'الهندسة الصناعية للتقنية الحيوية', logo_url: '' },
    { name: 'AniVax', name_ar: 'أنيفاكس', description: 'Veterinary vaccine manufacturing', description_ar: 'تصنيع لقاحات بيطرية', logo_url: '' },
    { name: 'Saudi NIBRT', name_ar: 'المعهد السعودي للتدريب والابتكار في المعالجة الحيوية', description: 'Saudi Institute for Bioprocessing Innovation and Training', description_ar: 'المعهد السعودي للابتكار والتدريب في المعالجة الحيوية', logo_url: 'nibrt.webp' }
  ];

  private readonly groupCompanyWebsiteUrls: Record<string, string> = {
    'saudi bio': 'https://saudibio.com/',
    'السعودية الحيوية': 'https://saudibio.com/',
    'vic': 'https://vaccine.com.sa/',
    'vaccine industrial company': 'https://vaccine.com.sa/',
    'vaccine industrial company (vic)': 'https://vaccine.com.sa/',
    'vaccine industrial holding llc': 'https://vaccine.com.sa/',
    'vaccine industrial holding company (vic)': 'https://vaccine.com.sa/',
    'شركة اللقاحات الصناعية': 'https://vaccine.com.sa/',
    'شركة اللقاحات الصناعية القابضة': 'https://vaccine.com.sa/',
    'bic': 'https://biotechinnovations.com.sa/',
    'blc': 'https://biotechinnovations.com.sa/',
    'biotech innovation company': 'https://biotechinnovations.com.sa/',
    'biotech innovations company': 'https://biotechinnovations.com.sa/',
    'biotech innovation company for r&d': 'https://biotechinnovations.com.sa/',
    'biotech innovations company for r&d': 'https://biotechinnovations.com.sa/',
    'biotechnology innovation company': 'https://biotechinnovations.com.sa/',
    'شركة ابتكارات التقنية الحيوية': 'https://biotechinnovations.com.sa/',
    'شركة الابتكار للتقنية الحيوية': 'https://biotechinnovations.com.sa/',
    'شركة الابتكار للتقنية الحيوية للأبحاث والتطوير': 'https://biotechinnovations.com.sa/',
    'شركة الابتكارات الحيوية': 'https://biotechinnovations.com.sa/',
    'bioera': 'https://bioera.sa/',
    'بيوإيرا': 'https://bioera.sa/',
    'anivax': 'https://www.anivax.sa/',
    'أنيفاكس': 'https://www.anivax.sa/',
    'saudi nibrt': 'https://saudi-nibrt.com/',
    'المعهد السعودي للتدريب والابتكار في المعالجة الحيوية': 'https://saudi-nibrt.com/'
  };

  groupCompaniesTitle(): string {
    const section = this.pageContent().group_companies;
    const value = this.translationService.currentLang() === 'ar' ? section?.title_ar : section?.title;
    if (typeof value === 'string') return value;
    return this.translationService.currentLang() === 'ar' ? 'مجموعة شركات التقنية الحيوية' : 'Our Group Of Biotech Companies';
  }

  groupCompaniesSubtitle(): string {
    const section = this.pageContent().group_companies;
    return this.translationService.currentLang() === 'ar'
      ? section?.subtitle_ar || section?.subtitle || ''
      : section?.subtitle || '';
  }

  groupCompanies(): AboutGroupCompany[] {
    return this.localizedGroupCompanies();
  }

  groupCompanyLogo(company: AboutGroupCompany): string {
    const logo = company.logo_url || '';
    const normalized = logo.replace(/\\/g, '/').replace(/^\/+/, '').toLowerCase();
    if (normalized === 'logo_navbar.webp') return 'logo_navbar_white.webp';
    if (normalized === 'bic-partner.svg') return 'bic-partner-dark.svg';
    return this.resolveImg(logo);
  }

  groupCompanyWebsite(company: AboutGroupCompany): string | null {
    const name = company.name.trim().toLocaleLowerCase();
    const arabicName = (company.name_ar || '').trim().toLocaleLowerCase();
    const knownUrl = this.groupCompanyWebsiteUrls[name] || this.groupCompanyWebsiteUrls[arabicName];
    if (knownUrl) return knownUrl;
    if (/\b(bic|blc)\b|biotech(nology)?\s+innovations?/i.test(`${company.name} ${company.name_ar || ''}`)
      || /ابتكار.*حيوي|حيوي.*ابتكار/.test(`${company.name} ${company.name_ar || ''}`)) {
      return 'https://biotechinnovations.com.sa/';
    }
    return null;
  }

  trackGroupCompany(_index: number, company: AboutGroupCompany): string {
    return company.name_ar || company.name;
  }

  facilityText(field: 'title' | 'lead' | 'paragraph_one' | 'paragraph_two'): string {
    const arabic = this.translationService.currentLang() === 'ar';
    const localized = this.facilityContent[arabic ? `${field}_ar` as keyof HomeFacilityContent : field];
    return localized || (arabic ? this.facilityContent[field] : '');
  }

  facilityImageClass(index: number): string {
    const classes = ['top', 'main', 'rdi', 'side-one', 'side-two', 'side-three', 'main-two'];
    return `about-facility__image--${classes[index] || 'extra'}`;
  }

  aboutHeroImageUrl(): string {
    const hero = this.pageContent().hero;
    const image = this.translationService.currentLang() === 'ar'
      ? (hero?.image_url_ar || hero?.image_url)
      : hero?.image_url;
    return image ? resolveImageUrl(image) : '';
  }

  heroText(field: 'badge' | 'title' | 'subtitle' | 'description'): string {
    const hero = this.pageContent().hero;
    const isArabic = this.translationService.currentLang() === 'ar';
    const value = isArabic ? hero?.[`${field}_ar` as keyof typeof hero] : hero?.[field];
    // An explicitly empty admin value means “hide this text”; only fall back
    // when the API has not provided that field at all.
    if (typeof value === 'string') return value;
    return this.translationService.translate(`about.hero.${field}`);
  }

  purposeBadge(): string {
    const section = this.pageContent().vision_mission;
    const field = this.translationService.currentLang() === 'ar' ? 'badge_ar' : 'badge';
    const value = section?.[field];
    return typeof value === 'string' ? value : this.translationService.translate('about.purpose.eyebrow');
  }

  purposeTitle(kind: 'vision' | 'mission'): string {
    const content = this.purposeContent();
    const value = content?.[`${kind}_title`];
    return typeof value === 'string' ? value : this.translationService.translate(`about.${kind}.title`);
  }

  purposeParagraphs(kind: 'vision' | 'mission'): string[] {
    const content = this.purposeContent();
    const value = content?.[`${kind}_paragraphs`];
    if (Array.isArray(value)) return value.filter((paragraph: unknown): paragraph is string => typeof paragraph === 'string' && !!paragraph.trim());
    const fallbackKeys = kind === 'vision'
      ? ['about.vision.p1', 'about.vision.p2', 'about.vision.p3']
      : ['about.mission.p1', 'about.mission.p2'];
    return fallbackKeys.map(key => this.translationService.translate(key));
  }

  private purposeContent(): Record<string, any> | null {
    const section = this.pageContent().vision_mission;
    return this.translationService.currentLang() === 'ar'
      ? section?.content_json_ar || null
      : section?.content_json || null;
  }

  onHeroImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) img.style.display = 'none';
  }

  // Dynamic Content Signals
  pageContent = signal<Partial<AboutPageContentMap>>({});
  private readonly localizedGroupCompanies = computed(() => {
    const data = this.pageContent().group_companies?.content_json as { companies?: AboutGroupCompany[] } | null;
    const companies = Array.isArray(data?.companies) ? data.companies : this.defaultGroupCompanies;
    const arabic = this.translationService.currentLang() === 'ar';
    return companies
      .filter(company => company && (company.name || company.name_ar) && (company.description || company.description_ar))
      .map(company => ({ ...company, name: (arabic && company.name_ar) || company.name, description: (arabic && company.description_ar) || company.description }));
  });

  // Section 2: Company Overview Modal State
  isOverviewModalOpen = false;

  // Leader Profile Modal State
  selectedLeader: Leader | null = null;
  isLeaderModalOpen = false;
  selectedLeaderModalProfile: LeaderProfileModalData | null = null;

  // Section 2: Company Overview expand toggle (legacy fallback if needed)
  isExpanded = false;

  // Section 2: Our Vision expand toggle
  isVisionExpanded = false;

  // Section 2: Our Mission expand toggle
  isMissionExpanded = false;

  // Section 3: Our Facility expand toggle
  isFacilityExpanded = false;

  // Section 5: Leadership Carousel State
  leaderIndex = 0;
  cardsPerView = 3;
  @ViewChild('leadershipSection') private leadershipSection?: ElementRef<HTMLElement>;
  private autoPlayTimer: any = null;
  private sectionObserver?: IntersectionObserver;
  private isLeadershipVisible = false;
  private touchStartX = 0;
  private touchEndX = 0;

  // Leadership partners data with real photos and full profiles
  leaders: Leader[] = [
    {
      name: 'Dr. Khaled Almosa',
      title: 'Founder and Chairman of Vaccine Industrial Company',
      role: 'Leading Saudi biotechnology pioneer & senior management consultant. Recognized as the “Godfather of Biotechnology Manufacturing in Saudi Arabia”.',
      badge: 'Founder & Chairman',
      initials: 'KA',
      image: '/uploads/1791464700410-121578282-Dr.Khaled-Almosa.webp',
      bioSections: [
        {
          heading: 'Executive Summary',
          paragraphs: [
            'Dr. Khaled Almosa is a leading Saudi biotechnology pioneer and senior management consultant. Recognized as the “Godfather of Biotechnology Manufacturing in Saudi Arabia” by H.E. Dr. Hussein A. Gezairy (former WHO Regional Director and former Saudi Minister of Health), he has shaped the Kingdom’s life sciences and healthcare industries for more than three decades.'
          ]
        },
        {
          heading: 'Government, Policy & Innovation Leadership',
          paragraphs: [
            'He served as a member of the Supreme Committee for Research, Development & Innovation (2021–2024), chaired by HRH the Crown Prince at the Council of Economic and Development Affairs. His contributions helped shape national strategies in biotechnology, healthcare, and R&D.'
          ]
        },
        {
          heading: 'Executive Profile',
          paragraphs: [
            'Dr. Almosa is the first Saudi national to invest in and establish biotechnology manufacturing industries, founding companies across insulin and biologics production, human and animal vaccines, biomedical engineering, medical services, consulting, and R&D. His work directly advances Saudi Vision 2030 through healthcare localization, innovation, and workforce development.'
          ]
        },
        {
          heading: 'Pioneering Biotech Enterprises',
          items: [
            'SAUDI BIO (2010–2020) — Founder & Chairman: First and only Saudi manufacturer of insulin and biologics, in partnership with Novo Nordisk and Sandoz. Acquired in 2023 by Lifera (PIF-owned).',
            'Vaccine Industrial Holding Company (VIC) — Founder & Chairman: Home to Saudi Arabia’s first and the Middle East’s largest human vaccine manufacturing facility, partnering with CSL Seqirus and other global biotech leaders.',
            'Biotech Innovation Company for R&D — Founder & Chairman: Established with Baylor College of Medicine; collaborates with KACST; funded by Saudi NIH to conduct MERS clinical trials.',
            'Anivax — Founder & Chairman: A dedicated animal vaccine R&D and manufacturing company in partnership with Boehringer Ingelheim, positioning Saudi Arabia as a regional veterinary biotech hub.',
            'Bioera — Industrial Engineering & Project Management — Founder & Chairman: International engineering firm operating across the GCC, USA, Europe, and India with partners including KeyPlants, Zyme Biotech, Shahin Engineering, Podtech, and Jadwa Contractors.',
            'MedTech Group of Companies — Founder & Chairman: Operates day surgery centers, medical facilities, and medical supplies services in Riyadh.',
            'Biotechnology Training Institute — Founder: Being established with NIBRT, the first institute of its kind in the Middle East to train the region’s biotechnology workforce.'
          ]
        },
        {
          heading: 'Consulting & Strategic Advisory',
          items: [
            'Dr. Khaled Almosa Consulting Firm (Riyadh) — Chairman: Licensed by the Saudi Ministry of Commerce; specializes in biotech, R&D, investment, and business development.',
            'Averon Consulting (Dubai) — Chairman: Provides strategic advisory in healthcare and biotechnology, including regulatory strategy, market entry, partnerships, and innovation planning.'
          ]
        },
        {
          heading: 'Research & Publications',
          items: [
            '“Investigating Factors That Impede Successful Vaccine Manufacturing Business in the Kingdom of Saudi Arabia: Imperatives for Healthcare Sustainability.”',
            '“My Mission to Save Lives in Saudi Arabia: Empowering 2030 Through Local Manufacturing of Insulin, Vaccines, Cancer Therapeutics, and Gene Editing Technologies.”'
          ]
        },
        {
          heading: 'Legacy',
          paragraphs: [
            'Dr. Almosa’s legacy is the biotechnology ecosystem he built — from the first insulin factory to the first human vaccine plant, from pioneering R&D to training the next generation of biotech professionals. His career represents a mission to save lives, strengthen national health security, and secure the Kingdom’s biotechnological future.'
          ]
        }
      ]
    },
    {
      name: 'H.E. Dr. Hussein AlGazairy',
      title: 'Founder of College of Medicine at King Saud University',
      role: 'Ex-Saudi Minister of Health & Ex-Regional Director of WHO, Eastern Mediterranean Region.',
      badge: 'Advisory Board',
      initials: 'HA',
      image: '/uploads/1791464656591-379501210-H.E-Dr.-Hussein-AlGazairy-1-1.webp',
      bioSections: [
        {
          heading: 'Distinguished Leadership',
          items: [
            'Founder of the College of Medicine at King Saud University',
            'Ex-Saudi Minister of Health',
            'Ex-Regional Director of World Health Organization (WHO), Eastern Mediterranean Region'
          ]
        }
      ]
    },
    {
      name: 'Professor Aws Alshamsan',
      title: 'Secretary-General of the Saudi Commission for Health',
      role: 'Ex-Consultant for Biological Products at SFDA & Former Dean of the College of Pharmacy at King Saud University.',
      badge: 'Scientific Board',
      initials: 'AA',
      image: '/uploads/1791464748885-690717555-Professor-Aws-Alshamsan-1-1.webp',
      bioSections: [
        {
          heading: 'Scientific & Academic Background',
          items: [
            'The Secretary-General of the Saudi Commission for Health Specialties',
            'Ex-Consultant for biological products at the Saudi Food and Drug Authority (SFDA) for five years',
            'Co-director of the Joint Center of Excellence in Nanomedicine at KACST between 2013 and 2015',
            'Director of King Abdullah Institute for Nanotechnology between 2014 and 2017',
            'Dean of the College of Pharmacy at King Saud University between 2017–2022'
          ]
        }
      ]
    },
    {
      name: 'Dr. Abdulrazak AlGazairy',
      title: 'Senior Medical Surgeon & Researcher',
      role: 'Head of Ophthalmology Division at PSBAHC, Co-founder of Saudi Biotechnology Manufacturing Co. & Chairman of Meditech Group.',
      badge: 'Medical Board',
      initials: 'AG',
      image: 'drabdul.jpg',
      bioSections: [
        {
          heading: 'Medical & Executive Experience',
          items: [
            'Senior Medical Surgeon and Researcher',
            'Head of Ophthalmology division, Prince Sultan Bin Abdulaziz Humanitarian City',
            'Co-founder, Saudi Biotechnology Manufacturing Co.',
            'Chairman, Meditech Group'
          ]
        }
      ]
    },
    {
      name: 'Mr. Turki Al-Dayel',
      title: 'Co-Head of Middle East & CEO of Ninety One Private Equity',
      role: 'Ex-Director & Head of Private Equity at Raidah Investment Company (GOSI), Board Member of Arabian Centers & SBMC.',
      badge: 'Executive Board',
      initials: 'TD',
      image: 'mr.-turki-al-dayel-director-1.jpg',
      bioSections: [
        {
          heading: 'Investment Leadership',
          items: [
            'Co-Head of the Middle East & CEO of Ninety One Private Equity, Saudi Arabia',
            'Ex-Director & Head of Private Equity at Raidah Investment Company (GOSI)',
            'Board member of Arabian Centers Co. and Saudi Biotechnology Manufacturing Co.'
          ]
        }
      ]
    },
    {
      name: 'Mr. Abdulrahman AlMalik',
      title: 'Executive Director of Investments - PIF Portfolio Company',
      role: 'Private Equity in Real-estate. Ex Advisor to the Minister of Economy & Planning and Financial Advisor at Ernst & Young.',
      badge: 'Executive Board',
      initials: 'AM',
      image: 'mr.-abdulrahman-almalik-1.jpg',
      bioSections: [
        {
          heading: 'Corporate Strategy & Governance',
          items: [
            'Executive Director of Investments - PIF portfolio Company, Private Equity in Real-estate',
            'Ex Advisor to the Minister of Economy & Planning and Financial Advisor at Ernst & Young',
            'Holds an MBA from ESADE Business School'
          ]
        }
      ]
    },
    {
      name: 'Professor Abdullah Alotaibi',
      title: 'Senior Consultant for Education & Training Affairs',
      role: 'Consultant for University Certificates Equalization at Ministry of Education, Former Member of Consultative (SHOURA) Council.',
      badge: 'Advisory Board',
      initials: 'AO',
      image: 'prof-abdullah-alotaibi.webp',
      bioSections: [
        {
          heading: 'Public Service & Academic Leadership',
          items: [
            'Senior Consultant for Education and Training Affairs',
            'Consultant for University Certificates Equalization at Ministry of Education (2016 – Present)',
            'Member of Consultative (SHOURA) Council (2009 – 2021)',
            'Professor of Clinical Low Vision and Rehabilitation at King Saud University (KSU)',
            'Dean of College of Applied Medical Sciences at KSU (2008)',
            'Consultant for Low Vision & Rehabilitation at Ministry of Health (MOH) for 10 years',
            'Member of different Committees at the Saudi Commission for Health Specialties (SCFHS) and Saudi Food and Drug Authority (SFDA)'
          ]
        }
      ]
    }
  ];

  ngOnInit(): void {
    this.updateCardsPerView();
    this.loadDynamicData();
  }

  ngAfterViewInit(): void {
    const section = this.leadershipSection?.nativeElement;
    if (!section || typeof window === 'undefined') return;

    if (typeof IntersectionObserver === 'undefined') {
      this.checkLeadershipVisibility();
      return;
    }

    this.sectionObserver = new IntersectionObserver(([entry]) => {
      this.isLeadershipVisible = entry.isIntersecting;
      if (this.isLeadershipVisible) this.startAutoPlay();
      else this.stopAutoPlay();
    }, { threshold: 0.15 });
    this.sectionObserver.observe(section);
  }

  loadDynamicData(): void {
    this.heroContentLoaded = false;
    this.homeFacilityService.getImages().subscribe({ next: response => { this.facilityImages = response.images || []; }, error: () => { this.facilityImages = []; } });
    this.homeFacilityService.getContent().subscribe({ next: response => { if (response.content) this.facilityContent = { ...this.facilityContent, ...response.content }; } });
    // 1. Fetch Dynamic Content Sections
    this.aboutService.getAboutContent().subscribe({
      next: (res) => {
        if (res.success && res.content) {
          this.pageContent.set(res.content);
        }
        this.heroContentLoaded = true;
      },
      error: () => {
        // Fallback to static values seamlessly
        this.heroContentLoaded = true;
      }
    });

    // 2. Fetch Dynamic Leaders
    this.aboutService.getLeaders({ status: 'Active' }).subscribe({
      next: (res) => {
        if (res.success && Array.isArray(res.leaders)) {
          this.leaders = res.leaders.map(l => ({
            id: l.id,
            name: l.name,
            name_ar: l.name_ar,
            title: l.title,
            title_ar: l.title_ar,
            role: l.role,
            role_ar: l.role_ar,
            badge: l.badge || 'Executive Board',
            badge_ar: l.badge_ar,
            initials: l.initials || l.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase(),
            image: this.resolveImg(l.image),
            bioSections: l.bio_sections,
            bioSectionsAr: l.bio_sections_ar
          }));
          this.updateCardsPerView();
        }
      },
      error: () => {
        // Keeps official hardcoded fallback leaders
      }
    });
  }

  @HostListener('window:storage', ['$event'])
  onAboutContentStorageChange(event: StorageEvent): void {
    if (event.key === 'vic_about_content_updated') this.loadDynamicData();
  }

  resolveImg(path: string | undefined | null, fallback = 'home_banner.webp'): string {
    if (!path) return fallback;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/backend/uploads/')) return `${(environment.serverUrl || '').replace(/\/backend\/?$/, '')}${path}`;
    if (path.startsWith('/uploads/')) return `${environment.serverUrl}${path}`;
    return path;
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
    this.sectionObserver?.disconnect();
  }

  startAutoPlay(): void {
    this.stopAutoPlay();
    if (typeof window !== 'undefined' && this.isLeadershipVisible) {
      const interval = window.innerWidth <= 768 ? 4000 : 2000;
      this.autoPlayTimer = setInterval(() => {
        if (!this.isLeaderModalOpen && !this.isOverviewModalOpen) {
          this.nextLeader();
        }
      }, interval);
    }
  }

  stopAutoPlay(): void {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateCardsPerView();
    if (this.sectionObserver) this.startAutoPlay();
    else this.checkLeadershipVisibility();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (!this.sectionObserver) this.checkLeadershipVisibility();
  }

  private checkLeadershipVisibility(): void {
    const section = this.leadershipSection?.nativeElement;
    if (!section || typeof window === 'undefined') return;
    const bounds = section.getBoundingClientRect();
    const visible = bounds.bottom > 0 && bounds.top < window.innerHeight;
    if (visible === this.isLeadershipVisible) return;
    this.isLeadershipVisible = visible;
    if (visible) this.startAutoPlay();
    else this.stopAutoPlay();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isLeaderModalOpen) {
      this.closeLeaderModal();
    } else if (this.isOverviewModalOpen) {
      this.closeOverviewModal();
    }
  }

  private updateCardsPerView(): void {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width <= 768) {
        this.cardsPerView = 1;
      } else if (width <= 1024) {
        this.cardsPerView = 2;
      } else {
        this.cardsPerView = 3;
      }

      if (this.leaderIndex > this.maxLeaderIndex) {
        this.leaderIndex = this.maxLeaderIndex;
      }
    }
  }

  get maxLeaderIndex(): number {
    return Math.max(0, this.leaders.length - this.cardsPerView);
  }

  get leaderPages(): number[] {
    return Array.from({ length: this.maxLeaderIndex + 1 }, (_, i) => i);
  }

  openOverviewModal(): void {
    this.isOverviewModalOpen = true;
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  closeOverviewModal(): void {
    this.isOverviewModalOpen = false;
    if (!this.isLeaderModalOpen && typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  openLeaderModal(leader: Leader): void {
    this.selectedLeader = leader;
    this.selectedLeaderModalProfile = localizeLeaderProfile(leader, this.translationService.currentLang() === 'ar');
    this.isLeaderModalOpen = true;
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  closeLeaderModal(): void {
    this.isLeaderModalOpen = false;
    this.selectedLeader = null;
    this.selectedLeaderModalProfile = null;
    if (!this.isOverviewModalOpen && typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }


  toggleReadMore(): void {
    this.openOverviewModal();
  }

  toggleVision(): void {
    this.isVisionExpanded = !this.isVisionExpanded;
  }

  toggleMission(): void {
    this.isMissionExpanded = !this.isMissionExpanded;
  }

  toggleFacility(): void {
    this.isFacilityExpanded = !this.isFacilityExpanded;
  }

  prevLeader(): void {
    if (this.leaderIndex > 0) {
      this.leaderIndex--;
    } else {
      this.leaderIndex = this.maxLeaderIndex;
    }
    this.startAutoPlay();
  }

  nextLeader(): void {
    if (this.leaderIndex < this.maxLeaderIndex) {
      this.leaderIndex++;
    } else {
      this.leaderIndex = 0;
    }
  }

  goToLeader(index: number): void {
    this.leaderIndex = Math.min(Math.max(0, index), this.maxLeaderIndex);
    this.startAutoPlay();
  }

  // Mobile Touch Swipe Handling
  onTouchStart(event: TouchEvent): void {
    this.stopAutoPlay();
    this.touchStartX = event.changedTouches[0].screenX;
  }

  onTouchEnd(event: TouchEvent): void {
    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipe();
    this.startAutoPlay();
  }

  private handleSwipe(): void {
    const swipeThreshold = 45;
    const diff = this.touchStartX - this.touchEndX;
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        this.nextLeader();
      } else {
        this.prevLeader();
      }
    }
  }

  // ========================================================
  // Localization & Translation Helpers for Leaders
  // ========================================================

  getLeaderBadge(leader: Leader | null | undefined): string {
    return leader ? localizeLeaderBadge(leader, this.translationService.currentLang() === 'ar') : '';
  }

  getLeaderName(leader: Leader | null | undefined): string {
    return leader ? localizeLeaderName(leader, this.translationService.currentLang() === 'ar') : '';
  }

  getLeaderTitle(leader: Leader | null | undefined): string {
    return leader ? localizeLeaderTitle(leader, this.translationService.currentLang() === 'ar') : '';
  }

  getLeaderRole(leader: Leader | null | undefined): string {
    return leader ? localizeLeaderRole(leader, this.translationService.currentLang() === 'ar') : '';
  }

  getLeaderBioSections(leader: Leader | null | undefined): LeaderSection[] {
    return leader ? localizeLeaderBioSections(leader, this.translationService.currentLang() === 'ar') : [];
  }

}


