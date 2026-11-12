import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PartnerService } from '../../../core/services/partner.service';
import { Partner, PartnerPageSettings } from '../../../core/models/partner.model';
import { environment } from '../../../../environments/environment';
import { MediaImagePickerComponent } from '../../../shared/components/media-image-picker/media-image-picker';

@Component({
  selector: 'app-partners-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MediaImagePickerComponent],
  templateUrl: './partners-management.html',
  styleUrl: './partners-management.css'
})
export class PartnersManagementComponent implements OnInit {
  private partnerService = inject(PartnerService);
  pageSettings: PartnerPageSettings = {
    hero_badge: 'GLOBAL PARTNERSHIPS', hero_title: 'Stronger Together.', hero_title_line2: 'Building a Better ', hero_accent: 'Future.',
    hero_description: 'Collaborating with global leaders to expand access to innovative vaccines and drive a healthier, more resilient tomorrow.',
    hero_badge_ar: 'شراكات عالمية', hero_title_ar: 'معاً أقوى.', hero_title_line2_ar: 'نبني مستقبلاً أفضل ', hero_accent_ar: 'للجميع.',
    hero_description_ar: 'نتعاون مع مؤسسات عالمية رائدة لتوفير لقاحات مبتكرة وتقنيات متقدمة وخبرات علمية للمنطقة وخارجها.',
    hero_image: 'partner_right.webp', hero_image_ar: 'partner_right.webp', cta_text: 'Partner With Us'
  };
  bannerSaving = signal(false);
  bannerImageFile: File | null = null;
  bannerImagePreview = '';
  bannerImageFileAr: File | null = null;
  bannerImagePreviewAr = '';

  // Loading & Alert Signals
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);
  isSyncing = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  // Partners List & Filter Signals
  partners = signal<Partner[]>([]);
  partnerSearch = signal<string>('');
  selectedTier = signal<string>('All');
  selectedCategory = signal<string>('All');
  selectedStatus = signal<string>('All');

  // Partner Modal Form
  isPartnerModalOpen = signal<boolean>(false);
  isEditingPartner = signal<boolean>(false);
  currentPartnerId = signal<number | null>(null);

  partnerForm = {
    code: '',
    name: '',
    name_ar: '',
    category: '',
    category_ar: '',
    tier: 'Strategic Alliance',
    website: '',
    description: '',
    description_ar: '',
    order_index: 0,
    status: 'Active' as 'Active' | 'Inactive',
    logo: ''
  };
  partnerLogoFile: File | null = null;
  partnerLogoPreview: string | null = null;

  // Delete Confirmation Modal
  isDeleteModalOpen = signal<boolean>(false);
  itemToDeleteId = signal<number | null>(null);
  itemToDeleteName = signal<string>('');

  // Computed Values
  filteredPartners = computed(() => {
    const list = this.partners();
    const search = this.partnerSearch().toLowerCase().trim();
    const tier = this.selectedTier();
    const cat = this.selectedCategory();
    const status = this.selectedStatus();

    return list.filter(p => {
      const matchSearch = !search ||
        p.name.toLowerCase().includes(search) ||
        p.category.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search);
      const matchTier = tier === 'All' || p.tier === tier;
      const matchCat = cat === 'All' || p.category === cat;
      const matchStatus = status === 'All' || p.status === status;
      return matchSearch && matchTier && matchCat && matchStatus;
    });
  });

  uniqueTiers = computed(() => {
    const set = new Set<string>();
    this.partners().forEach(p => { if (p.tier) set.add(p.tier); });
    return Array.from(set).sort();
  });

  uniqueCategories = computed(() => {
    const set = new Set<string>();
    this.partners().forEach(p => { if (p.category) set.add(p.category); });
    return Array.from(set).sort();
  });

  totalPartnersCount = computed(() => this.partners().length);
  activePartnersCount = computed(() => this.partners().filter(p => p.status === 'Active').length);

  ngOnInit(): void {
    this.loadPartners();
    this.loadPageSettings();
  }

  loadPageSettings(): void {
    this.partnerService.getPageSettings().subscribe({
      next: ({ settings }) => this.pageSettings = { ...this.pageSettings, ...settings },
      error: () => this.errorMessage.set('Could not load the Partners page banner settings.')
    });
  }

  onBannerImage(event: Event, language: 'en' | 'ar'): void {
    const file = (event.target as HTMLInputElement).files?.[0] || null;
    if (language === 'ar') {
      this.bannerImageFileAr = file;
      if (this.bannerImagePreviewAr) URL.revokeObjectURL(this.bannerImagePreviewAr);
      this.bannerImagePreviewAr = file ? URL.createObjectURL(file) : '';
    } else {
      this.bannerImageFile = file;
      if (this.bannerImagePreview) URL.revokeObjectURL(this.bannerImagePreview);
      this.bannerImagePreview = file ? URL.createObjectURL(file) : '';
    }
  }

  selectBannerFromLibrary(language: 'en' | 'ar', path: string): void {
    if (language === 'ar') {
      this.pageSettings.hero_image_ar = path; this.bannerImageFileAr = null;
      if (this.bannerImagePreviewAr) URL.revokeObjectURL(this.bannerImagePreviewAr);
      this.bannerImagePreviewAr = '';
    } else {
      this.pageSettings.hero_image = path; this.bannerImageFile = null;
      if (this.bannerImagePreview) URL.revokeObjectURL(this.bannerImagePreview);
      this.bannerImagePreview = '';
    }
  }

  bannerImageUrl(language: 'en' | 'ar' = 'en'): string {
    return language === 'ar'
      ? (this.bannerImagePreviewAr || this.resolveImg(this.pageSettings.hero_image_ar || this.pageSettings.hero_image || 'partner_right.webp'))
      : (this.bannerImagePreview || this.resolveImg(this.pageSettings.hero_image || 'partner_right.webp'));
  }

  saveBanner(): void {
    this.bannerSaving.set(true);
    const settings = this.pageSettings;
    const form = new FormData();
    ['hero_badge', 'hero_badge_ar', 'hero_title', 'hero_title_ar', 'hero_title_line2', 'hero_title_line2_ar', 'hero_accent', 'hero_accent_ar', 'hero_description', 'hero_description_ar', 'cta_text'].forEach(key => {
      form.append(key, String(settings[key as keyof PartnerPageSettings] || ''));
    });
    if (this.bannerImageFile) form.append('hero_image', this.bannerImageFile);
    else form.append('hero_image', settings.hero_image || 'partner_right.webp');
    form.append('hero_image_ar', settings.hero_image_ar || settings.hero_image || 'partner_right.webp');
    if (this.bannerImageFileAr) form.append('hero_image_ar', this.bannerImageFileAr);
    this.partnerService.updatePageSettings(form).subscribe({
      next: ({ settings: saved }) => {
        this.pageSettings = { ...settings, ...saved };
        this.bannerImageFile = null;
        this.bannerImageFileAr = null;
        if (this.bannerImagePreview) URL.revokeObjectURL(this.bannerImagePreview);
        if (this.bannerImagePreviewAr) URL.revokeObjectURL(this.bannerImagePreviewAr);
        this.bannerImagePreview = '';
        this.bannerImagePreviewAr = '';
        this.successMessage.set('Partners page banner saved.');
        this.bannerSaving.set(false);
        if (typeof window !== 'undefined') window.localStorage.setItem('vic_partner_settings_updated', String(Date.now()));
      },
      error: error => {
        this.errorMessage.set(error.error?.message || 'Could not save the Partners page banner.');
        this.bannerSaving.set(false);
      }
    });
  }

  loadPartners(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.partnerService.getPartners().subscribe({
      next: (res) => {
        if (res.success) {
          this.partners.set(res.partners || []);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load partners. Please ensure backend server is running.');
        this.isLoading.set(false);
      }
    });
  }

  clearAlerts(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  resolveImg(path: string | undefined | null): string {
    if (!path) return 'logo_navbar.webp';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/backend/uploads/')) return `${(environment.serverUrl || '').replace(/\/backend\/?$/, '')}${path}`;
    if (path.startsWith('/uploads/')) return `${environment.serverUrl}${path}`;
    return path;
  }

  // ==========================================
  // PARTNERS CRUD ACTIONS
  // ==========================================
  openAddPartnerModal(): void {
    this.isEditingPartner.set(false);
    this.currentPartnerId.set(null);
    this.partnerForm = {
      code: '',
      name: '',
      name_ar: '',
      category: '',
      category_ar: '',
      tier: 'Strategic Alliance',
      website: '',
      description: '',
      description_ar: '',
      order_index: this.partners().length + 1,
      status: 'Active',
      logo: ''
    };
    this.partnerLogoFile = null;
    this.partnerLogoPreview = null;
    this.isPartnerModalOpen.set(true);
  }

  openEditPartnerModal(partner: Partner): void {
    this.isEditingPartner.set(true);
    this.currentPartnerId.set(partner.id || null);
    this.partnerForm = {
      code: partner.code || '',
      name: partner.name,
      name_ar: partner.name_ar || '',
      category: partner.category,
      category_ar: partner.category_ar || '',
      tier: partner.tier || 'Strategic Alliance',
      website: partner.website || '',
      description: partner.description,
      description_ar: partner.description_ar || '',
      order_index: partner.order_index || 0,
      status: partner.status,
      logo: partner.logo
    };
    this.partnerLogoFile = null;
    this.partnerLogoPreview = this.resolveImg(partner.logo);
    this.isPartnerModalOpen.set(true);
  }

  closePartnerModal(): void {
    this.isPartnerModalOpen.set(false);
  }

  onPartnerLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.partnerLogoFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.partnerLogoPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  savePartner(): void {
    if (!this.partnerForm.name || !this.partnerForm.category) {
      this.errorMessage.set('Partner Name and Category are required.');
      return;
    }

    this.isSaving.set(true);
    this.clearAlerts();

    const formData = new FormData();
    formData.append('name', this.partnerForm.name);
    formData.append('name_ar', this.partnerForm.name_ar || '');
    formData.append('category', this.partnerForm.category);
    formData.append('category_ar', this.partnerForm.category_ar || '');
    formData.append('tier', this.partnerForm.tier);
    formData.append('website', this.partnerForm.website || '');
    formData.append('description', this.partnerForm.description || '');
    formData.append('description_ar', this.partnerForm.description_ar || '');
    formData.append('order_index', String(this.partnerForm.order_index || 0));
    formData.append('status', this.partnerForm.status);
    formData.append('code', this.partnerForm.code || this.partnerForm.name.toLowerCase().replace(/[^a-z0-9]/g, '-'));

    if (this.partnerLogoFile) {
      formData.append('logo', this.partnerLogoFile);
    } else if (this.partnerForm.logo) {
      formData.append('logo', this.partnerForm.logo);
    }

    if (this.isEditingPartner() && this.currentPartnerId()) {
      this.partnerService.updatePartner(this.currentPartnerId()!, formData).subscribe({
        next: (res) => {
          this.isSaving.set(false);
          this.isPartnerModalOpen.set(false);
          this.successMessage.set(`Partner "${res.partner.name}" updated successfully!`);
          if (typeof window !== 'undefined') window.localStorage.setItem('vic_partners_updated', String(Date.now()));
          this.refreshPartners();
        },
        error: (err) => {
          this.isSaving.set(false);
          this.errorMessage.set(err?.error?.message || 'Failed to update partner.');
        }
      });
    } else {
      this.partnerService.createPartner(formData).subscribe({
        next: (res) => {
          this.isSaving.set(false);
          this.isPartnerModalOpen.set(false);
          this.successMessage.set(`Partner "${res.partner.name}" added successfully!`);
          if (typeof window !== 'undefined') window.localStorage.setItem('vic_partners_updated', String(Date.now()));
          this.refreshPartners();
        },
        error: (err) => {
          this.isSaving.set(false);
          this.errorMessage.set(err?.error?.message || 'Failed to create partner.');
        }
      });
    }
  }

  togglePartnerStatus(partner: Partner): void {
    if (!partner.id) return;
    const newStatus = partner.status === 'Active' ? 'Inactive' : 'Active';
    const formData = new FormData();
    formData.append('status', newStatus);

    this.partnerService.updatePartner(partner.id, formData).subscribe({
      next: () => {
        this.partners.update(list =>
          list.map(p => p.id === partner.id ? { ...p, status: newStatus } : p)
        );
        if (typeof window !== 'undefined') window.localStorage.setItem('vic_partners_updated', String(Date.now()));
        this.successMessage.set(`Status updated for ${partner.name}.`);
      }
    });
  }

  movePartner(partner: Partner, direction: 'up' | 'down'): void {
    const list = [...this.partners()];
    const index = list.findIndex(p => p.id === partner.id);
    if (index < 0) return;

    if (direction === 'up' && index > 0) {
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
    } else if (direction === 'down' && index < list.length - 1) {
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
    } else {
      return;
    }

    const reordered = list.map((p, idx) => ({ id: p.id!, order_index: idx + 1 }));
    this.partners.set(list.map((p, idx) => ({ ...p, order_index: idx + 1 })));

    this.partnerService.reorderPartners(reordered).subscribe({
      next: () => {
        if (typeof window !== 'undefined') window.localStorage.setItem('vic_partners_updated', String(Date.now()));
      }
    });
  }

  refreshPartners(): void {
    this.partnerService.getPartners().subscribe({
      next: (res) => {
        if (res.success) {
          this.partners.set(res.partners);
        }
      }
    });
  }

  // ==========================================
  // DELETE DIALOG HANDLERS
  // ==========================================
  confirmDelete(id: number, name: string): void {
    this.itemToDeleteId.set(id);
    this.itemToDeleteName.set(name);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.itemToDeleteId.set(null);
  }

  executeDelete(): void {
    const id = this.itemToDeleteId();
    if (!id) return;

    this.partnerService.deletePartner(id).subscribe({
      next: () => {
        this.partners.update(list => list.filter(p => p.id !== id));
        if (typeof window !== 'undefined') window.localStorage.setItem('vic_partners_updated', String(Date.now()));
        this.successMessage.set('Partner deleted successfully.');
        this.closeDeleteModal();
      }
    });
  }

  // ==========================================
  // RESET / RESTORE OFFICIAL DEFAULTS
  // ==========================================
  restoreDefaults(): void {
    if (!confirm('Are you sure you want to restore the official default strategic partners?')) {
      return;
    }

    this.isSyncing.set(true);
    this.clearAlerts();

    this.partnerService.seedDefaults().subscribe({
      next: (res) => {
        this.isSyncing.set(false);
        this.successMessage.set(res.message);
        this.loadPartners();
      },
      error: (err) => {
        this.isSyncing.set(false);
        this.errorMessage.set(err?.error?.message || 'Failed to restore defaults.');
      }
    });
  }
}
