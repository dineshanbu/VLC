import { Component, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { TranslationService } from '../../../../../core/services/translation.service';

@Component({
  selector: 'app-hero',
  imports: [],
  templateUrl: './hero.html',
  styleUrl: './hero.css'
})
export class HeroComponent implements OnInit {
  @ViewChild('heroVideo') heroVideoRef?: ElementRef<HTMLVideoElement>;
  @ViewChild('modalVideo') modalVideoRef?: ElementRef<HTMLVideoElement>;

  readonly translationService = inject(TranslationService);

  get titleLine1(): string {
    return this.translationService.translate('hero.titleLine1');
  }

  get titleLine2(): string {
    return this.translationService.translate('hero.titleLine2');
  }

  get titleLine3Prefix(): string {
    return this.translationService.translate('hero.titleLine3Prefix');
  }

  get titleAccent(): string {
    return this.translationService.translate('hero.titleAccent');
  }

  get description(): string {
    return this.translationService.translate('hero.description');
  }

  get isRtl(): boolean {
    return this.translationService.isRtl();
  }

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
