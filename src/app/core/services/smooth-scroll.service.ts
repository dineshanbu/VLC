import { Injectable, NgZone, OnDestroy, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import Lenis from 'lenis';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SmoothScrollService implements OnDestroy {
  private readonly zone = inject(NgZone);
  private readonly router = inject(Router);

  private lenis?: Lenis;
  private rafId = 0;
  private destroyed = false;
  private modalCount = 0;

  readonly scrollProgress = signal(0);
  readonly scrollY = signal(0);
  readonly isScrolling = signal(false);

  constructor() {
    if (typeof window === 'undefined') return;

    // Respect section links instead of overriding them with a scroll to top.
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(event => {
        setTimeout(() => {
          if (this.destroyed || this.router.url !== event.urlAfterRedirects) return;
          this.resize();
          const fragment = this.router.parseUrl(event.urlAfterRedirects).fragment;
          if (fragment) {
            const target = document.getElementById(fragment);
            if (target) {
              const headerBottom = document.querySelector('.navbar')?.getBoundingClientRect().bottom || 88;
              this.scrollTo(target, -(headerBottom + 16), 0.65);
            }
          } else {
            this.scrollToTop(0.4);
          }
        }, 50);
      });

    this.initLenis();
  }

  private initLenis(): void {
    if (typeof window === 'undefined') return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    this.zone.runOutsideAngular(() => {
      this.lenis = new Lenis({
        autoRaf: false,
        lerp: 0.09,
        smoothWheel: true,
        syncTouch: false,
        wheelMultiplier: 0.95,
        touchMultiplier: 1.1,
        anchors: { offset: -88, duration: 0.9 },
        prevent: node =>
          node.matches(
            '[data-lenis-prevent], [role="dialog"], .about-modal, .mobile-menu, textarea, select'
          )
      });

      const onScroll = (e: { progress: number; scroll: number }) => {
        const p = Math.min(1, Math.max(0, e.progress));
        this.scrollProgress.set(p);
        this.scrollY.set(e.scroll);
        this.isScrolling.set(true);
      };

      this.lenis.on('scroll', onScroll);

      const raf = (time: number) => {
        if (this.destroyed) return;
        this.lenis?.raf(time);
        this.rafId = requestAnimationFrame(raf);
      };

      this.rafId = requestAnimationFrame(raf);

      // Window native scroll fallback & sync
      const onNativeScroll = () => {
        if (this.lenis) return;
        const doc = document.documentElement;
        const max = doc.scrollHeight - window.innerHeight || 1;
        const p = Math.min(1, Math.max(0, window.scrollY / max));
        this.scrollProgress.set(p);
        this.scrollY.set(window.scrollY);
      };

      window.addEventListener('scroll', onNativeScroll, { passive: true });
    });
  }

  scrollToTop(duration = 0.9): void {
    if (this.lenis) {
      this.lenis.scrollTo(0, { duration });
    } else if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  scrollTo(target: string | HTMLElement | number, offset = -88, duration = 0.9): void {
    if (this.lenis) {
      this.lenis.scrollTo(target, { offset, duration });
    } else if (typeof window !== 'undefined') {
      if (typeof target === 'number') {
        window.scrollTo({ top: target, behavior: 'smooth' });
      } else {
        const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY + offset;
          const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
          window.scrollTo({ top, behavior });
        }
      }
    }
  }

  resize(): void {
    this.lenis?.resize();
  }

  pause(): void {
    this.modalCount++;
    this.lenis?.stop();
  }

  resume(): void {
    this.modalCount = Math.max(0, this.modalCount - 1);
    if (this.modalCount === 0) {
      this.lenis?.start();
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    this.lenis?.destroy();
    this.lenis = undefined;
  }
}
