import { Component, OnInit, OnDestroy, signal, computed, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import {
  NewsArticle,
  getArticleBySlug,
  getRelatedArticles,
  NEWS_ARTICLES
} from '../../../../core/data/news-data';
import { NewsService } from '../../../../core/services/news.service';
import { resolveImageUrl } from '../../../../core/utils/image-url.util';

@Component({
  selector: 'app-news-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './news-detail.html',
  styleUrl: './news-detail.css',
  encapsulation: ViewEncapsulation.None
})
export class NewsDetailComponent implements OnInit, OnDestroy {
  private routeSub?: Subscription;
  private sanitizer = inject(DomSanitizer);
  private newsService = inject(NewsService);

  getImageUrl(url?: string | null): string {
    return resolveImageUrl(url);
  }

  slug = signal<string>('');
  article = signal<NewsArticle | undefined>(undefined);
  relatedArticles = signal<NewsArticle[]>([]);
  copiedToast = signal<boolean>(false);

  sanitizedHtml = computed<SafeHtml>(() => {
    const raw = this.article()?.contentHtml || '';
    return this.sanitizer.bypassSecurityTrustHtml(raw);
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe(params => {
      const slugParam = params.get('slug') || '';
      this.slug.set(slugParam);
      this.loadArticle(slugParam);
      this.scrollToTop();
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  private loadArticle(slug: string): void {
    // Try fetching from database first
    this.newsService.getNewsBySlugOrId(slug).subscribe({
      next: (res) => {
        if (res.article) {
          const a = res.article;
          const mapped: NewsArticle = {
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
          };
          this.article.set(mapped);
          this.relatedArticles.set(getRelatedArticles(slug, 3));
        }
      },
      error: () => {
        // Fallback to static articles
        const found = getArticleBySlug(slug);
        if (found) {
          this.article.set(found);
          this.relatedArticles.set(getRelatedArticles(slug, 3));
        } else if (NEWS_ARTICLES.length > 0) {
          this.article.set(NEWS_ARTICLES[0]);
          this.relatedArticles.set(getRelatedArticles(NEWS_ARTICLES[0].slug, 3));
        }
      }
    });
  }

  copyArticleLink(): void {
    if (typeof window !== 'undefined' && navigator?.clipboard) {
      navigator.clipboard.writeText(window.location.href).then(() => {
        this.copiedToast.set(true);
        setTimeout(() => {
          this.copiedToast.set(false);
        }, 3000);
      });
    }
  }

  private scrollToTop(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
