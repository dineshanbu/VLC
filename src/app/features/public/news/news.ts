import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import {
  NewsArticle,
  PressRelease,
  NEWS_ARTICLES,
  PRESS_RELEASES,
  NEWS_CATEGORIES
} from '../../../core/data/news-data';
import { NewsService } from '../../../core/services/news.service';
import { NewsPageSettings } from '../../../core/models/news.model';
import { TranslationService } from '../../../core/services/translation.service';
import { resolveImageUrl } from '../../../core/utils/image-url.util';
import { environment } from '../../../../environments/environment';
import { VideoMediaGalleryComponent } from '../home/components/video-media-gallery/video-media-gallery';
import { SectionHeadingPipe } from '../../../shared/pipes/section-heading.pipe';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, VideoMediaGalleryComponent, SectionHeadingPipe],
  templateUrl: './news.html',
  styleUrls: ['./news.css', '../public-theme.css', '../mobile-hero.css']
})
export class NewsComponent implements OnInit {
  public translationService = inject(TranslationService);
  private newsService = inject(NewsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  pageSettings: NewsPageSettings = {
    hero_eyebrow: 'Latest from VIC', hero_eyebrow_ar: 'أحدث أخبار VIC',
    hero_title: 'Stories of Innovation. Impacting Lives.', hero_title_ar: 'قصص الابتكار... حياة أفضل.',
    hero_description: 'Explore the latest news, press releases, and media resources from Vaccine Industrial Company (VIC).',
    hero_description_ar: 'استكشف أحدث الأخبار والبيانات الصحفية والوسائط الإعلامية من شركة اللقاحات الصناعية (VIC).',
    hero_button_text: 'View Latest News', hero_button_text_ar: 'عرض آخر الأخبار', hero_image: ''
  };
  heroSettingsLoaded = false;

  resolveImg(path: string | undefined | null, fallback = 'home_banner.webp'): string {
    if (!path || !path.trim()) return fallback;
    // Uploaded hero files are served by the API router (/api/uploads). Using
    // the configured uploads host also works when the frontend and API differ.
    if (path.startsWith('/uploads/')) {
      const uploadsBase = environment.uploadsUrl.replace(/\/$/, '');
      if (/^https?:\/\//i.test(uploadsBase)) return `${uploadsBase}${path.slice('/uploads'.length)}`;
      return `${environment.apiUrl.replace(/\/$/, '')}${path}`;
    }
    const resolved = resolveImageUrl(path, fallback);
    return resolved || fallback;
  }

  heroImageUrl(): string {
    const path = this.translationService.currentLang() === 'ar'
      ? (this.pageSettings.hero_image_ar || this.pageSettings.hero_image)
      : this.pageSettings.hero_image;
    return path ? this.resolveImg(path, '') : '';
  }

  onHeroImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (!img) return;
    const storedPath = (this.translationService.currentLang() === 'ar'
      ? (this.pageSettings.hero_image_ar || this.pageSettings.hero_image)
      : this.pageSettings.hero_image) || '';
    if (storedPath.startsWith('/uploads/')) {
      const apiBase = environment.apiUrl.replace(/\/$/, '');
      const uploadsBase = environment.uploadsUrl.replace(/\/$/, '');
      const serverBase = environment.serverUrl.replace(/\/$/, '');
      const suffix = storedPath.slice('/uploads'.length);
      const candidates = [
        /^https?:\/\//i.test(uploadsBase) ? `${uploadsBase}${suffix}` : '',
        `${apiBase}${storedPath}`,
        `${serverBase}${storedPath}`,
        typeof window !== 'undefined' ? `${window.location.origin}${storedPath}` : ''
      ].filter((url, index, all): url is string => !!url && url !== img.src && all.indexOf(url) === index);
      const nextIndex = Number(img.dataset['heroFallbackIndex'] || 0);
      if (candidates[nextIndex]) {
        img.dataset['heroFallbackIndex'] = String(nextIndex + 1);
        img.src = candidates[nextIndex];
        return;
      }
    }
    img.style.display = 'none';
  }

  readonly fallbackImages = [
    'news1.jpeg',
    'construction_milestone_oct.jpg',
    'news2.jpg',
    'news3.jpg',
    'news4.jpg'
  ];

  getImageUrl(url?: string | null, index = 0): string {
    const fallback = this.fallbackImages[index % this.fallbackImages.length];
    if (!url || !url.trim()) return fallback;
    const resolved = resolveImageUrl(url, fallback);
    return resolved || fallback;
  }

  onImgError(event: Event, index = 0): void {
    const img = event.target as HTMLImageElement;
    if (!img) return;
    const fallback = this.fallbackImages[index % this.fallbackImages.length];
    if (img.getAttribute('data-failed') !== 'true') {
      img.setAttribute('data-failed', 'true');
      img.src = fallback;
    }
  }

  // Category Filtering
  selectedCategory = signal<string>('All');
  searchQuery = signal<string>('');
  newsPage = signal<number>(1);
  readonly newsPageSize = 4;
  showAllPressReleases = signal<boolean>(false);

  // Download notification toast
  downloadNotice = signal<string | null>(null);

  readonly categories = NEWS_CATEGORIES;

  // Dynamic articles signal with static fallback
  articlesSignal = signal<NewsArticle[]>(NEWS_ARTICLES);

  // Press Releases Dataset
  readonly pressReleases: PressRelease[] = PRESS_RELEASES;

  ngOnInit(): void {
    this.fetchDynamicNews();
    this.newsService.getPageSettings().subscribe({
      next: response => { if (response.success && response.settings) this.pageSettings = { ...this.pageSettings, ...response.settings }; this.heroSettingsLoaded = true; },
      error: () => { this.heroSettingsLoaded = true; }
    });

    this.route.fragment.subscribe(fragment => {
      if (fragment === 'press-releases' || fragment === 'latest-news-section') {
        setTimeout(() => {
          this.scrollToSection('latest-news-section');
        }, 150);
      }
    });
  }

  fetchDynamicNews(): void {
    this.newsService.getNews({ status: 'Published' }).subscribe({
      next: (res) => {
        if (res.articles && res.articles.length > 0) {
          const valid = res.articles.filter(a => a && a.title);
          if (valid.length > 0) {
            const mappedArticles: NewsArticle[] = [...valid]
              .sort((a, b) => this.articleTimestamp(b) - this.articleTimestamp(a))
              .map((a, idx) => ({
                id: a.slug || a.id?.toString() || '',
                slug: a.slug || a.id?.toString() || '',
                title: a.title,
                title_ar: a.title_ar || '',
                category: a.category,
                categories: a.categories || [a.category],
                date: a.date_str || '2025',
                formattedDate: a.formatted_date || a.date_str || '2025',
                readTime: a.read_time || '3 min read',
                image: a.image?.trim() ? a.image.trim() : this.fallbackImages[idx % this.fallbackImages.length],
                badge: a.badge || a.category?.toUpperCase() || 'NEWS',
                summary: a.summary || '',
                summaryAr: a.summary_ar || '',
                contentHtml: a.content_html || '',
                contentHtmlAr: a.content_html_ar || '',
                officialLink: a.official_link || ''
              }));
            this.articlesSignal.set(mappedArticles);
          }
        }
      },
      error: () => {
        // Fallback already in articlesSignal
      }
    });
  }

  private articleTimestamp(article: { date_str?: string; formatted_date?: string; created_at?: string; id?: number }): number {
    const candidates = [article.date_str, article.formatted_date, article.created_at];
    for (const value of candidates) {
      if (!value?.trim()) continue;
      const isoDate = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
      const timestamp = isoDate
        ? Date.UTC(Number(isoDate[1]), Number(isoDate[2]) - 1, Number(isoDate[3]))
        : Date.parse(value);
      if (Number.isFinite(timestamp)) return timestamp;
    }
    return Number(article.id || 0);
  }

  // Filtered Latest News
  filteredArticles = computed(() => {
    const cat = this.selectedCategory();
    const query = this.searchQuery().trim().toLowerCase();

    return this.articlesSignal().filter(article => {
      const matchesCategory =
        cat === 'All' ||
        article.category === cat ||
        (article.categories && article.categories.includes(cat));

      const matchesQuery =
        !query ||
        article.title.toLowerCase().includes(query) ||
        article.summary.toLowerCase().includes(query) ||
        article.category.toLowerCase().includes(query);

      return matchesCategory && matchesQuery;
    });
  });

  // Displayed Latest News (four cards per page)
  displayedArticles = computed(() => {
    const all = this.filteredArticles();
    const start = (this.newsPage() - 1) * this.newsPageSize;
    return all.slice(start, start + this.newsPageSize);
  });

  readonly newsPageCount = computed(() =>
    Math.max(1, Math.ceil(this.filteredArticles().length / this.newsPageSize))
  );

  readonly newsPages = computed(() =>
    Array.from({ length: this.newsPageCount() }, (_, index) => index + 1)
  );

  readonly hasMoreNews = computed(() => this.newsPage() < this.newsPageCount());

  // Filtered Press Releases
  filteredPressReleases = computed(() => {
    const cat = this.selectedCategory();
    const query = this.searchQuery().trim().toLowerCase();

    return this.pressReleases.filter(pr => {
      const matchesCategory =
        cat === 'All' ||
        pr.category === cat ||
        (pr.categories && pr.categories.includes(cat));

      const matchesQuery =
        !query ||
        pr.title.toLowerCase().includes(query) ||
        pr.summary.toLowerCase().includes(query);

      return matchesCategory && matchesQuery;
    });
  });

  // Displayed Press Releases
  displayedPressReleases = computed(() => {
    const all = this.filteredPressReleases();
    if (this.showAllPressReleases() || this.selectedCategory() !== 'All' || this.searchQuery()) {
      return all;
    }
    return all.slice(0, 4);
  });

  setCategory(category: string): void {
    this.selectedCategory.set(category);
    this.newsPage.set(1);
  }

  getCategoryCount(category: string): number {
    if (category === 'All') {
      return this.articlesSignal().length;
    }
    return this.articlesSignal().filter(
      a => a.category === category || (a.categories && a.categories.includes(category))
    ).length;
  }

  showMoreNews(): void {
    if (this.hasMoreNews()) this.newsPage.update(page => page + 1);
  }

  goToNewsPage(page: number): void {
    this.newsPage.set(Math.min(Math.max(1, page), this.newsPageCount()));
  }

  previousNewsPage(): void {
    this.goToNewsPage(this.newsPage() - 1);
  }

  nextNewsPage(): void {
    this.goToNewsPage(this.newsPage() + 1);
  }

  toggleViewAllPressReleases(): void {
    this.showAllPressReleases.update(v => !v);
  }

  navigateToArticle(slug: string): void {
    this.router.navigate(['/news', slug]);
  }

  downloadAsset(fileName: string, downloadUrl: string): void {
    this.downloadNotice.set(`Downloading ${fileName}...`);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      this.downloadNotice.set(null);
    }, 3500);
  }

  scrollToSection(elementId: string): void {
    if (typeof document !== 'undefined') {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }
}
