import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject, computed, signal, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { TranslationService } from '../../../../../core/services/translation.service';
import { HomePageService } from '../../../../../core/services/home-page.service';
import { HomePageSection, PlatformCardContent } from '../../../../../core/models/home-page.model';
import { resolveImageUrl } from '../../../../../core/utils/image-url.util';
import { SectionHeadingPipe } from '../../../../../shared/pipes/section-heading.pipe';

interface PlatformCard {
  number: string;
  tag: string;
  tagColor: string;
  title: string;
  description: string;
  image: string;
  alt: string;
  route: string;
  imagePosition?: string;
}

@Component({
  selector: 'app-our-platform',
  imports: [SectionHeadingPipe],
  templateUrl: './our-platform.html',
  styleUrl: './our-platform.css'
})
export class OurPlatformComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  @ViewChild('carouselTrack') carouselTrack?: ElementRef<HTMLDivElement>;

  readonly translationService = inject(TranslationService);
  private readonly homePageService = inject(HomePageService);
  readonly platformContent = signal<HomePageSection | null>(null);
  readonly activeIndex = signal(0);
  private autoplayTimer?: ReturnType<typeof setInterval>;
  private isUserInteracting = false;
  private resizeObserver?: ResizeObserver;
  private contentObserver?: MutationObserver;

  ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver(() => this.updateDescriptionOverflow());
    const track = this.carouselTrack?.nativeElement;
    if (track) {
      this.contentObserver = new MutationObserver(() => this.observeDescriptions());
      this.contentObserver.observe(track, { childList: true, characterData: true, subtree: true });
    }
    this.observeDescriptions();
  }

  ngOnChanges(_changes: SimpleChanges): void {
    this.observeDescriptions();
  }

  readonly cards = computed<PlatformCard[]>(() => {
    const saved: PlatformCardContent[] = this.platformContent()?.content_json || [];
    const defaults: PlatformCard[] = [
    {
      number: this.translationService.translate('platform.card1.number'),
      tag: this.translationService.translate('platform.card1.tag'),
      tagColor: '#00E5C9',
      title: this.translationService.translate('platform.card1.title'),
      description: this.translationService.translate('platform.card1.desc'),
      image: 'slide_Images/vic_top1.webp',
      alt: 'VIC vaccine manufacturing facility and Riyadh campus',
      route: '/about',
      imagePosition: 'right 45%'
    },
    {
      number: this.translationService.translate('platform.card2.number'),
      tag: this.translationService.translate('platform.card2.tag'),
      tagColor: '#3B82F6',
      title: this.translationService.translate('platform.card2.title'),
      description: this.translationService.translate('platform.card2.desc'),
      image: 'purple_glove_vial_needle_macro.jpg',
      alt: 'Research & Development — Vaccine Innovations',
      route: '/about',
      imagePosition: 'right center'
    },
    {
      number: this.translationService.translate('platform.card3.number'),
      tag: this.translationService.translate('platform.card3.tag'),
      tagColor: '#00E5C9',
      title: this.translationService.translate('platform.card3.title'),
      description: this.translationService.translate('platform.card3.desc'),
      image: 'p4.webp',
      alt: 'Targeted Products — Industrial Vaccine Solutions',
      route: '/about',
      imagePosition: '85% center'
    }
    ];
    return defaults.map((card, index) => {
      const content = saved[index];
      if (!content) return card;
      const rtl = this.translationService.isRtl();
      const description = (rtl ? content.description_ar : content.description) || card.description;
      return {
        ...card,
        tag: (rtl ? content.tag_ar : content.tag) || card.tag,
        description,
        image: resolveImageUrl(content.image_url, card.image)
      };
    });
  });

  get eyebrow(): string {
    const content = this.platformContent();
    return (this.translationService.isRtl() ? content?.badge_ar : content?.badge) || this.translationService.translate('platform.eyebrow');
  }
  get heading(): string {
    const content = this.platformContent();
    return (this.translationService.isRtl() ? content?.title_ar : content?.title) || this.translationService.translate('platform.heading');
  }
  get intro(): string {
    const content = this.platformContent();
    return (this.translationService.isRtl() ? content?.description_ar : content?.description) || this.translationService.translate('platform.intro');
  }

  ngOnInit(): void {
    this.homePageService.getContent().subscribe({ next: response => this.platformContent.set(response.content.platform), error: () => undefined });
    this.startAutoplay();
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
    this.resizeObserver?.disconnect();
    this.contentObserver?.disconnect();
  }

  private observeDescriptions(): void {
    if (!this.resizeObserver || !this.carouselTrack?.nativeElement) return;
    this.resizeObserver.disconnect();
    this.carouselTrack.nativeElement.querySelectorAll<HTMLElement>('.platform__card-desc').forEach(element => {
      this.resizeObserver?.observe(element);
    });
    requestAnimationFrame(() => this.updateDescriptionOverflow());
  }

  private updateDescriptionOverflow(): void {
    this.carouselTrack?.nativeElement.querySelectorAll<HTMLElement>('.platform__card-details').forEach(details => {
      const description = details.querySelector<HTMLElement>('.platform__card-desc');
      if (!description) return;
      const lineHeight = parseFloat(getComputedStyle(description).lineHeight) || 24;
      details.classList.toggle('platform__card-details--long', description.scrollHeight > lineHeight * 2 + 1);
    });
  }

  toggleDescription(event: MouseEvent): void {
    const button = event.currentTarget as HTMLButtonElement;
    const details = button.closest<HTMLElement>('.platform__card-details');
    if (!details) return;
    const expanded = details.classList.toggle('platform__card-details--expanded');
    button.setAttribute('aria-label', expanded ? 'Show less description' : 'Show full description');
    button.setAttribute('aria-expanded', String(expanded));
  }

  private startAutoplay(): void {
    this.stopAutoplay();
    this.autoplayTimer = setInterval(() => {
      // Only auto-slide if track is scrollable (e.g. mobile viewport) and user is not interacting
      const track = this.carouselTrack?.nativeElement;
      if (!track || this.isUserInteracting) return;

      const isMobile = track.scrollWidth > track.clientWidth + 10;
      if (isMobile) {
        const next = (this.activeIndex() + 1) % this.cards().length;
        this.scrollToIndex(next);
      }
    }, 4000);
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

  nextSlide(): void {
    const next = (this.activeIndex() + 1) % this.cards().length;
    this.scrollToIndex(next);
    this.startAutoplay(); // Reset timer on manual action
  }

  prevSlide(): void {
    const prev = (this.activeIndex() - 1 + this.cards().length) % this.cards().length;
    this.scrollToIndex(prev);
    this.startAutoplay(); // Reset timer on manual action
  }

  onScroll(event: Event): void {
    const el = event.target as HTMLElement;
    if (!el) return;
    const cardWidth = el.scrollWidth / this.cards().length;
    const index = Math.round(el.scrollLeft / cardWidth);
    if (index !== this.activeIndex() && index >= 0 && index < this.cards().length) {
      this.activeIndex.set(index);
    }
  }

  scrollToIndex(index: number): void {
    const track = this.carouselTrack?.nativeElement;
    if (!track) return;
    const cardWidth = track.scrollWidth / this.cards().length;
    track.scrollTo({
      left: cardWidth * index,
      behavior: 'smooth'
    });
    this.activeIndex.set(index);
  }
}
