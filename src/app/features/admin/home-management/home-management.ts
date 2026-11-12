import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HomePageService } from '../../../core/services/home-page.service';
import { HomePageSection } from '../../../core/models/home-page.model';
import { resolveImageUrl } from '../../../core/utils/image-url.util';
import { MediaImagePickerComponent } from '../../../shared/components/media-image-picker/media-image-picker';

@Component({
  selector: 'app-home-management', standalone: true, imports: [CommonModule, FormsModule, RouterLink, MediaImagePickerComponent],
  templateUrl: './home-management.html', styleUrl: './home-management.css'
})
export class HomeManagementComponent implements OnInit {
  private readonly service = inject(HomePageService);
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly error = signal('');
  readonly success = signal('');
  readonly sections = signal<HomePageSection[]>([]);
  readonly selectedImages = signal<Record<string, File | undefined>>({});
  readonly selectedVideos = signal<Record<string, File | undefined>>({});
  readonly selectedCorporateVideo = signal<File | undefined>(undefined);
  readonly selectedCardImages = signal<Record<number, File | undefined>>({});
  readonly selectedPreviews = signal<Record<string, string>>({});

  ngOnInit(): void {
    this.service.getContent().subscribe({
      next: response => { this.sections.set([response.content.landing, response.content.platform, response.content.about, response.content.supporting, response.content.our_office]); this.isLoading.set(false); },
      error: () => { this.error.set('Could not load home page content. Please check the API connection.'); this.isLoading.set(false); }
    });
  }

  imageUrl(path: string): string { return resolveImageUrl(path); }
  isVideo(path?: string | null): boolean { return !!path && /\.(mp4|webm|mov)(?:$|[?#])/i.test(path); }
  selectImage(key: string, event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.setPreview(key, file);
      this.selectedImages.update(images => ({ ...images, [key]: file }));
    }
  }
  selectBannerFromLibrary(sectionKey: string, language: 'en' | 'ar', path: string): void {
    const field = language === 'ar' ? 'image_url_ar' : 'image_url';
    this.sections.update(sections => sections.map(section => section.section_key === sectionKey ? { ...section, [field]: path } : section));
    const key = language === 'ar' ? `${sectionKey}_ar` : sectionKey;
    this.selectedImages.update(images => { const next = { ...images }; delete next[key]; return next; });
    this.clearPreviews([key]);
  }
  selectVideo(key: string, event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.setPreview(`${key}_video`, file);
      this.selectedVideos.update(videos => ({ ...videos, [key]: file }));
    }
  }
  selectCorporateVideo(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.setPreview('corporate_video', file);
      this.selectedCorporateVideo.set(file);
    }
  }
  selectCardImage(index: number, event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.setPreview(`card_${index}`, file);
      this.selectedCardImages.update(images => ({ ...images, [index]: file }));
    }
  }
  private setPreview(key: string, file: File): void {
    const oldUrl = this.selectedPreviews()[key];
    if (oldUrl) URL.revokeObjectURL(oldUrl);
    const url = URL.createObjectURL(file);
    this.selectedPreviews.update(previews => ({ ...previews, [key]: url }));
  }
  previewUrl(key: string, fallback?: string): string {
    return this.selectedPreviews()[key] || (fallback ? this.imageUrl(fallback) : '');
  }
  private clearPreviews(keys: string[]): void {
    const current = this.selectedPreviews();
    keys.forEach(key => { if (current[key]) URL.revokeObjectURL(current[key]); });
    this.selectedPreviews.update(previews => {
      const next = { ...previews };
      keys.forEach(key => delete next[key]);
      return next;
    });
  }
  corporateVideoPath(): string {
    return this.sections().find(section => section.section_key === 'about')?.corporate_video_url || '';
  }
  saveCorporateVideo(): void {
    const video = this.selectedCorporateVideo();
    if (!video) {
      this.error.set('Choose a Watch Corporate video before saving.');
      this.success.set('');
      return;
    }
    this.isSaving.set(true); this.error.set(''); this.success.set('');
    this.service.updateCorporateVideo(video).subscribe({
      next: response => {
        this.sections.update(items => items.map(item => item.section_key === 'about'
          ? { ...item, corporate_video_url: response.corporate_video_url }
          : item));
        this.selectedCorporateVideo.set(undefined);
        this.clearPreviews(['corporate_video']);
        this.success.set('Watch Corporate video saved.');
        this.isSaving.set(false);
      },
      error: response => { this.error.set(response.error?.message || 'Unable to save the Watch Corporate video.'); this.isSaving.set(false); }
    });
  }
  save(section: HomePageSection): void {
    this.isSaving.set(true); this.error.set(''); this.success.set('');
    this.service.updateSection(section, this.selectedImages()[section.section_key], this.selectedCardImages(), this.selectedVideos()[section.section_key], this.selectedImages()[`${section.section_key}_ar`]).subscribe({
      next: response => {
        this.sections.update(items => items.map(item => item.section_key === section.section_key
          ? { ...response.section, corporate_video_url: response.section.corporate_video_url ?? item.corporate_video_url }
          : item));
          this.selectedImages.update(images => ({ ...images, [section.section_key]: undefined, [`${section.section_key}_ar`]: undefined }));
        this.selectedVideos.update(videos => ({ ...videos, [section.section_key]: undefined }));
        if (section.section_key === 'platform') {
          this.selectedCardImages.set({});
          this.clearPreviews((section.content_json || []).map((_card, index) => `card_${index}`));
        } else {
          this.clearPreviews([section.section_key, `${section.section_key}_ar`, `${section.section_key}_video`]);
        }
        this.success.set(`${section.section_key === 'landing' ? 'Landing banner' : section.section_key === 'platform' ? 'Our Platform' : section.section_key === 'about' ? 'About VIC' : section.section_key === 'our_office' ? 'Our Office section' : 'Supporting section'} saved.`);
        this.isSaving.set(false);
      },
      error: response => { this.error.set(response.error?.message || 'Unable to save this section.'); this.isSaving.set(false); }
    });
  }
}
