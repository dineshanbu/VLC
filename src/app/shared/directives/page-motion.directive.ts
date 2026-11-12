import { AfterViewInit, Directive, ElementRef, NgZone, OnDestroy, inject } from '@angular/core';

// One observer per public layout, including lazy routes and API-rendered content.
@Directive({ selector: '[appPageMotion]', standalone: true })
export class PageMotionDirective implements AfterViewInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private observer?: IntersectionObserver;
  private mutations?: MutationObserver;
  private preference?: MediaQueryList;
  private frame = 0;
  private readonly seen = new WeakSet<Element>();
  private readonly pending = new Set<HTMLElement>();
  private readonly animations = new Map<HTMLElement, Animation>();
  private readonly floating = new Set<HTMLElement>();
  private readonly groups = '[class$="__card"], [class$="-card"], .footer__col, figure, [class$="__image-wrapper"], [class$="__media-wrapper"], .about-vic__curved-media, .home-product__visual';
  private readonly decorations = '.vic-floating-v, .section-floating-v, .facility-gallery__floating-v, .about-vic__brand-mark, .about-vic__floating-badge, .hero__facility-badge';
  private readonly selector = `h1, h2, h3, h4, p, ${this.groups}, img, [class$="__eyebrow"], [class$="__label"], [class$="__action"], .home-product__feature, .home-partners__logo, .vision-support__pillar`;
  private readonly excluded = 'app-home, app-navbar, dialog, [role="dialog"], [aria-modal="true"], [class*="modal"], [aria-hidden="true"], [data-motion="off"]';

  ngAfterViewInit(): void {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
    this.zone.runOutsideAngular(() => {
      this.preference = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.preference.addEventListener('change', this.onPreferenceChange);
      this.observer = new IntersectionObserver(entries => {
        let order = 0;
        for (const entry of entries) {
          const element = entry.target as HTMLElement;
          if (this.floating.has(element)) {
            element.classList.toggle('vic-motion-in-view', entry.isIntersecting);
            continue;
          }
          if (!entry.isIntersecting) continue;
          this.observer?.unobserve(element);
          this.pending.delete(element);
          if (this.preference?.matches || typeof element.animate !== 'function') continue;
          const visual = element.matches(`img, ${this.groups}`);
          const compact = window.matchMedia('(max-width: 767px)').matches;
          const animation = element.animate([
            { opacity: 0, translate: `0 ${compact ? 16 : 28}px`, ...(visual ? { scale: '0.975' } : {}) },
            { opacity: 1, translate: '0 0', ...(visual ? { scale: '1' } : {}) }
          ], {
            duration: compact ? 520 : visual ? 850 : 680,
            delay: Math.min(order++ * 65, 260),
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            fill: 'backwards'
          });
          this.animations.set(element, animation);
          animation.onfinish = () => this.animations.delete(element);
        }
      }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });
      this.scan();
      this.mutations = new MutationObserver(() => {
        if (!this.frame) this.frame = window.requestAnimationFrame(() => {
          this.frame = 0;
          this.scan();
        });
      });
      this.mutations.observe(this.host.nativeElement, { subtree: true, childList: true });
      this.host.nativeElement.addEventListener('focusin', this.onFocus);
    });
  }

  private scan(): void {
    const root = this.host.nativeElement;
    const homeOwnsMotion = !!root.querySelector('app-home');
    // Release references to the previous route and removed carousel/API items.
    for (const element of [...this.pending, ...this.floating]) {
      if (root.contains(element) && !(homeOwnsMotion && element.closest('app-footer'))) continue;
      this.observer?.unobserve(element);
      this.pending.delete(element);
      this.floating.delete(element);
    }
    for (const [element, animation] of this.animations) {
      if (root.contains(element) && !(homeOwnsMotion && element.closest('app-footer'))) continue;
      animation.cancel();
      this.animations.delete(element);
    }
    if (this.preference?.matches) return;
    root.querySelectorAll<HTMLElement>(this.decorations).forEach(element => {
      if (element.closest('app-home')) return;
      if (this.floating.has(element)) return;
      this.floating.add(element);
      element.classList.add('vic-motion-float');
      this.observer?.observe(element);
    });
    root.querySelectorAll<HTMLElement>(this.selector).forEach(element => {
      if (homeOwnsMotion && element.closest('app-footer')) return;
      if (this.seen.has(element) || this.floating.has(element) || element.closest(this.excluded)) return;
      // Animate whole cards/media once instead of moving every nested child.
      if (element.parentElement?.closest(this.groups)) return;
      this.seen.add(element);
      this.pending.add(element);
      this.observer?.observe(element);
    });
  }

  private readonly onFocus = (event: FocusEvent): void => {
    // Keyboard users should never have to wait for an entrance to finish.
    if (!(event.target instanceof HTMLElement)) return;
    for (const [element, animation] of this.animations) {
      if (element.contains(event.target)) {
        animation.cancel();
        this.animations.delete(element);
      }
    }
  };

  private readonly onPreferenceChange = (): void => {
    if (this.preference?.matches) {
      for (const animation of this.animations.values()) animation.cancel();
      this.animations.clear();
    } else {
      this.scan();
    }
  };

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.mutations?.disconnect();
    this.preference?.removeEventListener('change', this.onPreferenceChange);
    this.host.nativeElement.removeEventListener('focusin', this.onFocus);
    if (this.frame) window.cancelAnimationFrame(this.frame);
    for (const animation of this.animations.values()) animation.cancel();
    this.animations.clear();
    this.pending.clear();
    this.floating.clear();
  }
}
