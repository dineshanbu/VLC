import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css'
})
export class UserManagementComponent implements OnInit {
  private userService = inject(UserService);

  users = signal<User[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  // Search & Filter
  searchTerm = signal<string>('');
  selectedRole = signal<string>('All');
  selectedStatus = signal<string>('All');

  // Modal State
  isModalOpen = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  currentUserModal = signal<Partial<User>>({
    name: '',
    email: '',
    password: '',
    role: 'Admin',
    department: 'Operations',
    status: 'Active',
    phone: ''
  });

  // Delete Confirm Modal
  isDeleteModalOpen = signal<boolean>(false);
  userToDelete = signal<User | null>(null);

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.userService.getUsers({
      search: this.searchTerm(),
      role: this.selectedRole(),
      status: this.selectedStatus()
    }).subscribe({
      next: (res) => {
        this.users.set(res.users || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to load user accounts.');
      }
    });
  }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.currentUserModal.set({
      name: '',
      email: '',
      password: '',
      role: 'Admin',
      department: 'Operations',
      status: 'Active',
      phone: ''
    });
    this.isModalOpen.set(true);
  }

  openEditModal(user: User): void {
    this.isEditing.set(true);
    this.currentUserModal.set({
      id: user.id,
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      department: user.department,
      status: user.status,
      phone: user.phone
    });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.isEditing.set(false);
  }

  saveUser(): void {
    const data = this.currentUserModal();
    if (!data.name || !data.email) {
      alert('Please fill out name and email.');
      return;
    }

    if (!this.isEditing() && !data.password) {
      alert('Password is required for new users.');
      return;
    }

    this.isSubmitting.set(true);

    if (this.isEditing() && data.id) {
      this.userService.updateUser(data.id, data).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.closeModal();
          this.showSuccess('User account updated successfully.');
          this.loadUsers();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          alert(err.error?.message || 'Failed to update user.');
        }
      });
    } else {
      this.userService.createUser(data).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.closeModal();
          this.showSuccess('New user account created successfully.');
          this.loadUsers();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          alert(err.error?.message || 'Failed to create user.');
        }
      });
    }
  }

  confirmDelete(user: User): void {
    this.userToDelete.set(user);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.userToDelete.set(null);
  }

  deleteUser(): void {
    const user = this.userToDelete();
    if (!user) return;

    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.showSuccess('User account deleted successfully.');
        this.loadUsers();
      },
      error: (err) => {
        this.closeDeleteModal();
        alert(err.error?.message || 'Failed to delete user.');
      }
    });
  }

  private showSuccess(msg: string): void {
    this.successMessage.set(msg);
    setTimeout(() => this.successMessage.set(''), 4000);
  }
}
