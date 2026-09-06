import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PartnerService } from '../../../core/services/partner.service';
import {
  PartnerPageSettings,
  Partner,
  PartnershipSection,
  PartnershipInquiry
} from '../../../core/models/partner.model';

@Component({
  selector: 'app-partners-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './partners-management.html',
  styleUrl: './partners-management.css'
})
export class PartnersManagementComponent implements OnInit {
  private partnerService = inject(PartnerService);

  // Active navigation tab: 'banner' | 'partners' | 'sections' | 'inquiries'
  activeTab = signal<'banner' | 'partners' | 'sections' | 'inquiries'>('partners');

  // Loading & Alert Signals
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);
  isSyncing = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  // 1. Settings / Banner Signals & Form
  settings = signal<PartnerPageSettings>({
    hero_badge: 'OUR PARTNERS',
    hero_title: 'Stronger Together.',
    hero_title_line2: 'Building Better Futures.',
    hero_accent: 'Futures.',
    hero_description: 'Collaboration is at the heart of everything we do. We work with global leaders, research institutions, and government entities to advance vaccine innovation and strengthen global health.',
    hero_image: 'partner_banner.jpg',
    cta_text: 'Partner With Us',
    stats: [
      { label: 'Global Strategic Alliances', value: '10+' },
      { label: 'Ecosystem Pillars', value: '5' },
      { label: 'Capital Commitment', value: 'SAR 500M+' },
      { label: 'Vision 2030 Biotech Impact', value: '100%' }
    ]
  });

  bannerFile: File | null = null;
  bannerPreviewUrl: string | null = null;

  // 2. Partners List & Filter Signals
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
    category: '',
    tier: 'Strategic Alliance',
    website: '',
    description: '',
    order_index: 0,
    status: 'Active' as 'Active' | 'Inactive',
    logo: ''
  };
  partnerLogoFile: File | null = null;
  partnerLogoPreview: string | null = null;

  // 3. Dynamic Sections Signals & Form
  sections = signal<PartnershipSection[]>([]);
  isSectionModalOpen = signal<boolean>(false);
  isEditingSection = signal<boolean>(false);
  currentSectionId = signal<number | null>(null);

  sectionForm = {
    section_key: 'custom_section',
    badge: '',
    title: '',
    subtitle: '',
    content: '',
    icon: 'handshake',
    cta_text: '',
    cta_url: '',
    layout_type: 'card' as 'card' | 'split_left' | 'split_right' | 'stat_grid' | 'banner_highlight',
    order_index: 0,
    status: 'Active' as 'Active' | 'Inactive',
    bullet_points: [] as string[],
    newBulletText: '',
    image_url: ''
  };
  sectionImageFile: File | null = null;
  sectionImagePreview: string | null = null;

  // 4. Inquiries Signals
  inquiries = signal<PartnershipInquiry[]>([]);
  inquirySearch = signal<string>('');
  inquiryStatusFilter = signal<string>('All');
  selectedInquiry = signal<PartnershipInquiry | null>(null);
  isInquiryDetailModalOpen = signal<boolean>(false);

  // Delete Confirmation Modal
  isDeleteModalOpen = signal<boolean>(false);
  deleteType = signal<'partner' | 'section' | 'inquiry'>('partner');
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

  filteredInquiries = computed(() => {
    const list = this.inquiries();
    const search = this.inquirySearch().toLowerCase().trim();
    const status = this.inquiryStatusFilter();

    return list.filter(i => {
      const matchSearch = !search ||
        i.full_name.toLowerCase().includes(search) ||
        i.organization.toLowerCase().includes(search) ||
        i.email.toLowerCase().includes(search) ||
        (i.message && i.message.toLowerCase().includes(search));
      const matchStatus = status === 'All' || i.status === status;
      return matchSearch && matchStatus;
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
  totalSectionsCount = computed(() => this.sections().length);
  newInquiriesCount = computed(() => this.inquiries().filter(i => i.status === 'New').length);

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    // Load Settings
    this.partnerService.getPageSettings().subscribe({
      next: (res) => {
        if (res.success && res.settings) {
          this.settings.set(res.settings);
        }
      },
      error: () => {
        // Fallback default already in signal
      }
    });

    // Load Partners
    this.partnerService.getPartners().subscribe({
      next: (res) => {
        if (res.success) {
          this.partners.set(res.partners || []);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Failed to load partners. Please ensure backend server is running.');
        this.isLoading.set(false);
      }
    });

    // Load Sections
    this.partnerService.getSections().subscribe({
      next: (res) => {
        if (res.success) {
          this.sections.set(res.sections || []);
        }
      }
    });

    // Load Inquiries
    this.partnerService.getInquiries().subscribe({
      next: (res) => {
        if (res.success) {
          this.inquiries.set(res.inquiries || []);
        }
      }
    });
  }

  // ==========================================
  // TAB NAVIGATION
  // ==========================================
  switchTab(tab: 'banner' | 'partners' | 'sections' | 'inquiries'): void {
    this.activeTab.set(tab);
    this.clearAlerts();
  }

  clearAlerts(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  // Helper for resolving image paths
  resolveImg(path: string | undefined | null): string {
    if (!path) return 'partner_banner.jpg';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/uploads/')) return `http://localhost:5000${path}`;
    return path;
  }

  // ==========================================
  // 1. BANNER & PAGE SETTINGS ACTIONS
  // ==========================================
  onBannerFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.bannerFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.bannerPreviewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeBannerFile(): void {
    this.bannerFile = null;
    this.bannerPreviewUrl = null;
  }

  addStatItem(): void {
    const current = this.settings();
    const stats = current.stats ? [...current.stats] : [];
    stats.push({ label: 'New Metric', value: '100+' });
    this.settings.set({ ...current, stats });
  }

  removeStatItem(index: number): void {
    const current = this.settings();
    if (current.stats) {
      const stats = current.stats.filter((_, i) => i !== index);
      this.settings.set({ ...current, stats });
    }
  }

  saveBannerSettings(): void {
    this.isSaving.set(true);
    this.clearAlerts();

    const current = this.settings();
    const formData = new FormData();
    formData.append('hero_badge', current.hero_badge || '');
    formData.append('hero_title', current.hero_title || '');
    formData.append('hero_title_line2', current.hero_title_line2 || '');
    formData.append('hero_accent', current.hero_accent || '');
    formData.append('hero_description', current.hero_description || '');
    formData.append('cta_text', current.cta_text || 'Partner With Us');
    formData.append('hero_image', current.hero_image || 'partner_banner.jpg');
    formData.append('stats_json', JSON.stringify(current.stats || []));

    if (this.bannerFile) {
      formData.append('hero_image', this.bannerFile);
    }

    this.partnerService.updatePageSettings(formData).subscribe({
      next: (res) => {
        this.isSaving.set(false);
        if (res.success) {
          this.settings.set(res.settings);
          this.bannerFile = null;
          this.bannerPreviewUrl = null;
          this.successMessage.set('Banner and page settings updated successfully!');
        }
      },
      error: (err) => {
        this.isSaving.set(false);
        this.errorMessage.set(err?.error?.message || 'Failed to update page settings.');
      }
    });
  }

  // ==========================================
  // 2. PARTNERS CRUD ACTIONS
  // ==========================================
  openAddPartnerModal(): void {
    this.isEditingPartner.set(false);
    this.currentPartnerId.set(null);
    this.partnerForm = {
      code: '',
      name: '',
      category: '',
      tier: 'Strategic Alliance',
      website: '',
      description: '',
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
      category: partner.category,
      tier: partner.tier || 'Strategic Alliance',
      website: partner.website || '',
      description: partner.description,
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
    formData.append('category', this.partnerForm.category);
    formData.append('tier', this.partnerForm.tier);
    formData.append('website', this.partnerForm.website || '');
    formData.append('description', this.partnerForm.description || '');
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

    this.partnerService.reorderPartners(reordered).subscribe();
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
  // 3. DYNAMIC SECTIONS CRUD ACTIONS
  // ==========================================
  openAddSectionModal(): void {
    this.isEditingSection.set(false);
    this.currentSectionId.set(null);
    this.sectionForm = {
      section_key: 'custom_section',
      badge: '',
      title: '',
      subtitle: '',
      content: '',
      icon: 'handshake',
      cta_text: '',
      cta_url: '',
      layout_type: 'card',
      order_index: this.sections().length + 1,
      status: 'Active',
      bullet_points: [],
      newBulletText: '',
      image_url: ''
    };
    this.sectionImageFile = null;
    this.sectionImagePreview = null;
    this.isSectionModalOpen.set(true);
  }

  openEditSectionModal(section: PartnershipSection): void {
    this.isEditingSection.set(true);
    this.currentSectionId.set(section.id || null);
    this.sectionForm = {
      section_key: section.section_key || 'custom_section',
      badge: section.badge || '',
      title: section.title,
      subtitle: section.subtitle || '',
      content: section.content || '',
      icon: section.icon || 'handshake',
      cta_text: section.cta_text || '',
      cta_url: section.cta_url || '',
      layout_type: section.layout_type || 'card',
      order_index: section.order_index || 0,
      status: section.status,
      bullet_points: section.bullet_points ? [...section.bullet_points] : [],
      newBulletText: '',
      image_url: section.image_url || ''
    };
    this.sectionImageFile = null;
    this.sectionImagePreview = section.image_url ? this.resolveImg(section.image_url) : null;
    this.isSectionModalOpen.set(true);
  }

  closeSectionModal(): void {
    this.isSectionModalOpen.set(false);
  }

  addBulletPoint(): void {
    const text = this.sectionForm.newBulletText.trim();
    if (text) {
      this.sectionForm.bullet_points.push(text);
      this.sectionForm.newBulletText = '';
    }
  }

  removeBulletPoint(index: number): void {
    this.sectionForm.bullet_points.splice(index, 1);
  }

  onSectionImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.sectionImageFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.sectionImagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeSectionImage(): void {
    this.sectionImageFile = null;
    this.sectionImagePreview = null;
    this.sectionForm.image_url = '';
  }

  saveSection(): void {
    if (!this.sectionForm.title) {
      this.errorMessage.set('Section Title is required.');
      return;
    }

    this.isSaving.set(true);
    this.clearAlerts();

    const formData = new FormData();
    formData.append('section_key', this.sectionForm.section_key);
    formData.append('badge', this.sectionForm.badge || '');
    formData.append('title', this.sectionForm.title);
    formData.append('subtitle', this.sectionForm.subtitle || '');
    formData.append('content', this.sectionForm.content || '');
    formData.append('icon', this.sectionForm.icon || 'handshake');
    formData.append('cta_text', this.sectionForm.cta_text || '');
    formData.append('cta_url', this.sectionForm.cta_url || '');
    formData.append('layout_type', this.sectionForm.layout_type);
    formData.append('order_index', String(this.sectionForm.order_index || 0));
    formData.append('status', this.sectionForm.status);
    formData.append('bullet_points', JSON.stringify(this.sectionForm.bullet_points || []));

    if (this.sectionImageFile) {
      formData.append('image', this.sectionImageFile);
    } else if (this.sectionForm.image_url) {
      formData.append('image_url', this.sectionForm.image_url);
    }

    if (this.isEditingSection() && this.currentSectionId()) {
      this.partnerService.updateSection(this.currentSectionId()!, formData).subscribe({
        next: (res) => {
          this.isSaving.set(false);
          this.isSectionModalOpen.set(false);
          this.successMessage.set(`Section "${res.section.title}" updated successfully!`);
          this.refreshSections();
        },
        error: (err) => {
          this.isSaving.set(false);
          this.errorMessage.set(err?.error?.message || 'Failed to update section.');
        }
      });
    } else {
      this.partnerService.createSection(formData).subscribe({
        next: (res) => {
          this.isSaving.set(false);
          this.isSectionModalOpen.set(false);
          this.successMessage.set(`Section "${res.section.title}" created successfully!`);
          this.refreshSections();
        },
        error: (err) => {
          this.isSaving.set(false);
          this.errorMessage.set(err?.error?.message || 'Failed to create section.');
        }
      });
    }
  }

  refreshSections(): void {
    this.partnerService.getSections().subscribe({
      next: (res) => {
        if (res.success) {
          this.sections.set(res.sections);
        }
      }
    });
  }

  // ==========================================
  // 4. INQUIRIES ACTIONS
  // ==========================================
  openInquiryDetails(inquiry: PartnershipInquiry): void {
    this.selectedInquiry.set(inquiry);
    this.isInquiryDetailModalOpen.set(true);
  }

  closeInquiryDetails(): void {
    this.isInquiryDetailModalOpen.set(false);
    this.selectedInquiry.set(null);
  }

  updateInquiryStatus(inquiry: PartnershipInquiry, newStatus: string): void {
    if (!inquiry.id) return;
    this.partnerService.updateInquiryStatus(inquiry.id, newStatus, inquiry.notes).subscribe({
      next: () => {
        inquiry.status = newStatus as any;
        this.inquiries.update(list =>
          list.map(i => i.id === inquiry.id ? { ...i, status: newStatus as any } : i)
        );
        this.successMessage.set(`Status updated for inquiry from ${inquiry.organization}.`);
      }
    });
  }

  saveInquiryNotes(): void {
    const current = this.selectedInquiry();
    if (!current || !current.id) return;

    this.partnerService.updateInquiryStatus(current.id, current.status, current.notes).subscribe({
      next: () => {
        this.successMessage.set('Notes saved successfully.');
        this.closeInquiryDetails();
      }
    });
  }

  // ==========================================
  // DELETE DIALOG HANDLERS
  // ==========================================
  confirmDelete(type: 'partner' | 'section' | 'inquiry', id: number, name: string): void {
    this.deleteType.set(type);
    this.itemToDeleteId.set(id);
    this.itemToDeleteName.set(name);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.itemToDeleteId.set(null);
  }

  executeDelete(): void {
    const type = this.deleteType();
    const id = this.itemToDeleteId();
    if (!id) return;

    if (type === 'partner') {
      this.partnerService.deletePartner(id).subscribe({
        next: () => {
          this.partners.update(list => list.filter(p => p.id !== id));
          this.successMessage.set('Partner deleted successfully.');
          this.closeDeleteModal();
        }
      });
    } else if (type === 'section') {
      this.partnerService.deleteSection(id).subscribe({
        next: () => {
          this.sections.update(list => list.filter(s => s.id !== id));
          this.successMessage.set('Section deleted successfully.');
          this.closeDeleteModal();
        }
      });
    } else if (type === 'inquiry') {
      this.partnerService.deleteInquiry(id).subscribe({
        next: () => {
          this.inquiries.update(list => list.filter(i => i.id !== id));
          this.successMessage.set('Inquiry deleted successfully.');
          this.closeDeleteModal();
        }
      });
    }
  }

  // ==========================================
  // RESET / RESTORE OFFICIAL DEFAULTS
  // ==========================================
  restoreDefaults(): void {
    if (!confirm('Are you sure you want to restore the official default partners, sections, and banner settings? This will reset custom changes.')) {
      return;
    }

    this.isSyncing.set(true);
    this.clearAlerts();

    this.partnerService.seedDefaults().subscribe({
      next: (res) => {
        this.isSyncing.set(false);
        this.successMessage.set(res.message);
        this.loadAllData();
      },
      error: (err) => {
        this.isSyncing.set(false);
        this.errorMessage.set(err?.error?.message || 'Failed to restore defaults.');
      }
    });
  }
}
