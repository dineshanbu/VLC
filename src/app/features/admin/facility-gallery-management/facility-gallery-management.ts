import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HomeFacilityService } from '../../../core/services/home-facility.service';
import { HomeFacilityImage } from '../../../core/models/home-facility.model';
import { resolveImageUrl } from '../../../core/utils/image-url.util';

@Component({ selector: 'app-facility-gallery-management', standalone: true, imports: [CommonModule, FormsModule], templateUrl: './facility-gallery-management.html', styleUrl: './facility-gallery-management.css' })
export class FacilityGalleryManagementComponent implements OnInit {
  private readonly service = inject(HomeFacilityService);
  readonly images = signal<HomeFacilityImage[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly message = signal('');
  readonly editing = signal<HomeFacilityImage | null>(null);
  readonly draggedIndex = signal<number | null>(null);
  file: File | null = null;
  previewUrl = '';
  form = this.emptyForm();

  ngOnInit(): void { this.load(); }
  load(): void { this.loading.set(true); this.service.getManageImages().subscribe({ next: ({ images }) => { this.images.set(images); this.loading.set(false); }, error: () => { this.message.set('Could not load the facility gallery.'); this.loading.set(false); } }); }
  addNew(): void { this.editing.set(null); this.form = this.emptyForm(); this.file = null; this.previewUrl = ''; }
  edit(image: HomeFacilityImage): void { this.editing.set(image); this.form = { title: image.title, alt_text: image.alt_text, image_url: image.source_type === 'url' ? image.image_url : '', status: image.status }; this.file = null; this.previewUrl = this.imageUrl(image.image_url); }
  onFile(event: Event): void { const file = (event.target as HTMLInputElement).files?.[0] || null; this.file = file; if (file) { this.previewUrl = URL.createObjectURL(file); if (!this.form.title) this.form.title = file.name.replace(/[_-]/g, ' ').replace(/\.[^.]+$/, ''); } }
  save(): void {
    if (!this.file && !this.form.image_url.trim() && !this.editing()) { this.message.set('Select an image file or enter an image URL.'); return; }
    this.saving.set(true); const data = new FormData();
    data.append('title', this.form.title || 'Facility image'); data.append('alt_text', this.form.alt_text || this.form.title || 'VIC facility image'); data.append('image_url', this.form.image_url.trim()); data.append('status', this.form.status); if (this.file) data.append('image', this.file);
    const current = this.editing(); const request = current?.id ? this.service.updateImage(current.id, data) : this.service.createImage(data);
    request.subscribe({ next: () => { this.message.set('Facility gallery saved.'); this.saving.set(false); this.addNew(); this.load(); }, error: (error) => { this.message.set(error.error?.message || 'Could not save the image.'); this.saving.set(false); } });
  }
  move(index: number, direction: -1 | 1): void { const items = [...this.images()]; const target = index + direction; if (target < 0 || target >= items.length) return; [items[index], items[target]] = [items[target], items[index]]; this.images.set(items.map((item, order_index) => ({ ...item, order_index }))); this.service.reorder(this.images().filter(item => item.id).map(item => ({ id: item.id!, order_index: item.order_index }))).subscribe({ next: () => this.message.set('Image order updated.'), error: () => { this.message.set('Could not save the new order.'); this.load(); } }); }
  dragStart(index: number): void { this.draggedIndex.set(index); }
  dragEnd(): void { this.draggedIndex.set(null); }
  drop(index: number): void { const from = this.draggedIndex(); if (from === null || from === index) { this.dragEnd(); return; } const items = [...this.images()]; const [moved] = items.splice(from, 1); items.splice(index, 0, moved); this.images.set(items.map((item, order_index) => ({ ...item, order_index }))); this.dragEnd(); this.service.reorder(this.images().filter(item => item.id).map(item => ({ id: item.id!, order_index: item.order_index }))).subscribe({ next: () => this.message.set('Gallery order updated.'), error: () => { this.message.set('Could not save the new order.'); this.load(); } }); }
  remove(image: HomeFacilityImage): void { if (!image.id || !confirm(`Remove “${image.title}” from the gallery?`)) return; this.service.deleteImage(image.id).subscribe({ next: () => { this.message.set('Facility image removed.'); this.load(); }, error: () => this.message.set('Could not remove the image.') }); }
  imageUrl(url: string): string { return resolveImageUrl(url); }
  private emptyForm() { return { title: '', alt_text: '', image_url: '', status: 'Active' as 'Active' | 'Inactive' }; }
}
