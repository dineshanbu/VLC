import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class SettingsComponent implements OnInit {
  private authService = inject(AuthService);

  currentUser = computed(() => this.authService.currentUser());

  name = signal<string>('');
  email = signal<string>('');
  phone = signal<string>('');
  department = signal<string>('');

  currentPassword = signal<string>('');
  newPassword = signal<string>('');
  confirmPassword = signal<string>('');

  isLoading = signal<boolean>(false);
  successMessage = signal<string>('');
  errorMessage = signal<string>('');

  ngOnInit(): void {
    const user = this.currentUser();
    if (user) {
      this.name.set(user.name);
      this.email.set(user.email);
      this.phone.set(user.phone || '');
      this.department.set(user.department || '');
    }
  }

  saveProfile(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.newPassword() && this.newPassword() !== this.confirmPassword()) {
      this.errorMessage.set('New passwords do not match.');
      return;
    }

    this.isLoading.set(true);

    const payload: any = {
      name: this.name(),
      phone: this.phone(),
      department: this.department()
    };

    if (this.newPassword()) {
      payload.currentPassword = this.currentPassword();
      payload.newPassword = this.newPassword();
    }

    this.authService.updateProfile(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Profile details updated successfully.');
        this.currentPassword.set('');
        this.newPassword.set('');
        this.confirmPassword.set('');
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to update profile.');
      }
    });
  }
}
