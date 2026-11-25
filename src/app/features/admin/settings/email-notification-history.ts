import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';

interface EmailHistoryItem {
  id: string;
  reportId: number;
  recipient: string | null;
  subject: string | null;
  status: 'accepted' | 'pending' | 'expired';
  attempts: number;
  firstAttemptAt: string | null;
  sentAt: string | null;
}

@Component({
  selector: 'app-email-notification-history',
  imports: [DatePipe],
  templateUrl: './email-notification-history.html',
  styleUrls: ['./settings.css', './email-notifications.css'],
})
export class EmailNotificationHistoryComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly endpoint = `${environment.apiUrl}/pharmacovigilance/email-notifications/history`;
  protected readonly items = signal<EmailHistoryItem[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly page = signal(1);
  protected readonly hasMore = signal(false);
  protected readonly filter = signal('all');
  protected readonly statusLabel = {
    accepted: 'Accepted by mail server',
    pending: 'Pending',
    expired: 'Retries ended',
  };

  ngOnInit(): void {
    this.load(1);
    const timer = setInterval(() => {
      if (!document.hidden && this.items().some(item => item.status === 'pending')) {
        this.load(this.page());
      }
    }, 15000);
    this.destroyRef.onDestroy(() => clearInterval(timer));
  }

  protected load(page: number, status = this.filter()): void {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    this.http.get<{ items: EmailHistoryItem[]; hasMore: boolean }>(this.endpoint, {
      params: { page, status },
    }).subscribe({
      next: response => {
        this.items.set(response.items);
        this.hasMore.set(response.hasMore);
        this.page.set(page);
        this.filter.set(status);
        this.loading.set(false);
      },
      error: error => {
        this.error.set(error.error?.message || 'Could not load email history.');
        this.loading.set(false);
      },
    });
  }
}
