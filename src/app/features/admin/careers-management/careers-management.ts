import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

export interface JobPosting {
  id?: number;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  description?: string;
  requirements?: string;
  status: 'Active' | 'Closed' | 'Draft';
  created_at?: string;
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
  private readonly API_URL = 'http://localhost:5000/api/careers';

  jobs = signal<JobPosting[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  isModalOpen = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  currentJob = signal<JobPosting>({
    title: '',
    department: 'Bioprocess Engineering',
    location: 'Sudair Industrial City, KSA',
    type: 'Full-time',
    experience: '3+ years',
    description: '',
    requirements: '',
    status: 'Active'
  });

  isDeleteModalOpen = signal<boolean>(false);
  jobToDelete = signal<JobPosting | null>(null);

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
    this.isLoading.set(true);
    this.http.get<{ success: boolean; jobs: JobPosting[] }>(this.API_URL).subscribe({
      next: (res) => {
        this.jobs.set(res.jobs || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.currentJob.set({
      title: '',
      department: 'Bioprocess Engineering',
      location: 'Sudair Industrial City, KSA',
      type: 'Full-time',
      experience: '3+ years',
      description: '',
      requirements: '',
      status: 'Active'
    });
    this.isModalOpen.set(true);
  }

  openEditModal(job: JobPosting): void {
    this.isEditing.set(true);
    this.currentJob.set({ ...job });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  saveJob(): void {
    const job = this.currentJob();
    if (!job.title) {
      alert('Job title is required');
      return;
    }

    if (this.isEditing() && job.id) {
      this.http.put(`${this.API_URL}/${job.id}`, job).subscribe({
        next: () => {
          this.closeModal();
          this.showSuccess('Job posting updated.');
          this.loadJobs();
        }
      });
    } else {
      this.http.post(this.API_URL, job).subscribe({
        next: () => {
          this.closeModal();
          this.showSuccess('New job position posted.');
          this.loadJobs();
        }
      });
    }
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
      }
    });
  }

  private showSuccess(msg: string): void {
    this.successMessage.set(msg);
    setTimeout(() => this.successMessage.set(''), 3500);
  }
}
