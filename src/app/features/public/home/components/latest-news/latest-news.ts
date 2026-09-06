import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { resolveImageUrl } from '../../../../../core/utils/image-url.util';
import { TranslationService } from '../../../../../core/services/translation.service';

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

  getImageUrl(url?: string | null): string {
    return resolveImageUrl(url);
  }

  readonly activeIndex = signal(0);
  private autoplayTimer?: ReturnType<typeof setInterval>;
  private isUserInteracting = false;

  readonly news = computed<NewsItem[]>(() => [
    {
      date: this.translationService.translate('news.item1.date'),
      title: this.translationService.translate('news.item1.title'),
      link: 'https://vaccine.com.sa/vic-signs-strategic-mou-with-csl-seqirus-and-saudi-moh-to-localise-cell-based-influenza-vaccine-manufacturing/',
      image: 'news1.jpeg'
    },
    {
      date: this.translationService.translate('news.item2.date'),
      title: this.translationService.translate('news.item2.title'),
      link: 'https://vaccine.com.sa/construction-of-saudi-arabias-first-human-vaccine-factory/',
      image: 'news2.jpg'
    },
    {
      date: this.translationService.translate('news.item3.date'),
      title: this.translationService.translate('news.item3.title'),
      link: 'https://vaccine.com.sa/exciting-collaboration-for-innovation-in-vaccine-research/',
      image: 'news3.jpg'
    },
    {
      date: this.translationService.translate('news.item4.date'),
      title: this.translationService.translate('news.item4.title'),
      link: 'https://vaccine.com.sa/unveils-new-company-introduction-video/',
      image: 'news4.jpg'
    }
  ]);

  ngOnInit(): void {
    this.startAutoplay();
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
