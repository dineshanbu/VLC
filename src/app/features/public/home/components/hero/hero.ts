import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { TranslationService } from '../../../../../core/services/translation.service';
import { HomePageService } from '../../../../../core/services/home-page.service';
import { HomePageSection } from '../../../../../core/models/home-page.model';
import { resolveImageUrl } from '../../../../../core/utils/image-url.util';
import { BrandingService } from '../../../../../core/services/branding.service';
import { SectionHeadingsService } from '../../../../../core/services/section-headings.service';

@Component({
  selector: 'app-hero',
  imports: [],
  templateUrl: './hero.html',
  styleUrl: './hero.css'
})
export class HeroComponent implements OnInit, AfterViewInit {
  @ViewChild('modalVideo') modalVideoRef?: ElementRef<HTMLVideoElement>;
  private heroVideoElement?: ElementRef<HTMLVideoElement>;

  @ViewChild('heroVideo')
  set heroVideoRef(value: ElementRef<HTMLVideoElement> | undefined) {
    this.heroVideoElement = value;
    // The video is rendered only after the landing media API response arrives,
    // which is after ngAfterViewInit. Start playback when that element appears.
    if (value && typeof window !== 'undefined') window.requestAnimationFrame(() => this.playHeroVideo());
  }

  readonly translationService = inject(TranslationService);
  private readonly homePageService = inject(HomePageService);
  private readonly sectionHeadingsService = inject(SectionHeadingsService);
  readonly branding = inject(BrandingService);
  readonly content = signal<HomePageSection | null>(null);
  readonly aboutContent = signal<HomePageSection | null>(null);
  isHeroContentLoaded = false;
  isHeroVideoReady = false;

  get bannerTitle(): string {
    const separator = this.isRtl ? '، ' : ' ';
    return `${this.bannerTitleLine1}${separator}${this.bannerTitleLine2} ${this.bannerTitleLine2Accent}`.trim();
  }

  get bannerTitleLine1(): string {
    const content = this.content();
    const fallbackEn = content?.title?.split(/\s+and\s+(?=First of Its Kind in Saudi Arabia)/i)[0]?.trim()
      || 'The Largest Human Vaccines Facility in the Middle East, Based in Saudi Arabia';
    const fallbackAr = content?.title_ar?.split(/،\s*(?=الأولى من نوعها)/u)[0]?.trim()
      || 'أكبر مصنع لقاحات بشرية في الشرق الأوسط';
    return this.sectionHeadingsService.get('home.hero.line1', fallbackEn, fallbackAr, this.isRtl);
  }

  get bannerTitleMobileLine1(): string {
    return this.bannerTitleLine1;
  }

  get bannerTitleLine2(): string {
    const content = this.content();
    const fallbackEn = content?.title?.match(/\s+and\s+(?=First of Its Kind in Saudi Arabia)/i)
      ? content.title.split(/\s+and\s+(?=First of Its Kind in Saudi Arabia)/i).slice(1).join('').trim()
      : 'First of Its Kind in Saudi Arabia';
    const fallbackAr = content?.title_ar?.match(/،\s*(?=الأولى من نوعها)/u)
      ? content.title_ar.split(/،\s*(?=الأولى من نوعها)/u).slice(1).join('').trim()
      : 'والأول من نوعه في المملكة العربية السعودية';
    const saved = this.sectionHeadingsService.get('home.hero.line2', fallbackEn, fallbackAr, this.isRtl);
    return this.isRtl
      ? saved.replace(/\s*المملكة العربية السعودية$/u, '').trim()
      : saved.replace(/\s+Saudi Arabia$/i, '').trim();
  }

  get bannerTitleLine2Accent(): string {
    return this.sectionHeadingsService.get(
      'home.hero.line2Accent',
      'Saudi Arabia',
      'المملكة العربية السعودية',
      this.isRtl
    );
  }

  get bannerMediaPath(): string {
    const content = this.content();
    // The landing banner has its own API-managed image/video field. The
    // corporate video belongs to the Watch Corporate Film button and must not
    // be substituted as the banner background.
    return this.isRtl
      ? (content?.image_url_ar || content?.image_url || '')
      : (content?.image_url || content?.image_url_ar || '');
  }
  get bannerImage(): string { return resolveImageUrl(this.bannerMediaPath); }
  get bannerIsVideo(): boolean { return /\.(mp4|webm|mov)(?:$|[?#])/i.test(this.bannerMediaPath); }
  get bannerDescription(): string { return this.isRtl ? (this.content()?.description_ar || this.description) : (this.content()?.description || this.description); }
  get bannerButtonText(): string { return this.isRtl ? (this.content()?.button_text_ar || 'شاهد فيلم الشركة') : (this.content()?.button_text || 'Watch Corporate Film'); }
  get bannerButtonUrl(): string { return this.content()?.button_url?.trim() || ''; }
  get corporateVideoUrl(): string { return resolveImageUrl(this.aboutContent()?.corporate_video_url || 'watch-normalized.mp4'); }

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
  readonly modalVideoUrl = signal('');

  ngOnInit(): void {
    this.branding.load();
    this.sectionHeadingsService.load().subscribe();
    this.homePageService.getContent().subscribe({ next: response => { this.isHeroVideoReady = false; this.content.set(response.content.landing); this.aboutContent.set(response.content.about); this.isHeroContentLoaded = true; }, error: () => { this.isHeroContentLoaded = true; } });
  }

  ngAfterViewInit(): void {
    this.playHeroVideo();
  }

  playHeroVideo(): void {
    const video = this.heroVideoElement?.nativeElement;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    if (video.paused) video.play().catch(() => undefined);
  }

  onHeroVideoReady(): void {
    this.isHeroVideoReady = true;
    this.playHeroVideo();
  }

  openVideoModal(videoUrl = this.corporateVideoUrl): void {
    this.modalVideoUrl.set(resolveImageUrl(videoUrl || this.corporateVideoUrl));
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
