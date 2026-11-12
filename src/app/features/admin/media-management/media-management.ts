import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MediaService } from '../../../core/services/media.service';
import { MediaItem } from '../../../core/models/media.model';
import { resolveImageUrl } from '../../../core/utils/image-url.util';

@Component({
  selector: 'app-media-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './media-management.html',
  styleUrl: './media-management.css'
})
export class MediaManagementComponent implements OnInit {
  private mediaService = inject(MediaService);

  getImageUrl(url?: string | null): string {
    return resolveImageUrl(url);
  }

  mediaList = signal<MediaItem[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');
  copiedUrlId = signal<number | null>(null);

  // Filters
  searchTerm = signal<string>('');
  selectedCategory = signal<string>('All');
  selectedFormat = signal<string>('All');

  // Preview Modal
  isPreviewModalOpen = signal<boolean>(false);
  previewItem = signal<MediaItem | null>(null);

  // Upload Modal
  isUploadModalOpen = signal<boolean>(false);
  isEditTitleModalOpen = signal<boolean>(false);
  isUploading = signal<boolean>(false);
  isSavingTitle = signal(false);
  uploadTitle = signal<string>('');
  uploadTitleAr = signal<string>('');
  uploadDescription = signal<string>('');
  uploadCategory = signal<string>('General');
  editingMedia = signal<MediaItem | null>(null);
  editTitle = signal('');
  editTitleAr = signal('');
  editDescription = signal('');
  selectedFile: File | null = null;
  filePreviewUrl = signal<string | null>(null);
  isDragOver = signal<boolean>(false);

  // Delete Modal
  isDeleteModalOpen = signal<boolean>(false);
  itemToDelete = signal<MediaItem | null>(null);

  ngOnInit(): void {
    this.loadMedia();
  }

  loadMedia(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.mediaService.getMedia({
      search: this.searchTerm(),
      category: this.selectedCategory(),
      format: this.selectedFormat()
    }).subscribe({
      next: (res) => {
        this.mediaList.set(res.media || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('Failed to load media assets from database.');
      }
    });
  }

  openPreview(item: MediaItem): void {
    this.previewItem.set(item);
    this.isPreviewModalOpen.set(true);
  }

  closePreview(): void {
    this.isPreviewModalOpen.set(false);
    this.previewItem.set(null);
  }

  openUploadModal(): void {
    this.uploadTitle.set('');
    this.uploadTitleAr.set('');
    this.uploadDescription.set('');
    this.uploadCategory.set('General');
    this.selectedFile = null;
    this.filePreviewUrl.set(null);
    this.isDragOver.set(false);
    this.isUploadModalOpen.set(true);
  }

  closeUploadModal(): void {
    this.isUploadModalOpen.set(false);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    this.processFile(file);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onFileDropped(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.processFile(event.dataTransfer.files[0]);
    }
  }

  private processFile(file: File): void {
    if (file) {
      this.selectedFile = file;
      if (file.type.startsWith('video/')) {
        this.uploadCategory.set('Videos');
      }
      if (!this.uploadTitle()) {
        this.uploadTitle.set(file.name.split('.')[0].replace(/[_-]/g, ' '));
      }
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e: any) => this.filePreviewUrl.set(e.target.result);
        reader.readAsDataURL(file);
      } else {
        this.filePreviewUrl.set(null);
      }
    }
  }

  submitUpload(): void {
    if (!this.selectedFile) {
      alert('Please select a file to upload.');
      return;
    }

    this.isUploading.set(true);
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('title', this.uploadTitle());
    formData.append('title_ar', this.uploadTitleAr());
    formData.append('description', this.uploadDescription());
    formData.append('category', this.uploadCategory());

    this.mediaService.uploadMedia(formData).subscribe({
      next: (res) => {
        this.isUploading.set(false);
        this.closeUploadModal();
        this.showSuccess('File uploaded successfully to database & disk storage.');
        this.loadMedia();
      },
      error: (err) => {
        this.isUploading.set(false);
        alert(err.error?.message || 'Failed to upload file.');
      }
    });
  }

  openEditTitle(item: MediaItem, event?: Event): void {
    event?.stopPropagation();
    this.editingMedia.set(item);
    this.editTitle.set(item.title || '');
    this.editTitleAr.set(item.title_ar || '');
    this.editDescription.set(item.description || '');
    this.isEditTitleModalOpen.set(true);
  }

  closeEditTitle(): void {
    this.isEditTitleModalOpen.set(false);
    this.editingMedia.set(null);
  }

  saveMediaTitles(): void {
    const item = this.editingMedia();
    if (!item?.id || !this.editTitle().trim()) return;
    this.isSavingTitle.set(true);
    this.mediaService.updateMedia(item.id, {
      title: this.editTitle().trim(),
      title_ar: this.editTitleAr().trim(),
      description: this.editDescription()
    }).subscribe({
      next: () => {
        this.isSavingTitle.set(false);
        this.closeEditTitle();
        this.showSuccess('English and Arabic media titles saved.');
        this.loadMedia();
      },
      error: error => {
        this.isSavingTitle.set(false);
        alert(error.error?.message || 'Could not save media titles.');
      }
    });
  }

  copyLink(item: MediaItem, event?: Event): void {
    if (event) event.stopPropagation();
    const fullUrl = this.getImageUrl(item.file_url);
    navigator.clipboard.writeText(fullUrl);
    if (item.id) {
      this.copiedUrlId.set(item.id);
      setTimeout(() => this.copiedUrlId.set(null), 2000);
    }
  }

  confirmDelete(item: MediaItem, event?: Event): void {
    if (event) event.stopPropagation();
    this.itemToDelete.set(item);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.itemToDelete.set(null);
  }

  deleteItem(): void {
    const item = this.itemToDelete();
    if (!item || !item.id) return;

    this.mediaService.deleteMedia(item.id).subscribe({
      next: () => {
        this.closeDeleteModal();
        if (this.previewItem()?.id === item.id) {
          this.closePreview();
        }
        this.showSuccess('Media asset removed successfully.');
        this.loadMedia();
      },
      error: (err) => {
        this.closeDeleteModal();
        alert(err.error?.message || 'Failed to delete asset.');
      }
    });
  }

  private showSuccess(msg: string): void {
    this.successMessage.set(msg);
    setTimeout(() => this.successMessage.set(''), 4000);
  }
}
