import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar';
import { FooterComponent } from '../../shared/components/footer/footer';
import { ScrollTopComponent } from '../../shared/components/scroll-top/scroll-top';
import { PageMotionDirective } from '../../shared/directives/page-motion.directive';
import { SmoothScrollService } from '../../core/services/smooth-scroll.service';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ScrollTopComponent, PageMotionDirective],
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.css'
})
export class PublicLayoutComponent {
  // Activate global smooth scroll service on public layout
  readonly smoothScroll = inject(SmoothScrollService);
}
