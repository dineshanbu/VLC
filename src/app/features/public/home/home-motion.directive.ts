import { AfterViewInit, Directive, ElementRef, NgZone, OnDestroy, inject, signal } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

@Directive({ selector: '[appHomeMotion]', standalone: true })
export class HomeMotionDirective implements AfterViewInit, OnDestroy {
  readonly scrollProgress = signal(0);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private media?: gsap.MatchMedia;
  private context?: gsap.Context;
  private lenis?: Lenis;
  private observer?: MutationObserver;
  private resize?: ResizeObserver;
  private frame = 0;
  private galleryFrame = 0;
  private progressFrame = 0;
  private refresh?: gsap.core.Tween;
  private galleryTween?: gsap.core.Tween;
  private galleryCommit?: () => void;
  private seen = new WeakSet<Element>();
  private compact = false;
  private destroyed = false;
  private layoutElement?: HTMLElement;
  private readonly cleanups: (() => void)[] = [];

  private get root(): HTMLElement {
    return this.host.nativeElement;
  }

  private get layout(): HTMLElement {
    return this.layoutElement || this.root;
  }

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') return;
    this.layoutElement = this.root.closest('app-public-layout') || this.root;

    this.zone.runOutsideAngular(() => {
      gsap.registerPlugin(ScrollTrigger);
      this.media = gsap.matchMedia();

      this.media.add({
        motion: '(prefers-reduced-motion: no-preference)',
        compact: '(max-width: 767px)',
        tablet: '(min-width: 768px) and (max-width: 1023px)',
        pointer: '(min-width: 1024px) and (hover: hover) and (pointer: fine)'
      }, media => {
        if (!media.conditions?.['motion']) return;
        this.compact = !!media.conditions['compact'];
        this.seen = new WeakSet();
        this.layout.classList.add('vic-premium-motion');

        this.context = gsap.context(() => {
          this.startScroll();
          this.initHero(!!media.conditions?.['pointer']);
          this.initSections();
        }, this.layout);

        this.observer = new MutationObserver(mutations => {
          this.syncScrollLock();
          const hasAddedNodes = mutations.some(m => m.addedNodes.length > 0);
          if (hasAddedNodes && !this.frame) {
            this.frame = requestAnimationFrame(() => {
              this.frame = 0;
              this.context?.add(() => this.initSections());
              this.scheduleRefresh();
            });
          }
        });
        this.observer.observe(this.layout, { childList: true, subtree: true });

        this.root.addEventListener('load', this.scheduleRefresh, true);
        this.layout.addEventListener('focusin', this.onFocus);
        this.scheduleRefresh();

        return () => this.cleanupMotion();
      });
    });
  }

  private startScroll(): void {
    this.lenis = new Lenis({
      autoRaf: false,
      lerp: 0.1,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.1,
      anchors: { offset: -88, duration: 1.0 },
      prevent: node =>
        node.matches(
          '[data-lenis-prevent], [role="dialog"], .mobile-menu, .news__grid, .platform__grid, textarea, select'
        )
    });

    const tick = (time: number) => this.lenis?.raf(time * 1000);
    const onLenisScroll = (e: { progress: number }) => {
      ScrollTrigger.update();
      this.onScrollProgress(e.progress);
    };
    const unsubscribe = this.lenis.on('scroll', onLenisScroll);
    gsap.ticker.add(tick);
    this.cleanups.push(() => {
      gsap.ticker.remove(tick);
      unsubscribe();
    });

    const onNativeScroll = () => {
      if (this.lenis) return;
      const doc = document.documentElement;
      const max = (doc.scrollHeight - window.innerHeight) || 1;
      const progress = Math.min(1, Math.max(0, window.scrollY / max));
      this.onScrollProgress(progress);
    };
    window.addEventListener('scroll', onNativeScroll, { passive: true });
    this.cleanups.push(() => window.removeEventListener('scroll', onNativeScroll));

    // Handle in-page anchor links for buttery-smooth scrolling
    const onAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a');
      if (!target) return;
      const href = target.getAttribute('href');
      if (href && href.startsWith('#') && href.length > 1) {
        const dest = this.layout.querySelector<HTMLElement>(href);
        if (dest && this.lenis) {
          e.preventDefault();
          this.lenis.scrollTo(dest, { offset: -88, duration: 0.9 });
        }
      }
    };
    this.layout.addEventListener('click', onAnchorClick);
    this.cleanups.push(() => this.layout.removeEventListener('click', onAnchorClick));

    this.syncScrollLock();
  }

  private syncScrollLock(): void {
    if (this.layout.querySelector('[aria-modal="true"], .mobile-menu')) {
      this.lenis?.stop();
    } else {
      this.lenis?.start();
    }
  }

  private rtl(): boolean {
    return document.documentElement.dir === 'rtl';
  }

  /* --------------------------------------------------------------------------
     4. HERO CINEMATIC SEQUENCE
     -------------------------------------------------------------------------- */
  private initHero(pointer: boolean): void {
    const hero = this.root.querySelector<HTMLElement>('.hero');
    if (!hero) return;

    const q = gsap.utils.selector(hero);
    const isRtl = this.rtl();
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // 1 & 2: Background starts at scale(1.05) and slowly settles to scale(1.0)
    heroTl.fromTo(
      q('.hero__video'),
      { scale: 1.05 },
      { scale: 1.0, duration: 2.2, ease: 'power2.out' },
      0
    );

    // 3: Dark blue overlay fades in naturally
    heroTl.from(
      q('.hero__gradient-overlay'),
      { opacity: 0.15, duration: 1.4, ease: 'power2.out' },
      0.1
    );

    // 4: VIC logo appears using opacity + slight horizontal movement
    heroTl.from(
      q('.hero__banner-logo'),
      { opacity: 0, x: isRtl ? 24 : -24, duration: 0.9 },
      0.25
    );

    heroTl.from(
      q('.hero__banner-divider'),
      { scaleY: 0, transformOrigin: 'center', duration: 0.8 },
      0.35
    );

    // 5: Main headline reveals line-by-line via masked text animation
    // 6: Highlighted cyan "Middle East" text appears slightly later
    this.revealHeroHeadline(heroTl);

    // 7: CTA button appears promptly after headline
    heroTl.from(
      q('.hero__btn-video'),
      { opacity: 0, y: 16, duration: 0.75, ease: 'power3.out', clearProps: 'opacity,transform' },
      0.92
    );

    // Top navbar logo initial entrance
    gsap.from(this.layout.querySelector('.navbar__logo'), {
      opacity: 0,
      scale: 0.98,
      duration: 0.7,
      clearProps: 'opacity,transform'
    });

    // Bottom scroll indicator: gentle vertical bobbing, smoothly fading out once user starts scrolling
    gsap.to(q('.hero__scroll'), {
      opacity: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: '+=160',
        scrub: true
      }
    });


    // Subtle desktop pointer parallax
    if (pointer) {
      const content = hero.querySelector<HTMLElement>('.hero__banner-content');
      if (content) {
        const xTo = gsap.quickTo(content, 'x', { duration: 0.6, ease: 'power2.out' });
        const yTo = gsap.quickTo(content, 'y', { duration: 0.6, ease: 'power2.out' });

        const move = (event: PointerEvent) => {
          const bounds = hero.getBoundingClientRect();
          xTo(((event.clientX - bounds.left) / bounds.width - 0.5) * 6);
          yTo(((event.clientY - bounds.top) / bounds.height - 0.5) * 4);
        };
        const leave = () => {
          xTo(0);
          yTo(0);
        };
        hero.addEventListener('pointermove', move, { passive: true });
        hero.addEventListener('pointerleave', leave);
        this.cleanups.push(() => {
          hero.removeEventListener('pointermove', move);
          hero.removeEventListener('pointerleave', leave);
        });
      }
    }
  }

  private revealHeroHeadline(timeline: gsap.core.Timeline): void {
    const words = Array.from(
      this.root.querySelectorAll<HTMLElement>('.hero__banner-title .motion-word')
    ).filter(word => !this.seen.has(word));

    if (!words.length) return;

    // Separate standard words from accent words ("Middle East" / "في الشرق الأوسط")
    const standardWords = words.filter(w => !w.closest('.hero__banner-title-accent'));
    const accentWords = words.filter(w => !!w.closest('.hero__banner-title-accent'));

    // Compute line groups by vertical offset
    const lines = [...new Set(standardWords.map(w => Math.round(w.getBoundingClientRect().top)))].sort(
      (a, b) => a - b
    );

    const rise = this.compact ? 24 : 40;

    // Line-by-line reveal for main headline
    standardWords.forEach(word => {
      this.seen.add(word);
      const lineIndex = Math.max(0, lines.indexOf(Math.round(word.getBoundingClientRect().top)));
      timeline.fromTo(
        word,
        { y: rise, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          ease: 'power3.out',
          clearProps: 'opacity,transform'
        },
        0.45 + lineIndex * 0.15
      );
    });

    // Highlighted cyan "Middle East" text appears slightly later
    accentWords.forEach(word => {
      this.seen.add(word);
      timeline.fromTo(
        word,
        { y: rise, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          ease: 'power3.out',
          clearProps: 'opacity,transform'
        },
        0.82
      );
    });
  }

  private reveal(selector: string, from: gsap.TweenVars, delay = 0, duration = 0.8): void {
    const elements = Array.from(this.layout.querySelectorAll<HTMLElement>(selector)).filter(
      element => !this.seen.has(element)
    );
    if (!elements.length) return;
    elements.forEach(element => this.seen.add(element));

    gsap.from(elements, {
      ...from,
      duration: this.compact ? Math.min(duration, 0.65) : duration,
      delay,
      stagger: 0.12,
      ease: 'power3.out',
      clearProps: 'transform,opacity',
      scrollTrigger: { trigger: elements[0], start: 'top 82%', once: true }
    });
  }

  /* --------------------------------------------------------------------------
     SECTIONS MOTION SYSTEM
     -------------------------------------------------------------------------- */
  private initSections(): void {
    const rise = this.compact ? 18 : 36;
    const isRtl = this.rtl();
    const side = isRtl ? 1 : -1;

    // ------------------------------------------------------------------------
    // 5. "DRIVEN BY SCIENCE. INSPIRED BY HUMANITY."
    // ------------------------------------------------------------------------
    this.reveal('.about-vic__eyebrow-wrapper', { opacity: 0, x: side * 22 }, 0, 0.75);

    // Masked sequential reveal: "Driven by Science." then "Inspired by Humanity."
    const aboutHeadingLines = Array.from(
      this.root.querySelectorAll<HTMLElement>('.about-vic__heading .motion-line')
    ).filter(el => !this.seen.has(el));

    if (aboutHeadingLines.length > 0) {
      aboutHeadingLines.forEach(line => this.seen.add(line));
      gsap.from(aboutHeadingLines, {
        opacity: 0,
        y: rise,
        duration: 0.85,
        stagger: 0.18,
        ease: 'power3.out',
        clearProps: 'opacity,transform',
        scrollTrigger: { trigger: aboutHeadingLines[0], start: 'top 82%', once: true }
      });
    }

    this.reveal('.about-vic__desc', { opacity: 0, y: 20 }, 0.28, 0.8);
    this.reveal('.about-vic__action', { opacity: 0, y: 14 }, 0.38, 0.7);

    // Right-side scientist image: GPU-accelerated opacity + scale reveal
    const aboutMedia = this.root.querySelector<HTMLElement>('.about-vic__curved-media');
    const aboutImg = this.root.querySelector<HTMLElement>('.about-vic__image');
    if (aboutMedia && !this.seen.has(aboutMedia)) {
      this.seen.add(aboutMedia);
      const mediaTl = gsap.timeline({
        scrollTrigger: { trigger: aboutMedia, start: 'top 84%', once: true }
      });
      mediaTl.fromTo(
        aboutMedia,
        { opacity: 0, scale: 0.96 },
        { opacity: 1, scale: 1.0, duration: 1.1, ease: 'power2.out', clearProps: 'opacity,transform' },
        0
      );
      if (aboutImg) {
        mediaTl.fromTo(
          aboutImg,
          { scale: 1.06 },
          { scale: 1.0, duration: 1.2, ease: 'power2.out', clearProps: 'transform' },
          0
        );
      }
    }

    // ------------------------------------------------------------------------
    // 6. "THREE PILLARS FOR GREATER IMPACT"
    // ------------------------------------------------------------------------
    this.reveal('.platform__label', { opacity: 0, x: side * 18 }, 0, 0.7);
    this.reveal('.platform__heading', { opacity: 0, y: 22 }, 0.1, 0.8);
    this.reveal('.platform__intro', { opacity: 0, y: 18 }, 0.2, 0.75);

    // Cards enter sequentially: LOCALIZE (1) -> INNOVATE (2) -> SCALE (3)
    // y: 50px -> 0, opacity: 0 -> 1, scale: 0.97 -> 1
    const pillarCards = Array.from(
      this.root.querySelectorAll<HTMLElement>('.platform__card')
    ).filter(el => !this.seen.has(el));

    if (pillarCards.length > 0) {
      pillarCards.forEach(card => this.seen.add(card));
      gsap.from(pillarCards, {
        opacity: 0,
        y: this.compact ? 24 : 50,
        scale: 0.97,
        duration: 0.9,
        stagger: 0.16,
        ease: 'power3.out',
        clearProps: 'opacity,transform',
        scrollTrigger: { trigger: pillarCards[0], start: 'top 80%', once: true }
      });
    }

    // ------------------------------------------------------------------------
    // 7. "FIRST OF ITS KIND IN SAUDI ARABIA" (FACILITY GALLERY)
    // ------------------------------------------------------------------------
    this.reveal('.facility-gallery .reference-eyebrow', { opacity: 0, x: side * 18 }, 0, 0.7);
    this.reveal('.facility-gallery h2', { opacity: 0, y: 22 }, 0.1, 0.8);

    if (!this.galleryCommit) {
      const photos = Array.from(
        this.root.querySelectorAll<HTMLElement>('.facility-gallery__photo')
      ).filter(el => !this.seen.has(el));

      if (photos.length > 0) {
        photos.forEach(photo => this.seen.add(photo));
        gsap.from(photos, {
          opacity: 0,
          y: rise,
          scale: 0.98,
          duration: 0.85,
          stagger: 0.14,
          ease: 'power3.out',
          clearProps: 'opacity,transform',
          scrollTrigger: { trigger: photos[0], start: 'top 82%', once: true }
        });
      }
    }

    // ------------------------------------------------------------------------
    // 8. FLUCELVAX PRODUCT SECTION
    // ------------------------------------------------------------------------
    this.reveal('.home-product__copy .home-showcase__eyebrow', { opacity: 0, x: side * 18 }, 0, 0.7);
    this.reveal('.home-product__title', { opacity: 0, y: 24 }, 0.1, 0.8);
    this.reveal('.home-product__description', { opacity: 0, y: 18 }, 0.2, 0.75);
    this.reveal('.home-product__link', { opacity: 0, y: 14 }, 0.3, 0.7);

    // Product hero: opacity 0 -> 1, y: 35px -> 0, scale: 0.95 -> 1
    this.reveal(
      '.home-product__visual',
      { opacity: 0, y: this.compact ? 20 : 35, scale: 0.95 },
      0.15,
      1.05
    );

    // Right-side scientific feature items: scale reveal, tiny rotation correction, text slides from right
    this.reveal('.home-product__feature-icon', { opacity: 0, scale: 0.82, rotation: isRtl ? 6 : -6 }, 0.2, 0.7);
    this.reveal('.home-product__feature-text', { opacity: 0, x: isRtl ? -24 : 24 }, 0.28, 0.75);

    // ------------------------------------------------------------------------
    // 9. NEWS & MEDIA SECTION
    // ------------------------------------------------------------------------
    this.reveal('.news__label', { opacity: 0, x: side * 18 }, 0, 0.7);
    this.reveal('.news__heading', { opacity: 0, y: 22 }, 0.1, 0.8);
    this.reveal('.news__view-all', { opacity: 0, x: -side * 18 }, 0.2, 0.75);

    // News cards enter sequentially
    const newsCards = Array.from(
      this.root.querySelectorAll<HTMLElement>('.news__card')
    ).filter(el => !this.seen.has(el));

    if (newsCards.length > 0) {
      newsCards.forEach(card => this.seen.add(card));
      gsap.from(newsCards, {
        opacity: 0,
        y: this.compact ? 22 : 40,
        duration: 0.85,
        stagger: 0.12,
        ease: 'power3.out',
        clearProps: 'opacity,transform',
        scrollTrigger: { trigger: newsCards[0], start: 'top 82%', once: true }
      });
    }

    // ------------------------------------------------------------------------
    // 10. SAUDI VISION 2030 SECTION
    // ------------------------------------------------------------------------
    this.reveal('.vision-support__overlay', { opacity: 0 }, 0, 1.1);
    this.reveal('.vision-support__eyebrow', { opacity: 0, x: side * 18 }, 0, 0.7);
    this.reveal('.vision-support__copy h2', { opacity: 0, y: 22 }, 0.1, 0.8);
    this.reveal('.vision-support__copy p', { opacity: 0, y: 16 }, 0.2, 0.75);

    // 4 Strategic icons reveal sequentially
    const visionPillars = Array.from(
      this.root.querySelectorAll<HTMLElement>('.vision-support__pillar')
    ).filter(el => !this.seen.has(el));

    if (visionPillars.length > 0) {
      visionPillars.forEach(p => this.seen.add(p));
      gsap.from(visionPillars, {
        opacity: 0,
        scale: 0.85,
        y: 16,
        duration: 0.75,
        stagger: 0.12,
        ease: 'power3.out',
        clearProps: 'opacity,transform',
        scrollTrigger: { trigger: visionPillars[0], start: 'top 82%', once: true }
      });
    }

    // Vision 2030 logo: respectful soft fade + subtle scale
    this.reveal('.vision-support__mark', { opacity: 0, scale: 0.97 }, 0.25, 0.95);

    // ------------------------------------------------------------------------
    // 11. FOOTER SECTION
    // ------------------------------------------------------------------------
    this.reveal('.footer__col', { opacity: 0, y: 24 }, 0.1, 0.85);

    // Riyadh skyline SVG line-drawing animation
    const skyline = this.layout.querySelector<SVGSVGElement>('svg.footer__skyline');
    if (skyline && !this.seen.has(skyline)) {
      this.seen.add(skyline);
      const paths = skyline.querySelectorAll('path');
      paths.forEach(path => {
        const length = path.getTotalLength ? path.getTotalLength() : 400;
        gsap.fromTo(
          path,
          { strokeDasharray: length, strokeDashoffset: length },
          {
            strokeDashoffset: 0,
            duration: 1.6,
            ease: 'power2.out',
            clearProps: 'strokeDasharray,strokeDashoffset',
            scrollTrigger: { trigger: skyline, start: 'top 90%', once: true }
          }
        );
      });
    }

    this.initDecorations();
  }

  /* --------------------------------------------------------------------------
     PARALLAX & FLOATING DECORATIONS
     -------------------------------------------------------------------------- */
  private initDecorations(): void {
    // Subtle medical floating elements & product idle bobbing
    const targets = this.root.querySelectorAll<HTMLElement>(
      '.about-vic__brand-mark, .facility-gallery__floating-v, .home-product__visual img'
    );

    targets.forEach(element => {
      if (this.seen.has(element)) return;
      this.seen.add(element);
      const isProduct = element.matches('.home-product__visual img');
      const float = gsap.to(element, {
        y: `-=${isProduct ? 4 : 8}`,
        duration: isProduct ? 3.4 : 4.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        paused: true
      });

      ScrollTrigger.create({
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: state => (state.isActive ? float.play() : float.pause())
      });
    });

    // Slow parallax on background textures and dividers (desktop only)
    if (!this.compact) {
      this.root
        .querySelectorAll<HTMLElement>(
          '.facility-gallery__pattern, .platform__bg, .hero__wave, .hero__wave-wrapper'
        )
        .forEach(element => {
          if (this.seen.has(element)) return;
          this.seen.add(element);
          gsap.fromTo(
            element,
            { y: -12 },
            {
              y: 12,
              ease: 'none',
              scrollTrigger: {
                trigger: element.parentElement || element,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.2
              }
            }
          );
        });
    }
  }

  /* --------------------------------------------------------------------------
     SMOOTH GALLERY SWAP TRANSITION
     -------------------------------------------------------------------------- */
  swapGallery(update: () => void): void {
    if (!this.context || this.galleryCommit) {
      update();
      return;
    }

    const grid = this.root.querySelector<HTMLElement>('.facility-gallery__grid');
    if (!grid) {
      update();
      return;
    }

    this.galleryCommit = update;
    this.context.add(() => {
      const currentPhotos = grid.querySelectorAll<HTMLElement>('.facility-gallery__photo');

      // Softly scale down and fade current photos
      this.galleryTween = gsap.to(currentPhotos, {
        opacity: 0.25,
        scale: 0.98,
        duration: 0.22,
        ease: 'power2.in',
        onComplete: () => {
          this.zone.run(update);
          this.galleryFrame = requestAnimationFrame(() => {
            this.galleryFrame = 0;
            if (this.destroyed) return;

            const newPhotos = this.root.querySelectorAll<HTMLElement>('.facility-gallery__photo');
            newPhotos.forEach(el => this.seen.add(el));

            // Next images scale in from 0.98 -> 1 with smooth ease
            this.context?.add(() => {
              gsap.fromTo(
                newPhotos,
                { opacity: 0.3, scale: 0.98 },
                {
                  opacity: 1,
                  scale: 1,
                  duration: 0.42,
                  stagger: 0.06,
                  ease: 'power2.out',
                  clearProps: 'opacity,transform'
                }
              );
            });
            this.galleryCommit = undefined;
          });
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     SECTION NAVIGATION (FLOATING UP / DOWN ARROWS)
     -------------------------------------------------------------------------- */
  scrollNext(): void {
    const sections = this.getOrderedSections();
    const currentScroll = this.lenis?.scroll ?? (typeof window !== 'undefined' ? window.scrollY : 0);
    const target = sections.find(sec => {
      const top = sec.getBoundingClientRect().top + window.scrollY;
      return top > currentScroll + 70;
    });

    if (target) {
      if (this.lenis) {
        this.lenis.scrollTo(target, { offset: -70, duration: 1.05 });
      } else {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  scrollPrev(): void {
    const sections = this.getOrderedSections();
    const currentScroll = this.lenis?.scroll ?? (typeof window !== 'undefined' ? window.scrollY : 0);
    const reversed = [...sections].reverse();
    const target = reversed.find(sec => {
      const top = sec.getBoundingClientRect().top + window.scrollY;
      return top < currentScroll - 70;
    });

    if (target) {
      if (this.lenis) {
        this.lenis.scrollTo(target, { offset: -70, duration: 1.05 });
      } else {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      if (this.lenis) {
        this.lenis.scrollTo(0, { duration: 1.05 });
      } else if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  scrollToTop(): void {
    if (this.lenis) {
      this.lenis.scrollTo(0, { duration: 1.15 });
    } else if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  private onScrollProgress(progress: number): void {
    if (this.progressFrame) return;
    this.progressFrame = requestAnimationFrame(() => {
      this.progressFrame = 0;
      const p = Math.min(1, Math.max(0, progress));
      this.scrollProgress.set(p);

      const btn = this.root.querySelector<HTMLElement>('.vic-scroll-top');
      if (btn) {
        if (p > 0.02) {
          btn.classList.add('is-visible');
        } else {
          btn.classList.remove('is-visible');
        }
        const bar = btn.querySelector<SVGCircleElement>('.vic-scroll-top__bar');
        if (bar) {
          const circumference = 131.95;
          bar.style.strokeDashoffset = `${circumference * (1 - p)}`;
        }
      }
    });
  }

  private getOrderedSections(): HTMLElement[] {
    if (typeof document === 'undefined') return [];
    const selectors = [
      '.hero',
      '#about-vic',
      '#platform',
      '#facility-gallery',
      '#home-product',
      '#latest-news',
      '#vision-support',
      'app-footer'
    ];
    const elements: HTMLElement[] = [];
    for (const sel of selectors) {
      const el = this.layout.querySelector<HTMLElement>(sel) || document.querySelector<HTMLElement>(sel);
      if (el && !elements.includes(el)) {
        elements.push(el);
      }
    }
    return elements;
  }

  private readonly scheduleRefresh = (): void => {
    this.refresh?.kill();
    this.refresh = gsap.delayedCall(0.25, () => {
      if (!this.destroyed && this.context) {
        if (this.lenis?.isScrolling) {
          this.scheduleRefresh();
          return;
        }
        this.lenis?.resize();
        ScrollTrigger.refresh();
      }
    });
  };

  private readonly onFocus = (event: FocusEvent): void => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const ancestors: HTMLElement[] = [];
    for (let el: HTMLElement | null = target; el && el !== this.layout; el = el.parentElement) {
      ancestors.push(el);
    }
    for (const tween of gsap.getTweensOf(ancestors)) {
      if (tween.repeat() === -1 || tween.scrollTrigger?.vars.scrub) continue;
      tween.progress(1);
    }
  };

  private cleanupMotion(): void {
    this.observer?.disconnect();
    this.resize?.disconnect();
    this.refresh?.kill();
    if (this.frame) cancelAnimationFrame(this.frame);
    if (this.galleryFrame) cancelAnimationFrame(this.galleryFrame);
    if (this.progressFrame) cancelAnimationFrame(this.progressFrame);
    this.frame = this.galleryFrame = this.progressFrame = 0;
    this.scrollProgress.set(0);
    this.galleryTween?.kill();
    this.galleryCommit = undefined;
    this.root.removeEventListener('load', this.scheduleRefresh, true);
    this.layout.removeEventListener('focusin', this.onFocus);
    this.cleanups.splice(0).forEach(cleanup => cleanup());
    this.lenis?.destroy();
    this.lenis = undefined;
    this.context?.revert();
    this.context = undefined;
    this.layout.classList.remove('vic-premium-motion');
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.media?.revert();
  }
}

