import { Component, OnInit, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NewsService } from '../../../core/services/news.service';
import { AdminNewsArticle } from '../../../core/models/news.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { resolveImageUrl } from '../../../core/utils/image-url.util';

@Component({
  selector: 'app-news-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './news-management.html',
  styleUrl: './news-management.css'
})
export class NewsManagementComponent implements OnInit {
  private newsService = inject(NewsService);
  private sanitizer = inject(DomSanitizer);

  getImageUrl(url?: string | null): string {
    return resolveImageUrl(url);
  }

  @ViewChild('visualEditor') visualEditorRef?: ElementRef<HTMLDivElement>;

  articles = signal<AdminNewsArticle[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  // Search & Filter
  searchTerm = signal<string>('');
  selectedCategory = signal<string>('All');
  selectedStatus = signal<string>('All');

  // Categories list
  readonly categories = [
    'Company Updates',
    'Partnerships',
    'MOU',
    'Research & Innovation',
    'Manufacturing',
    'Events',
    'Awards & Recognition'
  ];

  // Modal State
  isModalOpen = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  
  // Editor mode: 'visual' or 'html'
  editorMode = signal<'visual' | 'html'>('visual');

  // Preview Mode in Modal: 'editor' or 'preview'
  activeModalTab = signal<'editor' | 'preview'>('editor');
  previewDevice = signal<'desktop' | 'tablet' | 'mobile'>('desktop');

  currentArticle = signal<AdminNewsArticle>({
    title: '',
    category: 'Company Updates',
    summary: '',
    content_html: '',
    badge: 'NEWS',
    read_time: '3 min read',
    status: 'Published',
    official_link: ''
  });

  selectedFile: File | null = null;
  imagePreviewUrl = signal<string | null>(null);

  // Standalone Quick Preview Modal
  isPreviewModalOpen = signal<boolean>(false);
  previewArticle = signal<AdminNewsArticle | null>(null);

  // Delete modal
  isDeleteModalOpen = signal<boolean>(false);
  articleToDelete = signal<AdminNewsArticle | null>(null);

  ngOnInit(): void {
    this.loadNews();
  }

  loadNews(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.newsService.getNews({
      search: this.searchTerm(),
      category: this.selectedCategory(),
      status: this.selectedStatus()
    }).subscribe({
      next: (res) => {
        this.articles.set(res.articles || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('Failed to load news articles from database.');
      }
    });
  }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.selectedFile = null;
    this.imagePreviewUrl.set(null);
    this.activeModalTab.set('editor');
    this.editorMode.set('visual');
    this.currentArticle.set({
      title: '',
      category: 'Company Updates',
      summary: '',
      content_html: '<p>Write your detailed article announcement here...</p>',
      badge: 'COMPANY UPDATE',
      read_time: '3 min read',
      status: 'Published',
      official_link: ''
    });
    this.isModalOpen.set(true);
    setTimeout(() => this.syncVisualEditorFromHtml(), 100);
  }

  openEditModal(article: AdminNewsArticle): void {
    this.isEditing.set(true);
    this.selectedFile = null;
    this.activeModalTab.set('editor');
    this.editorMode.set('visual');
    const imgUrl = article.image ? (article.image.startsWith('http') || article.image.startsWith('/') ? article.image : `/${article.image}`) : null;
    this.imagePreviewUrl.set(imgUrl);
    this.currentArticle.set({ ...article });
    this.isModalOpen.set(true);
    setTimeout(() => this.syncVisualEditorFromHtml(), 100);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.isEditing.set(false);
  }

  // Visual Editor Actions
  execCmd(command: string, value: string | undefined = undefined): void {
    document.execCommand(command, false, value);
    this.syncHtmlFromVisualEditor();
  }

  formatBlock(tag: string): void {
    document.execCommand('formatBlock', false, `<${tag}>`);
    this.syncHtmlFromVisualEditor();
  }

  insertLink(): void {
    const url = prompt('Enter the link URL (e.g. https://example.com):');
    if (url) {
      document.execCommand('createLink', false, url);
      this.syncHtmlFromVisualEditor();
    }
  }

  insertImagePrompt(): void {
    const url = prompt('Enter image URL:');
    if (url) {
      document.execCommand('insertImage', false, url);
      this.syncHtmlFromVisualEditor();
    }
  }

  insertCallout(): void {
    const quote = prompt('Enter callout quote:');
    if (quote) {
      const html = `<blockquote class="editor-quote"><p>${quote}</p></blockquote>`;
      document.execCommand('insertHTML', false, html);
      this.syncHtmlFromVisualEditor();
    }
  }

  onVisualEditorInput(): void {
    this.syncHtmlFromVisualEditor();
  }

  syncHtmlFromVisualEditor(): void {
    if (this.visualEditorRef?.nativeElement) {
      const html = this.visualEditorRef.nativeElement.innerHTML;
      this.currentArticle.update(a => ({ ...a, content_html: html }));
    }
  }

  syncVisualEditorFromHtml(): void {
    if (this.visualEditorRef?.nativeElement) {
      this.visualEditorRef.nativeElement.innerHTML = this.currentArticle().content_html || '';
    }
  }

  toggleEditorMode(mode: 'visual' | 'html'): void {
    if (mode === 'html') {
      this.syncHtmlFromVisualEditor();
    } else {
      this.syncVisualEditorFromHtml();
    }
    this.editorMode.set(mode);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviewUrl.set(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  saveArticle(): void {
    if (this.editorMode() === 'visual') {
      this.syncHtmlFromVisualEditor();
    }

    const article = this.currentArticle();
    if (!article.title) {
      alert('Please enter article title.');
      return;
    }

    this.isSubmitting.set(true);
    const formData = new FormData();
    formData.append('title', article.title);
    formData.append('category', article.category);
    formData.append('summary', article.summary || '');
    formData.append('content_html', article.content_html || '');
    formData.append('badge', article.badge || article.category.toUpperCase());
    formData.append('read_time', article.read_time || '3 min read');
    formData.append('status', article.status || 'Published');
    if (article.official_link) formData.append('official_link', article.official_link);

    if (this.selectedFile) {
      formData.append('imageFile', this.selectedFile);
    }

    if (this.isEditing() && article.id) {
      this.newsService.updateNews(article.id, formData).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.closeModal();
          this.showSuccess('News article updated successfully in database.');
          this.loadNews();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          alert(err.error?.message || 'Failed to update article.');
        }
      });
    } else {
      this.newsService.createNews(formData).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.closeModal();
          this.showSuccess('News article saved & published successfully.');
          this.loadNews();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          alert(err.error?.message || 'Failed to create article.');
        }
      });
    }
  }

  // Quick Standalone Preview Modal
  openQuickPreview(article: AdminNewsArticle): void {
    this.previewArticle.set(article);
    this.isPreviewModalOpen.set(true);
  }

  closeQuickPreview(): void {
    this.isPreviewModalOpen.set(false);
    this.previewArticle.set(null);
  }

  getSafeHtml(html?: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html || '<p>No content preview available</p>');
  }

  confirmDelete(article: AdminNewsArticle): void {
    this.articleToDelete.set(article);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.articleToDelete.set(null);
  }

  deleteArticle(): void {
    const article = this.articleToDelete();
    if (!article || !article.id) return;

    this.newsService.deleteNews(article.id).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.showSuccess('Article removed from database.');
        this.loadNews();
      },
      error: (err) => {
        this.closeDeleteModal();
        alert(err.error?.message || 'Failed to delete article.');
      }
    });
  }

  private showSuccess(msg: string): void {
    this.successMessage.set(msg);
    setTimeout(() => this.successMessage.set(''), 4000);
  }
}
