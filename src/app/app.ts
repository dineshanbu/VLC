import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly router = inject(Router);
  private readonly titleService = inject(Title);
  protected readonly title = 'VIC — Vaccine Industrial Company';

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.updatePageTitle(event.urlAfterRedirects));

    this.updatePageTitle(this.router.url);
  }

  private updatePageTitle(url: string): void {
    const path = url.split('?')[0].split('#')[0].replace(/^\//, '');
    const pageTitle = this.getPageTitle(path);
    this.titleService.setTitle(`${pageTitle} | Vaccine Industrial Company`);
  }

  private getPageTitle(path: string): string {
    if (!path) return 'Home';

    const titles: Record<string, string> = {
      platform: 'Our Platform',
      products: 'Products',
      about: 'About Us',
      partners: 'Partners',
      investors: 'Investors',
      news: 'News & Media',
      careers: 'Careers',
      pharmacovigilance: 'Pharmacovigilance',
      contact: 'Contact Us',
      'admin/login': 'Admin Login',
      'admin/dashboard': 'Admin Dashboard',
      'admin/users': 'User Management',
      'admin/product': 'Product Management',
      'admin/news': 'News Management',
      'admin/media': 'Media Management',
      'admin/contacts': 'Contact Inquiries',
      'admin/pharmacovigilance': 'Pharmacovigilance Reports',
      'admin/careers': 'Careers Management',
      'admin/partners': 'Partners Management',
      'admin/about': 'About Management',
      'admin/settings': 'Settings',
    };

    if (path.startsWith('news/')) return 'News & Media';
    return titles[path] ?? 'Vaccine Industrial Company';
  }
}
