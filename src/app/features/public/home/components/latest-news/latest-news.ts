import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { resolveImageUrl } from '../../../../../core/utils/image-url.util';
import { TranslationService } from '../../../../../core/services/translation.service';
import { NewsService } from '../../../../../core/services/news.service';
import { AdminNewsArticle } from '../../../../../core/models/news.model';

interface NewsItem {
  date: string;
  title: string;
  link: string;
  image: string;
}

@Component({
  selector: 'app-latest-news',
  imports: [RouterLink],
  templateUrl: './latest-news.html',
  styleUrl: './latest-news.css'
})
export class LatestNewsComponent implements OnInit, OnDestroy {
  @ViewChild('carouselTrack') carouselTrack?: ElementRef<HTMLDivElement>;

  readonly translationService = inject(TranslationService);
  private readonly newsService = inject(NewsService);

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
  private autoplayTimer?: ReturnType<typeof setInterval>;
  private isUserInteracting = false;

  private readonly fallbackNews = computed<NewsItem[]>(() => [
    {
      date: this.translationService.translate('news.item1.date') || 'October 30, 2025',
      title: this.translationService.translate('news.item1.title') || 'VIC Signs Strategic MoU with CSL Seqirus and Saudi MoH to Localise Cell-Based Influenza Vaccine Manufacturing',
      link: '/news/vic-signs-strategic-mou-with-csl-seqirus-and-saudi-moh-to-localise-cell-based-influenza-vaccine-manufacturing',
      image: 'news1.jpeg'
    },
    {
      date: this.translationService.translate('news.item2.date') || 'January 19, 2025',
      title: this.translationService.translate('news.item2.title') || 'Construction of Saudi Arabia’s first human vaccine factory begins',
      link: '/news/construction-of-saudi-arabias-first-human-vaccine-factory',
      image: 'news2.jpg'
    },
    {
      date: this.translationService.translate('news.item3.date') || 'October 26, 2024',
      title: this.translationService.translate('news.item3.title') || 'Exciting Collaboration for Innovation in Vaccine Research and Development!',
      link: '/news/exciting-collaboration-for-innovation-in-vaccine-research',
      image: 'news3.jpg'
    },
    {
      date: this.translationService.translate('news.item4.date') || 'October 9, 2024',
      title: this.translationService.translate('news.item4.title') || 'VIC Unveils New Company Introduction Video',
      link: '/news/unveils-new-company-introduction-video',
      image: 'news4.jpg'
    }
  ]);

  readonly news = signal<NewsItem[]>([]);

  ngOnInit(): void {
    this.news.set(this.fallbackNews().slice(0, 3));
    this.loadLatestNews();
    this.startAutoplay();
  }

  private loadLatestNews(): void {
    this.newsService.getNews({ status: 'Published' }).subscribe({
      next: response => {
        if (!response.success || !response.articles?.length) return;

        const validArticles = response.articles.filter(a => a && a.title);
        if (!validArticles.length) return;

        const latest = [...validArticles]
          .sort((a, b) => this.newsTimestamp(b) - this.newsTimestamp(a))
          .slice(0, 3)
          .map((article, idx) => ({
            date: article.formatted_date || article.date_str || this.formatDate(article.created_at) || 'Latest Update',
            title: article.title,
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

  private newsTimestamp(article: AdminNewsArticle): number {
    const date = article.date_str || article.formatted_date || article.created_at;
    const timestamp = date ? Date.parse(date) : NaN;
    return Number.isNaN(timestamp) ? Number(article.id || 0) : timestamp;
  }

  private formatDate(date?: string): string {
    if (!date) return '';
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime())
      ? date
      : new Intl.DateTimeFormat(this.translationService.isRtl() ? 'ar-SA' : 'en-US', {
          year: 'numeric', month: 'long', day: 'numeric'
        }).format(parsed);
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
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
