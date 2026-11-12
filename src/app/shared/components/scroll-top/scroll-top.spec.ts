import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScrollTopComponent } from './scroll-top';
import { SmoothScrollService } from '../../../core/services/smooth-scroll.service';
import { provideRouter } from '@angular/router';

describe('ScrollTopComponent', () => {
  let component: ScrollTopComponent;
  let fixture: ComponentFixture<ScrollTopComponent>;
  let scrollService: SmoothScrollService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScrollTopComponent],
      providers: [SmoothScrollService, provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(ScrollTopComponent);
    component = fixture.componentInstance;
    scrollService = TestBed.inject(SmoothScrollService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be hidden initially at the top of the page', () => {
    expect(component.isVisible()).toBeFalse();
    const btn = fixture.nativeElement.querySelector('.vic-scroll-top-btn');
    expect(btn.classList.contains('is-visible')).toBeFalse();
  });

  it('should become visible when user scrolls down', () => {
    scrollService.scrollProgress.set(0.25);
    fixture.detectChanges();

    expect(component.isVisible()).toBeTrue();
    const btn = fixture.nativeElement.querySelector('.vic-scroll-top-btn');
    expect(btn.classList.contains('is-visible')).toBeTrue();
  });

  it('should compute the stroke dash offset proportionally to scroll progress', () => {
    scrollService.scrollProgress.set(0.5);
    fixture.detectChanges();

    const expectedOffset = component.circumference * (1 - 0.5);
    expect(Math.round(component.dashOffset())).toBe(Math.round(expectedOffset));
  });

  it('should invoke scrollToTop on click', () => {
    spyOn(scrollService, 'scrollToTop');
    component.scrollToTop();
    expect(scrollService.scrollToTop).toHaveBeenCalled();
  });
});
