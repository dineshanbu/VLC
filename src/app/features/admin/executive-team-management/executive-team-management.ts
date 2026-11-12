import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, SecurityContext, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { ExecutiveTeamService } from '../../../core/services/executive-team.service';
import { ExecutiveTeamMember } from '../../../core/models/executive-team.model';
import { resolveImageUrl } from '../../../core/utils/image-url.util';
import { MediaImagePickerComponent } from '../../../shared/components/media-image-picker/media-image-picker';

type ExecutiveTab = 'members' | 'banner' | 'page';

const defaultPageCopy = {
  meetButton: 'Meet Our Leadership', chairmanLabel: 'CHAIRMAN OF THE BOARD',
  chairmanQuote: 'Healthcare sovereignty begins with investing in innovation, local capability and scientific excellence.',
  quoteAttribution: 'Vaccine Industrial Company', rdiCalloutTitle: 'National Leadership',
  rdiDescription: 'Contributing to Saudi Arabia’s national innovation agenda through research, development and innovation.',
  associateLabel: 'ASSOCIATE CHIEF EXECUTIVE OFFICER',
  readMoreButton: 'Read More', teamTitle: 'EXECUTIVE LEADERSHIP TEAM',
  teamDescription: 'Experienced leaders overseeing manufacturing, quality, operations, commercial excellence and corporate strategy.',
  contactTitle: 'Interested in connecting with our leadership?',
  contactDescription: 'We welcome opportunities to collaborate and advance our shared vision for a healthier future.',
  contactButton: 'Contact Leadership', rdiTitle: 'Research, Development & Innovation (RDI) Supreme Committee',
  rdiIntro: 'The Research, Development & Innovation (RDI) Supreme Committee drives the Kingdom’s national innovation agenda, providing strategic direction to advance research, technology and industrial development across key sectors.'
};

const defaultCommitteeMembers = [
  { name: 'HRH Mohammed bin Salman', role: 'Chair of CEDA', image: '' },
  { name: 'HRH Abdulaziz bin Salman', role: 'Minister of Energy', image: '' },
  { name: 'HRH Abdullah Bin Bandar', role: 'Minister of National Guard', image: '' },
  { name: 'HE Abdulrahman Al-Fadhli', role: 'Minister of Environment, Water and Agriculture', image: '' },
  { name: 'HE Abdullah Alswaha', role: 'Minister of Communications and IT', image: '' },
  { name: 'HE Dr. Hamad Al Sheikh', role: 'Minister of Education', image: '' },
  { name: 'HE Bandar Al-Khorayef', role: 'Minister of Industry and Mineral Resources', image: '' },
  { name: 'HE Khaled Al-Faleh', role: 'Minister of Investment', image: '' },
  { name: 'HE Dr. Fahad Toonsi', role: 'Secretary of Strategic Management Committee', image: '' },
  { name: 'HE Ahmed Al-Ohali', role: 'Governor of GAMI', image: '' },
  { name: 'Yousef Al-Benyan', role: 'Minister of Education', image: '' },
  { name: 'Dr. Khaled Al-Mosa', role: 'Biotechnology and healthcare leader', image: '' },
  { name: 'HE Fahad Al-Rasheed', role: 'Committee Member', image: '' },
  { name: 'Tony Chan', role: 'Committee Member', image: '' }
];

const emptyMember = (): ExecutiveTeamMember => ({
  name: '', name_ar: '', title: '', title_ar: '', role: '', role_ar: '', badge: '', badge_ar: '',
  initials: '', image: '', bio_sections: [{ heading: 'Executive Summary', paragraphs: [''] }],
  bio_sections_ar: [{ heading: 'نبذة تنفيذية', paragraphs: [''] }], order_index: 0, status: 'Active'
});

@Component({
  selector: 'app-executive-team-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MediaImagePickerComponent],
  templateUrl: './executive-team-management.html',
  styleUrl: './executive-team-management.css'
})
export class ExecutiveTeamManagementComponent implements OnInit {
  private readonly teamService = inject(ExecutiveTeamService);
  private readonly sanitizer = inject(DomSanitizer);

  @ViewChild('bioEditorEn') private bioEditorEn?: ElementRef<HTMLDivElement>;
  @ViewChild('bioEditorAr') private bioEditorAr?: ElementRef<HTMLDivElement>;

  readonly activeTab = signal<ExecutiveTab>('members');
  readonly members = signal<ExecutiveTeamMember[]>([]);
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly isMemberModalOpen = signal(false);
  readonly isEditing = signal(false);
  readonly selectedStatus = signal<'All' | 'Active' | 'Inactive'>('All');
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  memberForm = emptyMember();
  bioText = '';
  bioTextAr = '';
  bioChanged = false;
  bioChangedAr = false;
  readonly bioEditorModeEn = signal<'visual' | 'html'>('visual');
  readonly bioEditorModeAr = signal<'visual' | 'html'>('visual');
  private savedBioRange: Range | null = null;
  private savedBioRangeLanguage: 'en' | 'ar' | null = null;
  memberImageFile: File | null = null;
  memberImagePreview = '';

  heroForm = {
    badge: 'OUR LEADERSHIP', badge_ar: 'قيادتنا', title: 'Senior Management', title_ar: 'الإدارة العليا',
    subtitle: '', subtitle_ar: '',
    description: 'A leadership team committed to advancing vaccine innovation, strengthening national health security and creating a healthier future.',
    description_ar: 'فريق قيادي ملتزم بتطوير ابتكار اللقاحات وتعزيز الأمن الصحي الوطني وبناء مستقبل أكثر صحة للأجيال القادمة.',
    image_url: 'home_banner.webp', image_url_ar: 'home_banner.webp'
  };
  heroImageFile: File | null = null;
  heroImageFileAr: File | null = null;
  heroPreview = '';
  heroPreviewAr = '';
  pageForm = { ...defaultPageCopy };
  committeeMembers = defaultCommitteeMembers.map(member => ({ ...member }));

  ngOnInit(): void {
    this.loadMembers();
    this.loadPageContent();
  }

  private loadMembers(): void {
    this.isLoading.set(true);
    this.teamService.getMembers().subscribe({
      next: response => { this.members.set(response.members || []); this.isLoading.set(false); },
      error: error => { this.errorMessage.set(error?.error?.message || 'Could not load Executive Team profiles.'); this.isLoading.set(false); }
    });
  }

  private loadPageContent(): void {
    this.teamService.getContent().subscribe({
      next: response => {
        const hero = response.content?.hero;
        if (hero) {
          this.heroForm = {
            badge: hero.badge || this.heroForm.badge, badge_ar: hero.badge_ar || this.heroForm.badge_ar,
            title: hero.title || this.heroForm.title, title_ar: hero.title_ar || this.heroForm.title_ar,
            subtitle: hero.subtitle || '', subtitle_ar: hero.subtitle_ar || '',
            description: hero.description || this.heroForm.description,
            description_ar: hero.description_ar || this.heroForm.description_ar,
            image_url: hero.image_url || this.heroForm.image_url,
            image_url_ar: hero.image_url_ar || hero.image_url || this.heroForm.image_url
          };
          this.heroPreview = resolveImageUrl(this.heroForm.image_url);
          this.heroPreviewAr = resolveImageUrl(this.heroForm.image_url_ar || this.heroForm.image_url);
        }
        const page = response.content?.page;
        if (page && typeof page === 'object') {
          this.pageForm = { ...defaultPageCopy, ...page };
          if (Array.isArray(page['committee_members'])) this.committeeMembers = page['committee_members'].map((member: any) => ({
            name: member.name || '', role: member.role || '', image: member.image || ''
          }));
        }
      },
      error: error => this.errorMessage.set(error?.error?.message || 'Could not load Executive Team page content.')
    });
  }

  filteredMembers(): ExecutiveTeamMember[] {
    return this.selectedStatus() === 'All' ? this.members() : this.members().filter(member => member.status === this.selectedStatus());
  }

  imageUrl(path: string): string { return resolveImageUrl(path); }

  openAddMember(): void {
    this.isEditing.set(false);
    this.memberForm = { ...emptyMember(), order_index: this.members().length + 1 };
    this.bioText = ''; this.bioTextAr = ''; this.bioChanged = false; this.bioChangedAr = false;
    this.bioEditorModeEn.set('visual'); this.bioEditorModeAr.set('visual');
    this.memberImageFile = null; this.memberImagePreview = '';
    this.isMemberModalOpen.set(true);
    setTimeout(() => this.syncBioEditorsFromHtml());
  }

  openEditMember(member: ExecutiveTeamMember): void {
    this.isEditing.set(true);
    this.memberForm = JSON.parse(JSON.stringify(member));
    this.bioText = this.flattenBio(member.bio_sections || []);
    this.bioTextAr = this.flattenBio(member.bio_sections_ar || []);
    this.bioChanged = false; this.bioChangedAr = false;
    this.bioEditorModeEn.set('visual'); this.bioEditorModeAr.set('visual');
    this.memberImageFile = null; this.memberImagePreview = this.imageUrl(member.image);
    this.isMemberModalOpen.set(true);
    setTimeout(() => this.syncBioEditorsFromHtml());
  }

  private flattenBio(sections: NonNullable<ExecutiveTeamMember['bio_sections']>): string {
    if (sections.length === 1 && !sections[0].heading && sections[0].paragraphs?.length === 1) {
      return this.toEditorHtml(sections[0].paragraphs[0]);
    }
    return sections.map(section => [
      section.heading ? `<h3>${this.escapeHtml(section.heading)}</h3>` : '',
      ...(section.paragraphs || []).map(paragraph => this.toEditorHtml(paragraph)),
      section.items?.length ? `<ul>${section.items.map(item => `<li>${this.bioListItemHtml(item)}</li>`).join('')}</ul>` : '',
      section.ordered_items?.length ? `<ol>${section.ordered_items.map(item => `<li>${this.bioListItemHtml(item)}</li>`).join('')}</ol>` : ''
    ].filter(Boolean).join('')).filter(Boolean).join('');
  }

  private bioListItemHtml(item: string): string {
    if (/<\/?[a-z][\s\S]*>/i.test(item)) return this.normalizePastedBioHtml(item);
    const decoder = document.createElement('textarea');
    decoder.innerHTML = item;
    return this.escapeHtml(decoder.value);
  }

  private toEditorHtml(value: string): string {
    if (!value) return '';
    if (/<\/?[a-z][\s\S]*>/i.test(value)) return this.normalizePastedBioHtml(value);
    if (/^\s*(?:[•●▪◦‣⁃·\uE000-\uF8FF]|\d+[.)]|#{1,6})\s+|\*\*[^*]+\*\*/m.test(value)) {
      return this.plainTextToBioHtml(value);
    }
    return `<p>${this.escapeHtml(value).replace(/\r?\n/g, '<br>')}</p>`;
  }

  private escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
  }

  private bioEditor(language: 'en' | 'ar'): HTMLDivElement | undefined {
    return language === 'en' ? this.bioEditorEn?.nativeElement : this.bioEditorAr?.nativeElement;
  }

  private setBioText(language: 'en' | 'ar', html: string): void {
    const safeHtml = this.sanitizer.sanitize(SecurityContext.HTML, html) || '';
    if (language === 'en') { this.bioText = safeHtml; this.bioChanged = true; }
    else { this.bioTextAr = safeHtml; this.bioChangedAr = true; }
  }

  syncBioEditorsFromHtml(): void {
    if (this.bioEditorEn?.nativeElement) this.bioEditorEn.nativeElement.innerHTML = this.bioText || '';
    if (this.bioEditorAr?.nativeElement) this.bioEditorAr.nativeElement.innerHTML = this.bioTextAr || '';
  }

  syncBioHtmlFromVisualEditor(language: 'en' | 'ar'): void {
    const editor = this.bioEditor(language);
    if (editor) {
      this.setBioText(language, editor.innerHTML);
      this.rememberBioSelection(language);
    }
  }

  pasteBioContent(event: ClipboardEvent, language: 'en' | 'ar'): void {
    const clipboard = event.clipboardData;
    const editor = this.bioEditor(language);
    if (!clipboard || !editor) return;

    const pastedHtml = clipboard.getData('text/html');
    const pastedText = clipboard.getData('text/plain');
    const textHasStructuredFormatting = pastedText.split(/\r?\n/).some(line =>
      /^\s*(?:[•●▪◦‣⁃·\uE000-\uF8FF*+\-]|\d+[.)]|#{1,6})\s+\S/.test(line) || /\*\*[^*]+\*\*|__[^_]+__/.test(line)
    );
    const htmlHasStructureOrAlignment = /<(?:ul|ol|li)\b|mso-list|text-align\s*:|\balign=/i.test(pastedHtml);
    const html = htmlHasStructureOrAlignment
      ? this.normalizePastedBioHtml(pastedHtml)
      : textHasStructuredFormatting
      ? this.plainTextToBioHtml(pastedText)
      : pastedHtml
          ? this.normalizePastedBioHtml(pastedHtml)
          : this.plainTextToBioHtml(pastedText);

    event.preventDefault();
    editor.focus();
    document.execCommand('insertHTML', false, html);
    this.syncBioHtmlFromVisualEditor(language);
  }

  private plainTextToBioHtml(text: string): string {
    const lines = text.replace(/\r/g, '').split('\n');
    const output: string[] = [];
    let activeList: 'ul' | 'ol' | null = null;
    let listItems: string[] = [];
    let previousWasBlank = true;

    const flushList = (): void => {
      if (activeList && listItems.length) {
        output.push(`<${activeList}>${listItems.map(item => `<li>${item}</li>`).join('')}</${activeList}>`);
      }
      activeList = null;
      listItems = [];
    };

    for (const line of lines) {
      const bullet = line.match(/^\s*[•●▪◦‣⁃·\uE000-\uF8FF*+\-]\s+(.+?)\s*$/);
      const numbered = line.match(/^\s*\d+[.)]\s+(.+?)\s*$/);
      const markdownHeading = line.match(/^\s*#{1,6}\s+(.+?)\s*$/);
      const type = bullet ? 'ul' : numbered ? 'ol' : null;
      if (type) {
        if (activeList !== type) flushList();
        activeList = type;
        listItems.push(this.markdownInlineToBioHtml((bullet || numbered)![1]));
        previousWasBlank = false;
        continue;
      }

      // PDF/Word clipboard text often wraps one bullet onto several lines.
      // Keep those continuation lines inside the same list item so the text
      // hangs under the sentence instead of restarting at the left margin.
      if (activeList && line.trim() && !markdownHeading && !previousWasBlank) {
        listItems[listItems.length - 1] += ` ${this.markdownInlineToBioHtml(line.trim())}`;
        continue;
      }

      flushList();
      if (markdownHeading) {
        output.push(`<h3>${this.markdownInlineToBioHtml(markdownHeading[1])}</h3>`);
      } else {
        output.push(line.trim() ? `<p>${this.markdownInlineToBioHtml(line.trim())}</p>` : '<p><br></p>');
      }
      previousWasBlank = !line.trim();
    }

    flushList();
    return output.join('');
  }

  private markdownInlineToBioHtml(value: string): string {
    const escaped = this.escapeHtml(value);
    return escaped
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/__([^_]+)__/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/_([^_]+)_/g, '<em>$1</em>');
  }

  private normalizePastedBioHtml(html: string): string {
    const template = document.createElement('template');
    template.innerHTML = html;

    const normalizeNode = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) {
        return this.markdownInlineToBioHtml(node.textContent || '');
      }
      if (!(node instanceof Element)) return '';

      const tag = node.tagName.toLowerCase();
      const tagMap: Record<string, string> = { h1: 'h3', h2: 'h3', h3: 'h3', h4: 'h4' };
      const sourceText = node.textContent || '';
      const bulletMatch = sourceText.match(/^[\s\u00a0]*(?:[•●▪◦‣⁃·]|[\uE000-\uF8FF])[\s\u00a0]*/);
      const isWordBullet = /mso-list|list-style-type\s*:\s*(?:disc|circle|square)/i.test(node.getAttribute('style') || '');
      const outputTag = (tag === 'p' || tag === 'div') && (bulletMatch || isWordBullet) ? 'li' : (tagMap[tag] || tag);
      const supportedTags = new Set(['p', 'div', 'br', 'h3', 'h4', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'u', 's', 'blockquote', 'a']);
      const children = Array.from(node.childNodes).map(normalizeNode).join('');

      if (!supportedTags.has(outputTag)) return children;
      if (outputTag === 'br') return '<br>';
      if (outputTag === 'li' && (bulletMatch || isWordBullet)) {
        const content = bulletMatch ? children.replace(/^[\s\u00a0]*(?:[•●▪◦‣⁃·]|[\uE000-\uF8FF])[\s\u00a0]*/, '') : children;
        return `<ul><li>${content}</li></ul>`;
      }
      if (outputTag === 'a') {
        const href = node.getAttribute('href');
        return href && /^(https?:|mailto:|tel:)/i.test(href) ? `<a href="${this.escapeHtml(href)}">${children}</a>` : children;
      }
      const alignment = this.pastedAlignment(node);
      const alignmentAttribute = alignment ? ` class="bio-align-${alignment}"` : '';
      return `<${outputTag}${alignmentAttribute}>${children}</${outputTag}>`;
    };

    return Array.from(template.content.childNodes).map(normalizeNode).join('').replace(/<\/ul>\s*<ul>/g, '');
  }

  private pastedAlignment(node: Element): 'left' | 'right' | 'center' | 'justify' | null {
    const align = (node.getAttribute('align') || '').toLowerCase();
    const textAlign = (node.getAttribute('style') || '').match(/text-align\s*:\s*(left|right|center|justify)/i)?.[1]?.toLowerCase();
    const value = textAlign || align;
    return value === 'left' || value === 'right' || value === 'center' || value === 'justify' ? value : null;
  }

  rememberBioSelection(language: 'en' | 'ar'): void {
    const editor = this.bioEditor(language);
    const selection = window.getSelection();
    if (!editor || !selection?.rangeCount || !selection.anchorNode || !selection.focusNode) return;
    if (!editor.contains(selection.anchorNode) || !editor.contains(selection.focusNode)) return;
    this.savedBioRange = selection.getRangeAt(0).cloneRange();
    this.savedBioRangeLanguage = language;
  }

  private restoreBioSelection(language: 'en' | 'ar'): HTMLDivElement | undefined {
    const editor = this.bioEditor(language);
    if (!editor) return undefined;
    editor.focus();
    if (this.savedBioRangeLanguage === language && this.savedBioRange && editor.contains(this.savedBioRange.commonAncestorContainer)) {
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(this.savedBioRange);
    }
    return editor;
  }

  execBioCmd(command: string, language: 'en' | 'ar'): void {
    const editor = this.restoreBioSelection(language);
    if (!editor) return;
    document.execCommand(command, false);
    this.syncBioHtmlFromVisualEditor(language);
  }

  formatBioBlock(tag: string, language: 'en' | 'ar'): void {
    const editor = this.restoreBioSelection(language);
    if (!editor) return;
    document.execCommand('formatBlock', false, `<${tag}>`);
    this.syncBioHtmlFromVisualEditor(language);
  }

  insertBioLink(language: 'en' | 'ar'): void {
    const url = prompt('Enter the link URL (e.g. https://example.com):');
    if (!url) return;
    this.restoreBioSelection(language);
    document.execCommand('createLink', false, url);
    this.syncBioHtmlFromVisualEditor(language);
  }

  insertBioImage(language: 'en' | 'ar'): void {
    const url = prompt('Enter image URL:');
    if (!url) return;
    this.restoreBioSelection(language);
    document.execCommand('insertImage', false, url);
    this.syncBioHtmlFromVisualEditor(language);
  }

  insertBioCallout(language: 'en' | 'ar'): void {
    const text = prompt('Enter callout quote:');
    if (!text) return;
    this.restoreBioSelection(language);
    document.execCommand('insertHTML', false, `<blockquote><p>${this.escapeHtml(text)}</p></blockquote>`);
    this.syncBioHtmlFromVisualEditor(language);
  }

  toggleBioEditorMode(mode: 'visual' | 'html', language: 'en' | 'ar'): void {
    if (mode === 'html') this.syncBioHtmlFromVisualEditor(language);
    if (language === 'en') this.bioEditorModeEn.set(mode);
    else this.bioEditorModeAr.set(mode);
    if (mode === 'visual') setTimeout(() => {
      const editor = this.bioEditor(language);
      if (editor) editor.innerHTML = language === 'en' ? this.bioText : this.bioTextAr;
    });
  }

  private readBioEditor(id: string): string {
    const language = id.endsWith('_ar') ? 'ar' : 'en';
    const mode = language === 'en' ? this.bioEditorModeEn() : this.bioEditorModeAr();
    const html = mode === 'visual' ? this.bioEditor(language)?.innerHTML || '' : (language === 'en' ? this.bioText : this.bioTextAr);
    return this.sanitizer.sanitize(SecurityContext.HTML, html)?.trim() || '';
  }

  private formValue(value: unknown): string {
    if (value === null || value === undefined) return '';
    return typeof value === 'object' ? JSON.stringify(value) : String(value);
  }

  private bioHtmlToSections(html: string): NonNullable<ExecutiveTeamMember['bio_sections']> {
    const normalizedHtml = this.normalizePastedBioHtml(html);
    const template = document.createElement('template');
    template.innerHTML = normalizedHtml;
    const sections: NonNullable<ExecutiveTeamMember['bio_sections']> = [];
    let nextHeading = '';
    let current: NonNullable<ExecutiveTeamMember['bio_sections']>[number] | null = null;

    const ensureCurrent = () => current ||= { heading: nextHeading, paragraphs: [] };
    const hasBody = (section: NonNullable<ExecutiveTeamMember['bio_sections']>[number]) =>
      !!(section.paragraphs?.length || section.items?.length || section.ordered_items?.length);
    const flush = () => {
      if (current && (hasBody(current) || current.heading)) sections.push(current);
      current = null;
    };
    const appendParagraph = (blockHtml: string) => {
      const section = ensureCurrent();
      if (section.items?.length || section.ordered_items?.length) {
        flush();
        current = ensureCurrent();
      }
      const safeHtml = this.sanitizer.sanitize(SecurityContext.HTML, blockHtml)?.trim();
      if (safeHtml) current!.paragraphs!.push(safeHtml);
      nextHeading = '';
    };
    const appendList = (list: Element, ordered: boolean) => {
      let section = ensureCurrent();
      if (section.items?.length || section.ordered_items?.length) {
        flush();
        section = ensureCurrent();
      }
      const items = Array.from(list.querySelectorAll(':scope > li'))
        .map(item => item.textContent?.trim() || '')
        .filter(Boolean);
      if (ordered) section.ordered_items = items;
      else section.items = items;
      nextHeading = '';
    };
    const visit = (node: Node): void => {
      if (node.nodeType === Node.TEXT_NODE) {
        const value = node.textContent?.trim();
        if (value) appendParagraph(`<p>${this.escapeHtml(value)}</p>`);
        return;
      }
      if (!(node instanceof Element)) return;
      const tag = node.tagName.toLowerCase();
      if (/^h[1-6]$/.test(tag)) {
        flush();
        nextHeading = node.textContent?.trim() || '';
        return;
      }
      if (tag === 'ul' || tag === 'ol') {
        appendList(node, tag === 'ol');
        return;
      }
      if (tag === 'p' || tag === 'blockquote') {
        appendParagraph(node.outerHTML);
        return;
      }
      if (tag === 'div' && !node.classList.contains('bio-align-left') && !node.classList.contains('bio-align-right') && !node.classList.contains('bio-align-center') && !node.classList.contains('bio-align-justify')) {
        Array.from(node.childNodes).forEach(visit);
        return;
      }
      appendParagraph(node.outerHTML);
    };

    Array.from(template.content.childNodes).forEach(visit);
    flush();
    return sections;
  }

  onMemberImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.memberImageFile = file;
    const reader = new FileReader();
    reader.onload = () => this.memberImagePreview = String(reader.result || '');
    reader.readAsDataURL(file);
  }

  onHeroImageSelected(event: Event, language: 'en' | 'ar' = 'en'): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (language === 'ar') this.heroImageFileAr = file;
    else this.heroImageFile = file;
    const reader = new FileReader();
    reader.onload = () => language === 'ar'
      ? this.heroPreviewAr = String(reader.result || '')
      : this.heroPreview = String(reader.result || '');
    reader.readAsDataURL(file);
  }

  selectHeroImageFromLibrary(language: 'en' | 'ar', path: string): void {
    if (language === 'ar') {
      this.heroForm.image_url_ar = path; this.heroImageFileAr = null; this.heroPreviewAr = this.imageUrl(path);
    } else {
      this.heroForm.image_url = path; this.heroImageFile = null; this.heroPreview = this.imageUrl(path);
    }
  }

  saveMember(): void {
    if (!this.memberForm.name.trim() || !this.memberForm.title.trim()) {
      this.errorMessage.set('Name and executive title are required.'); return;
    }
    const formData = new FormData();
    const payload = { ...this.memberForm };
    const bioHtml = this.readBioEditor('member_bio_editor');
    const bioHtmlAr = this.readBioEditor('member_bio_editor_ar');
    if (this.bioChanged) payload.bio_sections = bioHtml ? this.bioHtmlToSections(bioHtml) : [];
    if (this.bioChangedAr) payload.bio_sections_ar = bioHtmlAr ? this.bioHtmlToSections(bioHtmlAr) : [];
    for (const [key, value] of Object.entries(payload)) {
      formData.append(key, this.formValue(value));
    }
    if (this.memberImageFile) formData.append('image', this.memberImageFile);
    this.isSaving.set(true); this.clearAlerts();
    const request = this.isEditing() && this.memberForm.id
      ? this.teamService.updateMember(this.memberForm.id, formData)
      : this.teamService.createMember(formData);
    request.subscribe({
      next: () => {
        this.isSaving.set(false); this.isMemberModalOpen.set(false);
        this.successMessage.set(this.isEditing() ? 'Executive Team profile updated.' : 'Executive Team profile added.');
        this.loadMembers();
      },
      error: error => { this.isSaving.set(false); this.errorMessage.set(error?.error?.message || 'Could not save this profile.'); }
    });
  }

  deleteMember(member: ExecutiveTeamMember): void {
    if (!member.id || !window.confirm(`Remove ${member.name} from the Executive Team?`)) return;
    this.teamService.deleteMember(member.id).subscribe({
      next: () => { this.successMessage.set('Executive Team profile removed.'); this.loadMembers(); },
      error: error => this.errorMessage.set(error?.error?.message || 'Could not remove this profile.')
    });
  }

  toggleStatus(member: ExecutiveTeamMember): void {
    if (!member.id) return;
    const data = new FormData();
    for (const [key, value] of Object.entries(member)) data.append(key, this.formValue(value));
    data.set('status', member.status === 'Active' ? 'Inactive' : 'Active');
    this.teamService.updateMember(member.id, data).subscribe({
      next: () => this.loadMembers(),
      error: error => this.errorMessage.set(error?.error?.message || 'Could not update profile status.')
    });
  }

  moveMember(member: ExecutiveTeamMember, offset: -1 | 1): void {
    const members = [...this.members()];
    const index = members.findIndex(item => item.id === member.id);
    const next = index + offset;
    if (index < 0 || next < 0 || next >= members.length) return;
    [members[index], members[next]] = [members[next], members[index]];
    const items = members.map((item, order_index) => ({ id: item.id!, order_index: order_index + 1 }));
    this.teamService.reorderMembers(items).subscribe({ next: () => this.loadMembers(), error: error => this.errorMessage.set(error?.error?.message || 'Could not reorder profiles.') });
  }

  saveHero(): void {
    const form = new FormData();
    for (const [key, value] of Object.entries(this.heroForm)) form.append(key, value || '');
    if (this.heroImageFile) form.append('image', this.heroImageFile);
    if (this.heroImageFileAr) form.append('image_ar', this.heroImageFileAr);
    this.isSaving.set(true); this.clearAlerts();
    this.teamService.saveHero(form).subscribe({
      next: response => {
        this.isSaving.set(false); this.successMessage.set('Executive Team banner saved.');
        this.heroForm.badge = response.content.hero?.badge || this.heroForm.badge;
        this.heroForm.badge_ar = response.content.hero?.badge_ar || this.heroForm.badge_ar;
        this.heroForm.image_url = response.content.hero?.['image_url'] || this.heroForm.image_url;
        this.heroForm.image_url_ar = response.content.hero?.['image_url_ar'] || this.heroForm.image_url;
        this.heroPreview = this.imageUrl(this.heroForm.image_url);
        this.heroPreviewAr = this.imageUrl(this.heroForm.image_url_ar);
        this.heroImageFile = null; this.heroImageFileAr = null;
        localStorage.setItem('vic_executive_team_updated', String(Date.now()));
      },
      error: error => { this.isSaving.set(false); this.errorMessage.set(error?.error?.message || 'Could not save Executive Team banner.'); }
    });
  }

  savePage(): void {
    const content = { ...this.pageForm, committee_members: this.committeeMembers.filter(member => member.name.trim() || member.role.trim()) };
    this.isSaving.set(true); this.clearAlerts();
    this.teamService.savePage(content).subscribe({
      next: response => {
        this.isSaving.set(false); this.successMessage.set('Executive Team page content saved.');
        if (response.content.page?.['committee_members']) this.committeeMembers = response.content.page['committee_members'];
      },
      error: error => { this.isSaving.set(false); this.errorMessage.set(error?.error?.message || 'Could not save Executive Team page content.'); }
    });
  }

  addCommitteeMember(): void { this.committeeMembers.push({ name: '', role: '', image: '' }); }
  removeCommitteeMember(index: number): void { this.committeeMembers.splice(index, 1); }
  clearAlerts(): void { this.errorMessage.set(''); this.successMessage.set(''); }
}
