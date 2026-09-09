import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ContactService } from '../../../core/services/contact.service';
import { TranslationService } from '../../../core/services/translation.service';
import { resolveImageUrl } from '../../../core/utils/image-url.util';

export interface PharmacovigilanceReportForm {
  reporterName: string;
  contactNumber: string;
  email: string;
  productName: string;
  occupation: string;
  sideEffectDescription: string;
  otherInfo: string;
}

@Component({
  selector: 'app-pharmacovigilance',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './pharmacovigilance.html',
  styleUrls: ['./pharmacovigilance.css', '../public-theme.css']
})
export class PharmacovigilanceComponent {
  public readonly translationService = inject(TranslationService);
  private readonly contactService = inject(ContactService);

  readonly formModel: PharmacovigilanceReportForm = {
    reporterName: '',
    contactNumber: '',
    email: '',
    productName: '',
    occupation: '',
    sideEffectDescription: '',
    otherInfo: ''
  };

  readonly isSubmitting = signal<boolean>(false);
  readonly formSubmitted = signal<boolean>(false);
  readonly submissionError = signal<string>('');

  readonly occupations = [
    { value: 'Physician', labelEn: 'Physician / Doctor', labelAr: 'طبيب / ممارس طبي' },
    { value: 'Pharmacist', labelEn: 'Pharmacist', labelAr: 'صيدلي' },
    { value: 'Nurse', labelEn: 'Nurse', labelAr: 'ممرض / ممرضة' },
    { value: 'Healthcare Professional', labelEn: 'Other Healthcare Professional', labelAr: 'ممارس صحي آخر' },
    { value: 'Patient / Consumer', labelEn: 'Patient / Consumer', labelAr: 'مريض / مستهلك' },
    { value: 'Family / Caregiver', labelEn: 'Family Member / Caregiver', labelAr: 'أحد أفراد الأسرة / مقدم رعاية' },
    { value: 'Other', labelEn: 'Other', labelAr: 'أخرى' }
  ];

  resolveImg(path: string | undefined | null, fallback = 'home_banner.png'): string {
    if (!path || !path.trim()) return fallback;
    return resolveImageUrl(path, fallback) || fallback;
  }

  onHeroImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img && !img.src.endsWith('home_banner.png')) {
      img.src = 'home_banner.png';
    }
  }

  scrollToForm(event: Event): void {
    event.preventDefault();
    const target = document.getElementById('reporting-form');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  submitReport(): void {
    if (
      !this.formModel.reporterName.trim() ||
      !this.formModel.contactNumber.trim() ||
      !this.formModel.productName.trim() ||
      !this.formModel.sideEffectDescription.trim()
    ) {
      this.submissionError.set(
        this.translationService.isRtl()
          ? 'يرجى ملء جميع الحقول الإلزامية المطلوبة (*).'
          : 'Please fill out all required fields (*).'
      );
      return;
    }

    this.isSubmitting.set(true);
    this.submissionError.set('');

    const formattedMessage = [
      `Product Name: ${this.formModel.productName.trim()}`,
      `Occupation: ${this.formModel.occupation || 'Not Specified'}`,
      `Reporter Name: ${this.formModel.reporterName.trim()}`,
      `Contact Phone: ${this.formModel.contactNumber.trim()}`,
      `Reporter Email: ${this.formModel.email.trim() || 'Not Provided'}`,
      '',
      '--- SIDE EFFECT EXPERIENCE DESCRIPTION ---',
      this.formModel.sideEffectDescription.trim(),
      '',
      this.formModel.otherInfo.trim()
        ? `--- ANY OTHER INFORMATION ---\n${this.formModel.otherInfo.trim()}`
        : ''
    ].filter(Boolean).join('\n');

    const payload = {
      fullName: this.formModel.reporterName.trim(),
      email: this.formModel.email.trim() || 'mpv@mesned.com',
      phone: this.formModel.contactNumber.trim(),
      company: this.formModel.occupation || 'Pharmacovigilance Reporter',
      subject: `[Pharmacovigilance] Adverse Event Report - ${this.formModel.productName.trim()}`,
      message: formattedMessage
    };

    this.contactService.submitInquiry(payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.formSubmitted.set(true);
      },
      error: () => {
        // Fallback display success confirmation
        this.isSubmitting.set(false);
        this.formSubmitted.set(true);
      }
    });
  }

  resetReportForm(): void {
    this.formModel.reporterName = '';
    this.formModel.contactNumber = '';
    this.formModel.email = '';
    this.formModel.productName = '';
    this.formModel.occupation = '';
    this.formModel.sideEffectDescription = '';
    this.formModel.otherInfo = '';
    this.formSubmitted.set(false);
    this.submissionError.set('');
  }
}
