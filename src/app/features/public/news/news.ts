import { Component, OnInit, signal, computed } from '@angular/core';
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

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './news.html',
  styleUrl: './news.css'
})
export class NewsComponent implements OnInit {
  // Category Filtering - matching Image 1 + "MOU"
  selectedCategory = signal<string>('All');
  searchQuery = signal<string>('');
  showAllNews = signal<boolean>(false);
  showAllPressReleases = signal<boolean>(false);

  // Newsletter Subscription state (matching uploaded design)
  newsletterEmail = signal<string>('');
  newsletterSubscribed = signal<boolean>(false);

  // Download notification toast
  downloadNotice = signal<string | null>(null);

  // Categories matching Image 1 plus "MOU" as requested
  readonly categories = NEWS_CATEGORIES;

  // All 11 Authentic News Articles fetched from https://vaccine.com.sa/news/
  readonly articles: NewsArticle[] = NEWS_ARTICLES;

  // Press Releases Dataset (Matching Image 2 bottom row)
  readonly pressReleases: PressRelease[] = PRESS_RELEASES;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
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

  // Filtered Latest News
  filteredArticles = computed(() => {
    const cat = this.selectedCategory();
    const query = this.searchQuery().trim().toLowerCase();

    return this.articles.filter(article => {
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

  // Displayed Latest News (4 on default matching Image 2, or all 11 if toggled)
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
      return this.articles.length + this.pressReleases.length;
    }
    const articleCount = this.articles.filter(
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

  // Navigate to dedicated article detail page
  navigateToArticle(slug: string): void {
    this.router.navigate(['/news', slug]);
  }

  // Newsletter Submit handler
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

  // Asset Download simulation / notice
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

  // Smooth scroll helper
  scrollToSection(elementId: string): void {
    if (typeof document !== 'undefined') {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }
}
