import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild, inject } from '@angular/core';
import { AboutLeader, LeaderSection } from '../../../../../core/models/about.model';
import { AboutService } from '../../../../../core/services/about.service';
import { TranslationService } from '../../../../../core/services/translation.service';
import { resolveImageUrl } from '../../../../../core/utils/image-url.util';
import { SectionHeadingPipe } from '../../../../../shared/pipes/section-heading.pipe';
import { localizeLeaderBadge, localizeLeaderBioSections, localizeLeaderName, localizeLeaderRole, localizeLeaderTitle } from '../../../../../shared/utils/leader-profile-localization';

@Component({
  selector: 'app-founding-partners',
  standalone: true,
  imports: [CommonModule, SectionHeadingPipe],
  templateUrl: './founding-partners.html',
  styleUrl: './founding-partners.css'
})
export class FoundingPartnersComponent implements AfterViewInit, OnInit, OnChanges, OnDestroy {
  private readonly aboutService = inject(AboutService);
  readonly translationService = inject(TranslationService);
  leaders: AboutLeader[] = [];
  leaderIndex = 0;
  cardsPerView = 3;
  @Input() profileOpen = false;
  @Output() viewProfile = new EventEmitter<AboutLeader>();
  @ViewChild('leadershipSection') private leadershipSection?: ElementRef<HTMLElement>;
  private autoPlayTimer: ReturnType<typeof setInterval> | null = null;
  private sectionObserver?: IntersectionObserver;
  private isSectionVisible = false;
  private touchStartX = 0;
  private touchEndX = 0;

  ngOnInit(): void {
    this.updateCardsPerView();
    this.loadLeaders();
  }

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') return;
    if (typeof IntersectionObserver === 'undefined') {
      this.isSectionVisible = true;
      this.startAutoPlay();
      return;
    }

    this.sectionObserver = new IntersectionObserver(([entry]) => {
      this.isSectionVisible = entry.isIntersecting;
      if (this.isSectionVisible) this.startAutoPlay();
      else this.stopAutoPlay();
    }, { threshold: 0.15 });

    const section = this.leadershipSection?.nativeElement;
    if (section) this.sectionObserver.observe(section);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['profileOpen']) return;
    if (this.profileOpen) this.stopAutoPlay();
    else this.startAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
    this.sectionObserver?.disconnect();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateCardsPerView();
    this.startAutoPlay();
  }

  @HostListener('window:storage', ['$event'])
  onAboutContentStorageChange(event: StorageEvent): void {
    if (event.key === 'vic_about_content_updated') this.loadLeaders();
  }

  get maxLeaderIndex(): number {
    return Math.max(0, this.leaders.length - this.cardsPerView);
  }

  get leaderPages(): number[] {
    return Array.from({ length: this.maxLeaderIndex + 1 }, (_, index) => index);
  }

  leaderName(leader: AboutLeader): string {
    return localizeLeaderName(leader, this.translationService.currentLang() === 'ar');
  }

  leaderTitle(leader: AboutLeader): string {
    return localizeLeaderTitle(leader, this.translationService.currentLang() === 'ar');
  }

  leaderRole(leader: AboutLeader): string {
    return localizeLeaderRole(leader, this.translationService.currentLang() === 'ar');
  }

  leaderBadge(leader: AboutLeader): string {
    return localizeLeaderBadge(leader, this.translationService.currentLang() === 'ar');
  }

  leaderBioSections(leader: AboutLeader): LeaderSection[] {
    return localizeLeaderBioSections(leader, this.translationService.currentLang() === 'ar');
  }

  openLeaderProfile(leader: AboutLeader, event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    this.stopAutoPlay();
    this.viewProfile.emit(leader);
  }

  imageUrl(path: string | null | undefined): string {
    return resolveImageUrl(path, 'home_banner.webp');
  }

  prevLeader(): void {
    this.leaderIndex = this.leaderIndex > 0 ? this.leaderIndex - 1 : this.maxLeaderIndex;
    this.startAutoPlay();
  }

  nextLeader(): void {
    this.leaderIndex = this.leaderIndex < this.maxLeaderIndex ? this.leaderIndex + 1 : 0;
  }

  goToLeader(index: number): void {
    this.leaderIndex = Math.min(Math.max(0, index), this.maxLeaderIndex);
    this.startAutoPlay();
  }

  startAutoPlay(): void {
    this.stopAutoPlay();
    if (typeof window !== 'undefined' && this.isSectionVisible && !this.profileOpen && this.leaders.length > this.cardsPerView) {
      this.autoPlayTimer = setInterval(() => this.nextLeader(), window.innerWidth <= 768 ? 4000 : 2000);
    }
  }

  stopAutoPlay(): void {
    if (this.autoPlayTimer) clearInterval(this.autoPlayTimer);
    this.autoPlayTimer = null;
  }

  onTouchStart(event: TouchEvent): void {
    this.stopAutoPlay();
    this.touchStartX = event.changedTouches[0].screenX;
  }

  onTouchEnd(event: TouchEvent): void {
    this.touchEndX = event.changedTouches[0].screenX;
    const diff = this.touchStartX - this.touchEndX;
    if (Math.abs(diff) > 45) diff > 0 ? this.nextLeader() : this.prevLeader();
    this.startAutoPlay();
  }

  private updateCardsPerView(): void {
    if (typeof window === 'undefined') return;
    this.cardsPerView = window.innerWidth <= 768 ? 1 : window.innerWidth <= 1024 ? 2 : 3;
    this.leaderIndex = Math.min(this.leaderIndex, this.maxLeaderIndex);
  }

  private loadLeaders(): void {
    this.aboutService.getLeaders({ status: 'Active' }).subscribe({
      next: response => {
        this.leaders = (response.leaders || []).map(leader => ({
          ...leader,
          bio_sections: this.normalizeBioSections(leader.bio_sections),
          bio_sections_ar: this.normalizeBioSections(leader.bio_sections_ar)
        }));
        this.updateCardsPerView();
        this.startAutoPlay();
      },
      error: () => {
        this.leaders = [];
        this.stopAutoPlay();
      }
    });
  }

  private normalizeBioSections(value: unknown): LeaderSection[] {
    let sections = value;
    if (typeof sections === 'string') {
      try {
        sections = JSON.parse(sections);
      } catch {
        return [];
      }
    }
    if (!Array.isArray(sections)) return [];

    return sections
      .filter((section): section is Record<string, unknown> => !!section && typeof section === 'object')
      .map(section => ({
        heading: typeof section['heading'] === 'string' ? section['heading'] : '',
        paragraphs: this.normalizeBioItems(section['paragraphs']),
        items: this.normalizeBioItems(section['items'])
      }))
      .filter(section => section.heading || section.paragraphs?.length || section.items?.length);
  }

  private normalizeBioItems(value: unknown): string[] {
    if (typeof value === 'string') return value.trim() ? [value] : [];
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  }

}
