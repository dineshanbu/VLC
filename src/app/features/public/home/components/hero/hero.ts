import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { TranslationService } from '../../../../../core/services/translation.service';

@Component({
  selector: 'app-hero',
  imports: [],
  templateUrl: './hero.html',
  styleUrl: './hero.css'
})
export class HeroComponent implements OnInit, AfterViewInit {
  @ViewChild('modalVideo') modalVideoRef?: ElementRef<HTMLVideoElement>;
  @ViewChild('heroVideo') heroVideoRef?: ElementRef<HTMLVideoElement>;

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

  readonly isModalOpen = signal(false);

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.playHeroVideo();
  }

  playHeroVideo(): void {
    const video = this.heroVideoRef?.nativeElement;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.play().catch(() => undefined);
  }

  openVideoModal(): void {
    this.isModalOpen.set(true);
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
  }

  onModalKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeVideoModal();
    }
  }
}
