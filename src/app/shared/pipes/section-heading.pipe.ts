import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from '../../core/services/translation.service';
import { SectionHeadingsService } from '../../core/services/section-headings.service';

@Pipe({ name: 'sectionHeading', standalone: true, pure: false })
export class SectionHeadingPipe implements PipeTransform {
  private readonly headings = inject(SectionHeadingsService);
  private readonly language = inject(TranslationService);

  constructor() { this.headings.load().subscribe(); }

  transform(key: string, englishFallback = '', arabicFallback = ''): string {
    return this.headings.get(key, englishFallback, arabicFallback, this.language.isRtl());
  }
}
