import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HomeMotionDirective } from './home-motion.directive';

@Component({
  imports: [HomeMotionDirective],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<app-public-layout><article appHomeMotion>
    <a class="navbar__logo">VIC</a>
    <section class="hero">
      <div class="hero__media-wrapper"><div class="hero__video"></div><div class="hero__gradient-overlay"></div></div>
      <div class="hero__banner-content"><div class="hero__banner-logo"></div><div class="hero__banner-divider"></div>
        <h1 class="hero__banner-title"><span class="motion-word">Science</span></h1>
        <button class="hero__btn-video">Film</button>
      </div><a class="hero__scroll" href="#about-vic">Explore</a>
    </section>
    <section id="about-vic"><p class="about-vic__desc">Original content</p></section>
    <div class="facility-gallery__grid"><button class="facility-gallery__photo">Photo</button></div>
  </article></app-public-layout>`
})
class MotionFixture {}

describe('HomeMotionDirective integration', () => {
  let fixture: ComponentFixture<MotionFixture>;
  let baseline: number;
  let reduced: boolean;

  beforeEach(() => {
    gsap.registerPlugin(ScrollTrigger);
    baseline = ScrollTrigger.getAll().length;
    reduced = false;
    const nativeMedia = window.matchMedia.bind(window);
    spyOn(window, 'matchMedia').and.callFake(query => {
      if (!query.includes('prefers-reduced-motion')) return nativeMedia(query);
      return {
        get matches() { return query.includes('no-preference') ? !reduced : reduced; },
        media: query, addListener: () => {}, removeListener: () => {},
        addEventListener: () => {}, removeEventListener: () => {}
      } as unknown as MediaQueryList;
    });
  });

  afterEach(() => fixture?.destroy());

  function create(): HomeMotionDirective {
    fixture = TestBed.createComponent(MotionFixture);
    fixture.detectChanges();
    return fixture.debugElement.query(By.directive(HomeMotionDirective)).injector.get(HomeMotionDirective);
  }

  it('connects Lenis and releases scroll triggers, ticker and styles on route teardown', () => {
    const add = spyOn(gsap.ticker, 'add').and.callThrough();
    const remove = spyOn(gsap.ticker, 'remove').and.callThrough();
    create();
    expect(document.documentElement.classList.contains('lenis')).toBeTrue();
    expect(ScrollTrigger.getAll().length).toBeGreaterThan(baseline);
    const ticker = add.calls.allArgs().map(args => args[0]);
    fixture.destroy();
    expect(document.documentElement.classList.contains('lenis')).toBeFalse();
    expect(ScrollTrigger.getAll().length).toBe(baseline);
    expect(ticker.some(callback => remove.calls.allArgs().some(args => args[0] === callback))).toBeTrue();
  });

  it('leaves content and gallery immediately usable with reduced motion', () => {
    reduced = true;
    const motion = create();
    const update = jasmine.createSpy('update');
    motion.swapGallery(update);
    expect(update).toHaveBeenCalledTimes(1);
    expect(document.documentElement.classList.contains('lenis')).toBeFalse();
    expect(ScrollTrigger.getAll().length).toBe(baseline);
    expect(fixture.nativeElement.querySelector('.about-vic__desc').style.opacity).toBe('');
  });

  it('removes the parent motion class even when Angular detaches the route first', () => {
    create();
    const layout = fixture.nativeElement.querySelector('app-public-layout');
    expect(layout.classList.contains('vic-premium-motion')).toBeTrue();
    fixture.nativeElement.querySelector('article').remove();
    fixture.destroy();
    expect(layout.classList.contains('vic-premium-motion')).toBeFalse();
  });

  it('reverts running motion when the system preference changes', () => {
    create();
    reduced = true;
    gsap.matchMediaRefresh();
    expect(document.documentElement.classList.contains('lenis')).toBeFalse();
    expect(ScrollTrigger.getAll().length).toBe(baseline);
    expect(fixture.nativeElement.querySelector('.about-vic__desc').style.opacity).toBe('');
  });

  it('registers late API content without repeatedly creating triggers', async () => {
    create();
    const root = fixture.nativeElement.querySelector('article');
    const news = document.createElement('a');
    news.className = 'news__card';
    news.textContent = 'Loaded story';
    const before = ScrollTrigger.getAll().length;
    root.append(news);
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    expect(ScrollTrigger.getAll().length).toBeGreaterThan(before);
    const added = ScrollTrigger.getAll().length;
    news.textContent = 'Translated story';
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    expect(ScrollTrigger.getAll().length).toBe(added);
  });

  it('stops document inertia while a modal is open and resumes when closed', async () => {
    create();
    const dialog = document.createElement('div');
    dialog.setAttribute('aria-modal', 'true');
    fixture.nativeElement.querySelector('article').append(dialog);
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    expect(document.documentElement.classList.contains('lenis-stopped')).toBeTrue();
    dialog.remove();
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    expect(document.documentElement.classList.contains('lenis-stopped')).toBeFalse();
  });

  it('supports section navigation via scrollNext, scrollPrev, and scrollToTop safely', () => {
    const motion = create();
    expect(() => motion.scrollNext()).not.toThrow();
    expect(() => motion.scrollPrev()).not.toThrow();
    expect(() => motion.scrollToTop()).not.toThrow();
    expect(motion.scrollProgress()).toBeGreaterThanOrEqual(0);
  });
});
