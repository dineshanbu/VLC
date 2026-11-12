import { Component } from '@angular/core';

interface WhyVicFeature {
  title: string;
  subtitle: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-why-vic',
  imports: [],
  templateUrl: './why-vic.html',
  styleUrl: './why-vic.css'
})
export class WhyVicComponent {
  features: WhyVicFeature[] = [
    {
      title: 'Built for',
      subtitle: 'Saudi Arabia',
      description: 'Supporting healthcare localization through advanced vaccine manufacturing.',
      icon: 'handshake'
    },
    {
      title: 'Powered by',
      subtitle: 'Innovation',
      description: 'Technology transfer, world-class manufacturing and scientific excellence.',
      icon: 'atom'
    },
    {
      title: 'Designed for',
      subtitle: 'Global Impact',
      description: 'Serving regional healthcare through trusted partnerships and sustainable solutions.',
      icon: 'globe'
    }
  ];
}
