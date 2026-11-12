import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PharmacovigilancePageSettings, PharmacovigilanceService } from '../../../core/services/pharmacovigilance.service';
import { TranslationService } from '../../../core/services/translation.service';
import { resolveImageUrl } from '../../../core/utils/image-url.util';
import { SectionHeadingPipe } from '../../../shared/pipes/section-heading.pipe';

export interface PharmacovigilanceReportForm {
  reporterName: string;
  patientName: string;
  batchNumber: string;
  expirationDate: string;
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
  imports: [CommonModule, FormsModule, RouterModule, SectionHeadingPipe],
  templateUrl: './pharmacovigilance.html',
  styleUrls: ['./pharmacovigilance.css', '../public-theme.css', '../mobile-hero.css']
})
export class PharmacovigilanceComponent implements OnInit {
  public readonly translationService = inject(TranslationService);
  private readonly pharmacovigilanceService = inject(PharmacovigilanceService);
  heroSettingsLoaded = false;
  readonly pageSettings = signal<PharmacovigilancePageSettings>({
    hero_eyebrow: 'Patient Safety', hero_eyebrow_ar: 'سلامة المرضى',
    hero_title_line1: 'Adverse Events', hero_title_line1_ar: 'الإبلاغ عن', hero_title_line2: 'Reporting.', hero_title_line2_ar: 'الأعراض الجانبية.',
    hero_description: 'At Vaccine Industrial Company, pharmacovigilance is a core priority. We actively monitor medicine safety, manage potential risks, and take necessary actions to protect patients and improve medical care.',
    hero_description_ar: 'في شركة اللقاحات الصناعية (VIC)، تعد اليقظة الدوائية أولوية أساسية ومحورية. نحن نعمل بفاعلية على مراقبة سلامة الأدوية واللقاحات، وإدارة المخاطر المحتملة، واتخاذ كافة الإجراءات اللازمة لحماية المرضى وتعزيز الرعاية الصحية.',
    hero_cta: 'Fill Reporting Form', hero_cta_ar: 'تعبئة نموذج الإبلاغ', hero_image: '',
    channels_eyebrow: 'PHARMACOVIGILANCE & PATIENT SAFETY', channels_eyebrow_ar: 'اليقظة الدوائية وسلامة المرضى',
    channels_title: 'Direct Reporting Channels', channels_title_ar: 'قنوات الإبلاغ المباشرة',
    channels_intro: 'To report any safety concerns in Saudi Arabia, contact us via: (Please use one of the below reporting channels):',
    channels_intro_ar: 'للإبلاغ عن أي مخاوف أو بلاغات تتعلق بالسلامة داخل المملكة العربية السعودية، يُرجى التواصل معنا عبر إحدى القنوات التالية:',
    email_title: 'Email', email_title_ar: 'البريد الإلكتروني', email_address: 'mpv@mesned.com', email_note: 'Dedicated adverse event monitoring inbox', email_note_ar: 'البريد المخصص لاستقبال بلاغات الأعراض الجانبية',
    phone1_title: 'Primary Safety Line', phone1_title_ar: 'الخط المباشر', phone1_number: '+966 50 554 5754', phone1_note: 'Immediate pharmacovigilance telephone reception', phone1_note_ar: 'خدمة تلقي البلاغات الفورية',
    phone2_title: 'Secondary Safety Line', phone2_title_ar: 'خط الطوارئ', phone2_number: '+966 55 175 0051', phone2_note: 'Available for urgent safety and medical inquiries', phone2_note_ar: 'متاح للبلاغات والاستفسارات الطبية',
    form_prompt: 'or Use the reporting form published in this page below to submit your report directly.', form_prompt_ar: 'أو استخدام نموذج الإبلاغ المنشور في هذه الصفحة أدناه لإرسال التقرير مباشرة.',
    form_eyebrow: 'ADVERSE EVENT REPORT FORM', form_eyebrow_ar: 'نموذج الإبلاغ عن الأعراض الجانبية',
    form_title: 'Please fill out the Reporting form below.', form_title_ar: 'يرجى ملء نموذج الإبلاغ أدناه.',
    form_subtitle: 'All adverse event reports are treated with strict confidentiality in accordance with Saudi Food & Drug Authority (SFDA) pharmacovigilance standards.',
    form_subtitle_ar: 'تُعامل جميع البلاغات والمعلومات بسرية تامة وتُتابع وفقاً لمعايير الهيئة العامة للغذاء والدواء (SFDA).',
    success_title: 'Safety Report Submitted Successfully', success_title_ar: 'تم إرسال بلاغ السلامة بنجاح',
    success_text: 'Thank you for contributing to vaccine and medicine safety. Our pharmacovigilance safety officers have received your report and will follow up if additional details are required.',
    success_text_ar: 'شكراً لكم على مساهمتكم في تعزيز سلامة الأدوية واللقاحات. لقد استلم فريق اليقظة الدوائية بلاغكم وسيتم مراجعته والتواصل معكم عند الحاجة.',
    security_note: 'Your information is strictly protected and securely transmitted to qualified pharmacovigilance safety officers.',
    security_note_ar: 'تتم حماية معلوماتكم بسرية تامة وإرسالها بأمان إلى مسؤولي اليقظة الدوائية المختصين.'
  });

  readonly formModel: PharmacovigilanceReportForm = {
    reporterName: '',
    patientName: '',
    batchNumber: '',
    expirationDate: '',
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

  ngOnInit(): void {
    this.pharmacovigilanceService.getPageSettings().subscribe({
      next: response => { if (response.success && response.settings) this.pageSettings.set({ ...this.pageSettings(), ...response.settings }); this.heroSettingsLoaded = true; },
      error: error => { this.heroSettingsLoaded = true; console.warn('Could not load Pharmacovigilance page content.', error); }
    });
  }

  get heroImageUrl(): string {
    const settings = this.pageSettings();
    const image = this.translationService.currentLang() === 'ar'
      ? (settings.hero_image_ar || settings.hero_image)
      : settings.hero_image;
    return image ? resolveImageUrl(image) : '';
  }

  phoneHref(number: string): string {
    return `tel:${number.replace(/[^+\d]/g, '')}`;
  }

  readonly occupations = [
    { value: 'Physician', labelEn: 'Physician / Doctor', labelAr: 'طبيب / ممارس طبي' },
    { value: 'Pharmacist', labelEn: 'Pharmacist', labelAr: 'صيدلي' },
    { value: 'Nurse', labelEn: 'Nurse', labelAr: 'ممرض / ممرضة' },
    { value: 'Healthcare Professional', labelEn: 'Other Healthcare Professional', labelAr: 'ممارس صحي آخر' },
    { value: 'Patient / Consumer', labelEn: 'Patient / Consumer', labelAr: 'مريض / مستهلك' },
    { value: 'Family / Caregiver', labelEn: 'Family Member / Caregiver', labelAr: 'أحد أفراد الأسرة / مقدم رعاية' },
    { value: 'Other', labelEn: 'Other', labelAr: 'أخرى' }
  ];

  resolveImg(path: string | undefined | null, fallback = 'home_banner.webp'): string {
    if (!path || !path.trim()) return fallback;
    return resolveImageUrl(path, fallback) || fallback;
  }

  onHeroImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) img.style.display = 'none';
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

    const enteredExpirationDate = this.formModel.expirationDate.trim();
    const expirationDateIso = enteredExpirationDate ? this.expirationDateToIso(enteredExpirationDate) : '';
    if (enteredExpirationDate && !expirationDateIso) {
      this.submissionError.set(this.translationService.isRtl()
        ? 'يرجى إدخال تاريخ انتهاء الصلاحية بالتنسيق DD/MM/YYYY، مثال: 31/12/2026.'
        : 'Enter the expiration date as DD/MM/YYYY, for example 31/12/2026.');
      return;
    }

    this.isSubmitting.set(true);
    this.submissionError.set('');

    this.pharmacovigilanceService.submitReport({ ...this.formModel, expirationDate: expirationDateIso || '' }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.formSubmitted.set(true);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.submissionError.set(this.translationService.isRtl() ? 'تعذر إرسال البلاغ. يرجى المحاولة مرة أخرى.' : 'Your report could not be submitted. Please try again.');
      }
    });
  }

  private expirationDateToIso(value: string): string | null {
    const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    const localMatch = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(value);
    const year = isoMatch?.[1] || localMatch?.[3];
    const month = isoMatch?.[2] || localMatch?.[2];
    const day = isoMatch?.[3] || localMatch?.[1];
    if (!year || !month || !day) return null;

    const normalized = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    const date = new Date(`${normalized}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === normalized ? normalized : null;
  }

  normalizeExpirationDate(): void {
    const normalized = this.expirationDateToIso(this.formModel.expirationDate.trim());
    if (!normalized) return;
    const [year, month, day] = normalized.split('-');
    this.formModel.expirationDate = `${day}/${month}/${year}`;
  }

  resetReportForm(): void {
    this.formModel.reporterName = '';
    this.formModel.patientName = '';
    this.formModel.batchNumber = '';
    this.formModel.expirationDate = '';
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
