import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DEFAULT_PHARMACOVIGILANCE_CONTACTS, PharmacovigilancePageSettings, PharmacovigilanceReport, PharmacovigilanceService } from '../../../core/services/pharmacovigilance.service';
import { resolveImageUrl } from '../../../core/utils/image-url.util';
import { MediaImagePickerComponent } from '../../../shared/components/media-image-picker/media-image-picker';

@Component({ selector: 'app-pharmacovigilance-management', standalone: true, imports: [CommonModule, FormsModule, RouterLink, MediaImagePickerComponent], templateUrl: './pharmacovigilance-management.html', styleUrls: ['./pharmacovigilance-management.css', '../contact-management/contact-management.css'] })
export class PharmacovigilanceManagementComponent implements OnInit {
  private service = inject(PharmacovigilanceService);
  reports = signal<PharmacovigilanceReport[]>([]); isLoading = signal(true); search = signal(''); status = signal('All'); selected = signal<PharmacovigilanceReport | null>(null); notes = signal('');
  isDeletingReport = signal(false); isSavingReport = signal(false);
  reportActionMessage = signal(''); reportActionError = signal('');
  pageSettings: PharmacovigilancePageSettings = { ...DEFAULT_PHARMACOVIGILANCE_CONTACTS } as PharmacovigilancePageSettings;
  private savedPageSettings: Partial<PharmacovigilancePageSettings> = {};
  pageContentLoading = signal(true); pageContentSaving = signal(false); pageContentError = signal(''); pageContentSuccess = signal('');
  heroImageFile: File | null = null; heroImagePreview: string | null = null;
  heroImageFileAr: File | null = null; heroImagePreviewAr: string | null = null;
  ngOnInit() { this.loadReports(); this.loadPageSettings(); }
  loadPageSettings() {
    this.pageContentLoading.set(true);
    this.service.getPageSettings().subscribe({
      next: response => {
        if (response.success) this.applySavedPageSettings(response.settings);
        this.pageContentLoading.set(false);
      },
      error: () => { this.pageContentError.set('Could not load Pharmacovigilance page content.'); this.pageContentLoading.set(false); }
    });
  }
  private applySavedPageSettings(settings: PharmacovigilancePageSettings): void {
    this.pageSettings = { ...DEFAULT_PHARMACOVIGILANCE_CONTACTS, ...settings };
    this.savedPageSettings = { ...this.pageSettings };
  }

  onHeroImageChange(event: Event, language: 'en' | 'ar') {
    const file = (event.target as HTMLInputElement).files?.[0] || null;
    if (!file) return;
    if (!file.type.startsWith('image/')) { this.pageContentError.set('Choose an image file for the banner.'); return; }
    if (language === 'ar') {
      if (this.heroImagePreviewAr) URL.revokeObjectURL(this.heroImagePreviewAr);
      this.heroImageFileAr = file;
      this.heroImagePreviewAr = URL.createObjectURL(file);
    } else {
      if (this.heroImagePreview) URL.revokeObjectURL(this.heroImagePreview);
      this.heroImageFile = file;
      this.heroImagePreview = URL.createObjectURL(file);
    }
    this.pageContentError.set('');
  }
  selectHeroImageFromLibrary(language: 'en' | 'ar', path: string) {
    if (language === 'ar') {
      this.pageSettings.hero_image_ar = path; this.heroImageFileAr = null;
      if (this.heroImagePreviewAr) URL.revokeObjectURL(this.heroImagePreviewAr);
      this.heroImagePreviewAr = null;
    } else {
      this.pageSettings.hero_image = path; this.heroImageFile = null;
      if (this.heroImagePreview) URL.revokeObjectURL(this.heroImagePreview);
      this.heroImagePreview = null;
    }
  }
  heroImageUrl(language: 'en' | 'ar' = 'en') {
    return language === 'ar'
      ? (this.heroImagePreviewAr || resolveImageUrl(this.pageSettings.hero_image_ar || this.pageSettings.hero_image, 'banner_for_all2.webp'))
      : (this.heroImagePreview || resolveImageUrl(this.pageSettings.hero_image, 'banner_for_all2.webp'));
  }
  savePageSettings() {
    if (this.pageContentLoading() || this.pageContentSaving()) return;

    this.pageContentSaving.set(true); this.pageContentError.set(''); this.pageContentSuccess.set('');
    const data = new FormData();
    const changes = (Object.keys(this.pageSettings) as (keyof PharmacovigilancePageSettings)[])
      .filter(field => this.pageSettings[field] !== this.savedPageSettings[field]);
    const submitted = Object.fromEntries(changes.map(field => [field, this.pageSettings[field]]));
    data.append('settings_json', JSON.stringify(submitted));
    if (this.heroImageFile) data.append('hero_image', this.heroImageFile);
    if (this.heroImageFileAr) data.append('hero_image_ar', this.heroImageFileAr);
    this.service.updatePageSettings(data).subscribe({
      next: response => {
        this.pageContentSaving.set(false);
        const saved = response.settings;
        if (!response.success || !saved) {
          this.pageContentError.set('Could not confirm the save. Your edits are still in the form.');
          return;
        }

        const unconfirmedTextFields = changes.filter(field =>
          field !== 'hero_image' && field !== 'hero_image_ar' && saved[field] !== submitted[field]
        );
        if (unconfirmedTextFields.length) {
          const fields = unconfirmedTextFields.map(field =>
            field.replace(/_ar$/, ' (Saudi / Arabic)').replaceAll('_', ' ').replace(/^ppv /, 'PPV ')
          );
          this.pageContentError.set(`Could not confirm the save for ${fields.join(', ')}. Your edits are still in the form.`);
          return;
        }

        this.applySavedPageSettings(saved);
        this.heroImageFile = null; this.heroImageFileAr = null;
        if (this.heroImagePreview) URL.revokeObjectURL(this.heroImagePreview);
        if (this.heroImagePreviewAr) URL.revokeObjectURL(this.heroImagePreviewAr);
        this.heroImagePreview = null; this.heroImagePreviewAr = null;
        this.pageContentSuccess.set('Pharmacovigilance page content saved.');
      },
      error: error => { this.pageContentSaving.set(false); this.pageContentError.set(error.error?.message || 'Could not save Pharmacovigilance page content.'); }
    });
  }
  loadReports() { this.isLoading.set(true); this.service.getReports({ search: this.search(), status: this.status() }).subscribe({ next: r => { this.reports.set(r.reports || []); this.isLoading.set(false); }, error: () => this.isLoading.set(false) }); }
  open(report: PharmacovigilanceReport) { this.selected.set(report); this.notes.set(report.notes || ''); this.reportActionMessage.set(''); this.reportActionError.set(''); }
  close() { this.selected.set(null); }
  save(status?: PharmacovigilanceReport['status']): void {
    const report = this.selected();
    if (!report?.id || this.isSavingReport() || this.isDeletingReport()) return;
    const update = { status: status ?? report.status, notes: this.notes() };
    this.isSavingReport.set(true);
    this.reportActionError.set('');
    this.reportActionMessage.set('');
    this.service.updateReport(report.id, update).subscribe({
      next: response => {
        this.isSavingReport.set(false);
        if (!response.success) {
          this.reportActionError.set(response.message || 'Could not update the safety report.');
          return;
        }
        Object.assign(report, update);
        if (status === undefined && this.selected() === report) this.close();
        this.reportActionMessage.set(response.emailQueued ? 'Safety report updated. Email notification queued.' : response.message);
        this.loadReports();
      },
      error: error => {
        this.isSavingReport.set(false);
        this.selected.update(current => current === report ? { ...report } : current);
        this.reportActionError.set(error.error?.message || 'Could not update the safety report.');
      }
    });
  }
  deleteSelectedReport(): void {
    const report = this.selected();
    if (!report?.id || this.isDeletingReport() || !window.confirm('Permanently delete this safety report? This cannot be undone.')) return;
    this.isDeletingReport.set(true); this.reportActionError.set(''); this.reportActionMessage.set('');
    this.service.deleteReport(report.id).subscribe({
      next: response => {
        this.selected.set(null); this.isDeletingReport.set(false);
        this.reportActionMessage.set(response.message || 'Safety report deleted.');
        this.loadReports();
      },
      error: error => {
        this.isDeletingReport.set(false);
        this.reportActionError.set(error.error?.message || 'Could not delete the safety report. Please try again.');
      }
    });
  }
}
