import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PharmacovigilancePageSettings, PharmacovigilanceReport, PharmacovigilanceService } from '../../../core/services/pharmacovigilance.service';
import { resolveImageUrl } from '../../../core/utils/image-url.util';
import { MediaImagePickerComponent } from '../../../shared/components/media-image-picker/media-image-picker';

@Component({ selector: 'app-pharmacovigilance-management', standalone: true, imports: [CommonModule, FormsModule, RouterLink, MediaImagePickerComponent], templateUrl: './pharmacovigilance-management.html', styleUrls: ['./pharmacovigilance-management.css', '../contact-management/contact-management.css'] })
export class PharmacovigilanceManagementComponent implements OnInit {
  private service = inject(PharmacovigilanceService);
  reports = signal<PharmacovigilanceReport[]>([]); isLoading = signal(true); search = signal(''); status = signal('All'); selected = signal<PharmacovigilanceReport | null>(null); notes = signal('');
  isDeletingReport = signal(false); reportActionMessage = signal(''); reportActionError = signal('');
  pageSettings: PharmacovigilancePageSettings = {} as PharmacovigilancePageSettings;
  pageContentLoading = signal(true); pageContentSaving = signal(false); pageContentError = signal(''); pageContentSuccess = signal('');
  heroImageFile: File | null = null; heroImagePreview: string | null = null;
  heroImageFileAr: File | null = null; heroImagePreviewAr: string | null = null;
  ngOnInit() { this.loadReports(); this.loadPageSettings(); }
  loadPageSettings() {
    this.pageContentLoading.set(true);
    this.service.getPageSettings().subscribe({
      next: response => { if (response.success) this.pageSettings = response.settings; this.pageContentLoading.set(false); },
      error: () => { this.pageContentError.set('Could not load Pharmacovigilance page content.'); this.pageContentLoading.set(false); }
    });
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
    this.pageContentSaving.set(true); this.pageContentError.set(''); this.pageContentSuccess.set('');
    const data = new FormData();
    data.append('settings_json', JSON.stringify(this.pageSettings));
    if (this.heroImageFile) data.append('hero_image', this.heroImageFile);
    if (this.heroImageFileAr) data.append('hero_image_ar', this.heroImageFileAr);
    this.service.updatePageSettings(data).subscribe({
      next: response => {
        this.pageSettings = response.settings; this.heroImageFile = null; this.heroImageFileAr = null;
        if (this.heroImagePreview) URL.revokeObjectURL(this.heroImagePreview);
        if (this.heroImagePreviewAr) URL.revokeObjectURL(this.heroImagePreviewAr);
        this.heroImagePreview = null; this.heroImagePreviewAr = null; this.pageContentSaving.set(false);
        this.pageContentSuccess.set('Pharmacovigilance page content saved.');
      },
      error: error => { this.pageContentSaving.set(false); this.pageContentError.set(error.error?.message || 'Could not save Pharmacovigilance page content.'); }
    });
  }
  loadReports() { this.isLoading.set(true); this.service.getReports({ search: this.search(), status: this.status() }).subscribe({ next: r => { this.reports.set(r.reports || []); this.isLoading.set(false); }, error: () => this.isLoading.set(false) }); }
  open(report: PharmacovigilanceReport) { this.selected.set(report); this.notes.set(report.notes || ''); this.reportActionMessage.set(''); this.reportActionError.set(''); }
  close() { this.selected.set(null); }
  save(status?: PharmacovigilanceReport['status']) { const report = this.selected(); if (!report?.id) return; this.service.updateReport(report.id, { status: status || report.status, notes: this.notes() }).subscribe(() => { report.status = status || report.status; report.notes = this.notes(); this.loadReports(); }); }
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
