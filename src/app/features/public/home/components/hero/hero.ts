import { Component } from '@angular/core';

@Component({
  selector: 'app-hero',
  imports: [],
  templateUrl: './hero.html',
  styleUrl: './hero.css'
})
export class HeroComponent {
  scrollToVideo(): void {
    const el = document.getElementById('about-vic');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
