import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MediaItem } from '../../../core/models/media.model';
import { MediaService } from '../../../core/services/media.service';
import { resolveImageUrl } from '../../../core/utils/image-url.util';

@Component({
  selector: 'app-media-image-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './media-image-picker.html',
  styleUrl: './media-image-picker.css'
})
export class MediaImagePickerComponent {
  @Output() readonly selected = new EventEmitter<string>();

  private readonly mediaService = inject(MediaService);
  readonly isOpen = signal(false);
  readonly isLoading = signal(false);
  readonly isUploading = signal(false);
  readonly errorMessage = signal('');
  readonly search = signal('');
  readonly images = signal<MediaItem[]>([]);

  open(): void {
    this.search.set('');
    this.errorMessage.set('');
    this.isOpen.set(true);
    this.loadImages();
  }

  close(): void { this.isOpen.set(false); }

  filteredImages(): MediaItem[] {
    const query = this.search().trim().toLowerCase();
    if (!query) return this.images();
    return this.images().filter(item => `${item.title} ${item.file_name}`.toLowerCase().includes(query));
  }

  imageUrl(path: string): string { return resolveImageUrl(path); }

  private loadImages(): void {
    this.isLoading.set(true);
    this.mediaService.getMedia({ format: 'IMAGE' }).subscribe({
      next: response => { this.images.set(response.media || []); this.isLoading.set(false); },
      error: () => { this.errorMessage.set('Could not load images from Media & Upload.'); this.isLoading.set(false); }
    });
  }

  selectImage(image: MediaItem): void {
    this.selected.emit(image.file_url);
    this.close();
  }

  uploadAndSelect(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.errorMessage.set('Choose an image file.');
      return;
    }
    this.isUploading.set(true);
    this.errorMessage.set('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' '));
    formData.append('category', 'General');
    this.mediaService.uploadMedia(formData).subscribe({
      next: response => {
        this.isUploading.set(false);
        this.selected.emit(response.media.file_url);
        this.close();
      },
      error: error => {
        this.isUploading.set(false);
        this.errorMessage.set(error?.error?.message || 'Could not upload this image.');
      }
    });
  }
}
