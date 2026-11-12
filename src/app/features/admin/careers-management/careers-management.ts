import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { resolveImageUrl } from '../../../core/utils/image-url.util';
import { MediaImagePickerComponent } from '../../../shared/components/media-image-picker/media-image-picker';

interface CareersPageSettings {
  hero_eyebrow: string; hero_eyebrow_ar: string;
  hero_title: string; hero_title_line2: string; hero_title_ar: string; hero_title_line2_ar: string;
  hero_description: string; hero_description_ar: string; hero_image: string; hero_image_ar: string;
  life_eyebrow: string; life_eyebrow_ar: string; life_title: string; life_title_ar: string;
  life_description: string; life_description_ar: string;
  life_image_1: string; life_image_2: string; life_image_3: string; life_image_4: string;
  mission_eyebrow: string; mission_eyebrow_ar: string; mission_title: string; mission_title_ar: string;
  mission_description: string; mission_description_ar: string;
}

export interface JobPosting {
  id?: number;
  job_code?: string;
  title: string;
  title_ar?: string;
  department: string;
  department_ar?: string;
  location: string;
  location_ar?: string;
  type: string;
  type_ar?: string;
  experience: string;
  experience_ar?: string;
  overview?: string;
  overview_ar?: string;
  description?: string;
  requirements?: string;
  responsibilities?: string[] | string;
  responsibilities_ar?: string[] | string;
  qualifications?: string[] | string;
  qualifications_ar?: string[] | string;
  status: 'Active' | 'Closed' | 'Draft';
  applications_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface JobApplication {
  id: number;
  job_id: number | null;
  job_title?: string;
  job_department?: string;
  job_code?: string;
  candidate_name: string;
  email: string;
  phone?: string;
  resume_url?: string;
  cover_letter?: string;
  status: 'Submitted' | 'Reviewing' | 'Shortlisted' | 'Interviewed' | 'Rejected' | 'Hired';
  created_at: string;
}

@Component({
  selector: 'app-careers-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MediaImagePickerComponent],
  templateUrl: './careers-management.html',
  styleUrl: './careers-management.css'
})
export class CareersManagementComponent implements OnInit {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/careers`;

  // Active Main Tab: 'jobs' | 'applications'
  activeTab = signal<'jobs' | 'applications'>('jobs');

  // Core Data Signals
  jobs = signal<JobPosting[]>([]);
  applications = signal<JobApplication[]>([]);
  isLoading = signal<boolean>(true);
  isSyncing = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');
  pageSettingsSaving = signal<boolean>(false);
  pageSettings: CareersPageSettings = {
    hero_eyebrow: 'Careers at VIC', hero_eyebrow_ar: 'الوظائف في VIC',
    hero_title: 'Build a Healthier Future.', hero_title_line2: 'Build Your Career with VIC.',
    hero_title_ar: 'نبني مستقبلاً أكثر صحة.', hero_title_line2_ar: 'ابدأ مسيرتك المهنية مع VIC.',
    hero_description: 'Join a team of passionate experts working together to advance vaccine innovation and improve lives around the world.',
    hero_description_ar: 'انضم إلى فريق من الخبراء المتحمسين الذين يعملون معاً لدفع عجلة الابتكار في مجال اللقاحات وتحسين حياة الناس حول العالم.',
    hero_image: 'banner_for_all2.webp',
    hero_image_ar: 'banner_for_all2.webp',
    life_eyebrow: 'LIFE AT VIC', life_eyebrow_ar: 'الحياة في VIC',
    life_title: 'Where People Thrive', life_title_ar: 'حيث يزدهر الجميع',
    life_description: 'At VIC, we foster a culture of innovation and collaboration where every individual is empowered to do meaningful work and create lasting impact.',
    life_description_ar: 'نعزز في VIC ثقافة الابتكار والتعاون، ونمكّن كل فرد من أداء عمل هادف وإحداث أثر مستدام.',
    life_image_1: 'about_vic_lab.webp', life_image_2: 'news2.jpg', life_image_3: 'irish_embassy_vic.jpg', life_image_4: 'news4.jpg',
    mission_eyebrow: 'JOIN OUR MISSION', mission_eyebrow_ar: 'انضم إلى رسالتنا',
    mission_title: 'Ready to Make a Difference?', mission_title_ar: 'هل أنت مستعد لإحداث فرق؟',
    mission_description: 'Upload your CV and tell us about yourself. Our team will connect with you when opportunities that match your skills arise.',
    mission_description_ar: 'أرسل سيرتك الذاتية وأخبرنا عن نفسك. سيتواصل فريقنا معك عند توفر فرص تناسب مهاراتك.'
  };
  private pageImageFiles: Partial<Record<'hero_image' | 'hero_image_ar' | 'life_image_1' | 'life_image_2' | 'life_image_3' | 'life_image_4', File>> = {};
  pageImagePreviews: Partial<Record<'hero_image' | 'hero_image_ar' | 'life_image_1' | 'life_image_2' | 'life_image_3' | 'life_image_4', string>> = {};

  // Filters
  searchTerm = signal<string>('');
  selectedDepartment = signal<string>('All');
  selectedStatus = signal<string>('All');
  applicationStatusFilter = signal<string>('All');

  // Baseline Departments for VIC biomanufacturing tracks
  readonly baselineDepartments: string[] = [
    'Research & Development',
    'Manufacturing',
    'Quality',
    'Regulatory Affairs',
    'Supply Chain',
    'Human Resources'
  ];

  // Dynamic unique departments list
  departments = computed(() => {
    const set = new Set<string>(this.baselineDepartments);
    this.jobs().forEach(j => {
      if (j.department && j.department.trim()) set.add(j.department.trim());
    });
    return Array.from(set);
  });

  // KPI Statistics
  totalJobsCount = computed(() => this.jobs().length);
  activeJobsCount = computed(() => this.jobs().filter(j => j.status === 'Active').length);
  totalDepartmentsCount = computed(() => this.departments().length);
  totalApplicationsCount = computed(() => this.applications().length);

  // Filtered Jobs
  filteredJobs = computed(() => {
    const q = this.searchTerm().trim().toLowerCase();
    const dept = this.selectedDepartment();
    const status = this.selectedStatus();

    return this.jobs().filter(job => {
      const matchQ = !q ||
        job.title.toLowerCase().includes(q) ||
        (job.job_code && job.job_code.toLowerCase().includes(q)) ||
        job.department.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q);

      const matchDept = dept === 'All' || job.department.toLowerCase() === dept.toLowerCase();
      const matchStatus = status === 'All' || job.status === status;

      return matchQ && matchDept && matchStatus;
    });
  });

  // Filtered Applications
  filteredApplications = computed(() => {
    const q = this.searchTerm().trim().toLowerCase();
    const status = this.applicationStatusFilter();

    return this.applications().filter(app => {
      const matchQ = !q ||
        app.candidate_name.toLowerCase().includes(q) ||
        app.email.toLowerCase().includes(q) ||
        (app.job_title && app.job_title.toLowerCase().includes(q)) ||
        (app.phone && app.phone.includes(q));

      const matchStatus = status === 'All' || app.status === status;

      return matchQ && matchStatus;
    });
  });

  // Modal States
  isModalOpen = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  jobEditorLanguage = signal<'en' | 'ar'>('en');
  customDepartmentInput = signal<string>('');

  // Editing form model
  formJob = signal<{
    id?: number;
    job_code: string;
    title: string;
    title_ar: string;
    department: string;
    department_ar: string;
    location: string;
    location_ar: string;
    type: string;
    type_ar: string;
    experience: string;
    experience_ar: string;
    status: 'Active' | 'Closed' | 'Draft';
    overview: string;
    overview_ar: string;
    responsibilitiesText: string;
    responsibilitiesText_ar: string;
    qualificationsText: string;
    qualificationsText_ar: string;
  }>({
    job_code: '',
    title: '',
    title_ar: '',
    department: 'Research & Development',
    department_ar: '',
    location: 'Riyadh, KSA',
    location_ar: '',
    type: 'Full-Time',
    type_ar: '',
    experience: '3 - 6 years',
    experience_ar: '',
    status: 'Active',
    overview: '',
    overview_ar: '',
    responsibilitiesText: '',
    responsibilitiesText_ar: '',
    qualificationsText: '',
    qualificationsText_ar: ''
  });

  // Delete Modal
  isDeleteModalOpen = signal<boolean>(false);
  jobToDelete = signal<JobPosting | null>(null);

  // Application Details Modal
  isAppModalOpen = signal<boolean>(false);
  selectedApplication = signal<JobApplication | null>(null);

  ngOnInit(): void {
    this.loadJobs();
    this.loadApplications();
    this.loadPageSettings();
  }

  private loadPageSettings(): void {
    this.http.get<{ success: boolean; settings: CareersPageSettings }>(`${this.API_URL}/settings`).subscribe({
      next: response => { if (response.success && response.settings) this.pageSettings = { ...this.pageSettings, ...response.settings }; },
      error: () => this.showError('Could not load Careers page content.')
    });
  }

  onPageImageChange(field: 'hero_image' | 'hero_image_ar' | 'life_image_1' | 'life_image_2' | 'life_image_3' | 'life_image_4', event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.showError('Choose an image file for this section.');
      return;
    }
    this.pageImageFiles[field] = file;
    const oldPreview = this.pageImagePreviews[field];
    if (oldPreview) URL.revokeObjectURL(oldPreview);
    this.pageImagePreviews[field] = URL.createObjectURL(file);
  }

  pageImageUrl(field: 'hero_image' | 'hero_image_ar' | 'life_image_1' | 'life_image_2' | 'life_image_3' | 'life_image_4'): string {
    return this.pageImagePreviews[field] || resolveImageUrl(this.pageSettings[field]);
  }

  pageImagePath(field: 'hero_image' | 'hero_image_ar' | 'life_image_1' | 'life_image_2' | 'life_image_3' | 'life_image_4'): string {
    return this.pageSettings[field];
  }

  selectHeroImageFromLibrary(language: 'en' | 'ar', path: string): void {
    const field = language === 'ar' ? 'hero_image_ar' : 'hero_image';
    const oldPreview = this.pageImagePreviews[field];
    if (oldPreview) URL.revokeObjectURL(oldPreview);
    delete this.pageImagePreviews[field];
    delete this.pageImageFiles[field];
    this.pageSettings[field] = path;
  }

  savePageSettings(): void {
    this.pageSettingsSaving.set(true);
    this.errorMessage.set('');
    const data = new FormData();
    Object.entries(this.pageSettings).forEach(([key, value]) => {
      if (!key.startsWith('hero_image') && !key.startsWith('life_image_')) data.append(key, String(value ?? ''));
    });
    data.append('hero_image', this.pageSettings.hero_image || 'banner_for_all2.webp');
    data.append('hero_image_ar', this.pageSettings.hero_image_ar || this.pageSettings.hero_image || 'banner_for_all2.webp');
    Object.entries(this.pageImageFiles).forEach(([key, file]) => { if (file) data.append(key, file); });
    this.http.put<{ success: boolean; settings: CareersPageSettings }>(`${this.API_URL}/settings`, data).subscribe({
      next: response => {
        this.pageSettings = { ...this.pageSettings, ...response.settings };
        this.pageImageFiles = {};
        Object.values(this.pageImagePreviews).forEach(url => { if (url) URL.revokeObjectURL(url); });
        this.pageImagePreviews = {};
        this.pageSettingsSaving.set(false);
        this.showSuccess('Careers page content saved.');
      },
      error: error => {
        this.pageSettingsSaving.set(false);
        this.showError(error.error?.message || 'Could not save Careers page content.');
      }
    });
  }

  loadJobs(): void {
    this.isLoading.set(true);
    // Request all jobs without status restriction so admin sees Active, Draft, and Closed
    this.http.get<{ success: boolean; jobs: JobPosting[] }>(`${this.API_URL}?status=All`).subscribe({
      next: (res) => {
        this.jobs.set(res.jobs || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching jobs:', err);
        this.isLoading.set(false);
      }
    });
  }

  loadApplications(): void {
    this.http.get<{ success: boolean; applications: JobApplication[] }>(`${this.API_URL}/applications`).subscribe({
      next: (res) => {
        this.applications.set(res.applications || []);
      },
      error: (err) => {
        console.warn('Error loading applications:', err);
      }
    });
  }

  // Reseed / Sync Default Positions to DB
  syncDb(force: boolean = false): void {
    this.isSyncing.set(true);
    this.http.post<{ success: boolean; message: string }>(`${this.API_URL}/seed`, { force }).subscribe({
      next: (res) => {
        this.isSyncing.set(false);
        this.showSuccess(res.message || 'Database synchronized with default career positions.');
        this.loadJobs();
      },
      error: (err) => {
        this.isSyncing.set(false);
        this.showError('Failed to synchronize database positions.');
      }
    });
  }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.jobEditorLanguage.set('en');
    this.customDepartmentInput.set('');
    this.formJob.set({
      job_code: '',
      title: '',
      title_ar: '',
      department: 'Research & Development',
      department_ar: '',
      location: 'Riyadh, KSA',
      location_ar: '',
      type: 'Full-Time',
      type_ar: '',
      experience: '3 - 6 years',
      experience_ar: '',
      status: 'Active',
      overview: '',
      overview_ar: '',
      responsibilitiesText: '',
      responsibilitiesText_ar: '',
      qualificationsText: '',
      qualificationsText_ar: ''
    });
    this.isModalOpen.set(true);
  }

  openEditModal(job: JobPosting): void {
    this.isEditing.set(true);
    this.jobEditorLanguage.set('en');
    this.customDepartmentInput.set('');

    const respText = Array.isArray(job.responsibilities)
      ? job.responsibilities.join('\n')
      : (job.responsibilities || '');

    const qualText = Array.isArray(job.qualifications)
      ? job.qualifications.join('\n')
      : (job.qualifications || job.requirements || '');
    const respTextAr = Array.isArray(job.responsibilities_ar) ? job.responsibilities_ar.join('\n') : (job.responsibilities_ar || '');
    const qualTextAr = Array.isArray(job.qualifications_ar) ? job.qualifications_ar.join('\n') : (job.qualifications_ar || '');

    this.formJob.set({
      id: job.id,
      job_code: job.job_code || '',
      title: job.title,
      title_ar: job.title_ar || '',
      department: job.department,
      department_ar: job.department_ar || '',
      location: job.location,
      location_ar: job.location_ar || '',
      type: job.type || 'Full-Time',
      type_ar: job.type_ar || '',
      experience: job.experience || '3 - 6 years',
      experience_ar: job.experience_ar || '',
      status: job.status || 'Active',
      overview: job.overview || job.description || '',
      overview_ar: job.overview_ar || '',
      responsibilitiesText: respText,
      responsibilitiesText_ar: respTextAr,
      qualificationsText: qualText,
      qualificationsText_ar: qualTextAr
    });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  saveJob(): void {
    const f = this.formJob();
    if (!f.title.trim()) {
      alert('Position title is required.');
      return;
    }

    const finalDept = (f.department === 'Custom' && this.customDepartmentInput().trim())
      ? this.customDepartmentInput().trim()
      : f.department;

    if (!finalDept.trim()) {
      alert('Department/Category is required.');
      return;
    }

    const respArray = f.responsibilitiesText
      .split('\n')
      .map(s => s.trim().replace(/^[-*•]\s*/, ''))
      .filter(Boolean);

    const qualArray = f.qualificationsText
      .split('\n')
      .map(s => s.trim().replace(/^[-*•]\s*/, ''))
      .filter(Boolean);
    const respArrayAr = f.responsibilitiesText_ar.split('\n').map(s => s.trim().replace(/^[-*•]\s*/, '')).filter(Boolean);
    const qualArrayAr = f.qualificationsText_ar.split('\n').map(s => s.trim().replace(/^[-*•]\s*/, '')).filter(Boolean);

    const payload: Partial<JobPosting> = {
      job_code: f.job_code.trim() || undefined,
      title: f.title.trim(),
      title_ar: f.title_ar.trim(),
      department: finalDept,
      department_ar: f.department_ar.trim(),
      location: f.location.trim() || 'Riyadh, KSA',
      location_ar: f.location_ar.trim(),
      type: f.type,
      type_ar: f.type_ar.trim(),
      experience: f.experience.trim() || '3 - 6 years',
      experience_ar: f.experience_ar.trim(),
      status: f.status,
      overview: f.overview.trim(),
      overview_ar: f.overview_ar.trim(),
      description: f.overview.trim(),
      responsibilities: respArray,
      responsibilities_ar: respArrayAr,
      qualifications: qualArray,
      qualifications_ar: qualArrayAr
    };

    if (this.isEditing() && f.id) {
      this.http.put(`${this.API_URL}/${f.id}`, payload).subscribe({
        next: () => {
          this.closeModal();
          this.showSuccess('Job position updated successfully.');
          this.loadJobs();
        },
        error: (err) => {
          this.showError('Failed to update job position.');
        }
      });
    } else {
      this.http.post(this.API_URL, payload).subscribe({
        next: () => {
          this.closeModal();
          this.showSuccess('New job position posted successfully.');
          this.loadJobs();
        },
        error: (err) => {
          this.showError('Failed to create job position.');
        }
      });
    }
  }

  // Quick toggle status directly from table row
  toggleJobStatus(job: JobPosting): void {
    if (!job.id) return;
    const nextStatus: 'Active' | 'Closed' = job.status === 'Active' ? 'Closed' : 'Active';
    this.http.put(`${this.API_URL}/${job.id}`, { ...job, status: nextStatus }).subscribe({
      next: () => {
        this.showSuccess(`Job marked as ${nextStatus}.`);
        this.loadJobs();
      },
      error: () => {
        this.showError('Could not update status.');
      }
    });
  }

  confirmDelete(job: JobPosting): void {
    this.jobToDelete.set(job);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.jobToDelete.set(null);
  }

  deleteJob(): void {
    const job = this.jobToDelete();
    if (!job || !job.id) return;

    this.http.delete(`${this.API_URL}/${job.id}`).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.showSuccess('Job posting deleted.');
        this.loadJobs();
      },
      error: () => {
        this.showError('Failed to delete job posting.');
      }
    });
  }

  // Application details
  openAppDetails(app: JobApplication): void {
    this.selectedApplication.set(app);
    this.isAppModalOpen.set(true);
  }

  closeAppModal(): void {
    this.isAppModalOpen.set(false);
    this.selectedApplication.set(null);
  }

  updateAppStatus(app: JobApplication, newStatus: JobApplication['status']): void {
    this.http.put(`${this.API_URL}/applications/${app.id}/status`, { status: newStatus }).subscribe({
      next: () => {
        this.showSuccess(`Applicant status updated to ${newStatus}.`);
        this.loadApplications();
        if (this.selectedApplication()?.id === app.id) {
          this.selectedApplication.update(a => a ? { ...a, status: newStatus } : null);
        }
      },
      error: () => {
        this.showError('Failed to update candidate status.');
      }
    });
  }

  // Switch to applications tab filtered by job
  viewApplicationsForJob(job: JobPosting): void {
    this.activeTab.set('applications');
    if (job.title) {
      this.searchTerm.set(job.title);
    }
  }

  // Resume helpers
  getResumeUrl(resumeUrl?: string): string {
    if (!resumeUrl) return '';
    const trimmed = resumeUrl.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    if (trimmed.startsWith('/backend/uploads/')) {
      const base = (environment.serverUrl || '').replace(/\/backend\/?$/, '');
      return `${base}${trimmed}`;
    }
    if (trimmed.startsWith('/uploads/')) {
      return `${environment.serverUrl}${trimmed}`;
    }
    if (trimmed.includes('/uploads/')) {
      return `${environment.serverUrl}${trimmed.substring(trimmed.indexOf('/uploads/'))}`;
    }
    return `${environment.serverUrl}/uploads/${trimmed}`;
  }

  getResumeFileName(resumeUrl?: string): string {
    if (!resumeUrl) return 'Resume Document';
    const clean = resumeUrl.trim().replace(/\\/g, '/');
    const parts = clean.split('/');
    const last = parts[parts.length - 1];
    return last.replace(/^\d+-\d+-/, '').replace(/^\d+-/, '') || 'Candidate Resume';
  }

  hasValidResume(resumeUrl?: string): boolean {
    if (!resumeUrl) return false;
    const trimmed = resumeUrl.trim().toLowerCase();
    return trimmed.length > 0 &&
      trimmed !== 'no document uploaded' &&
      trimmed !== 'n/a' &&
      trimmed !== 'none';
  }

  private showSuccess(msg: string): void {
    this.successMessage.set(msg);
    setTimeout(() => this.successMessage.set(''), 3500);
  }

  private showError(msg: string): void {
    this.errorMessage.set(msg);
    setTimeout(() => this.errorMessage.set(''), 4000);
  }
}

