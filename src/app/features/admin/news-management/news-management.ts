import { Component, OnInit, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NewsService } from '../../../core/services/news.service';
import { AdminNewsArticle, NewsPageSettings } from '../../../core/models/news.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { resolveImageUrl } from '../../../core/utils/image-url.util';
import { environment } from '../../../../environments/environment';
import { MediaImagePickerComponent } from '../../../shared/components/media-image-picker/media-image-picker';

@Component({
  selector: 'app-news-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MediaImagePickerComponent],
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
  heroSettings: NewsPageSettings = {
    hero_eyebrow: 'Latest from VIC', hero_eyebrow_ar: 'أحدث أخبار VIC',
    hero_title: 'Stories of Innovation. Impacting Lives.', hero_title_ar: 'قصص الابتكار... حياة أفضل.',
    hero_description: 'Explore the latest news, press releases, and media resources from Vaccine Industrial Company (VIC).',
    hero_description_ar: 'استكشف أحدث الأخبار والبيانات الصحفية والوسائط الإعلامية من شركة اللقاحات الصناعية (VIC).',
    hero_button_text: 'View Latest News', hero_button_text_ar: 'عرض آخر الأخبار', hero_image: 'home_banner.webp', hero_image_ar: 'home_banner.webp'
  };
  heroSaving = signal(false);
  heroImageFile: File | null = null;
  heroImagePreview = signal<string | null>(null);
  heroImageFileAr: File | null = null;
  heroImagePreviewAr = signal<string | null>(null);

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
  activeContentLanguage = signal<'en' | 'ar'>('en');
  isTranslatingArabic = signal(false);
  translationNotice = signal('');
  previewDevice = signal<'desktop' | 'tablet' | 'mobile'>('desktop');

  currentArticle = signal<AdminNewsArticle>({
    title: '',
    title_ar: '',
    category: 'Company Updates',
    summary: '',
    summary_ar: '',
    content_html: '',
    content_html_ar: '',
    badge: 'NEWS',
    read_time: '3 min read',
    status: 'Published',
    official_link: ''
  });

  selectedFile: File | null = null;
  imagePreviewUrl = signal<string | null>(null);
  isPastingImage = signal(false);
  pastedImageStatus = signal('');
  pastedImageStatusType = signal<'uploading' | 'success' | 'error'>('uploading');

  // Standalone Quick Preview Modal
  isPreviewModalOpen = signal<boolean>(false);
  previewArticle = signal<AdminNewsArticle | null>(null);

  // Delete modal
  isDeleteModalOpen = signal<boolean>(false);
  articleToDelete = signal<AdminNewsArticle | null>(null);

  ngOnInit(): void {
    this.loadNews();
    this.loadHeroSettings();
  }

  loadHeroSettings(): void {
    this.newsService.getPageSettings().subscribe({
      next: ({ settings }) => this.heroSettings = { ...this.heroSettings, ...settings },
      error: () => this.errorMessage.set('Could not load the News & Media banner settings.')
    });
  }

  onHeroImageChange(event: Event, language: 'en' | 'ar'): void {
    const file = (event.target as HTMLInputElement).files?.[0] || null;
    if (language === 'ar') {
      if (this.heroImagePreviewAr()) URL.revokeObjectURL(this.heroImagePreviewAr()!);
      this.heroImageFileAr = file;
      this.heroImagePreviewAr.set(file ? URL.createObjectURL(file) : null);
    } else {
      if (this.heroImagePreview()) URL.revokeObjectURL(this.heroImagePreview()!);
      this.heroImageFile = file;
      this.heroImagePreview.set(file ? URL.createObjectURL(file) : null);
    }
  }

  selectHeroImageFromLibrary(language: 'en' | 'ar', path: string): void {
    if (language === 'ar') {
      this.heroSettings.hero_image_ar = path; this.heroImageFileAr = null;
      if (this.heroImagePreviewAr()) URL.revokeObjectURL(this.heroImagePreviewAr()!);
      this.heroImagePreviewAr.set(null);
    } else {
      this.heroSettings.hero_image = path; this.heroImageFile = null;
      if (this.heroImagePreview()) URL.revokeObjectURL(this.heroImagePreview()!);
      this.heroImagePreview.set(null);
    }
  }

  heroImageUrl(language: 'en' | 'ar' = 'en'): string {
    if (language === 'ar' && this.heroImagePreviewAr()) return this.heroImagePreviewAr()!;
    if (language === 'en' && this.heroImagePreview()) return this.heroImagePreview()!;
    const image = language === 'ar'
      ? (this.heroSettings.hero_image_ar || this.heroSettings.hero_image || 'home_banner.webp')
      : (this.heroSettings.hero_image || 'home_banner.webp');
    if (image.startsWith('/uploads/')) {
      const uploadsBase = environment.uploadsUrl.replace(/\/$/, '');
      return /^https?:\/\//i.test(uploadsBase)
        ? `${uploadsBase}${image.slice('/uploads'.length)}`
        : `${environment.apiUrl.replace(/\/$/, '')}${image}`;
    }
    return this.getImageUrl(image);
  }

  saveHeroSettings(): void {
    this.heroSaving.set(true);
    const data = new FormData();
    ['hero_eyebrow', 'hero_eyebrow_ar', 'hero_title', 'hero_title_ar', 'hero_description', 'hero_description_ar', 'hero_button_text', 'hero_button_text_ar'].forEach(key => {
      data.append(key, String(this.heroSettings[key as keyof NewsPageSettings] || ''));
    });
    if (this.heroImageFile) data.append('hero_image', this.heroImageFile);
    else data.append('hero_image', this.heroSettings.hero_image || 'home_banner.webp');
    data.append('hero_image_ar', this.heroSettings.hero_image_ar || this.heroSettings.hero_image || 'home_banner.webp');
    if (this.heroImageFileAr) data.append('hero_image_ar', this.heroImageFileAr);
    this.newsService.updatePageSettings(data).subscribe({
      next: ({ settings }) => {
        this.heroSettings = { ...this.heroSettings, ...settings };
        this.heroImageFile = null;
        this.heroImageFileAr = null;
        if (this.heroImagePreview()) URL.revokeObjectURL(this.heroImagePreview()!);
        if (this.heroImagePreviewAr()) URL.revokeObjectURL(this.heroImagePreviewAr()!);
        this.heroImagePreview.set(null);
        this.heroImagePreviewAr.set(null);
        this.successMessage.set('News & Media banner saved.');
        this.heroSaving.set(false);
      },
      error: error => {
        this.errorMessage.set(error.error?.message || 'Could not save the News & Media banner.');
        this.heroSaving.set(false);
      }
    });
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
    this.activeContentLanguage.set('en');
    this.pastedImageStatus.set('');
    this.editorMode.set('visual');
    this.currentArticle.set({
      title: '',
      title_ar: '',
      category: 'Company Updates',
      summary: '',
      summary_ar: '',
      content_html: '',
      content_html_ar: '',
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
    this.activeContentLanguage.set('en');
    this.pastedImageStatus.set('');
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

  async onVisualEditorPaste(event: ClipboardEvent): Promise<void> {
    const clipboard = event.clipboardData;
    if (!clipboard || !this.visualEditorRef?.nativeElement) return;

    const imageFile = Array.from(clipboard.files).find(file => file.type.startsWith('image/'))
      || Array.from(clipboard.items).map(item => item.getAsFile()).find(file => !!file && file.type.startsWith('image/'));
    const html = clipboard.getData('text/html');
    const dataImage = html.match(/<img[^>]+src=["'](data:image\/[^"']+)["']/i)?.[1];
    if (!imageFile && !dataImage) return;

    event.preventDefault();
    if (this.isPastingImage()) {
      this.pastedImageStatus.set('An image upload is already in progress. Please wait.');
      this.pastedImageStatusType.set('error');
      return;
    }

    const editor = this.visualEditorRef.nativeElement;
    const placeholderId = `pasted-image-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.insertHtmlAtCursor(`<span class="inline-image-upload-placeholder" data-image-upload-id="${placeholderId}">Uploading image…</span>`);
    this.syncHtmlFromVisualEditor();
    this.isPastingImage.set(true);
    this.pastedImageStatus.set('Uploading image to Media & Upload…');
    this.pastedImageStatusType.set('uploading');

    try {
      const file = imageFile || this.dataUrlToImageFile(dataImage!);
      const imageUrl = await this.uploadInlineImage(file);
      const mediaUrl = this.resolvePastedImageUrl(imageUrl);
      const placeholder = editor.querySelector(`[data-image-upload-id="${placeholderId}"]`);
      if (placeholder) {
        const image = document.createElement('img');
        image.src = mediaUrl;
        image.alt = file.name || 'Pasted article image';
        placeholder.replaceWith(image);
      } else {
        this.insertHtmlAtCursor(`<img src="${this.escapeHtml(mediaUrl)}" alt="${this.escapeHtml(file.name || 'Pasted article image')}" />`);
      }
      this.syncHtmlFromVisualEditor();
      this.pastedImageStatus.set('Image uploaded to Media & Upload and added to the article.');
      this.pastedImageStatusType.set('success');
    } catch (error: any) {
      editor.querySelector(`[data-image-upload-id="${placeholderId}"]`)?.remove();
      this.syncHtmlFromVisualEditor();
      const message = error?.error?.message
        || (error?.status === 404
          ? 'Image paste upload is not available on this server yet. Deploy the latest backend and try again.'
          : 'Could not upload the pasted image. Please check your connection and try again.');
      this.pastedImageStatus.set(message);
      this.pastedImageStatusType.set('error');
    } finally {
      this.isPastingImage.set(false);
    }
  }

  private resolvePastedImageUrl(url: string): string {
    if (/^https?:\/\//i.test(url)) return url;
    return `${environment.apiUrl.replace(/\/$/, '')}${url.startsWith('/') ? url : `/${url}`}`;
  }

  private uploadInlineImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('imageFile', file, file.name || 'pasted-image.png');
    return new Promise((resolve, reject) => {
      this.newsService.uploadInlineImage(formData).subscribe({
        next: response => resolve(response.url),
        error: reject
      });
    });
  }

  private dataUrlToImageFile(dataUrl: string): File {
    const [header, encoded] = dataUrl.split(',');
    const mimeType = header.match(/data:(.*?);base64/i)?.[1] || 'image/png';
    const binary = atob(encoded);
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
    const extension = mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'png';
    return new File([bytes], `pasted-image.${extension}`, { type: mimeType });
  }

  private insertHtmlAtCursor(html: string): void {
    const editor = this.visualEditorRef?.nativeElement;
    if (!editor) return;
    editor.focus();
    document.execCommand('insertHTML', false, html);
  }

  private escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
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
      this.updateArticleContent(html);
    }
  }

  syncVisualEditorFromHtml(): void {
    if (this.visualEditorRef?.nativeElement) {
      this.visualEditorRef.nativeElement.innerHTML = this.currentContentHtml();
    }
  }

  currentContentHtml(): string {
    const article = this.currentArticle();
    return this.activeContentLanguage() === 'ar'
      ? article.content_html_ar || ''
      : article.content_html || '';
  }

  updateArticleContent(value: string): void {
    this.currentArticle.update(article => this.activeContentLanguage() === 'ar'
      ? { ...article, content_html_ar: value }
      : { ...article, content_html: value });
  }

  setContentLanguage(language: 'en' | 'ar'): void {
    if (this.activeContentLanguage() === language) return;
    if (this.editorMode() === 'visual') this.syncHtmlFromVisualEditor();
    this.activeContentLanguage.set(language);
    if (this.editorMode() === 'visual') setTimeout(() => this.syncVisualEditorFromHtml());
    if (language === 'ar') this.translateMissingArabicFields();
  }

  private translateMissingArabicFields(): void {
    const article = this.currentArticle();
    const hasMissingFields = !article.title_ar?.trim()
      || !article.summary_ar?.trim()
      || !article.content_html_ar?.trim();
    const hasEnglishContent = !!(article.title?.trim() || article.summary?.trim() || article.content_html?.trim());
    if (!hasMissingFields || !hasEnglishContent || this.isTranslatingArabic()) return;

    this.translationNotice.set('Translating empty Arabic fields…');
    this.isTranslatingArabic.set(true);
    this.newsService.translateNewsToArabic({
      title: article.title || '',
      summary: article.summary || '',
      content_html: article.content_html || ''
    }).subscribe({
      next: ({ translations }) => {
        this.currentArticle.update(current => ({
          ...current,
          title_ar: current.title_ar?.trim() ? current.title_ar : translations.title_ar,
          summary_ar: current.summary_ar?.trim() ? current.summary_ar : translations.summary_ar,
          content_html_ar: current.content_html_ar?.trim() ? current.content_html_ar : translations.content_html_ar
        }));
        this.translationNotice.set('Arabic draft filled. Review it, then click Update & Save.');
        this.isTranslatingArabic.set(false);
        if (this.editorMode() === 'visual') setTimeout(() => this.syncVisualEditorFromHtml());
      },
      error: error => {
        this.translationNotice.set(error.error?.message || 'Arabic auto-translation is unavailable. You can still type Arabic manually.');
        this.isTranslatingArabic.set(false);
      }
    });
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
    formData.append('title_ar', article.title_ar || '');
    formData.append('category', article.category);
    formData.append('summary', article.summary || '');
    formData.append('summary_ar', article.summary_ar || '');
    formData.append('content_html', article.content_html || '');
    formData.append('content_html_ar', article.content_html_ar || '');
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
