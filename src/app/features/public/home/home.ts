import { AfterViewInit, Component, ElementRef, OnDestroy, inject, signal, computed } from '@angular/core';
import { TranslationService } from '../../../core/services/translation.service';
import { HeroComponent } from './components/hero/hero';
import { AboutVicComponent } from './components/about-vic/about-vic';
import { OurPlatformComponent } from './components/our-platform/our-platform';
import { LatestNewsComponent } from './components/latest-news/latest-news';
import { HomeShowcaseComponent } from './components/home-showcase/home-showcase';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [HeroComponent, AboutVicComponent, OurPlatformComponent, HomeShowcaseComponent, LatestNewsComponent, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  readonly translationService = inject(TranslationService);
  readonly facilityIndex = signal(0);
  readonly facilityModal = signal<{ src: string; alt: string } | null>(null);
  readonly showAllHomePartners = signal(false);
  readonly homePartners = [
    { name: 'CSL Seqirus', logo: 'https://vaccine.com.sa/backend/uploads/1789214396018-877230708-csl.png' },
    { name: 'Uhlmann Group', logo: 'https://vaccine.com.sa/backend/uploads/1789214524819-107356370-Uhlmann.jpg' },
    { name: 'Baylor College of Medicine', logo: 'https://vaccine.com.sa/backend/uploads/1789214534378-315607508-Baylor.jpg' },
    { name: 'BE', logo: 'https://vaccine.com.sa/backend/uploads/1789214540151-766112156-BE.jpg' },
    { name: 'SK bioscience', logo: 'https://vaccine.com.sa/backend/uploads/1789214547139-88023962-SK.jpg' },
    { name: 'Bharat Biotech', logo: 'https://vaccine.com.sa/backend/uploads/1789214553262-858953242-Bharat.png' },
    { name: 'Rota', logo: 'https://vaccine.com.sa/backend/uploads/1789214560702-200446247-Rota.jpg' },
    { name: 'KACST', logo: 'https://vaccine.com.sa/backend/uploads/1789214573340-693083447-Kacst.jpg' },
    { name: 'NIBRT', logo: 'https://vaccine.com.sa/backend/uploads/1789214578857-33286875-Nibrt.jpg' },
    { name: 'DVS Pharma', logo: 'https://vaccine.com.sa/backend/uploads/1789214584012-882017415-dvs.png' },
    { name: 'KeyPlants', logo: 'https://vaccine.com.sa/backend/uploads/1789214592238-239671210-Keyplants.png' },
    { name: 'Arabian Trade House', logo: 'https://vaccine.com.sa/backend/uploads/1789214597515-369094671-Arabian_trade_house.png' },
    { name: 'Zyme Biotech', logo: 'https://vaccine.com.sa/backend/uploads/1789214602591-452447184-zyme.jpg' }
  ];
  readonly displayedHomePartners = computed(() => this.showAllHomePartners() ? this.homePartners : this.homePartners.slice(0, 4));
  readonly facilityImages = [
    { src: 'slide_Images/vlc0.png', alt: 'VIC facility exterior' },
    { src: 'slide_Images/Vic main1.png', alt: 'VIC manufacturing facility exterior' },
    { src: 'slide_Images/Vic main2.png', alt: 'VIC manufacturing facility' },
    { src: 'slide_Images/Vic RDI.png', alt: 'VIC research and development facility' },
    { src: 'slide_Images/Vic side 2.png', alt: 'VIC facility side view' },
    { src: 'slide_Images/vic side 3.png', alt: 'VIC facility campus view' },
    { src: 'slide_Images/vic side.png', alt: 'VIC facility exterior view' },
    { src: 'slide_Images/Vic top1.png', alt: 'VIC facility aerial view' }
  ];
  readonly visibleFacilities = computed(() => Array.from(
    { length: Math.min(3, this.facilityImages.length) },
    (_, offset) => this.facilityImages[(offset + this.facilityIndex()) % this.facilityImages.length]
  ));
  moveFacility(direction: number): void {
    this.facilityIndex.update(index => (index + direction + this.facilityImages.length) % this.facilityImages.length);
  }
  openFacilityModal(photo: { src: string; alt: string }): void {
    this.facilityModal.set(photo);
  }
  closeFacilityModal(): void {
    this.facilityModal.set(null);
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
    '.home-partners__logo',
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
  }

  private registerRevealElements(showImmediately: boolean): void {
    const elements = this.host.nativeElement.querySelectorAll<HTMLElement>(this.revealSelector);

    elements.forEach((element, index) => {
      if (this.registeredElements.has(element)) return;

      this.registeredElements.add(element);
      element.classList.add('home-reveal');
      element.style.setProperty('--home-reveal-delay', `${(index % 5) * 80}ms`);

      if (element.matches(
        '.about-vic__curved-media, .about-vic__media-wrapper, .home-product__visual, .platform__card, .home-partners__logo, .news__card, .vision-support__mark'
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
