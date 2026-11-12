import { Component, signal, HostListener, inject, computed, Input } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TranslationService, Language } from '../../../core/services/translation.service';
import { BrandingService } from '../../../core/services/branding.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  @Input() logoPreviewMode = false;
  @Input() logoPreviewSrc = '';

  private readonly router = inject(Router);
  readonly translationService = inject(TranslationService);
  readonly branding = inject(BrandingService);

  protected readonly isScrolled = signal(false);
  protected readonly isMobileMenuOpen = signal(false);
  protected readonly isAboutMenuOpen = signal(false);
  protected readonly isMobileAboutMenuOpen = signal(false);
  protected readonly isProductsMenuOpen = signal(false);
  protected readonly isMobileProductsMenuOpen = signal(false);
  protected readonly isNewsPage = signal(false);
  protected readonly isHomePage = signal(true);

  // Active language computed from service
  get currentLang() {
    return this.translationService.currentLang;
  }

  // Dynamic Navigation Links reacting to language
  readonly navLinks = computed(() => [
    { label: this.translationService.translate('nav.partners'), route: '/partners' },
    { label: this.translationService.translate('nav.news'), route: '/news' },
    { label: this.translationService.translate('nav.careers'), route: '/careers' },
    { label: this.translationService.translate('nav.pharmacovigilance'), route: '/pharmacovigilance' },
    { label: this.translationService.translate('nav.contact'), route: '/contact' },
  ]);

  constructor() {
    this.branding.load();
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
    this.isMobileAboutMenuOpen.set(false);
    this.isMobileProductsMenuOpen.set(false);
    document.body.style.overflow = '';
  }

  switchLanguage(lang: Language): void {
    this.translationService.setLanguage(lang);
  }

  openAboutMenu(): void {
    this.isProductsMenuOpen.set(false);
    this.isAboutMenuOpen.set(true);
  }

  toggleMobileAboutMenu(): void {
    this.isMobileProductsMenuOpen.set(false);
    this.isMobileAboutMenuOpen.update(open => !open);
  }

  openMobileAboutMenu(): void {
    this.isMobileProductsMenuOpen.set(false);
    this.isMobileAboutMenuOpen.set(true);
  }

  openProductsMenu(): void {
    this.isAboutMenuOpen.set(false);
    this.isProductsMenuOpen.set(true);
  }

  toggleMobileProductsMenu(): void {
    this.isMobileAboutMenuOpen.set(false);
    this.isMobileProductsMenuOpen.update(open => !open);
  }

  openMobileProductsMenu(): void {
    this.isMobileAboutMenuOpen.set(false);
    this.isMobileProductsMenuOpen.set(true);
  }

  closeAboutMenu(): void {
    this.isAboutMenuOpen.set(false);
    this.isMobileAboutMenuOpen.set(false);
  }

  closeProductsMenu(): void {
    this.isProductsMenuOpen.set(false);
    this.isMobileProductsMenuOpen.set(false);
  }

  isAboutRouteActive(): boolean {
    return this.router.url.split('?')[0].startsWith('/about');
  }

  isProductsRouteActive(): boolean {
    return this.router.url.split('?')[0].startsWith('/products');
  }

  @HostListener('document:click', ['$event'])
  closeAboutMenuOnOutsideClick(event: MouseEvent): void {
    if (!(event.target instanceof Element) || (!event.target.closest('.navbar__about') && !event.target.closest('.navbar__products'))) {
      this.isAboutMenuOpen.set(false);
      this.isProductsMenuOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  closeAboutMenuOnEscape(): void {
    this.closeAboutMenu();
    this.closeProductsMenu();
  }
}
