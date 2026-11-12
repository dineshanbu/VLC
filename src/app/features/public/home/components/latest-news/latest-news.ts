import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { resolveImageUrl } from '../../../../../core/utils/image-url.util';
import { TranslationService } from '../../../../../core/services/translation.service';
import { NewsService } from '../../../../../core/services/news.service';
import { AdminNewsArticle } from '../../../../../core/models/news.model';
import { HomePageService } from '../../../../../core/services/home-page.service';
import { HomePageSection } from '../../../../../core/models/home-page.model';
import { ContactPageSettings, ContactService, DEFAULT_CONTACT_PAGE_SETTINGS } from '../../../../../core/services/contact.service';
import { VideoMediaGalleryComponent } from '../video-media-gallery/video-media-gallery';
import { SectionHeadingPipe } from '../../../../../shared/pipes/section-heading.pipe';

interface NewsItem {
  date: string;
  title: string;
  title_ar?: string;
  link: string;
  image: string;
}

@Component({
  selector: 'app-latest-news',
  imports: [RouterLink, VideoMediaGalleryComponent, SectionHeadingPipe],
  templateUrl: './latest-news.html',
  styleUrl: './latest-news.css'
})
export class LatestNewsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('carouselTrack') carouselTrack?: ElementRef<HTMLDivElement>;
  @ViewChild('locationsTrack') locationsTrack?: ElementRef<HTMLDivElement>;
  @ViewChild('locationsSection') locationsSection?: ElementRef<HTMLElement>;

  readonly translationService = inject(TranslationService);
  private readonly newsService = inject(NewsService);
  private readonly homePageService = inject(HomePageService);
  private readonly contactService = inject(ContactService);
  readonly supportingContent = signal<HomePageSection | null>(null);
  readonly officeSection = signal<HomePageSection | null>(null);
  readonly contactPageSettings = signal<ContactPageSettings>({ ...DEFAULT_CONTACT_PAGE_SETTINGS });

  readonly fallbackImages = [
    'news1.jpeg',
    'news2.jpg',
    'news3.jpg',
    'news4.jpg'
  ];

  getImageUrl(url?: string | null, index = 0): string {
    const fallback = this.fallbackImages[index % this.fallbackImages.length];
    if (!url || !url.trim()) return fallback;
    const resolved = resolveImageUrl(url, fallback);
    return resolved || fallback;
  }

  getSupportingImageUrl(): string {
    return resolveImageUrl(this.supportingContent()?.image_url, 'saudi-vision-biotech-strategy.png');
  }

  getOfficeImageUrl(): string {
    return resolveImageUrl(this.contactPageSettings().office_image, 'layered-glass-vaccine-building-card.png');
  }

  getFacilityImageUrl(): string {
    return resolveImageUrl(this.contactPageSettings().facility_image, 'layered-glass-vaccine-building-card.png');
  }

  getOfficeBackgroundStyle(): string {
    return `url("${resolveImageUrl('Abstract Teal Tech Wave Background.png')}")`;
  }

  onImgError(event: Event, index = 0): void {
    const img = event.target as HTMLImageElement;
    if (!img) return;
    const fallback = this.fallbackImages[index % this.fallbackImages.length];
    if (img.getAttribute('data-failed') !== 'true') {
      img.setAttribute('data-failed', 'true');
      img.src = fallback;
    }
  }

  readonly activeIndex = signal(0);
  readonly activeLocationSlide = signal(0);
  private autoplayTimer?: ReturnType<typeof setInterval>;
  private locationAutoplayTimer?: ReturnType<typeof setInterval>;
  private locationVisibilityObserver?: IntersectionObserver;
  private isUserInteracting = false;

  scrollLocationSlide(direction: -1 | 1): void {
    const track = this.locationsTrack?.nativeElement;
    if (!track) return;

    const slides = track.querySelectorAll<HTMLElement>('.home-office__container');
    const nextIndex = Math.max(0, Math.min(slides.length - 1, this.activeLocationSlide() + direction));
    const nextSlide = slides.item(nextIndex);
    if (!nextSlide) return;

    this.activeLocationSlide.set(nextIndex);
    nextSlide.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  onLocationsScroll(): void {
    const track = this.locationsTrack?.nativeElement;
    if (!track) return;

    const slides = Array.from(track.querySelectorAll<HTMLElement>('.home-office__container'));
    if (!slides.length) return;

    const trackCenter = track.getBoundingClientRect().left + track.clientWidth / 2;
    const nearestIndex = slides.reduce((nearest, slide, index) => {
      const distance = Math.abs(slide.getBoundingClientRect().left + slide.offsetWidth / 2 - trackCenter);
      const nearestDistance = Math.abs(slides[nearest].getBoundingClientRect().left + slides[nearest].offsetWidth / 2 - trackCenter);
      return distance < nearestDistance ? index : nearest;
    }, 0);

    this.activeLocationSlide.set(nearestIndex);
  }

  readonly news = signal<NewsItem[]>([]);

  ngOnInit(): void {
    this.homePageService.getContent().subscribe({
      next: response => {
        this.supportingContent.set(response.content.supporting);
        this.officeSection.set(response.content.our_office || null);
      },
      error: () => undefined
    });
    this.contactService.getPageSettings().subscribe({
      next: response => { if (response.success && response.settings) this.contactPageSettings.set({ ...DEFAULT_CONTACT_PAGE_SETTINGS, ...response.settings }); }
    });
    this.loadLatestNews();
    this.startAutoplay();
  }

  ngAfterViewInit(): void {
    const section = this.locationsSection?.nativeElement;
    if (!section || typeof IntersectionObserver === 'undefined') return;

    this.locationVisibilityObserver = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting && entry.intersectionRatio >= 0.35) {
        this.startLocationAutoplay();
      } else {
        this.stopLocationAutoplay();
      }
    }, { threshold: [0, 0.35] });
    this.locationVisibilityObserver.observe(section);
  }

  @HostListener('window:storage', ['$event'])
  onContactSettingsUpdated(event: StorageEvent): void {
    if (event.key !== 'vic_contact_page_updated') return;
    this.contactService.getPageSettings().subscribe({
      next: response => { if (response.success && response.settings) this.contactPageSettings.set({ ...DEFAULT_CONTACT_PAGE_SETTINGS, ...response.settings }); }
    });
  }

  private loadLatestNews(): void {
    this.newsService.getNews({ status: 'Published' }).subscribe({
      next: response => {
        if (!response.success || !response.articles?.length) return;

        const validArticles = response.articles.filter(a => a && (a.title?.trim() || a.title_ar?.trim()));
        if (!validArticles.length) return;

        const latest = [...validArticles]
          .sort((a, b) => this.newsTimestamp(b) - this.newsTimestamp(a))
          .slice(0, 3)
          .map((article, idx) => ({
            date: article.formatted_date || article.date_str || article.created_at || 'Latest Update',
            title: article.title?.trim() || article.title_ar?.trim() || '',
            title_ar: article.title_ar?.trim() || '',
            link: `/news/${article.slug || article.id}`,
            image: article.image?.trim() ? article.image.trim() : this.fallbackImages[idx % this.fallbackImages.length]
          }));

        if (latest.length > 0) {
          this.news.set(latest);
          this.activeIndex.set(0);
        }
      },
      error: () => {
        // Keep the translated fallback cards when the API is unavailable.
      }
    });
  }

  displayTitle(item: NewsItem): string {
    if (this.translationService.isRtl()) return item.title_ar?.trim() || item.title.trim();
    return item.title.trim() || item.title_ar?.trim() || '';
  }

  isArabicText(text: string): boolean {
    return /\p{Script=Arabic}/u.test(text);
  }

  displayDate(date: string): string {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return date;
    return new Intl.DateTimeFormat(this.translationService.isRtl() ? 'ar-SA' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    }).format(parsed);
  }

  private newsTimestamp(article: AdminNewsArticle): number {
    const date = article.date_str || article.formatted_date || article.created_at;
    const timestamp = date ? Date.parse(date) : NaN;
    return Number.isNaN(timestamp) ? Number(article.id || 0) : timestamp;
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
    this.stopLocationAutoplay();
    this.locationVisibilityObserver?.disconnect();
  }

  private startLocationAutoplay(): void {
    this.stopLocationAutoplay();
    this.locationAutoplayTimer = setInterval(() => {
      const track = this.locationsTrack?.nativeElement;
      const slides = track?.querySelectorAll<HTMLElement>('.home-office__container');
      if (!track || !slides?.length) return;

      const nextIndex = (this.activeLocationSlide() + 1) % slides.length;
      this.activeLocationSlide.set(nextIndex);
      slides.item(nextIndex)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }, 5000);
  }

  private stopLocationAutoplay(): void {
    if (this.locationAutoplayTimer) {
      clearInterval(this.locationAutoplayTimer);
      this.locationAutoplayTimer = undefined;
    }
  }

  private startAutoplay(): void {
    this.stopAutoplay();
    this.autoplayTimer = setInterval(() => {
      const track = this.carouselTrack?.nativeElement;
      if (!track || this.isUserInteracting) return;

      const isMobile = track.scrollWidth > track.clientWidth + 10;
      if (isMobile) {
        const next = (this.activeIndex() + 1) % this.news().length;
        this.scrollToIndex(next);
      }
    }, 4200);
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
    const next = (this.activeIndex() + 1) % this.news().length;
    this.scrollToIndex(next);
    this.startAutoplay();
  }

  prevSlide(): void {
    const prev = (this.activeIndex() - 1 + this.news().length) % this.news().length;
    this.scrollToIndex(prev);
    this.startAutoplay();
  }

  onScroll(event: Event): void {
    const el = event.target as HTMLElement;
    if (!el) return;
    const cardWidth = el.scrollWidth / this.news().length;
    const index = Math.round(el.scrollLeft / cardWidth);
    if (index !== this.activeIndex() && index >= 0 && index < this.news().length) {
      this.activeIndex.set(index);
    }
  }

  scrollToIndex(index: number): void {
    const track = this.carouselTrack?.nativeElement;
    if (!track) return;
    const cardWidth = track.scrollWidth / this.news().length;
    track.scrollTo({
      left: cardWidth * index,
      behavior: 'smooth'
    });
    this.activeIndex.set(index);
  }
}
