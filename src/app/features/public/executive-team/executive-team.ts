import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExecutiveTeamService } from '../../../core/services/executive-team.service';
import { ExecutiveTeamHero, ExecutiveTeamMember } from '../../../core/models/executive-team.model';
import { TranslationService } from '../../../core/services/translation.service';
import { resolveImageUrl } from '../../../core/utils/image-url.util';
import { SectionHeadingPipe } from '../../../shared/pipes/section-heading.pipe';

interface CommitteeMember {
  name: string;
  role: string;
  image?: string;
}

interface ExecutivePageCopy {
  chairmanLabel: string;
  chairmanQuote: string;
  quoteAttribution: string;
  rdiCalloutTitle: string;
  rdiDescription: string;
  associateLabel: string;
  readMoreButton: string;
  teamTitle: string;
  teamDescription: string;
  rdiTitle: string;
  rdiIntro: string;
}

const defaultExecutiveCopy: ExecutivePageCopy = {
  chairmanLabel: 'CHAIRMAN OF THE BOARD',
  chairmanQuote: 'Healthcare sovereignty begins with investing in innovation, local capability and scientific excellence.',
  quoteAttribution: 'Vaccine Industrial Company',
  rdiCalloutTitle: 'National Leadership',
  rdiDescription: 'Contributing to Saudi Arabia’s national innovation agenda through research, development and innovation.',
  associateLabel: 'ASSOCIATE CHIEF EXECUTIVE OFFICER',
  readMoreButton: 'Read More',
  teamTitle: 'EXECUTIVE LEADERSHIP TEAM',
  teamDescription: 'Experienced leaders overseeing manufacturing, quality, operations, commercial excellence and corporate strategy.',
  rdiTitle: 'Research, Development & Innovation (RDI) Supreme Committee',
  rdiIntro: 'The Research, Development & Innovation (RDI) Supreme Committee drives the Kingdom’s national innovation agenda, providing strategic direction to advance research, technology and industrial development across key sectors.'
};

const defaultCommitteeMembers: CommitteeMember[] = [
  { name: 'HRH Mohammed bin Salman', role: 'Chair of CEDA' },
  { name: 'HRH Abdulaziz bin Salman', role: 'Minister of Energy' },
  { name: 'HRH Abdullah Bin Bandar', role: 'Minister of National Guard' },
  { name: 'HE Abdulrahman Al-Fadhli', role: 'Minister of Environment, Water and Agriculture' },
  { name: 'HE Abdullah Alswaha', role: 'Minister of Communications and IT' },
  { name: 'HE Dr. Hamad Al Sheikh', role: 'Minister of Education' },
  { name: 'HE Bandar Al-Khorayef', role: 'Minister of Industry and Mineral Resources' },
  { name: 'HE Khaled Al-Faleh', role: 'Minister of Investment' },
  { name: 'HE Dr. Fahad Toonsi', role: 'Secretary of Strategic Management Committee' },
  { name: 'HE Ahmed Al-Ohali', role: 'Governor of GAMI' },
  { name: 'Yousef Al-Benyan', role: 'Minister of Education' },
  { name: 'Dr. Khaled Al-Mosa', role: 'Biotechnology and healthcare leader' },
  { name: 'HE Fahad Al-Rasheed', role: 'Committee Member' },
  { name: 'Tony Chan', role: 'Committee Member' }
];

@Component({
  selector: 'app-executive-team',
  standalone: true,
  imports: [CommonModule, SectionHeadingPipe],
  templateUrl: './executive-team.html',
  styleUrls: ['../about/about.css', '../public-theme.css', './executive-team.css']
})
export class ExecutiveTeamComponent implements OnInit, OnDestroy {
  private readonly teamService = inject(ExecutiveTeamService);
  readonly translationService = inject(TranslationService);
  readonly leaders = signal<ExecutiveTeamMember[]>([]);
  readonly isLoading = signal(true);
  readonly heroContent = signal<ExecutiveTeamHero | null>(null);
  heroContentLoaded = false;
  readonly pageCopy = signal<ExecutivePageCopy>(defaultExecutiveCopy);
  readonly committeeMembers = signal<CommitteeMember[]>(defaultCommitteeMembers);
  readonly isCommitteeModalOpen = signal(false);
  readonly selectedLeader = signal<ExecutiveTeamMember | null>(null);
  readonly teamSlide = signal(0);
  @ViewChild('teamCarousel') private teamCarousel?: ElementRef<HTMLElement>;

  ngOnInit(): void {
    this.loadDynamicContent();
  }

  private loadDynamicContent(): void {
    this.teamService.getContent().subscribe({
      next: response => {
        if (response.success) {
          this.heroContent.set(response.content?.hero || null);
          const pageContent = response.content?.page;
          if (pageContent && typeof pageContent === 'object') {
            this.pageCopy.set({ ...defaultExecutiveCopy, ...pageContent });
            this.committeeMembers.set(Array.isArray(pageContent['committee_members']) ? pageContent['committee_members'] : defaultCommitteeMembers);
          }
        }
        this.heroContentLoaded = true;
      },
      error: () => { this.heroContent.set(null); this.heroContentLoaded = true; }
    });

    this.teamService.getMembers('Active').subscribe({
      next: response => {
        this.leaders.set(response.success ? response.members : []);
        this.isLoading.set(false);
        this.startAutoCarousel();
      },
      error: () => {
        this.leaders.set([]);
        this.isLoading.set(false);
      }
    });
  }

  @HostListener('window:storage', ['$event'])
  onExecutiveContentStorageChange(event: StorageEvent): void {
    if (event.key === 'vic_executive_team_updated') this.loadDynamicContent();
  }

  heroText(field: 'badge' | 'title' | 'subtitle' | 'description'): string {
    const content = this.heroContent();
    const arabic = this.translationService.currentLang() === 'ar';
    const value = content?.[arabic ? `${field}_ar` as keyof ExecutiveTeamHero : field];
    if (typeof value === 'string') return value;
    if (field === 'badge') return arabic ? 'قيادتنا' : 'OUR LEADERSHIP';
    if (field === 'title') return arabic ? 'الإدارة العليا' : 'Senior Management';
    if (field === 'description') {
      return arabic
        ? 'فريق قيادي ملتزم بتطوير ابتكار اللقاحات وتعزيز الأمن الصحي الوطني وبناء مستقبل أكثر صحة للأجيال القادمة.'
        : 'A leadership team committed to advancing vaccine innovation, strengthening national health security and creating a healthier future for generations.';
    }
    return '';
  }

  heroImageUrl(): string {
    const hero = this.heroContent();
    const image = this.translationService.currentLang() === 'ar'
      ? (hero?.image_url_ar || hero?.image_url)
      : hero?.image_url;
    return image ? resolveImageUrl(image) : '';
  }

  leaderName(leader: ExecutiveTeamMember): string {
    return this.translationService.currentLang() === 'ar' ? leader.name_ar || leader.name : leader.name;
  }

  leaderTitle(leader: ExecutiveTeamMember): string {
    return this.translationService.currentLang() === 'ar' ? leader.title_ar || leader.title : leader.title;
  }

  leaderRole(leader: ExecutiveTeamMember): string {
    return this.translationService.currentLang() === 'ar' ? leader.role_ar || leader.role : leader.role;
  }

  leaderBadge(leader: ExecutiveTeamMember): string {
    const badge = this.translationService.currentLang() === 'ar' ? leader.badge_ar || leader.badge : leader.badge;
    return typeof badge === 'string' ? badge : '';
  }

  leaderBioSections(leader: ExecutiveTeamMember): NonNullable<ExecutiveTeamMember['bio_sections']> {
    const englishSections = Array.isArray(leader.bio_sections) ? leader.bio_sections : [];
    const localizedSections = this.translationService.currentLang() === 'ar'
      ? leader.bio_sections_ar
      : englishSections;
    if (this.hasBioBody(localizedSections)) return localizedSections!;
    return this.hasBioBody(englishSections) ? englishSections : localizedSections || englishSections;
  }

  private hasBioBody(sections: ExecutiveTeamMember['bio_sections'] | undefined): boolean {
    return Array.isArray(sections) && sections.some(section =>
      [...(section.paragraphs || []), ...(section.items || [])]
        .concat(section.ordered_items || [])
        .some(value => typeof value === 'string' && value.trim().length > 0)
    );
  }

  showLeaderBadge(leader: ExecutiveTeamMember): boolean {
    const badge = this.leaderBadge(leader).trim();
    return !!badge && !/^board\s+member$/i.test(badge) && !/^عضو\s+مجلس(?:\s+الإدارة)?$/i.test(badge);
  }

  imageUrl(path: string | undefined): string {
    if (!path) return '';
    return resolveImageUrl(path);
  }

  onImageError(event: Event): void {
    const image = event.currentTarget as HTMLImageElement;
    image.style.display = 'none';
    image.parentElement?.classList.add('image-missing');
  }

  onHeroImageError(event: Event): void {
    const image = event.currentTarget as HTMLImageElement;
    image.hidden = true;
  }

  initials(leader: ExecutiveTeamMember): string {
    return leader.initials || leader.name.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase();
  }

  committeeInitials(name: string): string {
    return name.split(' ').filter(Boolean).slice(-2).map(part => part[0]).join('').toUpperCase();
  }

  get chairman(): ExecutiveTeamMember | null {
    const leaders = this.leaders();
    return leaders.find(leader => /chairman|chair of the board|founder/i.test(`${leader.title} ${leader.badge}`)) || leaders[0] || null;
  }

  get associate(): ExecutiveTeamMember | null {
    const leaders = this.leaders().filter(leader => leader !== this.chairman);
    return leaders.find(leader => /associate|\bceo\b|chief executive|executive director/i.test(`${leader.title} ${leader.badge}`)) || leaders[0] || null;
  }

  get teamLeaders(): ExecutiveTeamMember[] {
    return this.leaders().filter(leader => leader !== this.chairman && leader !== this.associate);
  }

  openLeaderProfile(leader: ExecutiveTeamMember): void { this.selectedLeader.set(leader); }
  closeLeaderProfile(): void { this.selectedLeader.set(null); }

  private autoSlideInterval: any = null;

  startAutoCarousel(): void {
    if (typeof window === 'undefined') return;
    this.stopAutoCarousel();
    this.autoSlideInterval = setInterval(() => {
      const viewport = this.teamCarousel?.nativeElement;
      if (!viewport || viewport.scrollWidth <= viewport.clientWidth + 10) return;
      if (this.isCommitteeModalOpen() || this.selectedLeader()) return;

      const rect = viewport.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;

      this.scrollTeam(1);
    }, 5000);
  }

  stopAutoCarousel(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = null;
    }
  }

  ngOnDestroy(): void {
    this.stopAutoCarousel();
  }

  scrollTeam(direction: number): void {
    const total = this.teamLeaders.length;
    if (total <= 1) return;
    let next = this.teamSlide() + direction;
    if (next >= total) next = 0;
    if (next < 0) next = total - 1;
    this.goToTeamSlide(next);
  }

  goToTeamSlide(index: number): void {
    const viewport = this.teamCarousel?.nativeElement;
    const cards = viewport?.querySelectorAll<HTMLElement>('.executive-team-card');
    if (!viewport || !cards || !cards[index]) return;

    const targetCard = cards[index];
    const cardRect = targetCard.getBoundingClientRect();
    const viewportRect = viewport.getBoundingClientRect();
    const deltaX = cardRect.left - viewportRect.left;

    if (Math.abs(deltaX) > 1) {
      viewport.scrollBy({ left: deltaX, behavior: 'smooth' });
    }
    this.teamSlide.set(index);
  }

  onTeamCarouselScroll(): void {
    const viewport = this.teamCarousel?.nativeElement;
    const cards = viewport?.querySelectorAll<HTMLElement>('.executive-team-card');
    if (!viewport || !cards || cards.length === 0) return;
    const viewportRect = viewport.getBoundingClientRect();
    const viewportCenter = viewportRect.left + viewportRect.width / 2;
    let closestIndex = 0;
    let minDistance = Infinity;
    cards.forEach((card, idx) => {
      const cardRect = card.getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;
      const dist = Math.abs(cardCenter - viewportCenter);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = idx;
      }
    });
    this.teamSlide.set(closestIndex);
  }

  @HostListener('document:keydown.escape')
  closeModalsOnEscape(): void {
    this.isCommitteeModalOpen.set(false);
    this.selectedLeader.set(null);
  }
}
