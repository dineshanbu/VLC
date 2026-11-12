import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ManufacturingPlatformService } from '../../../core/services/manufacturing-platform.service';
import { ManufacturingPlatformContent, defaultManufacturingPlatformContent, mergeManufacturingPlatformContent } from '../../../core/models/manufacturing-platform.model';
import { resolveImageUrl } from '../../../core/utils/image-url.util';
import { MediaImagePickerComponent } from '../../../shared/components/media-image-picker/media-image-picker';

type EditorTab = 'hero' | 'journey' | 'overview' | 'growth';

@Component({
  selector: 'app-manufacturing-platform-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MediaImagePickerComponent],
  templateUrl: './manufacturing-platform-management.html',
  styleUrl: './manufacturing-platform-management.css'
})
export class ManufacturingPlatformManagementComponent implements OnInit, OnDestroy {
  private readonly service = inject(ManufacturingPlatformService);
  activeTab: EditorTab = 'hero';
  contentData: ManufacturingPlatformContent = structuredClone(defaultManufacturingPlatformContent);
  isLoading = true;
  isSaving = false;
  errorMessage = '';
  successMessage = '';
  selectedImages: Record<string, File> = {};
  imagePreviews: Record<string, string> = {};

  ngOnInit(): void {
    this.service.getContent().subscribe({
      next: response => { if (response.success && response.content) this.contentData = mergeManufacturingPlatformContent(response.content); this.isLoading = false; },
      error: () => { this.errorMessage = 'Could not load Manufacturing Platform content.'; this.isLoading = false; }
    });
  }

  ngOnDestroy(): void { Object.values(this.imagePreviews).forEach(url => URL.revokeObjectURL(url)); }
  imageUrl(path: string): string { return resolveImageUrl(path); }
  previewUrl(key: string, path: string): string { return this.imagePreviews[key] || this.imageUrl(path); }

  selectImage(key: string, event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (this.imagePreviews[key]) URL.revokeObjectURL(this.imagePreviews[key]);
    this.selectedImages[key] = file;
    this.imagePreviews[key] = URL.createObjectURL(file);
  }

  selectHeroImageFromLibrary(language: 'en' | 'ar', path: string): void {
    const key = language === 'ar' ? 'hero_image_ar' : 'hero_image';
    const oldPreview = this.imagePreviews[key];
    if (oldPreview) URL.revokeObjectURL(oldPreview);
    delete this.imagePreviews[key];
    delete this.selectedImages[key];
    if (language === 'ar') this.contentData.hero.image_url_ar = path;
    else this.contentData.hero.image_url = path;
  }

  addBullet(items: string[], translations: string[]): void { items.push(''); translations.push(''); }
  removeBullet(items: string[], translations: string[], index: number): void { items.splice(index, 1); translations.splice(index, 1); }
  addSupportedFormat(): void { this.contentData.journey.supported_formats.items.push({ name: '', name_ar: '' }); }
  removeSupportedFormat(index: number): void { this.contentData.journey.supported_formats.items.splice(index, 1); }

  save(): void {
    this.isSaving = true; this.errorMessage = ''; this.successMessage = '';
    const form = new FormData();
    form.append('content_json', JSON.stringify(this.contentData));
    Object.entries(this.selectedImages).forEach(([key, file]) => form.append(key, file));
    this.service.saveContent(form).subscribe({
      next: response => {
        this.contentData = mergeManufacturingPlatformContent(response.content);
        this.selectedImages = {};
        Object.values(this.imagePreviews).forEach(url => URL.revokeObjectURL(url));
        this.imagePreviews = {};
        this.successMessage = 'Manufacturing Platform page saved.';
        localStorage.setItem('vic_manufacturing_platform_updated', String(Date.now()));
        this.isSaving = false;
      },
      error: error => { this.errorMessage = error?.error?.message || 'Could not save Manufacturing Platform content.'; this.isSaving = false; }
    });
  }

  clearAlerts(): void { this.errorMessage = ''; this.successMessage = ''; }
}
