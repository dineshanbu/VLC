import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageMotionDirective } from './page-motion.directive';

@Component({
  imports: [PageMotionDirective],
  template: `<main appPageMotion>
    <h1>About VIC</h1><p>Company overview</p>
    <div class="news-card"><h2>News title</h2><img alt="Research" /></div>
    <div role="dialog"><p>Modal content</p></div>
    <img class="vic-floating-v" aria-hidden="true" />
  </main>`
})
class MotionHost {}

describe('PageMotionDirective', () => {
  let fixture: ComponentFixture<MotionHost>;
  let callback: IntersectionObserverCallback;
  let observer: jasmine.SpyObj<IntersectionObserver>;
  let preferenceChanged: () => void;
  let reduced: boolean;
  let animate: jasmine.Spy;
  let cancel: jasmine.Spy;

  beforeEach(() => {
    reduced = false;
    observer = jasmine.createSpyObj('IntersectionObserver', ['observe', 'unobserve', 'disconnect']);
    spyOn(window, 'IntersectionObserver').and.callFake(function (cb) {
      callback = cb;
      return observer;
    });
    spyOn(window, 'matchMedia').and.callFake(query => ({
      get matches() { return query.includes('reduced-motion') ? reduced : false; },
      addEventListener: (_: string, listener: () => void) => { preferenceChanged = listener; },
      removeEventListener: jasmine.createSpy('removeEventListener')
    } as unknown as MediaQueryList));
    cancel = jasmine.createSpy('cancel');
    animate = spyOn(HTMLElement.prototype, 'animate').and.callFake(() => ({
      cancel, onfinish: null
    } as unknown as Animation));
    fixture = TestBed.createComponent(MotionHost);
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  function enter(element: HTMLElement, isIntersecting = true): void {
    callback([{ target: element, isIntersecting } as unknown as IntersectionObserverEntry], observer);
  }

  it('reveals text and whole cards once, excluding dialog and nested card content', () => {
    const root: HTMLElement = fixture.nativeElement;
    const observed = observer.observe.calls.allArgs().map(args => args[0]);
    expect(observed).toContain(root.querySelector('h1')!);
    expect(observed).toContain(root.querySelector('.news-card')!);
    expect(observed).not.toContain(root.querySelector('h2')!);
    expect(observed).not.toContain(root.querySelector('[role="dialog"] p')!);
    const heading = root.querySelector<HTMLElement>('h1')!;
    enter(heading);
    expect(animate).toHaveBeenCalled();
    expect(observer.unobserve).toHaveBeenCalledWith(heading);
    expect((animate.calls.mostRecent().args[1] as KeyframeAnimationOptions).fill).toBe('backwards');
  });

  it('pauses floating elements outside the viewport', () => {
    const mark = fixture.nativeElement.querySelector('.vic-floating-v');
    enter(mark);
    expect(mark.classList.contains('vic-motion-in-view')).toBeTrue();
    enter(mark, false);
    expect(mark.classList.contains('vic-motion-in-view')).toBeFalse();
    expect(animate).not.toHaveBeenCalled();
  });

  it('registers content arriving later and releases removed route nodes', async () => {
    const main = fixture.nativeElement.querySelector('main');
    const oldHeading = main.querySelector('h1');
    oldHeading.remove();
    const heading = document.createElement('h2');
    heading.textContent = 'Loaded from API';
    main.appendChild(heading);
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    expect(observer.observe).toHaveBeenCalledWith(heading);
    expect(observer.unobserve).toHaveBeenCalledWith(oldHeading);
  });

  it('cancels entrances immediately when reduced motion is enabled', () => {
    enter(fixture.nativeElement.querySelector('h1'));
    reduced = true;
    preferenceChanged();
    expect(cancel).toHaveBeenCalled();
    animate.calls.reset();
    enter(fixture.nativeElement.querySelector('p'));
    expect(animate).not.toHaveBeenCalled();
  });

  it('makes focused content immediately available and disconnects on destruction', () => {
    const card = fixture.nativeElement.querySelector('.news-card');
    enter(card);
    card.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    expect(cancel).toHaveBeenCalled();
    fixture.destroy();
    expect(observer.disconnect).toHaveBeenCalled();
  });
});
