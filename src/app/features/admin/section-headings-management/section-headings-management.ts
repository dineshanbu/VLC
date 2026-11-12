import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SectionHeadingsService } from '../../../core/services/section-headings.service';
import { LocalizedSectionHeading } from '../../../core/models/section-heading.model';
import { SECTION_HEADING_DEFAULTS } from '../../../core/data/section-headings.catalog';

@Component({
  selector: 'app-section-headings-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './section-headings-management.html',
  styleUrl: './section-headings-management.css'
})
export class SectionHeadingsManagementComponent implements OnInit {
  private readonly service = inject(SectionHeadingsService);
  readonly catalog = SECTION_HEADING_DEFAULTS;
  readonly pages = [...new Map(this.catalog.map(item => [item.page, item.pageLabel])).entries()].map(([key, label]) => ({ key, label }));
  readonly activePage = signal(this.pages[0]?.key || 'home');
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly error = signal('');
  readonly success = signal('');
  values: Record<string, LocalizedSectionHeading> = {};

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading.set(true);
    this.service.load(true).subscribe(saved => {
      const legacyArabicCopy: Record<string, string> = {
        'executive.chairman.label': 'رئيس مجلس الإدارة',
        'executive.associate.label': 'الرئيس التنفيذي المشارك',
        'executive.rdiCallout.description': 'الإسهام في أجندة الابتكار الوطنية للمملكة العربية السعودية من خلال البحث والتطوير والابتكار.',
        'executive.team.description': 'قادة ذوو خبرة يشرفون على التصنيع والجودة والعمليات والتميز التجاري واستراتيجية الشركة.',
        'executive.rdi.description': 'تقود اللجنة العليا للبحث والتطوير والابتكار أجندة الابتكار الوطنية للمملكة، وتوفر التوجيه الاستراتيجي لتطوير البحث والتقنية والتنمية الصناعية في القطاعات الحيوية.',
        'executive.khaled.role': 'رائد في التقنية الحيوية وتصنيع اللقاحات'
      };
      const legacyManufacturingHero = saved['manufacturing.hero.title'];
      const legacyManufacturingHeroEn = legacyManufacturingHero?.en?.match(/^(.*?)\s+(Build for Tomorrow)$/i);
      const legacyManufacturingHeroAr = legacyManufacturingHero?.ar?.match(/^(.*?)\s+(نبني للمستقبل)$/u);
      const repaired = new Set<string>();
      this.values = Object.fromEntries(this.catalog.map(item => {
        const english = saved[item.key]?.en;
        const arabic = saved[item.key]?.ar;
        const legacyHomeHeroLine1 = item.key === 'home.hero.line1' && english === 'The Largest Human Vaccines Facility in the Middle East';
        const legacyHomeHeroLine1Arabic = item.key === 'home.hero.line1' && [
          'أكبر منشأة لتصنيع اللقاحات البشرية في الشرق الأوسط',
          'أكبر منشأة لتصنيع اللقاحات البشرية في الشرق الأوسط، ومقرها في المملكة العربية السعودية'
        ].includes(arabic || '');
        const legacyHomeHeroLine2Arabic = item.key === 'home.hero.line2' && arabic === 'الأولى من نوعها في المملكة العربية السعودية';
        const legacyHomeHeroLine2En = item.key === 'home.hero.line2' && /\s+Saudi Arabia$/i.test(english || '');
        const legacyHomeHeroLine2Ar = item.key === 'home.hero.line2' && /\s*المملكة العربية السعودية$/u.test(arabic || '');
        const legacyEnglish = item.key === 'executive.khaled.role' && english === 'Biotechnology and Vaccine Manufacturing Leader';
        const legacyArabic = arabic === legacyArabicCopy[item.key];
        if (legacyHomeHeroLine1 || legacyHomeHeroLine1Arabic || legacyHomeHeroLine2Arabic || legacyHomeHeroLine2En || legacyHomeHeroLine2Ar || legacyEnglish || legacyArabic) repaired.add(item.key);
        return [item.key, {
          en: legacyHomeHeroLine2En ? (english || '').replace(/\s+Saudi Arabia$/i, '').trim() : legacyHomeHeroLine1 || legacyEnglish ? item.en : english ?? (
            item.key === 'manufacturing.hero.line1' ? legacyManufacturingHeroEn?.[1] || item.en :
              item.key === 'manufacturing.hero.line2' ? legacyManufacturingHeroEn?.[2] || item.en : item.en
          ),
          ar: legacyHomeHeroLine2Ar ? (arabic || '').replace(/\s*المملكة العربية السعودية$/u, '').trim() : legacyHomeHeroLine1Arabic || legacyHomeHeroLine2Arabic || legacyArabic ? item.ar : arabic ?? (
            item.key === 'manufacturing.hero.line1' ? legacyManufacturingHeroAr?.[1] || item.ar :
              item.key === 'manufacturing.hero.line2' ? legacyManufacturingHeroAr?.[2] || item.ar : item.ar
          )
        }];
      }));
      const missing = this.catalog.some(item => !saved[item.key] || typeof saved[item.key].en !== 'string' || typeof saved[item.key].ar !== 'string');
      if (!missing && !repaired.size) { this.isLoading.set(false); return; }
      this.service.save(this.values).subscribe({
        next: () => this.isLoading.set(false),
        error: error => { this.isLoading.set(false); this.error.set(error?.error?.message || 'Could not initialize section headings.'); }
      });
    });
  }

  pageHeadings() { return this.catalog.filter(item => item.page === this.activePage()); }

  save(): void {
    this.isSaving.set(true); this.error.set(''); this.success.set('');
    this.service.save(this.values).subscribe({
      next: () => {
        this.isSaving.set(false);
        if (typeof window !== 'undefined') window.localStorage.setItem('vic_section_headings_updated', String(Date.now()));
        this.success.set(`${this.pages.find(page => page.key === this.activePage())?.label} headings saved in English and Saudi Arabic.`);
      },
      error: error => { this.isSaving.set(false); this.error.set(error?.error?.message || 'Could not save section headings.'); }
    });
  }

  resetPage(): void {
    for (const item of this.pageHeadings()) this.values[item.key] = { en: item.en, ar: item.ar };
    this.values = { ...this.values };
  }
}
