import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit, inject, signal } from '@angular/core';
import { BrandingService, DEFAULT_FOOTER_SETTINGS, FooterSiteSettings, LogoDimensions, SiteLogoKey } from '../../../core/services/branding.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar';
import { FooterComponent } from '../../../shared/components/footer/footer';

type LogoSlot = { key: SiteLogoKey; title: string; description: string; guidance: string };

@Component({
  selector: 'app-logo-replacement',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './logo-replacement.html',
  styleUrl: './logo-replacement.css'
})
export class LogoReplacementComponent implements OnInit {
  readonly branding = inject(BrandingService);
  readonly slots: LogoSlot[] = [
    { key: 'header_logo', title: 'Header logo', description: 'The logo shown in the public site header, including the mobile header.', guidance: 'Use a transparent PNG, SVG, or WebP with a wide horizontal layout.' },
    { key: 'footer_logo', title: 'Footer logo', description: 'The brand logo shown in the public site footer.', guidance: 'Use a transparent PNG, SVG, or WebP with a wide horizontal layout.' },
    { key: 'home_banner_logo', title: 'Home banner logo', description: 'The logo displayed within the home page hero banner.', guidance: 'Use a transparent PNG, SVG, or WebP with clear edges.' }
  ];

  readonly files = signal<Record<SiteLogoKey, File | null>>({ header_logo: null, footer_logo: null, home_banner_logo: null });
  readonly previews = signal<Partial<Record<SiteLogoKey, string>>>({});
  readonly draftDimensions = signal<LogoDimensions>({ header_logo: { width: 200, height: 50 }, footer_logo: { width: 206, height: 80 }, home_banner_logo: { width: 300, height: 116 } });
  readonly isSaving = signal(false);
  readonly successMessage = signal('');
  readonly errorMessage = signal('');
  footerSettings: FooterSiteSettings = { ...DEFAULT_FOOTER_SETTINGS, quick_links: DEFAULT_FOOTER_SETTINGS.quick_links.map(link => ({ ...link })) };
  readonly isSavingFooter = signal(false);
  readonly footerSuccessMessage = signal('');
  readonly footerErrorMessage = signal('');

  ngOnInit(): void {
    this.branding.loadSettings(true).subscribe({
      next: settings => this.draftDimensions.set(settings.dimensions),
      error: () => this.errorMessage.set('Could not load the saved logo settings.')
    });
    this.branding.loadFooterSettings(true).subscribe({
      next: response => this.footerSettings = { ...response.settings, quick_links: response.settings.quick_links.map(link => ({ ...link })) },
      error: () => this.footerErrorMessage.set('Could not load the saved footer content.')
    });
  }

  preview(key: SiteLogoKey): string {
    return this.previews()[key] || this.branding.logo(key);
  }

  hasChanges(): boolean {
    return Object.values(this.files()).some(file => file !== null) || this.dimensionsChanged();
  }

  dimensionsChanged(): boolean {
    const current = this.branding.dimensions();
    const draft = this.draftDimensions();
    return current.home_banner_logo.width !== draft.home_banner_logo.width || current.home_banner_logo.height !== draft.home_banner_logo.height;
  }

  setDimension(key: SiteLogoKey, axis: 'width' | 'height', event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.draftDimensions.update(current => ({ ...current, [key]: { ...current[key], [axis]: value } }));
  }

  dimension(key: SiteLogoKey, axis: 'width' | 'height'): number {
    return this.draftDimensions()[key][axis];
  }

  onFileSelected(event: Event, key: SiteLogoKey): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.successMessage.set('');
    this.errorMessage.set('');
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      this.errorMessage.set('Choose a PNG, JPG, WebP, or SVG logo file.');
      input.value = '';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.errorMessage.set('Logo files must be 10 MB or smaller.');
      input.value = '';
      return;
    }

    this.files.update(current => ({ ...current, [key]: file }));
    const reader = new FileReader();
    reader.onload = () => this.previews.update(current => ({ ...current, [key]: String(reader.result || '') }));
    reader.readAsDataURL(file);
  }

  saveLogos(): void {
    if (!this.hasChanges() || this.isSaving()) return;
    this.isSaving.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');
    const formData = new FormData();
    for (const slot of this.slots) {
      const file = this.files()[slot.key];
      if (file) formData.append(slot.key, file);
    }
    const sizes = this.draftDimensions();
    formData.append('home_banner_logo_width', String(sizes.home_banner_logo.width));
    formData.append('home_banner_logo_height', String(sizes.home_banner_logo.height));

    this.branding.save(formData).subscribe({
      next: response => {
        this.branding.acceptSavedSettings(response.logos, response.dimensions);
        this.draftDimensions.set(response.dimensions);
        this.files.set({ header_logo: null, footer_logo: null, home_banner_logo: null });
        this.previews.set({});
        this.successMessage.set(response.message || 'Logo replacements saved.');
        this.isSaving.set(false);
      },
      error: error => {
        this.errorMessage.set(error.error?.message || 'Could not save the logo changes. Please try again.');
        this.isSaving.set(false);
      }
    });
  }

  saveFooterSettings(): void {
    if (this.isSavingFooter()) return;
    this.isSavingFooter.set(true);
    this.footerSuccessMessage.set('');
    this.footerErrorMessage.set('');
    this.branding.saveFooterSettings(this.footerSettings).subscribe({
      next: response => {
        this.footerSettings = { ...response.settings, quick_links: response.settings.quick_links.map(link => ({ ...link })) };
        this.footerSuccessMessage.set(response.message || 'Footer content saved.');
        this.isSavingFooter.set(false);
      },
      error: error => {
        this.footerErrorMessage.set(error.error?.message || 'Could not save footer content. Please try again.');
        this.isSavingFooter.set(false);
      }
    });
  }

  addFooterQuickLink(): void {
    if (this.footerSettings.quick_links.length >= 8) return;
    this.footerSettings.quick_links.push({ label_en: '', label_ar: '', url: '' });
  }

  removeFooterQuickLink(index: number): void {
    this.footerSettings.quick_links.splice(index, 1);
  }
}
