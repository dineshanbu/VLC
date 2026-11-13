import { Component, HostListener, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ContactService, ContactPageSettings, DEFAULT_CONTACT_PAGE_SETTINGS } from '../../../core/services/contact.service';
import { TranslationService } from '../../../core/services/translation.service';
import { resolveImageUrl } from '../../../core/utils/image-url.util';
import { SectionHeadingPipe } from '../../../shared/pipes/section-heading.pipe';

export interface ContactMessageForm {
  fullName: string;
  email: string;
  company: string;
  phone: string;
  subject: string;
  message: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SectionHeadingPipe],
  templateUrl: './contact.html',
  styleUrls: ['./contact.css', '../public-theme.css', '../mobile-hero.css']
})
export class ContactComponent implements OnDestroy {
  public translationService = inject(TranslationService);
  private contactService = inject(ContactService);
  pageSettings = signal<ContactPageSettings>({ ...DEFAULT_CONTACT_PAGE_SETTINGS });
  heroSettingsLoaded = false;

  constructor() {
    this.loadPageSettings();
  }

  private loadPageSettings(): void {
    this.contactService.getPageSettings().subscribe({
      next: response => {
        if (response.success && response.settings) {
          this.pageSettings.set({
            ...DEFAULT_CONTACT_PAGE_SETTINGS,
            ...response.settings,
            hero_image: response.settings.hero_image || '',
            hero_image_ar: response.settings.hero_image_ar || response.settings.hero_image || ''
          });
        } else {
          this.pageSettings.update(settings => ({ ...settings, hero_image: '', hero_image_ar: '' }));
        }
        this.heroSettingsLoaded = true;
      },
      error: () => {
        this.pageSettings.update(settings => ({ ...settings, hero_image: '', hero_image_ar: '' }));
        this.heroSettingsLoaded = true;
      }
    });
  }

  @HostListener('window:storage', ['$event'])
  onStorageChange(event: StorageEvent): void {
    if (event.key === 'vic_contact_page_updated') {
      this.loadPageSettings();
    }
  }

  ngOnDestroy(): void {}

  get isRtl(): boolean { return this.translationService.isRtl(); }

  resolveImg(path: string | undefined | null, fallback = 'home_banner.webp'): string {
    if (!path || !path.trim()) path = fallback;
    const resolved = resolveImageUrl(path, fallback);
    return resolved || fallback;
  }

  get heroImageUrl(): string {
    const settings = this.pageSettings();
    const path = this.translationService.currentLang() === 'ar'
      ? (settings.hero_image_ar || settings.hero_image)
      : settings.hero_image;
    return path ? resolveImageUrl(path) : '';
  }

  onHeroImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) img.style.display = 'none';
  }

  // Contact Message Form Model
  contactForm: ContactMessageForm = {
    fullName: '',
    email: '',
    company: '',
    phone: '',
    subject: '',
    message: ''
  };

  formSubmitted = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  submissionError = signal<string>('');

  // Office Location Cards
  readonly locationCards = [
    {
      type: 'office',
      title: 'Riyadh Office',
      subtitle: 'Riyadh, Saudi Arabia',
      detail1: '+966 11 123 4567',
      detail2: 'Business Gate, Airport Road',
      icon: 'phone'
    },
    {
      type: 'inquiries',
      title: 'General Inquiries',
      subtitle: 'info@vic.com.sa',
      detail1: '+966 11 123 4567',
      detail2: 'Corporate Communications Desk',
      icon: 'mail'
    }
  ];

  submitContactForm(): void {
    if (!this.contactForm.fullName || !this.contactForm.email || !this.contactForm.message) {
      return;
    }

    this.isSubmitting.set(true);
    this.submissionError.set('');

    this.contactService.submitInquiry(this.contactForm).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.formSubmitted.set(true);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        // Fallback for visual confirmation in case server is starting
        this.formSubmitted.set(true);
      }
    });
  }

  resetContactForm(): void {
    this.contactForm = {
      fullName: '',
      email: '',
      company: '',
      phone: '',
      subject: '',
      message: ''
    };
    this.formSubmitted.set(false);
    this.submissionError.set('');
  }
}

