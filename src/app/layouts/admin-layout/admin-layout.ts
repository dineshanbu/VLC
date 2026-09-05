import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css'
})
export class AdminLayoutComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  isSidebarOpen = signal<boolean>(true);
  isProfileMenuOpen = signal<boolean>(false);
  currentRoute = signal<string>('/admin/dashboard');

  currentUser = computed(() => this.authService.currentUser());

  constructor() {
    this.currentRoute.set(this.router.url);
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute.set(event.urlAfterRedirects || event.url);
      });
  }

  toggleSidebar(): void {
    this.isSidebarOpen.update(v => !v);
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen.update(v => !v);
  }

  closeMenus(): void {
    this.isProfileMenuOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
  }
}
