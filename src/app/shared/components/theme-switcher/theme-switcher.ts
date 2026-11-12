import { Component, inject } from '@angular/core';
import { ThemeMode, ThemePalette, ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  templateUrl: './theme-switcher.html',
  styleUrl: './theme-switcher.css'
})
export class ThemeSwitcherComponent {
  readonly theme = inject(ThemeService);
  readonly modes: { value: ThemeMode; label: string; icon: string }[] = [
    { value: 'light', label: 'Light', icon: '☀' },
    { value: 'dark', label: 'Dark', icon: '☾' },
    { value: 'system', label: 'System', icon: '◐' }
  ];
  readonly palettes: { value: ThemePalette; label: string; color: string }[] = [
    { value: 'ocean', label: 'VIC Teal', color: '#00cbd5' },
    { value: 'emerald', label: 'Emerald', color: '#059669' },
    { value: 'indigo', label: 'Indigo', color: '#4f46e5' },
    { value: 'rose', label: 'Rose', color: '#e11d48' }
  ];

  chooseColor(event: Event): void {
    this.theme.setCustomColor((event.target as HTMLInputElement).value);
  }
}
