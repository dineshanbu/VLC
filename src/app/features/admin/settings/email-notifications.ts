import { BrandingService } from '../../../core/services/branding.service';
import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';
import { EmailNotificationHistoryComponent } from './email-notification-history';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html: string;
  showLogo: boolean;
  fields: string[];
}

interface EmailField {
  key: string;
  label: string;
  example: string;
}

interface EmailSettings {
  templates: EmailTemplate[];
  pharmacovigilance: { enabled: boolean; recipient: string; templateId: string };
}

interface EmailSettingsResponse {
  settings: EmailSettings;
  fields: EmailField[];
  deliveryConfigured: boolean;
  deliveryStatus?: {
    missingSettings: string[];
    transportAvailable?: boolean;
    queue: { accepted: number; pending: number; expired: number } | null;
  };
}

@Component({
  selector: 'app-email-notifications',
  imports: [FormsModule, EmailNotificationHistoryComponent],
  templateUrl: './email-notifications.html',
  styleUrls: ['./settings.css', './email-notifications.css']
})
export class EmailNotificationsComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly branding = inject(BrandingService);
  private readonly document = inject(DOCUMENT);
  private get logoUrl(): string {
    return new URL(this.branding.logo('home_banner_logo'), this.document.baseURI).href;
  }
  private readonly endpoint = `${environment.apiUrl}/pharmacovigilance/email-notifications`;

  protected settings?: EmailSettings;
  protected section = signal<'settings' | 'history'>('settings');
  protected editingId = '';
  protected deliveryConfigured = false;
  protected deliveryStatus: EmailSettingsResponse['deliveryStatus'];
  protected refreshingDelivery = signal(false);
  protected deliveryError = signal('');
  protected fields: EmailField[] = [];
  protected preview = signal<SafeHtml | null>(null);
  protected loading = signal(true);
  protected saving = signal(false);
  protected error = signal('');
  protected status = signal('');
  protected readonly fieldsPlaceholder = '{{report_fields}}';
  protected readonly eventPlaceholder = '{{event_message}}';
  protected readonly logoPlaceholder = '{{company_logo}}';
  protected readonly linkPlaceholder = '{{report_link}}';
  private readonly inlineFields = new Set(['report_id', 'submitted_at', 'admin_url']);

  protected get template(): EmailTemplate | undefined {
    return this.settings?.templates.find(item => item.id === this.editingId);
  }

  protected get templatesValid(): boolean {
    return this.settings?.templates.every(template => Boolean(template.name.trim() && template.html.trim())) ?? false;
  }

  ngOnInit(): void {
    this.branding.loadSettings().subscribe({ next: () => this.showPreview(), error: () => undefined });
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set('');
    this.http.get<EmailSettingsResponse>(this.endpoint).subscribe({
      next: response => {
        this.loading.set(false);
        if (!response?.settings || !Array.isArray(response.fields)) {
          this.error.set('Update the backend API to load email settings.');
          return;
        }
        this.settings = response.settings;
        this.fields = response.fields;
        this.deliveryConfigured = response.deliveryConfigured;
        this.deliveryStatus = response.deliveryStatus;
        this.selectTemplate(response.settings.pharmacovigilance.templateId);
      },
      error: response => {
        const message = response.status === 404
          ? 'Email settings are unavailable. Check that the latest backend is deployed.'
          : response.status === 0
            ? 'Could not reach the backend. Check the connection and retry.'
            : response.error?.message || 'Could not load email notification settings.';
        this.error.set(message);
        this.loading.set(false);
      }
    });
  }

  protected refreshDelivery(): void {
    this.refreshingDelivery.set(true);
    this.deliveryError.set('');
    this.http.get<EmailSettingsResponse>(this.endpoint).subscribe({
      next: response => {
        this.refreshingDelivery.set(false);
        this.deliveryConfigured = response.deliveryConfigured;
        this.deliveryStatus = response.deliveryStatus;
      },
      error: () => {
        this.refreshingDelivery.set(false);
        this.deliveryError.set('Could not refresh email delivery status.');
      }
    });
  }

  protected selectTemplate(id: string): void {
    this.editingId = id;
    this.showPreview();
  }

  protected addTemplate(): void {
    if (!this.settings || !this.template || this.settings.templates.length >= 20) return;
    const names = new Set(this.settings.templates.map(template => template.name.trim()));
    let name = 'New email template';
    for (let number = 2; names.has(name); number++) name = `New email template ${number}`;
    const template: EmailTemplate = {
      ...this.template,
      id: crypto.randomUUID(),
      name,
      fields: [...this.template.fields],
    };
    this.settings.templates.push(template);
    this.status.set('');
    this.selectTemplate(template.id);
  }

  protected removeTemplate(): void {
    const settings = this.settings;
    if (!settings || !this.template || settings.templates.length <= 1) return;
    settings.templates = settings.templates.filter(template => template.id !== this.editingId);
    if (settings.pharmacovigilance.templateId === this.editingId) {
      settings.pharmacovigilance.templateId = settings.templates[0].id;
    }
    this.status.set('');
    this.selectTemplate(settings.pharmacovigilance.templateId);
  }

  protected setField(key: string, enabled: boolean): void {
    const template = this.template;
    if (!template) return;
    template.fields = enabled ? [...template.fields, key] : template.fields.filter(field => field !== key);
    this.showPreview();
  }

  protected showPreview(): void {
    const template = this.template;
    if (!template?.html) {
      this.preview.set(null);
      return;
    }
    const inlineKeys = new Set(Array.from(template.html.matchAll(/\{\{(\w+)\}\}/g), match => match[1]));
    const selected = this.fields.filter(field => template.fields.includes(field.key));
    const rows = selected.filter(({ key }) =>
      !(key === 'admin_url' && inlineKeys.has('report_link')) && (!this.inlineFields.has(key) || !inlineKeys.has(key))
    ).map(field => {
      const content = field.key === 'admin_url' ? '<a href="#">Open safety reports</a>' : field.example;
      return `<tr><th scope="row" style="padding:9px 12px;text-align:left;vertical-align:top;border-bottom:1px solid #dde8ee;color:#355568">${field.label}</th><td style="padding:9px 12px;border-bottom:1px solid #dde8ee;overflow-wrap:anywhere">${content}</td></tr>`;
    }).join('');
    const details = rows ? `<table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#f3f8fa;font-size:14px"><tbody>${rows}</tbody></table>` : '';
    const logo = template.showLogo
      ? `<div style="margin:0 0 12px"><img src="${this.logoUrl}" alt="Vaccine Industrial Company" width="250" style="display:block;width:250px;max-width:100%;height:auto;border:0;background:#103449;padding:8px;box-sizing:border-box"></div>`
      : '';
    const reportLink = selected.some(field => field.key === 'admin_url')
      ? '<div style="padding-top:18px"><a href="#" style="display:inline-block;padding:10px 16px;background:#076b66;border:1px solid #076b66;border-radius:4px;color:#fff;font-size:14px;font-weight:bold;text-decoration:none">Open safety reports</a></div>'
      : '';
    const source = template.showLogo ? template.html : template.html.replace(/<img\b[^>]*\bsrc=["']\{\{company_logo_url\}\}["'][^>]*>/gi, '');
    const demo = source.replace(/\{\{(\w+)\}\}/g, (token, key) => {
      if (key === 'company_logo_url') return template.showLogo ? this.logoUrl : '';
      if (key === 'company_logo') return logo;
      if (key === 'report_link') return reportLink;
      if (key === 'event_message') return 'A new adverse event report was submitted and is available for review.';
      if (key === 'report_fields') return details;
      if (!this.fields.some(field => field.key === key)) return token;
      if (!this.inlineFields.has(key)) return '';
      return selected.find(field => field.key === key)?.example ?? '';
    });
    const policy = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data: ${this.logoUrl}; form-action 'none'; base-uri 'none'">`;
    const preview = policy + (inlineKeys.has('company_logo') || inlineKeys.has('company_logo_url') ? '' : logo) +
      demo + (inlineKeys.has('report_fields') ? '' : details);
    this.preview.set(this.sanitizer.bypassSecurityTrustHtml(preview));
  }

  protected save(): void {
    if (!this.settings || !this.templatesValid || this.saving()) return;
    this.saving.set(true);
    this.error.set('');
    this.status.set('');
    this.http.put<EmailSettingsResponse>(this.endpoint, this.settings).subscribe({
      next: response => {
        this.settings = response.settings;
        this.deliveryConfigured = response.deliveryConfigured;
        this.showPreview();
        this.status.set('Email notification settings saved.');
        this.saving.set(false);
      },
      error: response => {
        this.error.set(response.error?.message || 'Could not save email notification settings.');
        this.saving.set(false);
      }
    });
  }
}
