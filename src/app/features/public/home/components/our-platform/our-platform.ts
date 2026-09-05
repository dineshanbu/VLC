import { Component, ElementRef, OnDestroy, OnInit, ViewChild, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

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
  imports: [RouterLink],
  templateUrl: './our-platform.html',
  styleUrl: './our-platform.css'
})
export class OurPlatformComponent implements OnInit, OnDestroy {
  @ViewChild('carouselTrack') carouselTrack?: ElementRef<HTMLDivElement>;

  readonly activeIndex = signal(0);
  private autoplayTimer?: ReturnType<typeof setInterval>;
  private isUserInteracting = false;

  cards: PlatformCard[] = [
    {
      number: '01',
      tag: 'LOCALIZE',
      tagColor: '#00E5C9',
      title: 'Biomanufacturing',
      description: 'Empowering communities through localizing the manufacturing of vaccines in Saudi Arabia.',
      image: 'vicbirdview.png',
      alt: 'Biomanufacturing — VIC Facility Aerial View',
      route: '/platform',
      imagePosition: 'right 45%'
    },
    {
      number: '02',
      tag: 'INNOVATE',
      tagColor: '#3B82F6',
      title: 'Research & Development',
      description: 'Advancing science through research, development and innovation in vaccine technologies.',
      image: 'purple_glove_vial_needle_macro.jpg',
      alt: 'Research & Development — Vaccine Innovations',
      route: '/platform',
      imagePosition: 'right center'
    },
    {
      number: '03',
      tag: 'SCALE',
      tagColor: '#00E5C9',
      title: 'Targeted Products',
      description: 'Building world-class manufacturing capabilities to deliver vaccines at scale.',
      image: 'p4.png',
      alt: 'Targeted Products — Industrial Vaccine Solutions',
      route: '/products',
      imagePosition: '85% center'
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
      // Only auto-slide if track is scrollable (e.g. mobile viewport) and user is not interacting
      const track = this.carouselTrack?.nativeElement;
      if (!track || this.isUserInteracting) return;

      const isMobile = track.scrollWidth > track.clientWidth + 10;
      if (isMobile) {
        const next = (this.activeIndex() + 1) % this.cards.length;
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
    const next = (this.activeIndex() + 1) % this.cards.length;
    this.scrollToIndex(next);
    this.startAutoplay(); // Reset timer on manual action
  }

  prevSlide(): void {
    const prev = (this.activeIndex() - 1 + this.cards.length) % this.cards.length;
    this.scrollToIndex(prev);
    this.startAutoplay(); // Reset timer on manual action
  }

  onScroll(event: Event): void {
    const el = event.target as HTMLElement;
    if (!el) return;
    const cardWidth = el.scrollWidth / this.cards.length;
    const index = Math.round(el.scrollLeft / cardWidth);
    if (index !== this.activeIndex() && index >= 0 && index < this.cards.length) {
      this.activeIndex.set(index);
    }
  }

  scrollToIndex(index: number): void {
    const track = this.carouselTrack?.nativeElement;
    if (!track) return;
    const cardWidth = track.scrollWidth / this.cards.length;
    track.scrollTo({
      left: cardWidth * index,
      behavior: 'smooth'
    });
    this.activeIndex.set(index);
  }
}
