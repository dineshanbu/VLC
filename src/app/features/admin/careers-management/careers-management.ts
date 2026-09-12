import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface JobPosting {
  id?: number;
  job_code?: string;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  overview?: string;
  description?: string;
  requirements?: string;
  responsibilities?: string[] | string;
  qualifications?: string[] | string;
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
  imports: [CommonModule, FormsModule],
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
  customDepartmentInput = signal<string>('');

  // Editing form model
  formJob = signal<{
    id?: number;
    job_code: string;
    title: string;
    department: string;
    location: string;
    type: string;
    experience: string;
    status: 'Active' | 'Closed' | 'Draft';
    overview: string;
    responsibilitiesText: string;
    qualificationsText: string;
  }>({
    job_code: '',
    title: '',
    department: 'Research & Development',
    location: 'Riyadh, KSA',
    type: 'Full-Time',
    experience: '3 - 6 years',
    status: 'Active',
    overview: '',
    responsibilitiesText: '',
    qualificationsText: ''
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
    this.customDepartmentInput.set('');
    this.formJob.set({
      job_code: '',
      title: '',
      department: 'Research & Development',
      location: 'Riyadh, KSA',
      type: 'Full-Time',
      experience: '3 - 6 years',
      status: 'Active',
      overview: '',
      responsibilitiesText: '',
      qualificationsText: ''
    });
    this.isModalOpen.set(true);
  }

  openEditModal(job: JobPosting): void {
    this.isEditing.set(true);
    this.customDepartmentInput.set('');

    const respText = Array.isArray(job.responsibilities)
      ? job.responsibilities.join('\n')
      : (job.responsibilities || '');

    const qualText = Array.isArray(job.qualifications)
      ? job.qualifications.join('\n')
      : (job.qualifications || job.requirements || '');

    this.formJob.set({
      id: job.id,
      job_code: job.job_code || '',
      title: job.title,
      department: job.department,
      location: job.location,
      type: job.type || 'Full-Time',
      experience: job.experience || '3 - 6 years',
      status: job.status || 'Active',
      overview: job.overview || job.description || '',
      responsibilitiesText: respText,
      qualificationsText: qualText
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

    const payload: Partial<JobPosting> = {
      job_code: f.job_code.trim() || undefined,
      title: f.title.trim(),
      department: finalDept,
      location: f.location.trim() || 'Riyadh, KSA',
      type: f.type,
      experience: f.experience.trim() || '3 - 6 years',
      status: f.status,
      overview: f.overview.trim(),
      description: f.overview.trim(),
      responsibilities: respArray,
      qualifications: qualArray
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

