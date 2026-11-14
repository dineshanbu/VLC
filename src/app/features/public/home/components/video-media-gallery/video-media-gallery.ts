import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Component, Input, OnInit, computed, inject, signal } from '@angular/core';
import { MediaItem } from '../../../../../core/models/media.model';
import { MediaService } from '../../../../../core/services/media.service';
import { resolveImageUrl } from '../../../../../core/utils/image-url.util';
import { environment } from '../../../../../../environments/environment';
import { TranslationService } from '../../../../../core/services/translation.service';
import { SectionHeadingPipe } from '../../../../../shared/pipes/section-heading.pipe';

const normalizedMediaVideos = new Set([
  '1791444632910-683184310-csl-visit.mp4',
  '1791446505108-13585028-vaccination-forum.mp4',
  '1791446514589-129970616-mbc-interview.mp4',
  '1791446855526-221530362-VIC_sep_2026.mp4'.toLowerCase()
]);

const packagedMediaPosterStems = new Set([
  '1791444632910-683184310-csl-visit',
  '1791444632910-683184310-csl-visit-audio',
  '1791446505108-13585028-Vaccination-forum',
  '1791446505108-13585028-Vaccination-forum-audio',
  '1791446514589-129970616-MBC-Interview',
  '1791446514589-129970616-MBC-Interview-audio',
  '1791446855526-221530362-VIC_sep_2026',
  '1791446855526-221530362-VIC_sep_2026-audio',
  '1792934924528-908211553-Uhlmann'
]);

@Component({
  selector: 'app-video-media-gallery',
  standalone: true,
  imports: [CommonModule, RouterLink, SectionHeadingPipe],
  templateUrl: './video-media-gallery.html',
  styleUrl: './video-media-gallery.css'
})
export class VideoMediaGalleryComponent implements OnInit {
  private readonly mediaService = inject(MediaService);
  readonly translationService = inject(TranslationService);

  @Input() showPagination = false;
  @Input() showViewAll = false;
  @Input() showHeading = true;
  @Input() showEyebrow = true;
  @Input() glassHeader = false;
  @Input() mobileAutoplay = false;
  @Input() viewAllLabel = 'View All Media';
  readonly videos = signal<MediaItem[]>([]);
  readonly loading = signal(true);
  readonly loadFailed = signal(false);
  readonly currentPage = signal(1);
  @Input() pageSize = 4;
  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.videos().length / this.pageSize)));
  readonly visibleVideos = computed(() => {
    if (this.useMobileCarousel) {
      return this.videos().slice(this.currentPage() - 1, this.currentPage());
    }
    if (!this.showPagination) return this.videos().slice(0, 3);
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.videos().slice(start, start + this.pageSize);
  });
  readonly pages = computed(() => Array.from({ length: this.pageCount() }, (_, i) => i + 1));

  displayTitle(item: MediaItem): string {
    if (this.translationService.isRtl()) return item.title_ar?.trim() || item.title?.trim() || '';
    return item.title?.trim() || item.title_ar?.trim() || '';
  }

  isArabicText(text: string): boolean {
    return /\p{Script=Arabic}/u.test(text);
  }

  displayViewAllLabel(): string {
    return this.translationService.isRtl() ? this.translationService.translate('media.viewAll') : this.viewAllLabel;
  }

  ngOnInit(): void {
    // Video uploads may have been saved under General before the Videos
    // category was added. Use the stored media format as the reliable signal.
    this.mediaService.getMedia({ format: 'VIDEO' }).subscribe({
      next: response => {
        const videos = (response.media || []).filter(item => item.format?.trim().toUpperCase() === 'VIDEO');
        this.videos.set(videos);
        this.currentPage.set(1);
        this.loading.set(false);
      },
      error: () => {
        this.videos.set([]);
        this.loadFailed.set(true);
        this.loading.set(false);
      }
    });
  }

  videoUrl(path: string): string {
    const fileName = path.split(/[?#]/, 1)[0].split('/').pop()?.toLowerCase();
    const resolved = resolveImageUrl(path);
    return fileName && normalizedMediaVideos.has(fileName)
      ? resolved.replace(/\.mp4(?=([?#]|$))/i, '-audio.mp4')
      : resolved;
  }

  posterUrl(item: MediaItem): string {
    const videoName = (item.file_name || item.file_url).split(/[?#]/, 1)[0].split('/').pop() || '';
    const posterStem = videoName.replace(/\.[^.]+$/, '');
    if (packagedMediaPosterStems.has(posterStem)) {
      return resolveImageUrl(`/media-posters/${posterStem}.jpg`);
    }
    if (item.poster_url?.startsWith('http')) return item.poster_url;
    if (item.id) return `${environment.apiUrl.replace(/\/$/, '')}/media/${item.id}/poster`;
    return resolveImageUrl('/slide_Images/vlc0.webp');
  }

  private get hasMobileCarousel(): boolean {
    return this.glassHeader || this.mobileAutoplay;
  }

  get useMobileCarousel(): boolean {
    return this.hasMobileCarousel && typeof window !== 'undefined' && window.innerWidth <= 600;
  }

  goToPage(page: number): void {
    const maxPage = this.useMobileCarousel ? this.videos().length : this.pageCount();
    this.currentPage.set(Math.min(Math.max(page, 1), maxPage));
  }

  previousPage(): void {
    this.goToPage(this.currentPage() <= 1 ? this.videos().length : this.currentPage() - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage() >= this.videos().length ? 1 : this.currentPage() + 1);
  }

  onMobileTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0]?.clientX ?? null;
  }

  onMobileTouchEnd(event: TouchEvent): void {
    if (!this.hasMobileCarousel || window.innerWidth > 600 || this.touchStartX === null) return;
    const deltaX = event.changedTouches[0].clientX - this.touchStartX;
    if (Math.abs(deltaX) > 40) {
      deltaX < 0 ? this.nextPage() : this.previousPage();
    }
    this.touchStartX = null;
  }

  private touchStartX: number | null = null;
}
