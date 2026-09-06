import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AboutService } from '../../../core/services/about.service';
import {
  AboutLeader,
  AboutSectionContent,
  AboutPageContentMap,
  LeaderSection
} from '../../../core/models/about.model';

@Component({
  selector: 'app-about-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './about-management.html',
  styleUrl: './about-management.css'
})
export class AboutManagementComponent implements OnInit {
  private aboutService = inject(AboutService);

  // Active Tab: 'leaders' | 'hero' | 'vision_mission' | 'vision_2030'
  activeTab = signal<'leaders' | 'hero' | 'vision_mission' | 'vision_2030'>('leaders');

  // Loading & Feedback
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);
  isSyncing = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  // 1. LEADERS MANAGEMENT
  leaders = signal<AboutLeader[]>([]);
  leaderSearch = signal<string>('');
  selectedBadgeFilter = signal<string>('All');
  selectedStatusFilter = signal<string>('All');

  // Leader Form Modal State
  isLeaderModalOpen = signal<boolean>(false);
  isEditingLeader = signal<boolean>(false);
  currentLeaderId = signal<number | null>(null);

  leaderForm = {
    name: '',
    title: '',
    role: '',
    badge: 'Executive Board',
    initials: '',
    image: '',
    order_index: 0,
    status: 'Active' as 'Active' | 'Inactive',
    bio_sections: [] as LeaderSection[]
  };
  leaderPhotoFile: File | null = null;
  leaderPhotoPreview: string | null = null;

  // Leader Live Preview Modal
  isPreviewLeaderModalOpen = signal<boolean>(false);
  previewLeader = signal<AboutLeader | null>(null);

  // Delete Confirmation Modal
  isDeleteModalOpen = signal<boolean>(false);
  itemToDeleteId = signal<number | null>(null);
  itemToDeleteName = signal<string>('');

  // 2. PAGE CONTENT SECTIONS (HERO, OVERVIEW, VISION & MISSION, VISION 2030)
  contentMap = signal<Partial<AboutPageContentMap>>({});

  // Hero Edit Form State
  heroForm = {
    badge: 'ABOUT VIC',
    title: 'Vaccine Industrial Holding LLC',
    subtitle: 'Leading the Charge in Vaccine Innovation in Saudi Arabia',
    description: '',
    image_url: 'home_banner.png'
  };
  heroImageFile: File | null = null;
  heroImagePreview: string | null = null;

  // Overview Modal Story Form
  overviewForm = {
    badge: 'COMPANY OVERVIEW',
    title: 'Pioneering Biotechnology in Saudi Arabia',
    description: '',
    paragraphs: [] as string[],
    newParagraphText: ''
  };
  isOverviewPreviewModalOpen = signal<boolean>(false);

  // Vision & Mission Form State
  vmForm = {
    vision_title: 'OUR VISION',
    vision_paragraphs: [] as string[],
    newVisionText: '',
    mission_title: 'OUR MISSION',
    mission_text: ''
  };

  // Vision 2030 Form State
  v2030Form = {
    badge: 'NATIONALITY',
    title: 'Aligned with Saudi Vision 2030',
    description: '',
    image_url: 'saudi_biotech_strategy.jpg',
    features: [] as Array<{ title: string; desc?: string; icon?: string }>
  };
  v2030ImageFile: File | null = null;
  v2030ImagePreview: string | null = null;

  // Computed Values
  filteredLeaders = computed(() => {
    const list = this.leaders();
    const search = this.leaderSearch().toLowerCase().trim();
    const badge = this.selectedBadgeFilter();
    const status = this.selectedStatusFilter();

    return list.filter(l => {
      const matchSearch = !search ||
        l.name.toLowerCase().includes(search) ||
        l.title.toLowerCase().includes(search) ||
        l.role.toLowerCase().includes(search) ||
        l.badge.toLowerCase().includes(search);
      const matchBadge = badge === 'All' || l.badge === badge;
      const matchStatus = status === 'All' || l.status === status;
      return matchSearch && matchBadge && matchStatus;
    });
  });

  uniqueBadges = computed(() => {
    const set = new Set<string>();
    this.leaders().forEach(l => { if (l.badge) set.add(l.badge); });
    return Array.from(set).sort();
  });

  totalLeadersCount = computed(() => this.leaders().length);
  activeLeadersCount = computed(() => this.leaders().filter(l => l.status === 'Active').length);

  ngOnInit(): void {
    this.loadAllAboutData();
  }

  loadAllAboutData(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    // 1. Fetch Leaders
    this.aboutService.getLeaders().subscribe({
      next: (res) => {
        if (res.success) {
          this.leaders.set(res.leaders || []);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not connect to backend server. Please verify database connection.');
        this.isLoading.set(false);
      }
    });

    // 2. Fetch Page Content
    this.aboutService.getAboutContent().subscribe({
      next: (res) => {
        if (res.success && res.content) {
          this.contentMap.set(res.content);
          this.syncFormsFromContent(res.content);
        }
      }
    });
  }

  syncFormsFromContent(content: AboutPageContentMap): void {
    // Hero Form
    if (content.hero) {
      this.heroForm = {
        badge: content.hero.badge || 'ABOUT VIC',
        title: content.hero.title || 'Vaccine Industrial Holding LLC',
        subtitle: content.hero.subtitle || '',
        description: content.hero.description || '',
        image_url: content.hero.image_url || 'home_banner.png'
      };
      this.heroImagePreview = this.resolveImg(content.hero.image_url);
    }

    // Overview Form
    if (content.overview_modal) {
      this.overviewForm = {
        badge: content.overview_modal.badge || 'COMPANY OVERVIEW',
        title: content.overview_modal.title || 'Pioneering Biotechnology in Saudi Arabia',
        description: content.overview_modal.description || '',
        paragraphs: Array.isArray(content.overview_modal.content_json) ? [...content.overview_modal.content_json] : [],
        newParagraphText: ''
      };
    }

    // Vision & Mission Form
    if (content.vision_mission && content.vision_mission.content_json) {
      const vm = content.vision_mission.content_json;
      this.vmForm = {
        vision_title: vm.vision_title || 'OUR VISION',
        vision_paragraphs: Array.isArray(vm.vision_paragraphs) ? [...vm.vision_paragraphs] : [],
        newVisionText: '',
        mission_title: vm.mission_title || 'OUR MISSION',
        mission_text: Array.isArray(vm.mission_paragraphs) ? vm.mission_paragraphs.join('\n') : (vm.mission_paragraphs || '')
      };
    }

    // Vision 2030 Form
    if (content.vision_2030) {
      this.v2030Form = {
        badge: content.vision_2030.badge || 'NATIONALITY',
        title: content.vision_2030.title || 'Aligned with Saudi Vision 2030',
        description: content.vision_2030.description || '',
        image_url: content.vision_2030.image_url || 'saudi_biotech_strategy.jpg',
        features: Array.isArray(content.vision_2030.content_json) ? [...content.vision_2030.content_json] : []
      };
      this.v2030ImagePreview = this.resolveImg(content.vision_2030.image_url);
    }
  }

  switchTab(tab: 'leaders' | 'hero' | 'vision_mission' | 'vision_2030'): void {
    this.activeTab.set(tab);
    this.clearAlerts();
  }

  clearAlerts(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  resolveImg(path: string | undefined | null, fallback = 'logo_navbar.png'): string {
    if (!path) return fallback;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/uploads/')) return `http://localhost:5000${path}`;
    return path;
  }

  // ==========================================
  // LEADERSHIP CRUD
  // ==========================================
  openAddLeaderModal(): void {
    this.isEditingLeader.set(false);
    this.currentLeaderId.set(null);
    this.leaderForm = {
      name: '',
      title: '',
      role: '',
      badge: 'Executive Board',
      initials: '',
      image: '',
      order_index: this.leaders().length + 1,
      status: 'Active',
      bio_sections: [
        { heading: 'Executive Summary', paragraphs: [''] }
      ]
    };
    this.leaderPhotoFile = null;
    this.leaderPhotoPreview = null;
    this.isLeaderModalOpen.set(true);
  }

  openEditLeaderModal(leader: AboutLeader): void {
    this.isEditingLeader.set(true);
    this.currentLeaderId.set(leader.id || null);
    this.leaderForm = {
      name: leader.name,
      title: leader.title,
      role: leader.role,
      badge: leader.badge || 'Executive Board',
      initials: leader.initials || '',
      image: leader.image || '',
      order_index: leader.order_index || 0,
      status: leader.status,
      bio_sections: leader.bio_sections && leader.bio_sections.length > 0
        ? JSON.parse(JSON.stringify(leader.bio_sections))
        : [{ heading: 'Executive Summary', paragraphs: [''] }]
    };
    this.leaderPhotoFile = null;
    this.leaderPhotoPreview = this.resolveImg(leader.image);
    this.isLeaderModalOpen.set(true);
  }

  closeLeaderModal(): void {
    this.isLeaderModalOpen.set(false);
  }

  onLeaderPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.leaderPhotoFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.leaderPhotoPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  addBioSection(): void {
    this.leaderForm.bio_sections.push({
      heading: 'New Section',
      paragraphs: ['']
    });
  }

  removeBioSection(index: number): void {
    this.leaderForm.bio_sections.splice(index, 1);
  }

  addBioParagraph(section: LeaderSection): void {
    if (!section.paragraphs) section.paragraphs = [];
    section.paragraphs.push('');
  }

  removeBioParagraph(section: LeaderSection, pIndex: number): void {
    section.paragraphs?.splice(pIndex, 1);
  }

  addBioItem(section: LeaderSection, itemText: string): void {
    if (!section.items) section.items = [];
    if (itemText.trim()) {
      section.items.push(itemText.trim());
    }
  }

  removeBioItem(section: LeaderSection, iIndex: number): void {
    section.items?.splice(iIndex, 1);
  }

  saveLeader(): void {
    if (!this.leaderForm.name || !this.leaderForm.title) {
      this.errorMessage.set('Name and Title are required.');
      return;
    }

    this.isSaving.set(true);
    this.clearAlerts();

    const formData = new FormData();
    formData.append('name', this.leaderForm.name);
    formData.append('title', this.leaderForm.title);
    formData.append('role', this.leaderForm.role || '');
    formData.append('badge', this.leaderForm.badge || 'Executive Board');
    formData.append('initials', this.leaderForm.initials || '');
    formData.append('order_index', String(this.leaderForm.order_index || 0));
    formData.append('status', this.leaderForm.status);
    formData.append('bio_sections', JSON.stringify(this.leaderForm.bio_sections));

    if (this.leaderPhotoFile) {
      formData.append('image', this.leaderPhotoFile);
    } else if (this.leaderForm.image) {
      formData.append('image', this.leaderForm.image);
    }

    if (this.isEditingLeader() && this.currentLeaderId()) {
      this.aboutService.updateLeader(this.currentLeaderId()!, formData).subscribe({
        next: (res) => {
          this.isSaving.set(false);
          this.isLeaderModalOpen.set(false);
          this.successMessage.set(`Leader "${res.leader.name}" updated successfully!`);
          this.refreshLeaders();
        },
        error: (err) => {
          this.isSaving.set(false);
          this.errorMessage.set(err?.error?.message || 'Failed to update leader.');
        }
      });
    } else {
      this.aboutService.createLeader(formData).subscribe({
        next: (res) => {
          this.isSaving.set(false);
          this.isLeaderModalOpen.set(false);
          this.successMessage.set(`Leader "${res.leader.name}" created successfully!`);
          this.refreshLeaders();
        },
        error: (err) => {
          this.isSaving.set(false);
          this.errorMessage.set(err?.error?.message || 'Failed to create leader.');
        }
      });
    }
  }

  toggleLeaderStatus(leader: AboutLeader): void {
    if (!leader.id) return;
    const newStatus = leader.status === 'Active' ? 'Inactive' : 'Active';
    const formData = new FormData();
    formData.append('status', newStatus);

    this.aboutService.updateLeader(leader.id, formData).subscribe({
      next: () => {
        this.leaders.update(list =>
          list.map(l => l.id === leader.id ? { ...l, status: newStatus } : l)
        );
        this.successMessage.set(`Status updated for ${leader.name}.`);
      }
    });
  }

  moveLeader(leader: AboutLeader, direction: 'up' | 'down'): void {
    const list = [...this.leaders()];
    const index = list.findIndex(l => l.id === leader.id);
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

    const reordered = list.map((l, idx) => ({ id: l.id!, order_index: idx + 1 }));
    this.leaders.set(list.map((l, idx) => ({ ...l, order_index: idx + 1 })));

    this.aboutService.reorderLeaders(reordered).subscribe();
  }

  refreshLeaders(): void {
    this.aboutService.getLeaders().subscribe({
      next: (res) => {
        if (res.success) {
          this.leaders.set(res.leaders);
        }
      }
    });
  }

  // Preview Leader Full Profile Modal
  openPreviewLeader(leader: AboutLeader): void {
    this.previewLeader.set(leader);
    this.isPreviewLeaderModalOpen.set(true);
  }

  closePreviewLeader(): void {
    this.isPreviewLeaderModalOpen.set(false);
    this.previewLeader.set(null);
  }

  // Delete Leader
  confirmDeleteLeader(id: number, name: string): void {
    this.itemToDeleteId.set(id);
    this.itemToDeleteName.set(name);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.itemToDeleteId.set(null);
  }

  executeDeleteLeader(): void {
    const id = this.itemToDeleteId();
    if (!id) return;

    this.aboutService.deleteLeader(id).subscribe({
      next: () => {
        this.leaders.update(list => list.filter(l => l.id !== id));
        this.successMessage.set('Leader profile deleted successfully.');
        this.closeDeleteModal();
      }
    });
  }

  // ==========================================
  // SECTION 2: HERO BANNER & OVERVIEW MODAL
  // ==========================================
  onHeroImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.heroImageFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.heroImagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  saveHeroSection(): void {
    this.isSaving.set(true);
    this.clearAlerts();

    const formData = new FormData();
    formData.append('badge', this.heroForm.badge || 'ABOUT VIC');
    formData.append('title', this.heroForm.title || '');
    formData.append('subtitle', this.heroForm.subtitle || '');
    formData.append('description', this.heroForm.description || '');

    if (this.heroImageFile) {
      formData.append('image', this.heroImageFile);
    } else if (this.heroForm.image_url) {
      formData.append('image_url', this.heroForm.image_url);
    }

    this.aboutService.updateAboutSection('hero', formData).subscribe({
      next: (res) => {
        this.isSaving.set(false);
        this.successMessage.set('About Hero banner saved successfully!');
        this.heroImageFile = null;
      },
      error: (err) => {
        this.isSaving.set(false);
        this.errorMessage.set(err?.error?.message || 'Failed to update hero banner.');
      }
    });
  }

  // Overview Story Paragraphs
  addOverviewParagraph(): void {
    const text = this.overviewForm.newParagraphText.trim();
    if (text) {
      this.overviewForm.paragraphs.push(text);
      this.overviewForm.newParagraphText = '';
    }
  }

  removeOverviewParagraph(index: number): void {
    this.overviewForm.paragraphs.splice(index, 1);
  }

  saveOverviewModal(): void {
    this.isSaving.set(true);
    this.clearAlerts();

    const formData = new FormData();
    formData.append('badge', this.overviewForm.badge || 'COMPANY OVERVIEW');
    formData.append('title', this.overviewForm.title || '');
    formData.append('description', this.overviewForm.description || '');
    formData.append('content_json', JSON.stringify(this.overviewForm.paragraphs));

    this.aboutService.updateAboutSection('overview_modal', formData).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.successMessage.set('Company Overview story updated successfully!');
      },
      error: (err) => {
        this.isSaving.set(false);
        this.errorMessage.set(err?.error?.message || 'Failed to update overview story.');
      }
    });
  }

  openOverviewPreview(): void {
    this.isOverviewPreviewModalOpen.set(true);
  }

  closeOverviewPreview(): void {
    this.isOverviewPreviewModalOpen.set(false);
  }

  // ==========================================
  // SECTION 3: VISION & MISSION
  // ==========================================
  addVisionParagraph(): void {
    const text = this.vmForm.newVisionText.trim();
    if (text) {
      this.vmForm.vision_paragraphs.push(text);
      this.vmForm.newVisionText = '';
    }
  }

  removeVisionParagraph(index: number): void {
    this.vmForm.vision_paragraphs.splice(index, 1);
  }

  saveVisionMission(): void {
    this.isSaving.set(true);
    this.clearAlerts();

    const payload = {
      vision_title: this.vmForm.vision_title || 'OUR VISION',
      vision_paragraphs: this.vmForm.vision_paragraphs,
      mission_title: this.vmForm.mission_title || 'OUR MISSION',
      mission_paragraphs: [this.vmForm.mission_text]
    };

    const formData = new FormData();
    formData.append('badge', 'FOUNDATIONAL PILLARS');
    formData.append('title', 'Our Vision & Mission');
    formData.append('content_json', JSON.stringify(payload));

    this.aboutService.updateAboutSection('vision_mission', formData).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.successMessage.set('Vision & Mission content saved successfully!');
      },
      error: (err) => {
        this.isSaving.set(false);
        this.errorMessage.set(err?.error?.message || 'Failed to update Vision & Mission.');
      }
    });
  }

  // ==========================================
  // SECTION 4: SAUDI VISION 2030
  // ==========================================
  onV2030ImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.v2030ImageFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.v2030ImagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  addV2030Feature(): void {
    this.v2030Form.features.push({
      title: 'New Transformation Pillar',
      desc: 'Advancing healthcare security and life-saving immunization',
      icon: 'heart'
    });
  }

  removeV2030Feature(index: number): void {
    this.v2030Form.features.splice(index, 1);
  }

  saveVision2030(): void {
    this.isSaving.set(true);
    this.clearAlerts();

    const formData = new FormData();
    formData.append('badge', this.v2030Form.badge || 'NATIONALITY');
    formData.append('title', this.v2030Form.title || 'Aligned with Saudi Vision 2030');
    formData.append('description', this.v2030Form.description || '');
    formData.append('content_json', JSON.stringify(this.v2030Form.features));

    if (this.v2030ImageFile) {
      formData.append('image', this.v2030ImageFile);
    } else if (this.v2030Form.image_url) {
      formData.append('image_url', this.v2030Form.image_url);
    }

    this.aboutService.updateAboutSection('vision_2030', formData).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.successMessage.set('Saudi Vision 2030 section saved successfully!');
        this.v2030ImageFile = null;
      },
      error: (err) => {
        this.isSaving.set(false);
        this.errorMessage.set(err?.error?.message || 'Failed to update Vision 2030 section.');
      }
    });
  }

  // ==========================================
  // SYNC DEFAULTS
  // ==========================================
  restoreDefaults(): void {
    if (!confirm('Are you sure you want to restore the official default About Us content and founding leadership team?')) {
      return;
    }

    this.isSyncing.set(true);
    this.clearAlerts();

    this.aboutService.seedDefaults().subscribe({
      next: (res) => {
        this.isSyncing.set(false);
        this.successMessage.set(res.message);
        this.loadAllAboutData();
      },
      error: (err) => {
        this.isSyncing.set(false);
        this.errorMessage.set(err?.error?.message || 'Failed to restore defaults.');
      }
    });
  }
}
