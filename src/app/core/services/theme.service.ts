import { Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ThemePalette = 'ocean' | 'emerald' | 'indigo' | 'rose' | 'custom';

export interface ThemePreference {
  version: 2;
  mode: ThemeMode;
  palette: ThemePalette;
  customColor: string;
}

const STORAGE_KEY = 'vic-theme-preference';
// The approved VIC palette is the default for every page. Other choices remain optional.
const DEFAULT_PREFERENCE: ThemePreference = { version: 2, mode: 'dark', palette: 'ocean', customColor: '#00cbd5' };

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly preference = signal<ThemePreference>(this.readPreference());
  readonly isPanelOpen = signal(false);

  constructor() {
    this.apply(this.preference());
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (this.preference().mode === 'system') this.apply(this.preference());
    });
  }

  setMode(mode: ThemeMode): void {
    this.update({ mode });
  }

  setPalette(palette: ThemePalette): void {
    this.update({ palette });
  }

  setCustomColor(customColor: string): void {
    if (!/^#[0-9a-fA-F]{6}$/.test(customColor)) return;
    this.update({ palette: 'custom', customColor });
  }

  togglePanel(): void {
    this.isPanelOpen.update(open => !open);
  }

  closePanel(): void {
    this.isPanelOpen.set(false);
  }

  private update(change: Partial<ThemePreference>): void {
    const next = { ...this.preference(), ...change };
    this.preference.set(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    this.apply(next);
  }

  private readPreference(): ThemePreference {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      // Always enforce the approved VIC dark+ocean design. Merge any v2 saved preferences but
      // keep mode:'dark' and palette:'ocean' locked so every visitor sees the correct theme.
      if (saved.version === 2) {
        return { ...DEFAULT_PREFERENCE, ...saved, mode: 'dark', palette: 'ocean' };
      }
      return DEFAULT_PREFERENCE;
    } catch {
      return DEFAULT_PREFERENCE;
    }
  }

  private apply(preference: ThemePreference): void {
    const root = document.documentElement;
    const mode = preference.mode === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : preference.mode;
    root.dataset['theme'] = mode;
    root.dataset['palette'] = preference.palette;
    root.style.setProperty('--theme-custom', preference.customColor);
    root.style.colorScheme = mode;
  }
}
