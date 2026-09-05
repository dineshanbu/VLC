import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../../../core/services/contact.service';
import { ContactInquiry } from '../../../core/models/contact.model';

@Component({
  selector: 'app-contact-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact-management.html',
  styleUrl: './contact-management.css'
})
export class ContactManagementComponent implements OnInit {
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

  ngOnInit(): void {
    this.loadInquiries();
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
