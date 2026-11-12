import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslationService } from '../../../../../core/services/translation.service';
import { HomePageService } from '../../../../../core/services/home-page.service';
import { HomePageSection } from '../../../../../core/models/home-page.model';
import { resolveImageUrl } from '../../../../../core/utils/image-url.util';
import { SectionHeadingPipe } from '../../../../../shared/pipes/section-heading.pipe';

@Component({
  selector: 'app-about-vic',
  imports: [RouterLink, SectionHeadingPipe],
  templateUrl: './about-vic.html',
  styleUrl: './about-vic.css'
})
export class AboutVicComponent {
  @Output() readonly watchVideo = new EventEmitter<string>();
  readonly translationService = inject(TranslationService);
  private readonly homePageService = inject(HomePageService);
  readonly content = signal<HomePageSection | null>(null);

  constructor() {
    this.homePageService.getContent().subscribe({ next: response => this.content.set(response.content.about), error: () => undefined });
  }

  get isRtl(): boolean { return this.translationService.isRtl(); }
  get eyebrow(): string { return (this.isRtl ? this.content()?.badge_ar : this.content()?.badge) || this.translationService.translate('aboutVic.eyebrow'); }
  get headingLine1(): string { return (this.isRtl ? this.content()?.title_ar : this.content()?.title) || ''; }
  get headingLine2(): string { return (this.isRtl ? this.content()?.title_line2_ar : this.content()?.title_line2) || ''; }
  get description(): string { return (this.isRtl ? this.content()?.description_ar : this.content()?.description) || this.translationService.translate('aboutVic.desc'); }
  get imageUrl(): string { return resolveImageUrl(this.content()?.image_url, 'vc-company.jpg'); }
  get videoUrl(): string { return this.content()?.video_url || 'watch-normalized.mp4'; }
}
