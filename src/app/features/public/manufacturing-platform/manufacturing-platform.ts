import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { ManufacturingPlatformService } from '../../../core/services/manufacturing-platform.service';
import { TranslationService } from '../../../core/services/translation.service';
import { ManufacturingPlatformContent, defaultManufacturingPlatformContent, mergeManufacturingPlatformContent } from '../../../core/models/manufacturing-platform.model';
import { resolveImageUrl } from '../../../core/utils/image-url.util';
import { SectionHeadingPipe } from '../../../shared/pipes/section-heading.pipe';

@Component({
  selector: 'app-manufacturing-platform',
  standalone: true,
  imports: [CommonModule, SectionHeadingPipe],
  templateUrl: './manufacturing-platform.html',
  styleUrls: ['../public-theme.css', './manufacturing-platform.css']
})
export class ManufacturingPlatformComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly service = inject(ManufacturingPlatformService);
  readonly translationService = inject(TranslationService);
  readonly content = signal<ManufacturingPlatformContent>(defaultManufacturingPlatformContent);
  readonly apiHeroImage = signal<{ en: string; ar: string }>({ en: '', ar: '' });
  heroContentLoaded = false;
  readonly activeStage = signal(0);
  readonly expandedStage = signal<number | null>(0);
  readonly stageTransitioning = signal(false);
  readonly growthSlide = signal(0);
  @ViewChild('journeySection') private journeySection?: ElementRef<HTMLElement>;
  @ViewChild('growthCarousel') private growthCarousel?: ElementRef<HTMLElement>;
  private carouselTimer: ReturnType<typeof setInterval> | null = null;
  private stageTransitionTimer: ReturnType<typeof setTimeout> | null = null;
  private carouselVisibilityObserver?: IntersectionObserver;

  ngOnInit(): void {
    this.loadContent();
  }

  ngAfterViewInit(): void {
    const section = this.journeySection?.nativeElement;
    if (!section || typeof IntersectionObserver === 'undefined') return;

    this.carouselVisibilityObserver = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting && entry.intersectionRatio >= 0.35) this.startCarousel();
      else this.stopCarousel();
    }, { threshold: [0, 0.35] });
    this.carouselVisibilityObserver.observe(section);
  }

  @HostListener('window:storage', ['$event'])
  onPlatformContentStorageChange(event: StorageEvent): void {
    if (event.key === 'vic_manufacturing_platform_updated') this.loadContent();
  }

  private loadContent(): void {
    this.heroContentLoaded = false;
    this.service.getContent().subscribe({
      next: response => {
        if (response.success && response.content) {
          const hero = response.content.hero;
          this.apiHeroImage.set({ en: hero?.image_url || '', ar: hero?.image_url_ar || '' });
          this.content.set(mergeManufacturingPlatformContent(response.content));
        }
        this.heroContentLoaded = true;
      },
      error: () => { this.apiHeroImage.set({ en: '', ar: '' }); this.content.set(defaultManufacturingPlatformContent); this.heroContentLoaded = true; }
    });
  }

  ngOnDestroy(): void {
    this.stopCarousel();
    this.carouselVisibilityObserver?.disconnect();
    if (this.stageTransitionTimer) clearTimeout(this.stageTransitionTimer);
  }

  get isArabic(): boolean { return this.translationService.currentLang() === 'ar'; }
  get heroImageUrl(): string {
    const image = this.apiHeroImage();
    const path = this.isArabic ? image.ar || image.en : image.en;
    return path ? resolveImageUrl(path) : '';
  }
  localized(english: string, arabic?: string): string { return this.isArabic && arabic?.trim() ? arabic : english; }
  heroText(field: 'badge' | 'title' | 'description' | 'button_text'): string {
    const hero = this.content().hero;
    const arabicField = `${field}_ar` as keyof typeof hero;
    return this.localized(hero[field] || '', typeof hero[arabicField] === 'string' ? hero[arabicField] as string : '');
  }

  imageUrl(path: string): string { return resolveImageUrl(path); }
  onStageImageError(event: Event): void {
    const image = event.target as HTMLImageElement;
    if (image && !image.src.endsWith('home_banner.webp')) image.src = 'home_banner.webp';
  }
  setActiveStage(index: number): void {
    if (this.activeStage() !== index) {
      this.stageTransitioning.set(true);
      if (this.stageTransitionTimer) clearTimeout(this.stageTransitionTimer);
      this.stageTransitionTimer = setTimeout(() => {
        this.stageTransitioning.set(false);
        this.stageTransitionTimer = null;
      }, 360);
    }
    this.activeStage.set(index);
    this.expandedStage.set(index);
  }
  moveCarousel(direction: -1 | 1): void {
    const stageCount = this.content().journey.stages.length;
    if (!stageCount) return;
    this.setActiveStage((this.activeStage() + direction + stageCount) % stageCount);
  }
  private startCarousel(): void {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (this.carouselTimer) return;
    this.carouselTimer = setInterval(() => {
      if (window.matchMedia('(min-width: 768px)').matches) this.moveCarousel(1);
    }, 5000);
  }
  private stopCarousel(): void {
    if (this.carouselTimer) {
      clearInterval(this.carouselTimer);
      this.carouselTimer = null;
    }
  }
  toggleStage(index: number): void {
    if (this.expandedStage() === index) {
      this.expandedStage.set(null);
      return;
    }
    this.expandedStage.set(index);
    this.activeStage.set(index);
  }
  moveGrowthSlide(direction: -1 | 1): void {
    const phases = this.content().growth.phases;
    if (!phases.length) return;
    const next = (this.growthSlide() + direction + phases.length) % phases.length;
    this.goToGrowthSlide(next);
  }
  goToGrowthSlide(index: number): void {
    const phases = this.content().growth.phases;
    const cards = this.growthCarousel?.nativeElement.querySelectorAll<HTMLElement>('.manufacturing-growth-card');
    if (index < 0 || index >= phases.length || !cards?.[index]) return;
    this.growthSlide.set(index);
    cards[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  }
  onGrowthCarouselScroll(): void {
    const carousel = this.growthCarousel?.nativeElement;
    if (!carousel) return;
    const center = carousel.getBoundingClientRect().left + carousel.clientWidth / 2;
    const cards = Array.from(carousel.querySelectorAll<HTMLElement>('.manufacturing-growth-card'));
    if (!cards.length) return;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;
    cards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const distance = Math.abs(rect.left + rect.width / 2 - center);
      if (distance < closestDistance) { closestIndex = index; closestDistance = distance; }
    });
    if (this.growthSlide() !== closestIndex) this.growthSlide.set(closestIndex);
  }
  stageIcon(index: number): string[] {
    const icons: Record<number, string[]> = {
      0: ['M10 3h4M11 3v6l-5 9a2 2 0 0 0 2 3h8a2 2 0 0 0 2-3l-5-9V3', 'M8 15h8'],
      1: ['M3 7l9-4 9 4-9 4-9-4z', 'M3 7v10l9 4 9-4V7', 'M12 11v10'],
      2: ['M3 4v16M6 4v16M9 4v16M12 4v16M15 4v16M18 4v16M21 4v16'],
      3: ['M8 3h6v2h-1v5l4 4a4 4 0 1 1-6 6H5', 'M4 20h16', 'M8 16a4 4 0 0 0 8 0', 'M17 6l3-3'],
      4: ['M12 2v20M4 6l16 12M20 6 4 18', 'M8 2l4 4 4-4M8 22l4-4 4 4', 'M2 10l6 1-1-6M22 14l-6-1 1 6']
    };
    return icons[index] || icons[0];
  }

  onHeroImageError(event: Event): void {
    const image = event.currentTarget as HTMLImageElement;
    image.style.display = 'none';
  }
}
