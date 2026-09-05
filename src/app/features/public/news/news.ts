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
import { resolveImageUrl } from '../../../core/utils/image-url.util';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './news.html',
  styleUrl: './news.css'
})
export class NewsComponent implements OnInit {
  private newsService = inject(NewsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  getImageUrl(url?: string | null): string {
    return resolveImageUrl(url);
  }

  // Category Filtering
  selectedCategory = signal<string>('All');
  searchQuery = signal<string>('');
  showAllNews = signal<boolean>(false);
  showAllPressReleases = signal<boolean>(false);

  // Newsletter Subscription state
  newsletterEmail = signal<string>('');
  newsletterSubscribed = signal<boolean>(false);

  // Download notification toast
  downloadNotice = signal<string | null>(null);

  readonly categories = NEWS_CATEGORIES;

  // Dynamic articles signal with static fallback
  articlesSignal = signal<NewsArticle[]>(NEWS_ARTICLES);

  // Press Releases Dataset
  readonly pressReleases: PressRelease[] = PRESS_RELEASES;

  ngOnInit(): void {
    this.fetchDynamicNews();

    this.route.fragment.subscribe(fragment => {
      if (fragment === 'press-releases') {
        setTimeout(() => {
          this.scrollToSection('press-releases');
        }, 150);
      } else if (fragment === 'stay-updated') {
        setTimeout(() => {
          this.scrollToSection('stay-updated');
        }, 150);
      }
    });
  }

  fetchDynamicNews(): void {
    this.newsService.getNews({ status: 'Published' }).subscribe({
      next: (res) => {
        if (res.articles && res.articles.length > 0) {
          const mappedArticles: NewsArticle[] = res.articles.map(a => ({
            id: a.slug || a.id?.toString() || '',
            slug: a.slug || a.id?.toString() || '',
            title: a.title,
            category: a.category,
            categories: a.categories || [a.category],
            date: a.date_str || '2025',
            formattedDate: a.formatted_date || a.date_str || '2025',
            readTime: a.read_time || '3 min read',
            image: a.image || 'news1.jpeg',
            badge: a.badge || a.category.toUpperCase(),
            summary: a.summary || '',
            contentHtml: a.content_html || '',
            officialLink: a.official_link || ''
          }));
          this.articlesSignal.set(mappedArticles);
        }
      },
      error: () => {
        // Fallback already in articlesSignal
      }
    });
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

  // Displayed Latest News (4 on default, or all if toggled)
  displayedArticles = computed(() => {
    const all = this.filteredArticles();
    if (this.showAllNews() || this.selectedCategory() !== 'All' || this.searchQuery()) {
      return all;
    }
    return all.slice(0, 4);
  });

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
  }

  getCategoryCount(category: string): number {
    if (category === 'All') {
      return this.articlesSignal().length + this.pressReleases.length;
    }
    const articleCount = this.articlesSignal().filter(
      a => a.category === category || (a.categories && a.categories.includes(category))
    ).length;
    const prCount = this.pressReleases.filter(
      p => p.category === category || (p.categories && p.categories.includes(category))
    ).length;
    return articleCount + prCount;
  }

  toggleViewAllNews(): void {
    this.showAllNews.update(v => !v);
  }

  toggleViewAllPressReleases(): void {
    this.showAllPressReleases.update(v => !v);
  }

  navigateToArticle(slug: string): void {
    this.router.navigate(['/news', slug]);
  }

  submitNewsletter(): void {
    const email = this.newsletterEmail().trim();
    if (!email || !email.includes('@')) {
      return;
    }
    this.newsletterSubscribed.set(true);
  }

  resetNewsletter(): void {
    this.newsletterEmail.set('');
    this.newsletterSubscribed.set(false);
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
