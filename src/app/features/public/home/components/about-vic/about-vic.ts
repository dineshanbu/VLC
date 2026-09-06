import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslationService } from '../../../../../core/services/translation.service';

@Component({
  selector: 'app-about-vic',
  imports: [RouterLink],
  templateUrl: './about-vic.html',
  styleUrl: './about-vic.css'
})
export class AboutVicComponent {
  readonly translationService = inject(TranslationService);
}
