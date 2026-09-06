import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PartnerService } from '../../../core/services/partner.service';
import { Partner } from '../../../core/models/partner.model';

@Component({
  selector: 'app-partners-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './partners-management.html',
  styleUrl: './partners-management.css'
})
export class PartnersManagementComponent implements OnInit {
  private partnerService = inject(PartnerService);

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
    if (!path) return 'logo_navbar.png';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/uploads/')) return `http://localhost:5000${path}`;
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
