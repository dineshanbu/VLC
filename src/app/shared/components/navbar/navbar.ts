import { Component, signal, HostListener, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TranslationService, Language } from '../../../core/services/translation.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  private readonly router = inject(Router);
  readonly translationService = inject(TranslationService);

  protected readonly isScrolled = signal(false);
  protected readonly isMobileMenuOpen = signal(false);
  protected readonly isNewsPage = signal(false);
  protected readonly isHomePage = signal(true);

  // Active language computed from service
  get currentLang() {
    return this.translationService.currentLang;
  }

  // Dynamic Navigation Links reacting to language
  readonly navLinks = computed(() => [
    { label: this.translationService.translate('nav.home'), route: '/' },
    { label: this.translationService.translate('nav.products'), route: '/products' },
    { label: this.translationService.translate('nav.about'), route: '/about' },
    { label: this.translationService.translate('nav.partners'), route: '/partners' },
    { label: this.translationService.translate('nav.news'), route: '/news' },
    { label: this.translationService.translate('nav.careers'), route: '/careers' },
    { label: this.translationService.translate('nav.pharmacovigilance'), route: '/pharmacovigilance' },
    { label: this.translationService.translate('nav.contact'), route: '/contact' },
  ]);

  constructor() {
    this.updateCurrentPage(this.router.url);
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(event => {
      this.updateCurrentPage(event.urlAfterRedirects || event.url);
      setTimeout(() => {
        this.isScrolled.set(window.scrollY > 50);
      }, 50);
    });
  }

  private updateCurrentPage(url: string): void {
    this.isNewsPage.set(url.startsWith('/news'));
    const cleanUrl = url.split('?')[0].split('#')[0];
    this.isHomePage.set(cleanUrl === '/' || cleanUrl === '');
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

  switchLanguage(lang: Language): void {
    this.translationService.setLanguage(lang);
  }
}
