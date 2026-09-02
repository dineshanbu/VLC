import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

export interface ContactMessageForm {
  fullName: string;
  email: string;
  company: string;
  phone: string;
  subject: string;
  message: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class ContactComponent {
  // Contact Message Form Model
  contactForm: ContactMessageForm = {
    fullName: '',
    email: '',
    company: '',
    phone: '',
    subject: '',
    message: ''
  };

  formSubmitted = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);

  // Office Location Cards
  readonly locationCards = [
    {
      type: 'office',
      title: 'Head Office & Campus',
      subtitle: 'King Abdullah Economic City',
      detail1: 'Phase 2, Industrial Valley',
      detail2: '23965, Saudi Arabia',
      icon: 'campus'
    },
    {
      type: 'office',
      title: 'Riyadh Office',
      subtitle: 'Riyadh, Saudi Arabia',
      detail1: '+966 11 123 4567',
      detail2: 'Business Gate, Airport Road',
      icon: 'tower'
    },
    {
      type: 'partnerships',
      title: 'International Partnerships',
      subtitle: 'Global collaborations',
      detail1: 'across 25+ countries',
      detail2: 'R&D & Tech Transfer',
      icon: 'globe'
    },
    {
      type: 'inquiries',
      title: 'General Inquiries',
      subtitle: 'info@vic.com.sa',
      detail1: '+966 11 123 4567',
      detail2: 'Corporate Communications Desk',
      icon: 'mail'
    }
  ];

  submitContactForm(): void {
    if (!this.contactForm.fullName || !this.contactForm.email || !this.contactForm.message) {
      return;
    }

    this.isSubmitting.set(true);
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.formSubmitted.set(true);
    }, 600);
  }

  resetContactForm(): void {
    this.contactForm = {
      fullName: '',
      email: '',
      company: '',
      phone: '',
      subject: '',
      message: ''
    };
    this.formSubmitted.set(false);
  }
}
