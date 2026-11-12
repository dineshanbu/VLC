import { Component, inject, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslationService } from '../../../core/services/translation.service';
import { BrandingService } from '../../../core/services/branding.service';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class FooterComponent {
  @Input() logoPreviewMode = false;
  @Input() logoPreviewSrc = '';

  readonly translationService = inject(TranslationService);
  readonly branding = inject(BrandingService);
  currentYear = new Date().getFullYear();

  constructor() {
    this.branding.load();
  }

  text(english: string, arabic: string): string {
    return this.translationService.isRtl() ? arabic : english;
  }

  isInternalLink(url: string): boolean {
    return url.startsWith('/') && !url.startsWith('//');
  }
}
