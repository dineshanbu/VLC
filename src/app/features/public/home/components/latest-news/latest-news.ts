import { Component, ElementRef, OnDestroy, OnInit, ViewChild, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { resolveImageUrl } from '../../../../../core/utils/image-url.util';

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

  getImageUrl(url?: string | null): string {
    return resolveImageUrl(url);
  }

  readonly activeIndex = signal(0);
  private autoplayTimer?: ReturnType<typeof setInterval>;
  private isUserInteracting = false;

  readonly news: NewsItem[] = [
    {
      date: 'October 30, 2025',
      title: 'VIC Signs Strategic MoU with CSL Seqirus and Saudi MoH to Localise Cell-Based Influenza Vaccine Manufacturing',
      link: 'https://vaccine.com.sa/vic-signs-strategic-mou-with-csl-seqirus-and-saudi-moh-to-localise-cell-based-influenza-vaccine-manufacturing/',
      image: 'news1.jpeg'
    },
    {
      date: 'January 19, 2025',
      title: 'Construction of Saudi Arabia’s first human vaccine factory begins',
      link: 'https://vaccine.com.sa/construction-of-saudi-arabias-first-human-vaccine-factory/',
      image: 'news2.jpg'
    },
    {
      date: 'October 26, 2024',
      title: 'Exciting Collaboration for Innovation in Vaccine Research and Development!',
      link: 'https://vaccine.com.sa/exciting-collaboration-for-innovation-in-vaccine-research/',
      image: 'news3.jpg'
    },
    {
      date: 'October 9, 2024',
      title: 'Vaccine Industrial Company Unveils New Company Introduction Video',
      link: 'https://vaccine.com.sa/unveils-new-company-introduction-video/',
      image: 'news4.jpg'
    }
  ];

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
        const next = (this.activeIndex() + 1) % this.news.length;
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
    const next = (this.activeIndex() + 1) % this.news.length;
    this.scrollToIndex(next);
    this.startAutoplay();
  }

  prevSlide(): void {
    const prev = (this.activeIndex() - 1 + this.news.length) % this.news.length;
    this.scrollToIndex(prev);
    this.startAutoplay();
  }

  onScroll(event: Event): void {
    const el = event.target as HTMLElement;
    if (!el) return;
    const cardWidth = el.scrollWidth / this.news.length;
    const index = Math.round(el.scrollLeft / cardWidth);
    if (index !== this.activeIndex() && index >= 0 && index < this.news.length) {
      this.activeIndex.set(index);
    }
  }

  scrollToIndex(index: number): void {
    const track = this.carouselTrack?.nativeElement;
    if (!track) return;
    const cardWidth = track.scrollWidth / this.news.length;
    track.scrollTo({
      left: cardWidth * index,
      behavior: 'smooth'
    });
    this.activeIndex.set(index);
  }
}
