import { Component, HostListener, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AboutService } from '../../../core/services/about.service';
import { TranslationService } from '../../../core/services/translation.service';
import { AboutPageContentMap } from '../../../core/models/about.model';

export interface LeaderSection {
  heading: string;
  items?: string[];
  paragraphs?: string[];
}

export interface Leader {
  id?: number;
  name: string;
  name_ar?: string;
  title: string;
  title_ar?: string;
  role: string;
  role_ar?: string;
  badge: string;
  badge_ar?: string;
  initials: string;
  image: string;
  bioSections?: LeaderSection[];
  bioSectionsAr?: LeaderSection[];
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.html',
  styleUrl: './about.css'
})
export class AboutComponent implements OnInit, OnDestroy {
  private aboutService = inject(AboutService);
  public translationService = inject(TranslationService);

  // Dynamic Content Signals
  pageContent = signal<Partial<AboutPageContentMap>>({});

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

  // Arabic localized leadership profiles
  private readonly arabicLeadersMap: Record<string, Leader> = {
    almosa: {
      name: 'د. خالد الموسى',
      title: 'المؤسس ورئيس مجلس إدارة شركة اللقاحات الصناعية القابضة',
      role: 'رائد صناعة التقنية الحيوية في المملكة واستشاري إدارة أول، والمُلقب بـ "عراب تصنيع التقنية الحيوية في المملكة العربية السعودية".',
      badge: 'المؤسس ورئيس مجلس الإدارة',
      initials: 'خ م',
      image: 'Dr.Khaled-Almosa.jpeg',
      bioSections: [
        {
          heading: 'نبذة تنفيذية',
          paragraphs: [
            'يعد الدكتور خالد الموسى رائداً وطنياً في صناعة التقنية الحيوية واستشارياً أول في الإدارة الصحية. وصفه معالي الدكتور حسين الجزائري (المدير الإقليمي الأسبق لمنظمة الصحة العالمية ووزير الصحة السعودي الأسبق) بأنه "عراب تصنيع التقنية الحيوية في المملكة العربية السعودية"، حيث ساهم في تشكيل وتطوير قطاع علوم الحياة والرعاية الصحية في المملكة لأكثر من ثلاثة عقود.'
          ]
        },
        {
          heading: 'القيادة الحكومية ورسم السياسات والابتكار',
          paragraphs: [
            'حاز على عضوية اللجنة العليا للبحث والتطوير والابتكار (2021–2024) برئاسة صاحب السمو الملكي ولي العهد رئيس مجلس الوزراء في مجلس الشؤون الاقتصادية والتنمية، حيث ساهمت جهوده في صياغة الاستراتيجيات الوطنية للتقنية الحيوية والرعاية الصحية والبحث والابتكار.'
          ]
        },
        {
          heading: 'الملف التنفيذي المهني',
          paragraphs: [
            'الدكتور الموسى هو أول مواطن سعودي يستثمر ويؤسس مصانع للتقنية الحيوية في المملكة، حيث أنشأ شركات ومرافق رائدة في إنتاج الإنسولين والمستحضرات الحيوية، واللقاحات البشرية والبيطرية، والهندسة الطبية، والخدمات الصحية والاستشارات، والبحث والتطوير، مساهماً مباشرة في تحقيق مستهدفات رؤية السعودية 2030 عبر توطين الرعاية الصحية وتأهيل الكفاءات الوطنية.'
          ]
        },
        {
          heading: 'مشاريع التقنية الحيوية الرائدة',
          items: [
            'الشركة السعودية للصناعات الحيوية (SAUDI BIO 2010–2020) — المؤسس ورئيس مجلس الإدارة: أول وأوحد مصنّع سعودي للإنسولين والمستحضرات الحيوية بالشراكة مع نوفو نورديسك وساندوز (استحوذت عليها شركة "لايفيرا" التابعة لصندوق الاستثمارات العامة في 2023).',
            'شركة اللقاحات الصناعية القابضة (VIC) — المؤسس ورئيس مجلس الإدارة: تحتضن أول منشأة لتصنيع اللقاحات البشرية في المملكة والأكبر في الشرق الأوسط، بالشراكة مع سي إس إل سيكيروس وكبرى الشركات العالمية.',
            'شركة الابتكار للتقنية الحيوية للبحث والتطوير — المؤسس ورئيس مجلس الإدارة: تأسست بالشراكة مع كلية بايلور للطب بالولايات المتحدة وبالتعاون مع مدينة الملك عبدالعزيز للعلوم والتقنية، وبتمويل من المعهد الوطني لأبحاث الصحة لإجراء التجارب السريرية للقاح كورونا ميرس.',
            'أنيمال فاكس (Anivax) — المؤسس ورئيس مجلس الإدارة: شركة متخصصة في أبحاث وتصنيع اللقاحات البيطرية بالشراكة مع بوهرنجر إنجلهايم العالمية لتكون المملكة مركزاً إقليمياً للتقنية الحيوية البيطرية.',
            'بيوإيرا للهندسة الصناعية وإدارة المشاريع — المؤسس ورئيس مجلس الإدارة: شركة هندسية دولية تنشط في دول الخليج والولايات المتحدة وأوروبا والهند بالتعاون مع شركاء دوليين مثل كي بلانتس وزايم بيوتك وبودتك.',
            'مجموعة شركات ميدتك — المؤسس ورئيس مجلس الإدارة: تدير مراكز جراحة اليوم الواحد والمجمعات الطبية وخدمات التوريدات الصحية بالرياض.',
            'معهد تدريب التقنية الحيوية — المؤسس: قيد التأسيس بالشراكة مع NIBRT الأيرلندي كأول معهد متخصص لتأهيل وتدريب الكفاءات والكوادر الحيوية في المنطقة.'
          ]
        },
        {
          heading: 'الاستشارات والإرشاد الاستراتيجي',
          items: [
            'مكتب الدكتور خالد الموسى للاستشارات الإدارية (الرياض) — رئيس المكتب: مرخص من وزارة التجارة والاستثمار؛ متخصص في استراتيجيات التقنية الحيوية والأبحاث والتطوير والاستثمار.',
            'أفيرون للاستشارات (دبي) — رئيس مجلس الإدارة: يقدم استشارات استراتيجية وتنظيمية في الرعاية الصحية ودخول الأسواق والشراكات الدولية.'
          ]
        },
        {
          heading: 'الأبحاث والمنشورات العلمية',
          items: [
            'دراسة: "استقصاء العوامل المؤثرة على نجاح قطاع تصنيع اللقاحات في المملكة العربية السعودية: متطلبات استدامة الرعاية الصحية".',
            'مؤلف: "مهمتي لإنقاذ الأرواح في المملكة: تمكين رؤية 2030 عبر التوطين الصناعي للإنسولين واللقاحات وعلاجات السرطان وتقنيات التعديل الجيني".'
          ]
        },
        {
          heading: 'الأثر والمسيرة الوطنية',
          paragraphs: [
            'يتجلى أثر الدكتور الموسى في المنظومة المتكاملة للتقنية الحيوية التي أرسى دعائمها في المملكة — من أول مصنع للإنسولين إلى أول مجمع للقاحات البشرية، ومن الأبحاث الرائدة إلى تأهيل أجيال الغد من المتخصصين، حاملاً رسالة وطنية سامية لإنقاذ الأرواح وتعزيز الأمن الصحي للمملكة.'
          ]
        }
      ]
    },
    hussein: {
      name: 'معالي د. حسين الجزائري',
      title: 'مؤسس كلية الطب بجامعة الملك سعود',
      role: 'وزير الصحة السعودي الأسبق والمدير الإقليمي الأسبق لمنظمة الصحة العالمية لإقليم شرق المتوسط.',
      badge: 'الهيئة الاستشارية',
      initials: 'ح ج',
      image: 'H.E-Dr.-Hussein-AlGazairy-1-1.jpg',
      bioSections: [
        {
          heading: 'المسيرة القيادية والتاريخية',
          items: [
            'مؤسس كلية الطب بجامعة الملك سعود بالرياض',
            'وزير الصحة الأسبق في المملكة العربية السعودية',
            'المدير الإقليمي الأسبق لمنظمة الصحة العالمية (WHO) لإقليم شرق المتوسط'
          ]
        }
      ]
    },
    alshamsan: {
      name: 'أ.د. أوس الشمسان',
      title: 'الأمين العام للهيئة السعودية للتخصصات الصحية',
      role: 'مستشار المستحضرات الحيوية الأسبق في الهيئة العامة للغذاء والدواء وعميد كلية الصيدلة الأسبق بجامعة الملك سعود.',
      badge: 'الهيئة العلمية',
      initials: 'أ ش',
      image: 'Professor-Aws-Alshamsan-1-1.jpg',
      bioSections: [
        {
          heading: 'الخلفية العلمية والأكاديمية',
          items: [
            'الأمين العام للهيئة السعودية للتخصصات الصحية',
            'مستشار المستحضرات والمنتجات الحيوية بالهيئة العامة للغذاء والدواء (SFDA) لمدة خمس سنوات',
            'المدير المشارك لمركز التميز المشترك لتقنية النانو الطبية بمدينة الملك عبدالعزيز للعلوم والتقنية (2013–2015)',
            'مدير معهد الملك عبدالله لتقنية النانو (2014–2017)',
            'عميد كلية الصيدلة بجامعة الملك سعود (2017–2022)'
          ]
        }
      ]
    },
    abdulrazak: {
      name: 'د. عبد الرزاق الجزائري',
      title: 'جراح استشاري أول وباحث طبي',
      role: 'رئيس قسم طب وجراحة العيون بمدينة الأمير سلطان الإنسانية، شريك مؤسس للشركة السعودية للصناعات الحيوية، ورئيس مجموعة ميديتك.',
      badge: 'الهيئة الطبية',
      initials: 'ع ج',
      image: 'drabdul.jpg',
      bioSections: [
        {
          heading: 'الخبرات الطبية والتنفيذية',
          items: [
            'جراح استشاري أول وباحث طبي متخصص',
            'رئيس قسم طب وجراحة العيون بمدينة سلطان بن عبدالعزيز للخدمات الإنسانية',
            'شريك مؤسس بالشركة السعودية للصناعات الحيوية المتقدمة للإنسولين',
            'رئيس مجلس إدارة مجموعة ميديتك الطبية'
          ]
        }
      ]
    },
    turki: {
      name: 'أ. تركي الدايل',
      title: 'الرئيس التنفيذي المشارك للشرق الأوسط ورئيس ناينتي ون للاستثمار المباشر',
      role: 'مدير ورئيس الاستثمار المباشر الأسبق بشركة رائدة الاستثمارية (التأمينات)، عضو مجلس إدارة المراكز العربية والشركة السعودية للصناعات الحيوية.',
      badge: 'مجلس الإدارة التنفيذي',
      initials: 'ت د',
      image: 'Mr.-Turki-Al-Dayel-Director-1.jpg',
      bioSections: [
        {
          heading: 'القيادة الاستثمارية والتنفيذية',
          items: [
            'الرئيس التنفيذي المشارك للشرق الأوسط ورئيس الاستثمار بشركة ناينتي ون في المملكة',
            'مدير ورئيس الاستثمار المباشر الأسبق بشركة رائدة للاستثمار (المؤسسة العامة للتأمينات الاجتماعية)',
            'عضو مجلس إدارة شركة المراكز العربية والشركة السعودية لصناعة المستحضرات الحيوية'
          ]
        }
      ]
    },
    almalik: {
      name: 'أ. عبد الرحمن المالك',
      title: 'المدير التنفيذي للاستثمارات - شركة تابعة لصندوق الاستثمارات العامة',
      role: 'خبير استثمار عقاري مباشر، مستشار أسبق لوزير الاقتصاد والتخطيط ومستشار مالي أسبق لدى إرنست آند يونغ.',
      badge: 'مجلس الإدارة التنفيذي',
      initials: 'ع م',
      image: 'Mr.-Abdulrahman-AlMalik-1.jpg',
      bioSections: [
        {
          heading: 'الاستراتيجية المؤسسية والحوكمة',
          items: [
            'المدير التنفيذي للاستثمارات في شركة تابعة لمحفظة صندوق الاستثمارات العامة (PIF)',
            'مستشار أسبق لمعالي وزير الاقتصاد والتخطيط، ومستشار مالي سابق في شركة إرنست آند يونغ (EY)',
            'حاصل على درجة الماجستير في إدارة الأعمال (MBA) من كلية إيسادي (ESADE) العالمية للأعمال'
          ]
        }
      ]
    },
    alotaibi: {
      name: 'أ.د. عبد الله العتيبي',
      title: 'مستشار أول لشؤون التعليم والتدريب',
      role: 'مستشار معادلة الشهادات الجامعية بوزارة التعليم وعضو مجلس الشورى السابق وأستاذ بجامعة الملك سعود.',
      badge: 'الهيئة الاستشارية',
      initials: 'ع ع',
      image: 'prof-abdullah-alotaibi.png',
      bioSections: [
        {
          heading: 'الخدمة العامة والقيادة الأكاديمية',
          items: [
            'مستشار أول لشؤون التعليم والتأهيل والتدريب',
            'مستشار الإدارة العامة لمعادلة الشهادات الجامعية بوزارة التعليم (2016 – حتى الآن)',
            'عضو مجلس الشورى السعودي (2009 – 2021)',
            'أستاذ البصريات الإكلينيكية وإعادة التأهيل بجامعة الملك سعود',
            'عميد كلية العلوم الطبية التطبيقية بجامعة الملك سعود (2008)',
            'مستشار لبرامج التأهيل والبصريات بوزارة الصحة لمدة 10 سنوات'
          ]
        }
      ]
    }
  };

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
    this.loadDynamicData();
    this.startAutoPlay();
  }

  loadDynamicData(): void {
    // 1. Fetch Dynamic Content Sections
    this.aboutService.getAboutContent().subscribe({
      next: (res) => {
        if (res.success && res.content) {
          this.pageContent.set(res.content);
        }
      },
      error: () => {
        // Fallback to static values seamlessly
      }
    });

    // 2. Fetch Dynamic Leaders
    this.aboutService.getLeaders({ status: 'Active' }).subscribe({
      next: (res) => {
        if (res.success && res.leaders && res.leaders.length > 0) {
          this.leaders = res.leaders.map(l => ({
            id: l.id,
            name: l.name,
            name_ar: l.name_ar,
            title: l.title,
            title_ar: l.title_ar,
            role: l.role,
            role_ar: l.role_ar,
            badge: l.badge || 'Executive Board',
            badge_ar: l.badge_ar,
            initials: l.initials || l.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase(),
            image: this.resolveImg(l.image),
            bioSections: l.bio_sections,
            bioSectionsAr: l.bio_sections_ar
          }));
          this.updateCardsPerView();
        }
      },
      error: () => {
        // Keeps official hardcoded fallback leaders
      }
    });
  }

  resolveImg(path: string | undefined | null, fallback = 'home_banner.png'): string {
    if (!path) return fallback;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/uploads/')) return `http://localhost:5000${path}`;
    return path;
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

  // ========================================================
  // Localization & Translation Helpers for Leaders
  // ========================================================

  private findArabicLeader(leader: Leader | null | undefined): Leader | undefined {
    if (!leader || !leader.name) return undefined;
    const name = leader.name.toLowerCase();
    if (name.includes('khaled') || name.includes('almosa')) {
      return this.arabicLeadersMap['almosa'];
    }
    if (name.includes('hussein') || (name.includes('algazairy') && (name.includes('h.e') || name.includes('dr.')))) {
      return this.arabicLeadersMap['hussein'];
    }
    if (name.includes('aws') || name.includes('alshamsan')) {
      return this.arabicLeadersMap['alshamsan'];
    }
    if (name.includes('abdulrazak') || name.includes('abdul razak') || name.includes('drabdul')) {
      return this.arabicLeadersMap['abdulrazak'];
    }
    if (name.includes('turki') || name.includes('dayel')) {
      return this.arabicLeadersMap['turki'];
    }
    if (name.includes('abdulrahman') || name.includes('almalik') || name.includes('malik')) {
      return this.arabicLeadersMap['almalik'];
    }
    if (name.includes('abdullah') || name.includes('alotaibi') || name.includes('otaibi')) {
      return this.arabicLeadersMap['alotaibi'];
    }
    return undefined;
  }

  getLeaderBadge(leader: Leader | null | undefined): string {
    if (!leader) return '';
    if (this.translationService.currentLang() === 'ar') {
      if (leader.badge_ar) return leader.badge_ar;
      const badgeMap: Record<string, string> = {
        'Founder & Chairman': 'المؤسس ورئيس مجلس الإدارة',
        'Scientific Board': 'الهيئة العلمية',
        'Advisory Board': 'الهيئة الاستشارية',
        'Medical Board': 'الهيئة الطبية',
        'Executive Board': 'مجلس الإدارة التنفيذي',
        'Board of Directors': 'مجلس الإدارة',
        'Executive Management': 'الإدارة التنفيذية'
      };
      if (leader.badge && badgeMap[leader.badge]) {
        return badgeMap[leader.badge];
      }
      const arLeader = this.findArabicLeader(leader);
      if (arLeader && arLeader.badge) return arLeader.badge;
    }
    return leader.badge;
  }

  getLeaderName(leader: Leader | null | undefined): string {
    if (!leader) return '';
    if (this.translationService.currentLang() === 'ar') {
      if (leader.name_ar) return leader.name_ar;
      const arLeader = this.findArabicLeader(leader);
      if (arLeader) return arLeader.name;
    }
    return leader.name;
  }

  getLeaderTitle(leader: Leader | null | undefined): string {
    if (!leader) return '';
    if (this.translationService.currentLang() === 'ar') {
      if (leader.title_ar) return leader.title_ar;
      const arLeader = this.findArabicLeader(leader);
      if (arLeader) return arLeader.title;
    }
    return leader.title;
  }

  getLeaderRole(leader: Leader | null | undefined): string {
    if (!leader) return '';
    if (this.translationService.currentLang() === 'ar') {
      if (leader.role_ar) return leader.role_ar;
      const arLeader = this.findArabicLeader(leader);
      if (arLeader) return arLeader.role;
    }
    return leader.role;
  }

  getLeaderBioSections(leader: Leader | null | undefined): LeaderSection[] {
    if (!leader) return [];
    if (this.translationService.currentLang() === 'ar') {
      if (leader.bioSectionsAr && leader.bioSectionsAr.length > 0) {
        return leader.bioSectionsAr;
      }
      const arLeader = this.findArabicLeader(leader);
      if (arLeader && arLeader.bioSections && arLeader.bioSections.length > 0) {
        return arLeader.bioSections;
      }
    }
    return leader.bioSections || [];
  }
}

