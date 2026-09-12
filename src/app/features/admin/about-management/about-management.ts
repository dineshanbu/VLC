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
import { environment } from '../../../../environments/environment';

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
  leaderEditLang = signal<'en' | 'ar'>('en');

  leaderForm = {
    name: '',
    name_ar: '',
    title: '',
    title_ar: '',
    role: '',
    role_ar: '',
    badge: 'Executive Board',
    badge_ar: 'مجلس الإدارة التنفيذي',
    initials: '',
    image: '',
    order_index: 0,
    status: 'Active' as 'Active' | 'Inactive',
    bio_sections: [] as LeaderSection[],
    bio_sections_ar: [] as LeaderSection[]
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
  heroEditLang = signal<'en' | 'ar'>('en');
  heroPreviewLang = signal<'en' | 'ar'>('en');
  heroForm = {
    badge: 'ABOUT VIC',
    badge_ar: 'عن الشركة',
    title: 'Vaccine Industrial Holding LLC',
    title_ar: 'شركة اللقاحات الصناعية القابضة',
    subtitle: 'Leading the Charge in Vaccine Innovation in Saudi Arabia',
    subtitle_ar: 'ريادة الابتكار وتوطين صناعة اللقاحات في المملكة العربية السعودية',
    description: '',
    description_ar: '',
    image_url: 'home_banner.png'
  };
  heroImageFile: File | null = null;
  heroImagePreview: string | null = null;

  // Overview Modal Story Form
  overviewEditLang = signal<'en' | 'ar'>('en');
  overviewForm = {
    badge: 'COMPANY OVERVIEW',
    badge_ar: 'نظرة عامة على الشركة',
    title: 'Pioneering Biotechnology in Saudi Arabia',
    title_ar: 'ريادة التقنية الحيوية وصناعة اللقاحات في المملكة',
    description: '',
    description_ar: '',
    paragraphs: [] as string[],
    paragraphs_ar: [] as string[],
    newParagraphText: '',
    newParagraphTextAr: ''
  };
  isOverviewPreviewModalOpen = signal<boolean>(false);

  // Vision & Mission Form State
  vmEditLang = signal<'en' | 'ar'>('en');
  vmForm = {
    vision_title: 'OUR VISION',
    vision_title_ar: 'رؤيتنا',
    vision_paragraphs: [] as string[],
    vision_paragraphs_ar: [] as string[],
    newVisionText: '',
    newVisionTextAr: '',
    mission_title: 'OUR MISSION',
    mission_title_ar: 'رسالتنا',
    mission_text: '',
    mission_text_ar: ''
  };

  // Vision 2030 Form State
  v2030EditLang = signal<'en' | 'ar'>('en');
  v2030Form = {
    badge: 'NATIONALITY',
    badge_ar: 'الاستراتيجية الوطنية',
    title: 'Aligned with Saudi Vision 2030',
    title_ar: 'متوافقون مع رؤية السعودية 2030',
    description: '',
    description_ar: '',
    image_url: 'saudi_biotech_strategy.jpg',
    features: [] as Array<{ title: string; desc?: string; icon?: string }>,
    features_ar: [] as Array<{ title: string; desc?: string; icon?: string }>
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
        badge_ar: content.hero.badge_ar || 'عن الشركة',
        title: content.hero.title || 'Vaccine Industrial Holding LLC',
        title_ar: content.hero.title_ar || 'شركة اللقاحات الصناعية القابضة',
        subtitle: content.hero.subtitle || 'Pioneering Biotechnology & Vaccine Manufacturing in Saudi Arabia',
        subtitle_ar: content.hero.subtitle_ar || 'ريادة التقنية الحيوية وصناعة اللقاحات في المملكة العربية السعودية',
        description: content.hero.description || 'Dedicated to advancing healthcare resilience and biomanufacturing excellence in the Kingdom and beyond.',
        description_ar: content.hero.description_ar || 'ملتزمون بتعزيز مرونة الرعاية الصحية والتميز في التصنيع الحيوي في المملكة وخارجها.',
        image_url: content.hero.image_url || 'home_banner.png'
      };
      this.heroImagePreview = this.resolveImg(content.hero.image_url);
    }

    // Overview Form
    if (content.overview_modal) {
      this.overviewForm = {
        badge: content.overview_modal.badge || 'COMPANY OVERVIEW',
        badge_ar: content.overview_modal.badge_ar || 'نظرة عامة على الشركة',
        title: content.overview_modal.title || 'Pioneering Biotechnology in Saudi Arabia',
        title_ar: content.overview_modal.title_ar || 'ريادة التقنية الحيوية وصناعة اللقاحات في المملكة',
        description: content.overview_modal.description || 'Dedicated to healthcare resilience, self-reliance, and biomanufacturing excellence.',
        description_ar: content.overview_modal.description_ar || 'ملتزمون بتعزيز مرونة الرعاية الصحية والاكتفاء الذاتي والتميز في التصنيع الحيوي.',
        paragraphs: Array.isArray(content.overview_modal.content_json) ? [...content.overview_modal.content_json] : [],
        paragraphs_ar: Array.isArray(content.overview_modal.content_json_ar) ? [...content.overview_modal.content_json_ar] : [],
        newParagraphText: '',
        newParagraphTextAr: ''
      };
    }

    // Vision & Mission Form
    if (content.vision_mission) {
      const vm = content.vision_mission.content_json || {};
      const vmAr = content.vision_mission.content_json_ar || {};
      this.vmForm = {
        vision_title: vm.vision_title || 'OUR VISION',
        vision_title_ar: vmAr.vision_title || 'رؤيتنا',
        vision_paragraphs: Array.isArray(vm.vision_paragraphs) ? [...vm.vision_paragraphs] : [],
        vision_paragraphs_ar: Array.isArray(vmAr.vision_paragraphs) ? [...vmAr.vision_paragraphs] : [],
        newVisionText: '',
        newVisionTextAr: '',
        mission_title: vm.mission_title || 'OUR MISSION',
        mission_title_ar: vmAr.mission_title || 'رسالتنا',
        mission_text: Array.isArray(vm.mission_paragraphs) ? vm.mission_paragraphs.join('\n') : (vm.mission_paragraphs || ''),
        mission_text_ar: Array.isArray(vmAr.mission_paragraphs) ? vmAr.mission_paragraphs.join('\n') : (vmAr.mission_paragraphs || '')
      };
    }

    // Vision 2030 Form
    if (content.vision_2030) {
      this.v2030Form = {
        badge: content.vision_2030.badge || 'NATIONALITY',
        badge_ar: content.vision_2030.badge_ar || 'الاستراتيجية الوطنية',
        title: content.vision_2030.title || 'Aligned with Saudi Vision 2030',
        title_ar: content.vision_2030.title_ar || 'متوافقون مع رؤية السعودية 2030',
        description: content.vision_2030.description || 'Contributing to national biotechnology and healthcare self-sufficiency goals.',
        description_ar: content.vision_2030.description_ar || 'المساهمة في تحقيق أهداف التقنية الحيوية الوطنية والاكتفاء الذاتي الصحي.',
        image_url: content.vision_2030.image_url || 'saudi_biotech_strategy.jpg',
        features: Array.isArray(content.vision_2030.content_json) ? [...content.vision_2030.content_json] : [],
        features_ar: Array.isArray(content.vision_2030.content_json_ar) ? [...content.vision_2030.content_json_ar] : []
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
    if (path.startsWith('/backend/uploads/')) return `${(environment.serverUrl || '').replace(/\/backend\/?$/, '')}${path}`;
    if (path.startsWith('/uploads/')) return `${environment.serverUrl}${path}`;
    return path;
  }

  // ==========================================
  // LEADERSHIP CRUD
  // ==========================================
  openAddLeaderModal(): void {
    this.isEditingLeader.set(false);
    this.currentLeaderId.set(null);
    this.leaderEditLang.set('en');
    this.leaderForm = {
      name: '',
      name_ar: '',
      title: '',
      title_ar: '',
      role: '',
      role_ar: '',
      badge: 'Executive Board',
      badge_ar: 'مجلس الإدارة التنفيذي',
      initials: '',
      image: '',
      order_index: this.leaders().length + 1,
      status: 'Active',
      bio_sections: [
        { heading: 'Executive Summary', paragraphs: [''] }
      ],
      bio_sections_ar: [
        { heading: 'نبذة تنفيذية', paragraphs: [''] }
      ]
    };
    this.leaderPhotoFile = null;
    this.leaderPhotoPreview = null;
    this.isLeaderModalOpen.set(true);
  }

  openEditLeaderModal(leader: AboutLeader): void {
    this.isEditingLeader.set(true);
    this.currentLeaderId.set(leader.id || null);
    this.leaderEditLang.set('en');
    this.leaderForm = {
      name: leader.name,
      name_ar: leader.name_ar || '',
      title: leader.title,
      title_ar: leader.title_ar || '',
      role: leader.role,
      role_ar: leader.role_ar || '',
      badge: leader.badge || 'Executive Board',
      badge_ar: leader.badge_ar || '',
      initials: leader.initials || '',
      image: leader.image || '',
      order_index: leader.order_index || 0,
      status: leader.status,
      bio_sections: leader.bio_sections && leader.bio_sections.length > 0
        ? JSON.parse(JSON.stringify(leader.bio_sections))
        : [{ heading: 'Executive Summary', paragraphs: [''] }],
      bio_sections_ar: leader.bio_sections_ar && leader.bio_sections_ar.length > 0
        ? JSON.parse(JSON.stringify(leader.bio_sections_ar))
        : [{ heading: 'نبذة تنفيذية', paragraphs: [''] }]
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

  addBioSectionAr(): void {
    this.leaderForm.bio_sections_ar.push({
      heading: 'قسم جديد',
      paragraphs: ['']
    });
  }

  removeBioSectionAr(index: number): void {
    this.leaderForm.bio_sections_ar.splice(index, 1);
  }

  addBioParagraphAr(section: LeaderSection): void {
    if (!section.paragraphs) section.paragraphs = [];
    section.paragraphs.push('');
  }

  removeBioParagraphAr(section: LeaderSection, pIndex: number): void {
    section.paragraphs?.splice(pIndex, 1);
  }

  addBioItemAr(section: LeaderSection, itemText: string): void {
    if (!section.items) section.items = [];
    if (itemText.trim()) {
      section.items.push(itemText.trim());
    }
  }

  removeBioItemAr(section: LeaderSection, iIndex: number): void {
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
    formData.append('name_ar', this.leaderForm.name_ar || '');
    formData.append('title', this.leaderForm.title);
    formData.append('title_ar', this.leaderForm.title_ar || '');
    formData.append('role', this.leaderForm.role || '');
    formData.append('role_ar', this.leaderForm.role_ar || '');
    formData.append('badge', this.leaderForm.badge || 'Executive Board');
    formData.append('badge_ar', this.leaderForm.badge_ar || '');
    formData.append('initials', this.leaderForm.initials || '');
    formData.append('order_index', String(this.leaderForm.order_index || 0));
    formData.append('status', this.leaderForm.status);
    formData.append('bio_sections', JSON.stringify(this.leaderForm.bio_sections));
    formData.append('bio_sections_ar', JSON.stringify(this.leaderForm.bio_sections_ar));

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
    formData.append('badge_ar', this.heroForm.badge_ar || '');
    formData.append('title', this.heroForm.title || '');
    formData.append('title_ar', this.heroForm.title_ar || '');
    formData.append('subtitle', this.heroForm.subtitle || '');
    formData.append('subtitle_ar', this.heroForm.subtitle_ar || '');
    formData.append('description', this.heroForm.description || '');
    formData.append('description_ar', this.heroForm.description_ar || '');

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

  addOverviewParagraphAr(): void {
    const text = this.overviewForm.newParagraphTextAr.trim();
    if (text) {
      this.overviewForm.paragraphs_ar.push(text);
      this.overviewForm.newParagraphTextAr = '';
    }
  }

  removeOverviewParagraphAr(index: number): void {
    this.overviewForm.paragraphs_ar.splice(index, 1);
  }

  saveOverviewModal(): void {
    this.isSaving.set(true);
    this.clearAlerts();

    const formData = new FormData();
    formData.append('badge', this.overviewForm.badge || 'COMPANY OVERVIEW');
    formData.append('badge_ar', this.overviewForm.badge_ar || '');
    formData.append('title', this.overviewForm.title || '');
    formData.append('title_ar', this.overviewForm.title_ar || '');
    formData.append('description', this.overviewForm.description || '');
    formData.append('description_ar', this.overviewForm.description_ar || '');
    formData.append('content_json', JSON.stringify(this.overviewForm.paragraphs));
    formData.append('content_json_ar', JSON.stringify(this.overviewForm.paragraphs_ar));

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

  trackByIndex(index: number, item: any): number {
    return index;
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

  addVisionParagraphAr(): void {
    const text = this.vmForm.newVisionTextAr.trim();
    if (text) {
      this.vmForm.vision_paragraphs_ar.push(text);
      this.vmForm.newVisionTextAr = '';
    }
  }

  removeVisionParagraphAr(index: number): void {
    this.vmForm.vision_paragraphs_ar.splice(index, 1);
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

    const payloadAr = {
      vision_title: this.vmForm.vision_title_ar || 'رؤيتنا',
      vision_paragraphs: this.vmForm.vision_paragraphs_ar,
      mission_title: this.vmForm.mission_title_ar || 'رسالتنا',
      mission_paragraphs: [this.vmForm.mission_text_ar]
    };

    const formData = new FormData();
    formData.append('badge', 'OUR PURPOSE');
    formData.append('badge_ar', 'أهدافنا');
    formData.append('title', '');
    formData.append('title_ar', '');
    formData.append('content_json', JSON.stringify(payload));
    formData.append('content_json_ar', JSON.stringify(payloadAr));

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
    this.v2030Form.features_ar.push({
      title: 'ركيزة تحول جديدة',
      desc: 'تعزيز الأمن الصحي الوطني وتأمين اللقاحات الحيوية',
      icon: 'heart'
    });
  }

  removeV2030Feature(index: number): void {
    this.v2030Form.features.splice(index, 1);
    if (this.v2030Form.features_ar && this.v2030Form.features_ar.length > index) {
      this.v2030Form.features_ar.splice(index, 1);
    }
  }

  saveVision2030(): void {
    this.isSaving.set(true);
    this.clearAlerts();

    const formData = new FormData();
    formData.append('badge', this.v2030Form.badge || 'NATIONALITY');
    formData.append('badge_ar', this.v2030Form.badge_ar || '');
    formData.append('title', this.v2030Form.title || 'Aligned with Saudi Vision 2030');
    formData.append('title_ar', this.v2030Form.title_ar || '');
    formData.append('description', this.v2030Form.description || '');
    formData.append('description_ar', this.v2030Form.description_ar || '');
    formData.append('content_json', JSON.stringify(this.v2030Form.features));
    formData.append('content_json_ar', JSON.stringify(this.v2030Form.features_ar));

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
