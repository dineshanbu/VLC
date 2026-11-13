import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ContactPageSettings, ContactService, DEFAULT_CONTACT_PAGE_SETTINGS } from '../../../core/services/contact.service';
import { resolveImageUrl } from '../../../core/utils/image-url.util';
import { ContactInquiry } from '../../../core/models/contact.model';
import { MediaImagePickerComponent } from '../../../shared/components/media-image-picker/media-image-picker';

@Component({
  selector: 'app-contact-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MediaImagePickerComponent],
  templateUrl: './contact-management.html',
  styleUrl: './contact-management.css'
})
export class ContactManagementComponent implements OnInit, OnDestroy {
  private contactService = inject(ContactService);

  inquiries = signal<ContactInquiry[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  // Filters
  searchTerm = signal<string>('');
  selectedStatus = signal<string>('All');
  onlyStarred = signal<boolean>(false);

  // View / Detail Modal
  selectedInquiry = signal<ContactInquiry | null>(null);
  isDetailModalOpen = signal<boolean>(false);
  inquiryNotes = signal<string>('');

  // Delete Modal
  isDeleteModalOpen = signal<boolean>(false);
  inquiryToDelete = signal<ContactInquiry | null>(null);
  pageSettings: ContactPageSettings = { ...DEFAULT_CONTACT_PAGE_SETTINGS };
  pageContentLoading = signal(true);
  pageContentSaving = signal(false);
  pageContentError = signal('');
  pageContentSuccess = signal('');
  heroImageFile: File | null = null;
  heroImagePreview: string | null = null;
  heroImageFileAr: File | null = null;
  heroImagePreviewAr: string | null = null;
  officeImageFile: File | null = null;
  officeImagePreview: string | null = null;
  facilityImageFile: File | null = null;
  facilityImagePreview: string | null = null;

  // Multiple hero phone numbers management
  heroPhoneList: string[] = [''];

  initHeroPhones(): void {
    const raw = this.pageSettings.hero_phone || '';
    const parsed = raw.split(/[/,;]+/).map(p => p.trim()).filter(Boolean);
    this.heroPhoneList = parsed.length > 0 ? parsed : [''];
  }

  addHeroPhone(): void {
    this.heroPhoneList.push('');
    this.syncHeroPhonesToSettings();
  }

  removeHeroPhone(index: number): void {
    if (this.heroPhoneList.length > 1) {
      this.heroPhoneList.splice(index, 1);
      this.syncHeroPhonesToSettings();
    }
  }

  updateHeroPhone(index: number, val: string): void {
    this.heroPhoneList[index] = val;
    this.syncHeroPhonesToSettings();
  }

  syncHeroPhonesToSettings(): void {
    const filtered = this.heroPhoneList.map(p => p.trim()).filter(Boolean);
    this.pageSettings.hero_phone = filtered.join(' / ');
  }

  get heroPhoneListPreview(): string {
    return this.heroPhoneList.map(p => p.trim()).filter(Boolean).join(' / ');
  }

  ngOnInit(): void {
    this.loadInquiries();
    this.loadPageSettings();
  }

  loadPageSettings(): void {
    this.pageContentLoading.set(true);
    this.contactService.getPageSettings().subscribe({
      next: response => {
        this.pageSettings = { ...DEFAULT_CONTACT_PAGE_SETTINGS, ...response.settings };
        this.initHeroPhones();
        this.pageContentLoading.set(false);
      },
      error: () => {
        this.initHeroPhones();
        this.pageContentError.set('Could not load Contact page content.');
        this.pageContentLoading.set(false);
      }
    });
  }

  onHeroImageChange(event: Event, language: 'en' | 'ar'): void {
    const file = (event.target as HTMLInputElement).files?.[0] || null;
    if (!file) return;
    if (!file.type.startsWith('image/')) { this.pageContentError.set('Choose an image file for the banner.'); return; }
    if (language === 'ar') {
      if (this.heroImagePreviewAr) URL.revokeObjectURL(this.heroImagePreviewAr);
      this.heroImageFileAr = file; this.heroImagePreviewAr = URL.createObjectURL(file);
    } else {
      if (this.heroImagePreview) URL.revokeObjectURL(this.heroImagePreview);
      this.heroImageFile = file; this.heroImagePreview = URL.createObjectURL(file);
    }
    this.pageContentError.set('');
  }

  selectHeroImageFromLibrary(language: 'en' | 'ar', path: string): void {
    if (language === 'ar') {
      this.pageSettings.hero_image_ar = path; this.heroImageFileAr = null;
      if (this.heroImagePreviewAr) URL.revokeObjectURL(this.heroImagePreviewAr);
      this.heroImagePreviewAr = null;
    } else {
      this.pageSettings.hero_image = path; this.heroImageFile = null;
      if (this.heroImagePreview) URL.revokeObjectURL(this.heroImagePreview);
      this.heroImagePreview = null;
    }
  }

  heroImageUrl(language: 'en' | 'ar' = 'en'): string {
    return language === 'ar'
      ? (this.heroImagePreviewAr || resolveImageUrl(this.pageSettings.hero_image_ar || this.pageSettings.hero_image, 'banner_for_all2.webp'))
      : (this.heroImagePreview || resolveImageUrl(this.pageSettings.hero_image, 'banner_for_all2.webp'));
  }

  onLocationImageChange(event: Event, location: 'office' | 'facility'): void {
    const file = (event.target as HTMLInputElement).files?.[0] || null;
    if (!file) return;
    if (!file.type.startsWith('image/')) { this.pageContentError.set('Choose an image file for the location.'); return; }
    if (location === 'office') {
      if (this.officeImagePreview) URL.revokeObjectURL(this.officeImagePreview);
      this.officeImageFile = file;
      this.officeImagePreview = URL.createObjectURL(file);
    } else {
      if (this.facilityImagePreview) URL.revokeObjectURL(this.facilityImagePreview);
      this.facilityImageFile = file;
      this.facilityImagePreview = URL.createObjectURL(file);
    }
    this.pageContentError.set('');
  }

  selectLocationImage(location: 'office' | 'facility', path: string): void {
    if (location === 'office') {
      this.pageSettings.office_image = path;
      this.officeImageFile = null;
      if (this.officeImagePreview) URL.revokeObjectURL(this.officeImagePreview);
      this.officeImagePreview = null;
    } else {
      this.pageSettings.facility_image = path;
      this.facilityImageFile = null;
      if (this.facilityImagePreview) URL.revokeObjectURL(this.facilityImagePreview);
      this.facilityImagePreview = null;
    }
  }

  locationImageUrl(location: 'office' | 'facility'): string {
    if (location === 'office') return this.officeImagePreview || resolveImageUrl(this.pageSettings.office_image, 'layered-glass-vaccine-building-card.png');
    return this.facilityImagePreview || resolveImageUrl(this.pageSettings.facility_image, 'layered-glass-vaccine-building-card.png');
  }

  savePageSettings(): void {
    this.syncHeroPhonesToSettings();
    this.pageContentSaving.set(true); this.pageContentError.set(''); this.pageContentSuccess.set('');
    const data = new FormData(); data.append('settings_json', JSON.stringify(this.pageSettings));
    if (this.heroImageFile) data.append('hero_image', this.heroImageFile);
    if (this.heroImageFileAr) data.append('hero_image_ar', this.heroImageFileAr);
    if (this.officeImageFile) data.append('office_image', this.officeImageFile);
    if (this.facilityImageFile) data.append('facility_image', this.facilityImageFile);
    this.contactService.updatePageSettings(data).subscribe({
      next: response => {
        this.pageSettings = { ...DEFAULT_CONTACT_PAGE_SETTINGS, ...response.settings };
        this.initHeroPhones();
        this.heroImageFile = null; this.heroImageFileAr = null;
        if (this.heroImagePreview) URL.revokeObjectURL(this.heroImagePreview);
        if (this.heroImagePreviewAr) URL.revokeObjectURL(this.heroImagePreviewAr);
        if (this.officeImagePreview) URL.revokeObjectURL(this.officeImagePreview);
        if (this.facilityImagePreview) URL.revokeObjectURL(this.facilityImagePreview);
        this.heroImagePreview = null; this.heroImagePreviewAr = null; this.officeImageFile = null; this.officeImagePreview = null; this.facilityImageFile = null; this.facilityImagePreview = null; this.pageContentSaving.set(false); this.pageContentSuccess.set('Contact page content saved.');
        if (typeof window !== 'undefined') window.localStorage.setItem('vic_contact_page_updated', String(Date.now()));
      },
      error: error => { this.pageContentSaving.set(false); this.pageContentError.set(error.error?.message || 'Could not save Contact page content.'); }
    });
  }

  ngOnDestroy(): void {
    [this.heroImagePreview, this.heroImagePreviewAr, this.officeImagePreview, this.facilityImagePreview]
      .filter((url): url is string => !!url)
      .forEach(url => URL.revokeObjectURL(url));
  }

  loadInquiries(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.contactService.getInquiries({
      search: this.searchTerm(),
      status: this.selectedStatus(),
      starred: this.onlyStarred()
    }).subscribe({
      next: (res) => {
        this.inquiries.set(res.inquiries || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('Failed to load inquiries.');
      }
    });
  }

  toggleStar(inquiry: ContactInquiry, event: Event): void {
    event.stopPropagation();
    if (!inquiry.id) return;

    const newStarred = !inquiry.is_starred;
    this.contactService.updateInquiry(inquiry.id, { is_starred: newStarred ? 1 : 0 }).subscribe({
      next: () => {
        inquiry.is_starred = newStarred;
        this.inquiries.update(list => [...list]);
      }
    });
  }

  openDetail(inquiry: ContactInquiry): void {
    this.selectedInquiry.set(inquiry);
    this.inquiryNotes.set(inquiry.notes || '');
    this.isDetailModalOpen.set(true);

    // If status is New, mark as In Progress automatically
    if (inquiry.status === 'New' && inquiry.id) {
      this.contactService.updateInquiry(inquiry.id, { status: 'In Progress' }).subscribe({
        next: () => {
          inquiry.status = 'In Progress';
          this.inquiries.update(list => [...list]);
        }
      });
    }
  }

  closeDetail(): void {
    this.isDetailModalOpen.set(false);
    this.selectedInquiry.set(null);
  }

  updateStatus(status: 'New' | 'In Progress' | 'Resolved' | 'Archived'): void {
    const inquiry = this.selectedInquiry();
    if (!inquiry || !inquiry.id) return;

    this.contactService.updateInquiry(inquiry.id, { status, notes: this.inquiryNotes() }).subscribe({
      next: () => {
        inquiry.status = status;
        inquiry.notes = this.inquiryNotes();
        this.showSuccess(`Inquiry marked as ${status}.`);
        this.loadInquiries();
      }
    });
  }

  saveNotes(): void {
    const inquiry = this.selectedInquiry();
    if (!inquiry || !inquiry.id) return;

    this.contactService.updateInquiry(inquiry.id, { notes: this.inquiryNotes() }).subscribe({
      next: () => {
        inquiry.notes = this.inquiryNotes();
        this.showSuccess('Notes saved.');
      }
    });
  }

  confirmDelete(inquiry: ContactInquiry, event: Event): void {
    event.stopPropagation();
    this.inquiryToDelete.set(inquiry);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.inquiryToDelete.set(null);
  }

  deleteInquiry(): void {
    const inquiry = this.inquiryToDelete();
    if (!inquiry || !inquiry.id) return;

    this.contactService.deleteInquiry(inquiry.id).subscribe({
      next: () => {
        this.closeDeleteModal();
        if (this.selectedInquiry()?.id === inquiry.id) {
          this.closeDetail();
        }
        this.showSuccess('Inquiry deleted.');
        this.loadInquiries();
      },
      error: (err) => {
        this.closeDeleteModal();
        alert(err.error?.message || 'Failed to delete inquiry.');
      }
    });
  }

  private showSuccess(msg: string): void {
    this.successMessage.set(msg);
    setTimeout(() => this.successMessage.set(''), 3500);
  }
}
