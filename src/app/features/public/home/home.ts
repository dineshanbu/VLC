import { Component } from '@angular/core';
import { HeroComponent } from './components/hero/hero';
import { AboutVicComponent } from './components/about-vic/about-vic';
import { OurPlatformComponent } from './components/our-platform/our-platform';
import { LatestNewsComponent } from './components/latest-news/latest-news';

@Component({
  selector: 'app-home',
  imports: [HeroComponent, AboutVicComponent, OurPlatformComponent, LatestNewsComponent],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {
}
