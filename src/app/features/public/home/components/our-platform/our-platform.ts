import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface PlatformCard {
  title: string;
  description: string;
  image: string;
  alt: string;
  route: string;
  imagePosition?: string;
  iconType: 'molecule' | 'flask' | 'syringe';
}

@Component({
  selector: 'app-our-platform',
  imports: [RouterLink],
  templateUrl: './our-platform.html',
  styleUrl: './our-platform.css'
})
export class OurPlatformComponent {
  cards: PlatformCard[] = [
    {
      title: 'Biomanufacturing Localization',
      description: 'Empowering Communities: Advancing Biotechnology through Localizing Manufacturing of Vaccines',
      image: 'scientist_holographic_molecular_structure.jpg',
      alt: 'Biomanufacturing Localization — scientist with holographic molecular structure',
      route: '/platform',
      imagePosition: 'center 20%',
      iconType: 'molecule'
    },
    {
      title: 'Research, Development and Innovation',
      description: 'Fostering Progress: Research, Development, and Innovation in Vaccine Advancements',
      image: 'purple_glove_vial_needle_macro.jpg',
      alt: 'Research, Development and Innovation — purple gloved hand with vaccine vial and needle',
      route: '/platform',
      imagePosition: 'center',
      iconType: 'flask'
    },
    {
      title: 'Targeted Products',
      description: 'Elevating Public Health: Strategic Marketing of Innovative Vaccine Solutions',
      image: 'syringe_liquid_draw.jpg',
      alt: 'Targeted Products — syringe drawing liquid from vaccine vial',
      route: '/products',
      imagePosition: 'center',
      iconType: 'syringe'
    }
  ];
}
