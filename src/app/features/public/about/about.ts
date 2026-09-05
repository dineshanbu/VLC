import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface LeaderSection {
  heading: string;
  items?: string[];
  paragraphs?: string[];
}

export interface Leader {
  name: string;
  title: string;
  role: string;
  badge: string;
  initials: string;
  image: string;
  bioSections?: LeaderSection[];
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.html',
  styleUrl: './about.css'
})
export class AboutComponent implements OnInit, OnDestroy {
  // Section 2: Company Overview Modal State
  isOverviewModalOpen = false;

  // Leader Profile Modal State
  selectedLeader: Leader | null = null;
  isLeaderModalOpen = false;

  // Section 2: Company Overview expand toggle (legacy fallback if needed)
  isExpanded = false;

  // Section 2: Our Vision expand toggle
  isVisionExpanded = false;

  // Section 2: Our Mission expand toggle
  isMissionExpanded = false;

  // Section 3: Our Facility expand toggle
  isFacilityExpanded = false;

  // Section 5: Leadership Carousel State
  leaderIndex = 0;
  cardsPerView = 3;
  private autoPlayTimer: any = null;
  private touchStartX = 0;
  private touchEndX = 0;

  // Leadership partners data with real photos and full profiles
  leaders: Leader[] = [
    {
      name: 'Dr. Khaled Almosa',
      title: 'Founder and Chairman of Vaccine Industrial Company',
      role: 'Leading Saudi biotechnology pioneer & senior management consultant. Recognized as the “Godfather of Biotechnology Manufacturing in Saudi Arabia”.',
      badge: 'Founder & Chairman',
      initials: 'KA',
      image: 'Dr.Khaled-Almosa.jpeg',
      bioSections: [
        {
          heading: 'Executive Summary',
          paragraphs: [
            'Dr. Khaled Almosa is a leading Saudi biotechnology pioneer and senior management consultant. Recognized as the “Godfather of Biotechnology Manufacturing in Saudi Arabia” by H.E. Dr. Hussein A. Gezairy (former WHO Regional Director and former Saudi Minister of Health), he has shaped the Kingdom’s life sciences and healthcare industries for more than three decades.'
          ]
        },
        {
          heading: 'Government, Policy & Innovation Leadership',
          paragraphs: [
            'He served as a member of the Supreme Committee for Research, Development & Innovation (2021–2024), chaired by HRH the Crown Prince at the Council of Economic and Development Affairs. His contributions helped shape national strategies in biotechnology, healthcare, and R&D.'
          ]
        },
        {
          heading: 'Executive Profile',
          paragraphs: [
            'Dr. Almosa is the first Saudi national to invest in and establish biotechnology manufacturing industries, founding companies across insulin and biologics production, human and animal vaccines, biomedical engineering, medical services, consulting, and R&D. His work directly advances Saudi Vision 2030 through healthcare localization, innovation, and workforce development.'
          ]
        },
        {
          heading: 'Pioneering Biotech Enterprises',
          items: [
            'SAUDI BIO (2010–2020) — Founder & Chairman: First and only Saudi manufacturer of insulin and biologics, in partnership with Novo Nordisk and Sandoz. Acquired in 2023 by Lifera (PIF-owned).',
            'Vaccine Industrial Holding Company (VIC) — Founder & Chairman: Home to Saudi Arabia’s first and the Middle East’s largest human vaccine manufacturing facility, partnering with CSL Seqirus and other global biotech leaders.',
            'Biotech Innovation Company for R&D — Founder & Chairman: Established with Baylor College of Medicine; collaborates with KACST; funded by Saudi NIH to conduct MERS clinical trials.',
            'Anivax — Founder & Chairman: A dedicated animal vaccine R&D and manufacturing company in partnership with Boehringer Ingelheim, positioning Saudi Arabia as a regional veterinary biotech hub.',
            'Bioera — Industrial Engineering & Project Management — Founder & Chairman: International engineering firm operating across the GCC, USA, Europe, and India with partners including KeyPlants, Zyme Biotech, Shahin Engineering, Podtech, and Jadwa Contractors.',
            'MedTech Group of Companies — Founder & Chairman: Operates day surgery centers, medical facilities, and medical supplies services in Riyadh.',
            'Biotechnology Training Institute — Founder: Being established with NIBRT, the first institute of its kind in the Middle East to train the region’s biotechnology workforce.'
          ]
        },
        {
          heading: 'Consulting & Strategic Advisory',
          items: [
            'Dr. Khaled Almosa Consulting Firm (Riyadh) — Chairman: Licensed by the Saudi Ministry of Commerce; specializes in biotech, R&D, investment, and business development.',
            'Averon Consulting (Dubai) — Chairman: Provides strategic advisory in healthcare and biotechnology, including regulatory strategy, market entry, partnerships, and innovation planning.'
          ]
        },
        {
          heading: 'Research & Publications',
          items: [
            '“Investigating Factors That Impede Successful Vaccine Manufacturing Business in the Kingdom of Saudi Arabia: Imperatives for Healthcare Sustainability.”',
            '“My Mission to Save Lives in Saudi Arabia: Empowering 2030 Through Local Manufacturing of Insulin, Vaccines, Cancer Therapeutics, and Gene Editing Technologies.”'
          ]
        },
        {
          heading: 'Legacy',
          paragraphs: [
            'Dr. Almosa’s legacy is the biotechnology ecosystem he built — from the first insulin factory to the first human vaccine plant, from pioneering R&D to training the next generation of biotech professionals. His career represents a mission to save lives, strengthen national health security, and secure the Kingdom’s biotechnological future.'
          ]
        }
      ]
    },
    {
      name: 'H.E. Dr. Hussein AlGazairy',
      title: 'Founder of College of Medicine at King Saud University',
      role: 'Ex-Saudi Minister of Health & Ex-Regional Director of WHO, Eastern Mediterranean Region.',
      badge: 'Advisory Board',
      initials: 'HA',
      image: 'H.E-Dr.-Hussein-AlGazairy-1-1.jpg',
      bioSections: [
        {
          heading: 'Distinguished Leadership',
          items: [
            'Founder of the College of Medicine at King Saud University',
            'Ex-Saudi Minister of Health',
            'Ex-Regional Director of World Health Organization (WHO), Eastern Mediterranean Region'
          ]
        }
      ]
    },
    {
      name: 'Professor Aws Alshamsan',
      title: 'Secretary-General of the Saudi Commission for Health',
      role: 'Ex-Consultant for Biological Products at SFDA & Former Dean of the College of Pharmacy at King Saud University.',
      badge: 'Scientific Board',
      initials: 'AA',
      image: 'Professor-Aws-Alshamsan-1-1.jpg',
      bioSections: [
        {
          heading: 'Scientific & Academic Background',
          items: [
            'The Secretary-General of the Saudi Commission for Health Specialties',
            'Ex-Consultant for biological products at the Saudi Food and Drug Authority (SFDA) for five years',
            'Co-director of the Joint Center of Excellence in Nanomedicine at KACST between 2013 and 2015',
            'Director of King Abdullah Institute for Nanotechnology between 2014 and 2017',
            'Dean of the College of Pharmacy at King Saud University between 2017–2022'
          ]
        }
      ]
    },
    {
      name: 'Dr. Abdulrazak AlGazairy',
      title: 'Senior Medical Surgeon & Researcher',
      role: 'Head of Ophthalmology Division at PSBAHC, Co-founder of Saudi Biotechnology Manufacturing Co. & Chairman of Meditech Group.',
      badge: 'Medical Board',
      initials: 'AG',
      image: 'drabdul.jpg',
      bioSections: [
        {
          heading: 'Medical & Executive Experience',
          items: [
            'Senior Medical Surgeon and Researcher',
            'Head of Ophthalmology division, Prince Sultan Bin Abdulaziz Humanitarian City',
            'Co-founder, Saudi Biotechnology Manufacturing Co.',
            'Chairman, Meditech Group'
          ]
        }
      ]
    },
    {
      name: 'Mr. Turki Al-Dayel',
      title: 'Co-Head of Middle East & CEO of Ninety One Private Equity',
      role: 'Ex-Director & Head of Private Equity at Raidah Investment Company (GOSI), Board Member of Arabian Centers & SBMC.',
      badge: 'Executive Board',
      initials: 'TD',
      image: 'Mr.-Turki-Al-Dayel-Director-1.jpg',
      bioSections: [
        {
          heading: 'Investment Leadership',
          items: [
            'Co-Head of the Middle East & CEO of Ninety One Private Equity, Saudi Arabia',
            'Ex-Director & Head of Private Equity at Raidah Investment Company (GOSI)',
            'Board member of Arabian Centers Co. and Saudi Biotechnology Manufacturing Co.'
          ]
        }
      ]
    },
    {
      name: 'Mr. Abdulrahman AlMalik',
      title: 'Executive Director of Investments - PIF Portfolio Company',
      role: 'Private Equity in Real-estate. Ex Advisor to the Minister of Economy & Planning and Financial Advisor at Ernst & Young.',
      badge: 'Executive Board',
      initials: 'AM',
      image: 'Mr.-Abdulrahman-AlMalik-1.jpg',
      bioSections: [
        {
          heading: 'Corporate Strategy & Governance',
          items: [
            'Executive Director of Investments - PIF portfolio Company, Private Equity in Real-estate',
            'Ex Advisor to the Minister of Economy & Planning and Financial Advisor at Ernst & Young',
            'Holds an MBA from ESADE Business School'
          ]
        }
      ]
    },
    {
      name: 'Professor Abdullah Alotaibi',
      title: 'Senior Consultant for Education & Training Affairs',
      role: 'Consultant for University Certificates Equalization at Ministry of Education, Former Member of Consultative (SHOURA) Council.',
      badge: 'Advisory Board',
      initials: 'AO',
      image: 'prof-abdullah-alotaibi.png',
      bioSections: [
        {
          heading: 'Public Service & Academic Leadership',
          items: [
            'Senior Consultant for Education and Training Affairs',
            'Consultant for University Certificates Equalization at Ministry of Education (2016 – Present)',
            'Member of Consultative (SHOURA) Council (2009 – 2021)',
            'Professor of Clinical Low Vision and Rehabilitation at King Saud University (KSU)',
            'Dean of College of Applied Medical Sciences at KSU (2008)',
            'Consultant for Low Vision & Rehabilitation at Ministry of Health (MOH) for 10 years',
            'Member of different Committees at the Saudi Commission for Health Specialties (SCFHS) and Saudi Food and Drug Authority (SFDA)'
          ]
        }
      ]
    }
  ];

  ngOnInit(): void {
    this.updateCardsPerView();
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  startAutoPlay(): void {
    this.stopAutoPlay();
    if (typeof window !== 'undefined') {
      this.autoPlayTimer = setInterval(() => {
        if (!this.isLeaderModalOpen && !this.isOverviewModalOpen) {
          this.nextLeader();
        }
      }, 2000);
    }
  }

  stopAutoPlay(): void {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateCardsPerView();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isLeaderModalOpen) {
      this.closeLeaderModal();
    } else if (this.isOverviewModalOpen) {
      this.closeOverviewModal();
    }
  }

  private updateCardsPerView(): void {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width <= 768) {
        this.cardsPerView = 1;
      } else if (width <= 1024) {
        this.cardsPerView = 2;
      } else {
        this.cardsPerView = 3;
      }

      if (this.leaderIndex > this.maxLeaderIndex) {
        this.leaderIndex = this.maxLeaderIndex;
      }
    }
  }

  get maxLeaderIndex(): number {
    return Math.max(0, this.leaders.length - this.cardsPerView);
  }

  get leaderPages(): number[] {
    return Array.from({ length: this.maxLeaderIndex + 1 }, (_, i) => i);
  }

  openOverviewModal(): void {
    this.isOverviewModalOpen = true;
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  closeOverviewModal(): void {
    this.isOverviewModalOpen = false;
    if (!this.isLeaderModalOpen && typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  openLeaderModal(leader: Leader): void {
    this.selectedLeader = leader;
    this.isLeaderModalOpen = true;
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  closeLeaderModal(): void {
    this.isLeaderModalOpen = false;
    this.selectedLeader = null;
    if (!this.isOverviewModalOpen && typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }


  toggleReadMore(): void {
    this.openOverviewModal();
  }

  toggleVision(): void {
    this.isVisionExpanded = !this.isVisionExpanded;
  }

  toggleMission(): void {
    this.isMissionExpanded = !this.isMissionExpanded;
  }

  toggleFacility(): void {
    this.isFacilityExpanded = !this.isFacilityExpanded;
  }

  prevLeader(): void {
    if (this.leaderIndex > 0) {
      this.leaderIndex--;
    } else {
      this.leaderIndex = this.maxLeaderIndex;
    }
    this.startAutoPlay();
  }

  nextLeader(): void {
    if (this.leaderIndex < this.maxLeaderIndex) {
      this.leaderIndex++;
    } else {
      this.leaderIndex = 0;
    }
  }

  goToLeader(index: number): void {
    this.leaderIndex = Math.min(Math.max(0, index), this.maxLeaderIndex);
    this.startAutoPlay();
  }

  // Mobile Touch Swipe Handling
  onTouchStart(event: TouchEvent): void {
    this.stopAutoPlay();
    this.touchStartX = event.changedTouches[0].screenX;
  }

  onTouchEnd(event: TouchEvent): void {
    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipe();
    this.startAutoPlay();
  }

  private handleSwipe(): void {
    const swipeThreshold = 45;
    const diff = this.touchStartX - this.touchEndX;
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        this.nextLeader();
      } else {
        this.prevLeader();
      }
    }
  }
}
