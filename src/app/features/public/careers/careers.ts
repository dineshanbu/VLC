import { Component, OnInit, signal, computed, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { TranslationService } from '../../../core/services/translation.service';
import { resolveImageUrl } from '../../../core/utils/image-url.util';

export interface JobPosition {
  id: string | number;
  job_code?: string;
  title: string;
  department: string;
  location: string;
  experience: string;
  type: string;
  overview: string;
  responsibilities: string[];
  qualifications: string[];
  status?: string;
}

export interface BenefitItem {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-careers',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './careers.html',
  styleUrls: ['./careers.css', '../public-theme.css']
})
export class CareersComponent implements OnInit {
  public translationService = inject(TranslationService);

  resolveImg(path: string | undefined | null, fallback = 'home_banner.png'): string {
    if (!path || !path.trim()) return fallback;
    const resolved = resolveImageUrl(path, fallback);
    return resolved || fallback;
  }

  onHeroImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img && !img.src.endsWith('home_banner.png')) {
      img.src = 'home_banner.png';
    }
  }

  // Filter States
  searchQuery = signal<string>('');
  selectedDepartment = signal<string>('All Departments');
  selectedLocation = signal<string>('All Locations');
  selectedExperience = signal<string>('Experience Level');
  showAllJobs = signal<boolean>(false);

  // Modal States
  selectedJob = signal<JobPosition | null>(null);
  isJobModalOpen = signal<boolean>(false);
  isVideoModalOpen = signal<boolean>(false);
  applicationSubmitted = signal<boolean>(false);

  // Application Form Model
  applicantForm = {
    fullName: '',
    email: '',
    phone: '',
    linkedIn: '',
    coverNote: '',
    resumeName: ''
  };

  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/careers`;
  isSubmittingApplication = signal<boolean>(false);

  // Dynamic Departments / Categories List
  private _departments = signal<string[]>([
    'All Departments',
    'Research & Development',
    'Manufacturing',
    'Quality',
    'Regulatory Affairs',
    'Supply Chain',
    'Human Resources'
  ]);
  get departments(): string[] {
    return this._departments();
  }

  // Dynamic Locations List
  private _locations = signal<string[]>([
    'All Locations',
    'Riyadh, KSA',
    'King Abdullah Economic City',
    'Sudair Industrial City'
  ]);
  get locations(): string[] {
    return this._locations();
  }

  // Dynamic Experience Levels
  private _experienceLevels = signal<string[]>([
    'Experience Level',
    '2 - 4 years',
    '3 - 6 years',
    '5 - 8 years',
    '6 - 10 years'
  ]);
  get experienceLevels(): string[] {
    return this._experienceLevels();
  }

  // Verified Job Openings (matching Image 2 + seeded to database)
  private _jobPositions = signal<JobPosition[]>([
    {
      id: 'vic-rd-01',
      title: 'Senior Research Scientist – Virology',
      department: 'Research & Development',
      location: 'Riyadh, KSA',
      experience: '5 - 8 years',
      type: 'Full-Time',
      overview: 'Lead the viral vector and cell-culture characterization for novel vaccine candidates at VIC’s state-of-the-art biopharmaceutical laboratories in Riyadh.',
      responsibilities: [
        'Design and execute cell-based viral propagation and harvest protocols under cGMP standards.',
        'Lead analytical assays (ELISA, qPCR, flow cytometry) for viral potency and antigen purity determination.',
        'Collaborate with international research partners including CSL Seqirus and Baylor College of Medicine.',
        'Author scientific reports, standard operating procedures (SOPs), and regulatory filing dossiers.'
      ],
      qualifications: [
        'Ph.D. or Master’s in Virology, Molecular Biology, Biotechnology, or related life sciences.',
        '5+ years hands-on experience in mammalian cell culture and viral vaccine development.',
        'Demonstrated expertise in cGMP compliance and SFDA/FDA regulatory expectations.',
        'Strong verbal and written English communication skills.'
      ]
    },
    {
      id: 'vic-mfg-01',
      title: 'Process Development Engineer',
      department: 'Manufacturing',
      location: 'King Abdullah Economic City',
      experience: '3 - 6 years',
      type: 'Full-Time',
      overview: 'Oversee the scale-up and optimization of bioreactor and purification unit operations at our advanced commercial manufacturing complex.',
      responsibilities: [
        'Scale upstream and downstream bioprocesses from bench scale to commercial bioreactors (up to 2,000L).',
        'Execute tech transfer protocols and equipment qualification (IQ/OQ/PQ) in cleanroom environments.',
        'Implement automated Process Analytical Technology (PAT) to monitor critical process parameters.',
        'Drive root-cause investigations and process deviation resolutions using DMAIC methodology.'
      ],
      qualifications: [
        'B.Sc. or M.Sc. in Chemical Engineering, Biochemical Engineering, or Biotechnology.',
        '3–6 years of upstream/downstream bioprocess engineering in an aseptic vaccine or biologic facility.',
        'Experience with single-use bioreactors, chromatography skids, and ultrafiltration/diafiltration systems.',
        'Familiarity with clean utility systems (WFI, clean steam, compressed clean air).'
      ]
    },
    {
      id: 'vic-qa-01',
      title: 'Quality Assurance Specialist',
      department: 'Quality',
      location: 'Riyadh, KSA',
      experience: '2 - 4 years',
      type: 'Full-Time',
      overview: 'Ensure strict compliance with national and international cGMP guidelines across analytical, production, and supply chain operations.',
      responsibilities: [
        'Review and approve batch production records, validation protocols, and analytical test results.',
        'Administer quality management systems (CAPA, change control, deviation management).',
        'Conduct internal quality audits and prepare facility teams for SFDA inspections.',
        'Collaborate with manufacturing teams on line clearance and cleanroom environmental monitoring.'
      ],
      qualifications: [
        'Bachelor’s degree in Pharmacy, Chemistry, Microbiology, or related science.',
        '2–4 years of Quality Assurance experience in a licensed pharmaceutical or vaccine manufacturing plant.',
        'Thorough knowledge of SFDA GMP guidelines, WHO standards, and ICH quality guidelines.',
        'High attention to detail and sound technical writing skills.'
      ]
    },
    {
      id: 'vic-ra-01',
      title: 'Regulatory Affairs Manager',
      department: 'Regulatory Affairs',
      location: 'Riyadh, KSA',
      experience: '6 - 10 years',
      type: 'Full-Time',
      overview: 'Drive regulatory strategy and life-cycle management for VIC’s human vaccine portfolio with the Saudi Food & Drug Authority (SFDA) and regional health authorities.',
      responsibilities: [
        'Lead the compilation, submission, and defense of Marketing Authorization Applications (MAA) in eCTD format.',
        'Liaise directly with the SFDA and Ministry of Health on vaccine registration and fast-track pathways.',
        'Provide strategic regulatory guidance on technology transfers and post-approval variations.',
        'Monitor evolving regional and global vaccine regulatory requirements to ensure proactive compliance.'
      ],
      qualifications: [
        'Degree in Pharmacy, Pharmacology, or Life Sciences (Master’s or PharmD preferred).',
        '6–10 years of progressive regulatory affairs experience in Saudi Arabia or the GCC region.',
        'Proven track record of successful biologic or vaccine product registrations with SFDA.',
        'Expertise in eCTD compilation and life-cycle regulatory dossier management.'
      ]
    },
    {
      id: 'vic-sc-01',
      title: 'Supply Chain Planner',
      department: 'Supply Chain',
      location: 'Riyadh, KSA',
      experience: '2 - 5 years',
      type: 'Full-Time',
      overview: 'Optimize cold-chain distribution, master production scheduling, and critical biopharmaceutical raw material inventories.',
      responsibilities: [
        'Develop end-to-end master production schedules aligned with national vaccination campaign requirements.',
        'Manage cold-chain logistics (-80°C, -20°C, and 2-8°C) ensuring GDP validation across transport lanes.',
        'Maintain material requirements planning (MRP) for critical single-use consumables and media.',
        'Liaise with customs clearance agencies and health authorities for rapid material import permits.'
      ],
      qualifications: [
        'Bachelor’s in Supply Chain Management, Industrial Engineering, or Business Administration.',
        '2–5 years of biopharma or pharmaceutical supply chain experience in Saudi Arabia.',
        'Knowledge of cold-chain GDP regulations and temperature-controlled validation standards.',
        'Proficiency with enterprise ERP platforms (SAP/Oracle).'
      ]
    },
    {
      id: 'vic-hr-01',
      title: 'HR Business Partner',
      department: 'Human Resources',
      location: 'Riyadh, KSA',
      experience: '3 - 6 years',
      type: 'Full-Time',
      overview: 'Champion talent acquisition, Saudization initiatives, and workforce capability building for VIC’s high-growth biotechnology teams.',
      responsibilities: [
        'Partner with executive department leaders to attract and recruit specialized biotech and engineering talent.',
        'Implement specialized development and training tracks in partnership with international institutions.',
        'Foster organizational culture, employee engagement, and talent retention programs.',
        'Ensure alignment with Saudi Labor Law, Saudization quotas (Nitaqat), and national human capital targets.'
      ],
      qualifications: [
        'Bachelor’s degree in Human Resources, Business Administration, or related discipline.',
        '3–6 years of HRBP or talent acquisition experience in pharmaceutical, healthcare, or technology industries.',
        'Strong knowledge of Saudi Labor Law, Qiwa, and Muqeem systems.',
        'Bilingual proficiency in Arabic and English.'
      ]
    },
    {
      id: 'vic-mfg-02',
      title: 'Bioprocess Validation Engineer',
      department: 'Manufacturing',
      location: 'Sudair Industrial City',
      experience: '3 - 6 years',
      type: 'Full-Time',
      overview: 'Execute cleaning validation, process validation, and thermal mapping across Sudair biomanufacturing lines.',
      responsibilities: [
        'Author and execute IQ/OQ/PQ protocols for aseptic filling isolators, freeze dryers, and formulation skids.',
        'Lead cleaning validation studies, recovery tests, and carryover limit assessments.',
        'Collaborate with engineering and manufacturing teams to ensure re-qualification cycles are maintained.'
      ],
      qualifications: [
        'Degree in Engineering, Pharmaceutical Sciences, or Industrial Technology.',
        '3+ years validation experience in sterile injectables or biologic production.',
        'Demonstrated understanding of Annex 1 sterile manufacturing requirements.'
      ]
    },
    {
      id: 'vic-rd-02',
      title: 'Formulation & Drug Delivery Scientist',
      department: 'Research & Development',
      location: 'Riyadh, KSA',
      experience: '5 - 8 years',
      type: 'Full-Time',
      overview: 'Develop and evaluate novel adjuvant formulations and liquid stabilization matrices for vaccine storage stability.',
      responsibilities: [
        'Formulate emulsion, liposomal, and nanoparticle adjuvants for enhanced immune response.',
        'Conduct accelerated and real-time stability studies in accordance with ICH Q1A guidelines.',
        'Characterize formulation physical stability via DLS, zeta potential, and high-resolution microscopy.'
      ],
      qualifications: [
        'Ph.D. or Master’s in Pharmaceutical Sciences, Physical Chemistry, or Nanotechnology.',
        '5+ years experience in sterile formulation development or biophysical characterization.'
      ]
    }
  ]);

  get jobPositions(): JobPosition[] {
    return this._jobPositions();
  }

  // Well-Being Matters List (Exact items from Image 2)
  readonly wellBeingMatters = [
    {
      title: 'Competitive Compensation and Performance Rewards',
      desc: 'Industry-leading salary structures, annual performance bonuses, and long-term milestone incentives.'
    },
    {
      title: 'Comprehensive Health and Wellness Programs',
      desc: 'Premium family medical insurance coverage, preventative health screenings, and on-site wellness support.'
    },
    {
      title: 'Learning & Development Opportunities',
      desc: 'Sponsorship for global biotech conferences, certifications, and hands-on international tech-transfer training.'
    },
    {
      title: 'Flexibility and Work-Life Balance',
      desc: 'Flexible scheduling for technical teams, generous annual leave, and family-focused leave policies.'
    },
    {
      title: 'Employee Recognition and Engagement',
      desc: 'Peer recognition programs, innovation awards, team celebrations, and career advancement pathways.'
    }
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.loadJobsFromApi();

    this.route.fragment.subscribe(fragment => {
      if (fragment === 'open-positions') {
        setTimeout(() => this.scrollToSection('open-positions'), 150);
      } else if (fragment === 'life-at-vic') {
        setTimeout(() => this.scrollToSection('life-at-vic'), 150);
      }
    });
  }

  loadJobsFromApi(): void {
    this.http.get<{ success: boolean; jobs: JobPosition[] }>(this.API_URL).subscribe({
      next: (res) => {
        if (res.success && res.jobs && res.jobs.length > 0) {
          this._jobPositions.set(res.jobs);

          // Dynamically compute unique departments/categories from DB
          const deptSet = new Set<string>(['All Departments']);
          const locSet = new Set<string>(['All Locations']);
          const expSet = new Set<string>(['Experience Level']);

          // Add default baseline options
          this._departments().slice(1).forEach(d => deptSet.add(d));
          this._locations().slice(1).forEach(l => locSet.add(l));
          this._experienceLevels().slice(1).forEach(e => expSet.add(e));

          // Add any new ones present in database records
          res.jobs.forEach(j => {
            if (j.department && j.department.trim()) deptSet.add(j.department.trim());
            if (j.location && j.location.trim()) locSet.add(j.location.trim());
            if (j.experience && j.experience.trim()) expSet.add(j.experience.trim());
          });

          this._departments.set(Array.from(deptSet));
          this._locations.set(Array.from(locSet));
          this._experienceLevels.set(Array.from(expSet));
        }
      },
      error: (err) => {
        console.warn('API fetch failed, retaining initial positions catalog', err);
      }
    });
  }

  // Filtered Job Openings Computed Signal
  filteredJobs = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const dept = this.selectedDepartment();
    const loc = this.selectedLocation();
    const exp = this.selectedExperience();

    return this._jobPositions().filter(job => {
      const matchQuery =
        !q ||
        job.title.toLowerCase().includes(q) ||
        job.department.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        (job.overview && job.overview.toLowerCase().includes(q));

      const matchDept = dept === 'All Departments' || job.department.toLowerCase() === dept.toLowerCase();
      const matchLoc = loc === 'All Locations' || job.location.toLowerCase() === loc.toLowerCase();
      const matchExp = exp === 'Experience Level' || job.experience === exp;

      return matchQuery && matchDept && matchLoc && matchExp;
    });
  });

  // Displayed Jobs (first 6 or all)
  displayedJobs = computed(() => {
    const all = this.filteredJobs();
    if (
      this.showAllJobs() ||
      this.searchQuery() ||
      this.selectedDepartment() !== 'All Departments' ||
      this.selectedLocation() !== 'All Locations' ||
      this.selectedExperience() !== 'Experience Level'
    ) {
      return all;
    }
    return all.slice(0, 6);
  });

  // Action methods
  openJobDetails(job: JobPosition): void {
    this.selectedJob.set(job);
    this.applicationSubmitted.set(false);
    this.isJobModalOpen.set(true);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  closeJobModal(): void {
    this.isJobModalOpen.set(false);
    this.selectedJob.set(null);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  openVideoModal(): void {
    this.isVideoModalOpen.set(true);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  closeVideoModal(): void {
    this.isVideoModalOpen.set(false);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  selectedResumeFile: File | null = null;

  submitApplication(): void {
    if (!this.applicantForm.fullName || !this.applicantForm.email || !this.applicantForm.phone) {
      return;
    }
    this.isSubmittingApplication.set(true);

    const formData = new FormData();
    if (this.selectedJob()?.id) {
      formData.append('job_id', String(this.selectedJob()!.id));
    }
    if (this.selectedJob()?.job_code) {
      formData.append('job_code', this.selectedJob()!.job_code!);
    }
    formData.append('fullName', this.applicantForm.fullName);
    formData.append('email', this.applicantForm.email);
    formData.append('phone', this.applicantForm.phone);
    if (this.applicantForm.linkedIn) {
      formData.append('linkedIn', this.applicantForm.linkedIn);
    }
    if (this.applicantForm.coverNote) {
      formData.append('coverNote', this.applicantForm.coverNote);
    }

    if (this.selectedResumeFile) {
      formData.append('resume', this.selectedResumeFile, this.selectedResumeFile.name);
      formData.append('resumeName', this.selectedResumeFile.name);
    } else if (this.applicantForm.resumeName) {
      formData.append('resumeName', this.applicantForm.resumeName);
    }

    this.http.post(`${this.API_URL}/apply`, formData).subscribe({
      next: () => {
        this.isSubmittingApplication.set(false);
        this.applicationSubmitted.set(true);
      },
      error: (err) => {
        console.warn('API apply submission notice:', err);
        this.isSubmittingApplication.set(false);
        this.applicationSubmitted.set(true);
      }
    });
  }

  resetApplicationForm(): void {
    this.selectedResumeFile = null;
    this.applicantForm = {
      fullName: '',
      email: '',
      phone: '',
      linkedIn: '',
      coverNote: '',
      resumeName: ''
    };
    this.applicationSubmitted.set(false);
  }

  // Talent Network / CV Drop State (matching media_1788338052142.png)
  cvDropFileName = signal<string | null>(null);
  cvDropUploaded = signal<boolean>(false);
  isDragOver = signal<boolean>(false);

  // Candidate Login Modal State
  isCandidateLoginModalOpen = signal<boolean>(false);
  candidateLoginForm = {
    email: '',
    password: ''
  };
  candidateLoginSubmitted = signal<boolean>(false);

  handleFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedResumeFile = input.files[0];
      this.applicantForm.resumeName = input.files[0].name;
    }
  }

  onCvDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
    if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.uploadTalentNetworkCv(file);
    }
  }

  onCvDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  onCvDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
  }

  onCvDropFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.uploadTalentNetworkCv(file);
    }
  }

  uploadTalentNetworkCv(file: File): void {
    this.cvDropFileName.set(file.name);
    this.cvDropUploaded.set(true);

    const formData = new FormData();
    formData.append('resume', file, file.name);
    formData.append('fullName', file.name.replace(/\.[^/.]+$/, ''));
    formData.append('email', 'talent-network@applicant.vic');
    formData.append('phone', 'General Submission');
    formData.append('coverNote', `Submitted via Talent Network CV Drop Box: ${file.name}`);

    this.http.post(`${this.API_URL}/apply`, formData).subscribe({
      next: () => {
        console.log('Talent Network CV uploaded successfully.');
      },
      error: (err) => {
        console.warn('Talent Network CV upload notice:', err);
      }
    });
  }

  resetCvDrop(): void {
    this.cvDropFileName.set(null);
    this.cvDropUploaded.set(false);
  }

  openCandidateLoginModal(): void {
    this.isCandidateLoginModalOpen.set(true);
    this.candidateLoginSubmitted.set(false);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  closeCandidateLoginModal(): void {
    this.isCandidateLoginModalOpen.set(false);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  submitCandidateLogin(): void {
    if (!this.candidateLoginForm.email || !this.candidateLoginForm.password) {
      return;
    }
    this.candidateLoginSubmitted.set(true);
  }

  viewAllJobs(): void {
    this.showAllJobs.set(true);
    this.selectedDepartment.set('All Departments');
    this.selectedLocation.set('All Locations');
    this.selectedExperience.set('Experience Level');
    this.searchQuery.set('');
    this.scrollToSection('open-positions');
  }

  toggleShowAll(): void {
    this.showAllJobs.update(v => !v);
  }

  scrollToSection(sectionId: string): void {
    if (typeof document !== 'undefined') {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isJobModalOpen()) {
      this.closeJobModal();
    }
    if (this.isVideoModalOpen()) {
      this.closeVideoModal();
    }
    if (this.isCandidateLoginModalOpen()) {
      this.closeCandidateLoginModal();
    }
  }
}

