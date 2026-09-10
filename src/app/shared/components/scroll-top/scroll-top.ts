import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SmoothScrollService } from '../../../core/services/smooth-scroll.service';

@Component({
  selector: 'app-scroll-top',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scroll-top.html',
  styleUrl: './scroll-top.css'
})
export class ScrollTopComponent {
  private readonly scrollService = inject(SmoothScrollService);

  readonly circumference = 125.66; // 2 * Math.PI * 20

  readonly isVisible = computed(() => {
    return this.scrollService.scrollProgress() > 0.02 || this.scrollService.scrollY() > 70;
  });

  readonly dashOffset = computed(() => {
    const progress = Math.min(1, Math.max(0, this.scrollService.scrollProgress()));
    return this.circumference * (1 - progress);
  });

  readonly progressPercentage = computed(() => {
    return Math.round(this.scrollService.scrollProgress() * 100);
  });

  scrollToTop(): void {
    this.scrollService.scrollToTop(1.0);
  }
}
