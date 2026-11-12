import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../../core/services/translation.service';
import { HeroComponent } from './components/hero/hero';
import { AboutVicComponent } from './components/about-vic/about-vic';
import { OurPlatformComponent } from './components/our-platform/our-platform';
import { LatestNewsComponent } from './components/latest-news/latest-news';
import { HomeShowcaseComponent } from './components/home-showcase/home-showcase';
import { HomeFacilityService } from '../../../core/services/home-facility.service';
import { HomeFacilityImage } from '../../../core/models/home-facility.model';
import { Partner } from '../../../core/models/partner.model';
import { PartnerService } from '../../../core/services/partner.service';
import { resolveImageUrl } from '../../../core/utils/image-url.util';
import { FoundingPartnersComponent } from './components/founding-partners/founding-partners';
import { SectionHeadingPipe } from '../../../shared/pipes/section-heading.pipe';
import { AboutLeader } from '../../../core/models/about.model';
import { LeaderProfileModalComponent, LeaderProfileModalData } from '../../../shared/components/leader-profile-modal/leader-profile-modal';
import { localizeLeaderProfile } from '../../../shared/utils/leader-profile-localization';

@Component({
  selector: 'app-home',
  imports: [CommonModule, HeroComponent, AboutVicComponent, OurPlatformComponent, HomeShowcaseComponent, LatestNewsComponent, FoundingPartnersComponent, SectionHeadingPipe, LeaderProfileModalComponent],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly translationService = inject(TranslationService);
  private readonly homeFacilityService = inject(HomeFacilityService);
  private readonly partnerService = inject(PartnerService);
  readonly facilityIndex = signal(0);
  readonly facilityModal = signal<{ src: string; alt: string } | null>(null);
  readonly homePartners = signal<Partner[]>([]);
  selectedLeader: AboutLeader | null = null;
  selectedLeaderModalProfile: LeaderProfileModalData | null = null;
  isLeaderModalOpen = false;
  private previousBodyOverflow = '';
  @ViewChild('homePartnerTrack') private homePartnerTrack?: ElementRef<HTMLElement>;
  readonly facilityImages = signal<HomeFacilityImage[]>([
    { title: 'VIC facility exterior', alt_text: 'VIC facility exterior', image_url: '/uploads/facility-gallery/1789227486983-887709867-updated1.png', order_index: 0, status: 'Active' },
    { title: 'VIC facility exterior', alt_text: 'VIC facility exterior', image_url: '/uploads/facility-gallery/vlc0.webp', order_index: 1, status: 'Active' },
    { title: 'VIC manufacturing facility exterior', alt_text: 'VIC manufacturing facility exterior', image_url: '/uploads/facility-gallery/vic_main1.webp', order_index: 2, status: 'Active' },
    { title: 'VIC manufacturing facility', alt_text: 'VIC manufacturing facility', image_url: '/uploads/facility-gallery/vic_main2.webp', order_index: 3, status: 'Active' },
    { title: 'VIC research and development facility', alt_text: 'VIC research and development facility', image_url: '/uploads/facility-gallery/vic_rdi.webp', order_index: 4, status: 'Active' },
    { title: 'VIC facility side view', alt_text: 'VIC facility side view', image_url: '/uploads/facility-gallery/vic_side_2.webp', order_index: 5, status: 'Active' },
    { title: 'VIC facility campus view', alt_text: 'VIC facility campus view', image_url: '/uploads/facility-gallery/vic_side_3.webp', order_index: 6, status: 'Active' },
    { title: 'VIC facility exterior view', alt_text: 'VIC facility exterior view', image_url: '/uploads/facility-gallery/vic_side.webp', order_index: 7, status: 'Active' },
    { title: 'VIC facility aerial view', alt_text: 'VIC facility aerial view', image_url: '/uploads/facility-gallery/vic_top1.webp', order_index: 8, status: 'Active' }
  ]);
  readonly visibleFacilities = computed(() => Array.from(
    { length: Math.min(3, this.facilityImages().length) },
    (_, offset) => this.facilityImages()[(offset + this.facilityIndex()) % this.facilityImages().length]
  ));
  moveFacility(direction: number): void {
    const count = this.facilityImages().length;
    if (count) this.facilityIndex.update(index => (index + direction + count) % count);
  }
  openFacilityModal(photo: HomeFacilityImage): void {
    this.facilityModal.set({ src: resolveImageUrl(photo.image_url), alt: photo.alt_text || photo.title });
  }
  facilityImageUrl(imageUrl: string): string {
    return resolveImageUrl(imageUrl);
  }
  partnerImageUrl(imageUrl: string): string {
    return resolveImageUrl(imageUrl);
  }
  partnerDisplayName(partner: Partner): string {
    return this.translationService.currentLang() === 'ar' && partner.name_ar?.trim()
      ? partner.name_ar
      : partner.name;
  }
  partnerDisplayCategory(partner: Partner): string {
    if (this.translationService.currentLang() !== 'ar') return partner.category;
    if (partner.category_ar?.trim()) return partner.category_ar;

    const categoryKeys: Record<string, string> = {
      csl: 'technology', uhlmann: 'production', rota: 'production', bcm: 'vaccineResearch',
      kacst: 'academic', nibrt: 'bioprocess', dvs: 'business', zyme: 'project',
      keyplants: 'engineering', ath: 'supply'
    };
    const categoryKey = categoryKeys[this.partnerKey(partner)];
    return categoryKey ? this.translationService.translate(`partners.category.${categoryKey}`) : partner.category;
  }
  partnerDisplayDescription(partner: Partner): string {
    if (this.translationService.currentLang() !== 'ar') return partner.description;
    if (partner.description_ar?.trim()) return partner.description_ar;

    const partnerKey = this.partnerKey(partner);
    const knownPartners = new Set(['csl', 'uhlmann', 'rota', 'bcm', 'kacst', 'nibrt', 'dvs', 'zyme', 'keyplants', 'ath']);
    return this.translationService.translate(`partners.description.${knownPartners.has(partnerKey) ? partnerKey : 'fallback'}`);
  }
  partnerWebsiteUrl(partner: Partner): string | null {
    const fallbackSites: Record<string, string> = {
      zyme: 'https://www.zymebiotech.com/',
      'arabian trade house': 'https://www.ath.com.sa/'
    };
    const website = partner.website?.trim() || fallbackSites[partner.name.trim().toLowerCase()];
    if (!website) return null;
    return /^https?:\/\//i.test(website) ? website : `https://${website}`;
  }
  movePartnerCarousel(direction: -1 | 1): void {
    const track = this.homePartnerTrack?.nativeElement;
    const firstCard = track?.querySelector<HTMLElement>('.home-partner-showcase__card');
    if (!track || !firstCard) return;
    const gap = Number.parseFloat(getComputedStyle(track).columnGap || '0');
    track.scrollBy({ left: direction * (firstCard.getBoundingClientRect().width + gap), behavior: 'smooth' });
  }
  private partnerKey(partner: Partner): string {
    const id = String(partner.code || partner.id || '').toLowerCase();
    if (['csl', 'uhlmann', 'rota', 'bcm', 'kacst', 'nibrt', 'dvs', 'zyme', 'keyplants', 'ath'].includes(id)) return id;
    const name = partner.name.toLowerCase();
    if (name.includes('csl')) return 'csl';
    if (name.includes('uhlmann')) return 'uhlmann';
    if (name.includes('rota')) return 'rota';
    if (name.includes('baylor')) return 'bcm';
    if (name.includes('kacst')) return 'kacst';
    if (name.includes('nibrt')) return 'nibrt';
    if (name.includes('dvs')) return 'dvs';
    if (name.includes('zyme')) return 'zyme';
    if (name.includes('keyplants')) return 'keyplants';
    if (name.includes('arabian trade')) return 'ath';
    return '';
  }
  closeFacilityModal(): void {
    this.facilityModal.set(null);
  }
  openLeaderProfile(leader: AboutLeader): void {
    this.previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    this.selectedLeader = leader;
    const profile = localizeLeaderProfile(leader, this.translationService.currentLang() === 'ar');
    this.selectedLeaderModalProfile = { ...profile, image: profile.image ? resolveImageUrl(profile.image) : undefined };
    this.isLeaderModalOpen = true;
  }
  closeLeaderProfile(): void {
    this.isLeaderModalOpen = false;
    this.selectedLeader = null;
    this.selectedLeaderModalProfile = null;
    document.body.style.overflow = this.previousBodyOverflow;
  }
  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isLeaderModalOpen) this.closeLeaderProfile();
  }
  ngOnInit(): void {
    this.loadHomePartners();

    this.homeFacilityService.getImages().subscribe({
      next: ({ images }) => {
        if (images?.length) {
          this.facilityImages.set(images);
          this.facilityIndex.set(0);
        }
      }
    });
  }

  @HostListener('window:storage', ['$event'])
  onPartnerStorageChange(event: StorageEvent): void {
    if (event.key === 'vic_partners_updated') this.loadHomePartners();
  }

  private loadHomePartners(): void {
    this.partnerService.getPartners({ status: 'Active' }).subscribe({
      next: response => this.homePartners.set(response.success ? response.partners || [] : []),
      error: () => this.homePartners.set([])
    });
  }
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private revealObserver?: IntersectionObserver;
  private contentObserver?: MutationObserver;
  private readonly registeredElements = new WeakSet<Element>();

  private readonly revealSelector = [
    '.about-vic__eyebrow-wrapper',
    '.about-vic__heading',
    '.about-vic__desc',
    '.about-vic__action',
    '.about-vic__curved-media',
    '.about-vic__media-wrapper',
    '.platform__label',
    '.platform__heading',
    '.platform__intro',
    '.platform__card',
    '.home-product__copy > *',
    '.home-product__visual',
    '.home-product__feature',
    '.home-partners__copy > *',
    '.home-partner-showcase__card',
    '.news__label',
    '.news__heading',
    '.news__view-all',
    '.news__card',
    '.vision-support__copy > *',
    '.vision-support__pillar',
    '.vision-support__mark'
  ].join(',');

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      this.registerRevealElements(true);
      return;
    }

    this.revealObserver = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('home-reveal--visible');
          this.revealObserver?.unobserve(entry.target);
        }
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    this.registerRevealElements(false);

    // API-backed products, partners and news can arrive after the first render.
    this.contentObserver = new MutationObserver(() => this.registerRevealElements(false));
    this.contentObserver.observe(this.host.nativeElement, { childList: true, subtree: true });
  }

  ngOnDestroy(): void {
    this.revealObserver?.disconnect();
    this.contentObserver?.disconnect();
    if (this.isLeaderModalOpen && typeof document !== 'undefined') {
      document.body.style.overflow = this.previousBodyOverflow;
    }
  }

  private registerRevealElements(showImmediately: boolean): void {
    const elements = this.host.nativeElement.querySelectorAll<HTMLElement>(this.revealSelector);

    elements.forEach((element, index) => {
      if (this.registeredElements.has(element)) return;

      this.registeredElements.add(element);
      element.classList.add('home-reveal');
      element.style.setProperty('--home-reveal-delay', `${(index % 5) * 80}ms`);

      if (element.matches(
        '.about-vic__curved-media, .about-vic__media-wrapper, .home-product__visual, .platform__card, .home-partner-showcase__card, .news__card, .vision-support__mark'
      )) {
        element.classList.add('home-reveal--visual');
      }

      if (showImmediately) {
        element.classList.add('home-reveal--visible');
      } else {
        this.revealObserver?.observe(element);
      }
    });
  }
}
