import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface LeaderProfileModalData {
  id?: number | string;
  name: string;
  title: string;
  role: string;
  badge: string;
  initials?: string;
  image?: string;
  bioSections: Array<{
    heading: string;
    paragraphs?: string[];
    items?: string[];
  }>;
}

@Component({
  selector: 'app-leader-profile-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leader-profile-modal.html',
  styleUrl: './leader-profile-modal.css'
})
export class LeaderProfileModalComponent {
  @Input({ required: true }) profile!: LeaderProfileModalData;
  @Output() closed = new EventEmitter<void>();

  get headingId(): string {
    return `leader-profile-heading-${this.profile.id || this.profile.initials || 'profile'}`;
  }
}
