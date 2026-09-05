import { Component, ElementRef, OnInit, ViewChild, signal } from '@angular/core';

@Component({
  selector: 'app-hero',
  imports: [],
  templateUrl: './hero.html',
  styleUrl: './hero.css'
})
export class HeroComponent implements OnInit {
  @ViewChild('heroVideo') heroVideoRef?: ElementRef<HTMLVideoElement>;
  @ViewChild('modalVideo') modalVideoRef?: ElementRef<HTMLVideoElement>;

  // Static content matching the exact attached design
  readonly titleLine1 = 'Protecting Lives.';
  readonly titleLine2 = 'Building';
  readonly titleLine3Prefix = 'Healthier ';
  readonly titleAccent = 'Futures.';
  readonly description = "Saudi Arabia's next-generation vaccine manufacturing company, advancing innovation, localization and global health.";

  readonly isVideoLoaded = signal(false);
  readonly isModalOpen = signal(false);

  ngOnInit(): void {}

  onVideoCanPlay(): void {
    this.isVideoLoaded.set(true);
    const video = this.heroVideoRef?.nativeElement;
    if (video) {
      video.play().catch(() => {});
    }
  }

  openVideoModal(): void {
    this.isModalOpen.set(true);
    if (this.heroVideoRef?.nativeElement) {
      this.heroVideoRef.nativeElement.pause();
    }
    setTimeout(() => {
      if (this.modalVideoRef?.nativeElement) {
        this.modalVideoRef.nativeElement.currentTime = 0;
        this.modalVideoRef.nativeElement.muted = false;
        this.modalVideoRef.nativeElement.play().catch(() => {
          if (this.modalVideoRef?.nativeElement) {
            this.modalVideoRef.nativeElement.muted = true;
            this.modalVideoRef.nativeElement.play();
          }
        });
      }
    }, 100);
  }

  closeVideoModal(): void {
    this.isModalOpen.set(false);
    if (this.modalVideoRef?.nativeElement) {
      this.modalVideoRef.nativeElement.pause();
    }
    if (this.heroVideoRef?.nativeElement) {
      this.heroVideoRef.nativeElement.play();
    }
  }

  onModalKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeVideoModal();
    }
  }
}
