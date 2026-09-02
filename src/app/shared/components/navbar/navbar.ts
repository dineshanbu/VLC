import { Component, signal, HostListener, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  private readonly router = inject(Router);

  protected readonly isScrolled = signal(false);
  protected readonly isMobileMenuOpen = signal(false);
  protected readonly currentLang = signal<'en' | 'ar'>('en');
  protected readonly isNewsPage = signal(false);

  protected readonly navLinks = [
    { label: 'Home', route: '/' },
    { label: 'Products', route: '/products' },
    { label: 'About Us', route: '/about' },
    { label: 'Partners', route: '/partners' },
    { label: 'News & Media', route: '/news' },
    { label: 'Careers', route: '/careers' },
    { label: 'Contact Us', route: '/contact' },
  ];

  constructor() {
    this.updateCurrentPage(this.router.url);
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(event => {
      this.updateCurrentPage(event.urlAfterRedirects || event.url);
    });
  }

  private updateCurrentPage(url: string): void {
    this.isNewsPage.set(url.startsWith('/news'));
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled.set(window.scrollY > 50);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
    if (this.isMobileMenuOpen()) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
    document.body.style.overflow = '';
  }

  switchLanguage(lang: 'en' | 'ar'): void {
    this.currentLang.set(lang);
  }
}
