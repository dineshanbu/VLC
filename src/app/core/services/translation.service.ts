import { Injectable, signal, effect } from '@angular/core';

export type Language = 'en' | 'ar';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  readonly currentLang = signal<Language>('en');

  // Translations dictionary
  private readonly translations: Record<Language, Record<string, string>> = {
    en: {
      // Navbar & General
      'nav.home': 'Home',
      'nav.products': 'Products',
      'nav.about': 'About Us',
      'nav.partners': 'Partners',
      'nav.news': 'News & Media',
      'nav.careers': 'Careers',
      'nav.pharmacovigilance': 'Pharmacovigilance',
      'nav.contact': 'Contact Us',
      'nav.contactUsBtn': 'Contact Us',

      // Hero Banner
      'hero.eyebrowLine1': 'A HEALTHIER NATION.',
      'hero.eyebrowLine2': 'A BRIGHTER TOMORROW.',
      'hero.titleLine1': 'Protecting Lives.',
      'hero.titleLine2': 'Building',
      'hero.titleLine3Prefix': 'Healthier ',
      'hero.titleAccent': 'Futures.',
      'hero.description': "Saudi Arabia's advanced vaccine manufacturing company, advancing innovation, localization and regional health security.",
      'hero.exploreProducts': 'Explore Our Products',
      'hero.watchFilm': 'Watch Corporate Film',
      'hero.facilityCampus': 'VIC MANUFACTURING CAMPUS',
      'hero.facilityLocation': 'Riyadh, Saudi Arabia',
      'hero.watchVideo': 'Watch Corporate Video',
      'hero.videoModalTag': 'VACCINE INDUSTRIAL COMPANY',
      'hero.videoModalTitle': 'Corporate Overview',
      'hero.feature1': 'Localized Manufacturing',
      'hero.feature2': 'Global Partnerships',
      'hero.feature3': 'Innovation Driven',
      'hero.feature4': 'Healthier Communities',

      // About VIC Section
      'aboutVic.eyebrow': 'ABOUT VIC',
      'aboutVic.headingLine1': 'Driven by Science.',
      'aboutVic.headingLine2': 'Inspired by Humanity.',
      'aboutVic.desc': 'Vaccine Industrial Holding LLC (VIC), founded in 2022 in Riyadh by Dr. Khaled Almosa, a national biotech leader, is Saudi Arabia’s first company dedicated to establishing an advanced vaccine biomanufacturing facility. VIC aims to position the Kingdom as a regional and global vaccine hub by adopting advanced technologies, meeting global manufacturing standards, and strengthening national healthcare self-sufficiency.',
      'aboutVic.btn': 'More About VIC',
      'aboutVic.badge': 'Science for a Healthier Tomorrow',

      // Our Platform Section
      'platform.eyebrow': 'OUR PLATFORM',
      'platform.heading': 'Three Pillars for Greater Impact.',
      'platform.intro': 'We are building end-to-end capabilities to deliver high-quality vaccines for Saudi Arabia and beyond.',
      'platform.card1.number': '01',
      'platform.card1.tag': 'LOCALIZE',
      'platform.card1.title': 'Biomanufacturing',
      'platform.card1.desc': 'Empowering communities through localizing the manufacturing of vaccines in Saudi Arabia.',
      'platform.card2.number': '02',
      'platform.card2.tag': 'INNOVATE',
      'platform.card2.title': 'Research & Development',
      'platform.card2.desc': 'Advancing science through research, development and innovation in vaccine technologies.',
      'platform.card3.number': '03',
      'platform.card3.tag': 'SCALE',
      'platform.card3.title': 'Targeted Products',
      'platform.card3.desc': 'Building world-class manufacturing capabilities to deliver vaccines at scale.',
      'homeProduct.eyebrow': 'OUR PRODUCT',
      'homeProduct.link': 'Learn About',
      'homePartners.eyebrow': 'OUR PARTNERS',
      'homePartners.title': 'Stronger Together.',
      'homePartners.description': 'We work with leading global and regional partners to bring innovative vaccines to people across Saudi Arabia and beyond.',
      'visionSupport.eyebrow': 'SUPPORTING',
      'visionSupport.title': 'SAUDI VISION 2030',
      'visionSupport.description': 'Advancing healthcare localization through world-class vaccine manufacturing, technology transfer and scientific excellence.',
      'visionSupport.item1': 'Healthcare Localization',
      'visionSupport.item2': 'Advanced Manufacturing',
      'visionSupport.item3': 'Technology Transfer',
      'visionSupport.item4': 'National Health Security',

      // Latest News Section
      'news.eyebrow': 'LATEST NEWS',
      'news.mediaEyebrow': 'LATEST NEWS & MEDIA',
      'news.homeHeading': 'Updates on Our Journey.',
      'news.viewAll': 'View All News',
      'news.readMore': 'Read More',
      'news.item1.date': 'October 30, 2025',
      'news.item1.title': 'VIC Signs Strategic MoU with CSL Seqirus and Saudi MoH to Localise Cell-Based Influenza Vaccine Manufacturing',
      'news.item2.date': 'January 19, 2025',
      'news.item2.title': 'Construction of Saudi Arabia’s first human vaccine factory begins',
      'news.item3.date': 'October 26, 2024',
      'news.item3.title': 'Exciting Collaboration for Innovation in Vaccine Research and Development!',
      'news.item4.date': 'October 9, 2024',
      'news.item4.title': 'VIC Unveils New Company Introduction Video',

      // Products Page (English)
      'products.breadcrumb.home': 'Home',
      'products.breadcrumb.products': 'Products',
      'products.hero.titlePart1': 'Innovative Vaccines.',
      'products.hero.titlePart2': 'Trusted ',
      'products.hero.titleAccent': 'Protection.',
      'products.hero.desc': 'Developing and manufacturing high-quality vaccines to protect lives and strengthen global health security.',
      'products.section.eyebrow': 'OUR PRODUCTS',
      'products.btn.viewDetails': 'View Product Details',
      'products.btn.downloadBrochure': 'Download Brochure',
      'products.resources.heading': 'Resources & Downloads',
      'products.resources.item1': 'Product Information',
      'products.resources.item2': 'Prescribing Information',
      'products.resources.item3': 'Patient Information Leaflet',
      'products.resources.item4': 'Quality Certificate',
      'products.cta.badge': 'STRATEGIC COLLABORATION',
      'products.cta.titlePart1': 'Building a Healthier Future, ',
      'products.cta.titleAccent': 'Together.',
      'products.cta.desc': 'Partnering with global biotechnology leaders, research institutes, and healthcare organizations to localize advanced vaccine manufacturing and safeguard public health.',
      'products.cta.btn': 'Explore Partnerships',

      // Technology Section
      'products.tech.eyebrow': 'OUR TECHNOLOGY',
      'products.tech.heading': 'Cell-Based Vaccine Technology',
      'products.tech.desc': 'Flucelvax® is produced using advanced MDCK (Madin-Darby Canine Kidney) cell culture technology, a well-established and scalable platform for influenza vaccine production.',
      'products.tech.approach1': 'A MODERN APPROACH',
      'products.tech.approach2': 'TO VACCINE MANUFACTURING',
      'products.tech.pillar1.title': 'Faster Adaptability',
      'products.tech.pillar1.desc': 'Enables rapid response to emerging influenza strains.',
      'products.tech.pillar2.title': 'Egg-free Production',
      'products.tech.pillar2.desc': 'Suitable for individuals with egg allergies.',
      'products.tech.pillar3.title': 'Consistent Manufacturing',
      'products.tech.pillar3.desc': 'Delivers high-quality vaccines with reliable supply.',

      // Modal Tabs & Headers
      'products.modal.tab.overview': 'Overview',
      'products.modal.tab.specification': 'Specification',
      'products.modal.tab.indication': 'Indication',
      'products.modal.tab.storage': 'Storage & Handling',
      'products.modal.tab.documents': 'Documents',
      'products.modal.heading.overview': 'Product Overview',
      'products.modal.heading.quality': 'Quality Standards',
      'products.modal.heading.specs': 'Specifications',
      'products.modal.indication.desc': 'is indicated for active immunization against seasonal and epidemic pathogens targeted by this vaccine. Administration must comply with official national health authority vaccination guidelines.',
      'products.modal.indication.targetPop': 'Target Population',
      'products.modal.indication.targetVal': 'Individuals 6 months and older / High-risk and general population cohorts',
      'products.modal.indication.route': 'Administration Route',
      'products.modal.indication.routeVal': 'Administered via intramuscular injection by qualified healthcare professionals',

      // Products Data
      'products.flucelvax.name': 'Flucelvax®',
      'products.flucelvax.subtitle': 'Seasonal Influenza Vaccine',
      'products.flucelvax.desc': 'Flucelvax® is a next-generation, cell culture-based influenza vaccine designed to help protect against seasonal flu.',
      'products.flucelvax.feat1': 'Produced in MDCK cell culture',
      'products.flucelvax.feat2': 'Egg-free manufacturing process',
      'products.flucelvax.feat3': 'High purity and consistent quality',

      'products.vaxigrip.name': 'Vaxigrip®',
      'products.vaxigrip.subtitle': 'Influenza Vaccine (Split Virion)',
      'products.vaxigrip.desc': 'Vaxigrip® is formulated to provide robust seasonal protection against circulating influenza viruses, backed by proven clinical efficacy.',
      'products.vaxigrip.feat1': 'Quadrivalent broad protection against circulating flu strains',
      'products.vaxigrip.feat2': 'High batch-to-batch consistency and purity',
      'products.vaxigrip.feat3': 'Compliant with international WHO recommendations',

      'products.pneumovax.name': 'Pneumovax®',
      'products.pneumovax.subtitle': 'Pneumococcal Polyvalent Vaccine',
      'products.pneumovax.desc': 'Pneumovax® is a polyvalent vaccine formulated to protect against invasive pneumococcal infections in vulnerable and high-risk populations.',
      'products.pneumovax.feat1': 'Broad 23-serotype pneumococcal coverage',
      'products.pneumovax.feat2': 'Elevated and durable immune response',
      'products.pneumovax.feat3': 'Produced under strict GMP quality standards',

      'products.rotarix.name': 'Rotarix®',
      'products.rotarix.subtitle': 'Rotavirus Oral Vaccine',
      'products.rotarix.desc': 'Rotarix® is an oral vaccine offering early and robust protection against severe rotavirus gastroenteritis in infants.',
      'products.rotarix.feat1': 'Gentle oral drop administration for infants',
      'products.rotarix.feat2': 'High clinical efficacy against severe rotavirus diarrhea',
      'products.rotarix.feat3': 'Extensively validated across global clinical trials',

      // About Page (English)
      'about.hero.badge': 'ABOUT VIC',
      'about.hero.title': 'Vaccine Industrial Holding LLC',
      'about.hero.subtitle': 'Leading the Charge in Vaccine Innovation in Saudi Arabia',
      'about.hero.desc': 'Vaccine Industrial Holding LLC (VIC) stands as a pioneering biotechnology firm headquartered in Riyadh, Saudi Arabia, dedicated to advancing vaccine innovation, manufacturing excellence, and national healthcare resilience.',
      'about.hero.readMore': 'Read More',

      'about.purpose.eyebrow': 'OUR PURPOSE',
      'about.purpose.title': 'Vision and Mission',

      'about.vision.title': 'Our Vision',
      'about.vision.p1': 'To become a leading vaccine manufacturing company, recognized for scientific excellence, innovation and our contribution to healthier communities.',
      'about.vision.p2': "We are committed to contributing to the realization of the National Biotechnology Strategy and aligning our efforts with the ambitious goals of Saudi Arabia's Vision 2030.",
      'about.vision.p3': 'Having successfully pioneered the localization of the insulin and biotechnology industries within the Kingdom, we are now focused on advancing the localization of the vaccine industry.',

      'about.mission.title': 'Our Mission',
      'about.mission.p1': 'To develop and manufacture high-quality vaccines through innovation, strategic partnerships and local talent, strengthening health security and improving lives in Saudi Arabia and beyond.',
      'about.mission.p2': 'Vaccine Industrial Holding LLC is dedicated to advancing vaccine innovation and manufacturing excellence in Saudi Arabia, building a self-sustaining biotechnology ecosystem and safeguarding national healthcare resilience to shape a healthier future.',

      'about.btn.readMore': 'Read More →',
      'about.btn.readLess': 'Read Less ↑',

      'about.overview.badge': 'COMPANY OVERVIEW',
      'about.overview.title': 'Pioneering Biotechnology in Saudi Arabia',
      'about.overview.p1': 'Vaccine Industrial Holding LLC (VIC) stands as a pioneering biotechnology firm headquartered in Riyadh, Saudi Arabia. Established in January 2022, VIC was conceived by Dr. Khaled Almosa, a distinguished healthcare management consultant and a visionary in the biotechnology sector. With an illustrious career as the Founder, Vice Chairman, and Managing Director of the Saudi Biotechnology Manufacturing Company for Insulin and Biologics from 2010 to 2020, Dr. Almosa has significantly advanced the biotechnology industry within the Kingdom.',
      'about.overview.p2': 'Dr. Almosa is a multifaceted entrepreneur, having founded numerous companies across various industries. He is also the founder of the Biotechnology Innovation Company for R&D in collaboration with King Abdulaziz City for Science and Technology (KACST) and the Center for Vaccine Development at Baylor College of Medicine, Houston, USA. Additionally, he established the Biotechnology Training Institute in Saudi Arabia and Bioera Industrial Engineering Company to construct biotech facilities in the GCC region.',
      'about.overview.p3': 'Beyond his contributions to VIC, Dr. Almosa is a respected member of the KSA Supreme Committee for Research, Development, and Innovation, chaired by HRH Crown Prince and Prime Minister Mohammed bin Salman. This committee operates under the Council of Economic and Development Affairs and the Council of Ministers (2021–2024), emphasizing Dr. Almosa’s dedication to fostering innovation and driving progress in biotechnology and healthcare.',
      'about.overview.p4': 'Vaccine Industrial Holding LLC is the first and only company in Saudi Arabia committed to establishing a state-of-the-art vaccine biomanufacturing facility. This ambitious project aims to transform the Kingdom into a global hub for vaccine production, enhancing self-reliance and advancing the nation’s healthcare infrastructure.',
      'about.overview.p5': 'The development of this groundbreaking facility will occur in three strategic phases over seven years. Each phase is meticulously planned to build cutting-edge capabilities, utilizing the latest technologies and innovations to produce high-quality vaccines that meet global standards. VIC’s initiative reflects its commitment to supporting Saudi Arabia’s healthcare needs while contributing to global efforts in vaccine accessibility and sustainability.',
      'about.overview.highlight': 'Through this transformative journey, VIC addresses regional healthcare demands and positions Saudi Arabia as a global leader in vaccine manufacturing. With visionary leadership, technological excellence, and an unwavering commitment to innovation, Vaccine Industrial Holding LLC is paving the way for a healthier and more resilient future.',

      'about.v2030.badge': 'NATIONAL STRATEGY',
      'about.v2030.title': 'Aligned with Saudi Vision 2030',
      'about.v2030.desc': "VIC is proud to support the Kingdom's Vision 2030 by localizing advanced vaccine manufacturing, strengthening health security, creating high-value jobs, and driving innovation for a resilient and sustainable healthcare ecosystem.",
      'about.v2030.pillar1': 'Health Sector Transformation',
      'about.v2030.pillar2': 'Economic Diversification',
      'about.v2030.pillar3': 'Local Content Development',
      'about.v2030.pillar4': 'Innovation & Sustainability',

      'about.leadership.badge': 'LEADERSHIP & FOUNDING TEAM',
      'about.leadership.title': 'Founding Partners',
      'about.leadership.subtitle': "Distinguished medical leaders, biotechnology visionaries, and executive pioneers steering VIC's mission.",
      'about.leadership.viewProfile': 'View Profile',

      // Our Journey Section
      'about.journey.eyebrow': 'OUR MILESTONE',
      'about.journey.titleLine1': 'Building for',
      'about.journey.titleLine2': 'Generations',
      'about.journey.desc': 'From our establishment in 2022 to the development of advanced manufacturing capabilities, we are progressing towards a future of greater health security for Saudi Arabia and the region.',
      'about.journey.step1.year': '2022',
      'about.journey.step1.desc': 'Company established in Riyadh',
      'about.journey.step2.year': '2023',
      'about.journey.step2.desc': 'Strategic partnerships formed',
      'about.journey.step3.year': '2024',
      'about.journey.step3.desc': 'Manufacturing facility development begins',
      'about.journey.step4.year': '2025',
      'about.journey.step4.desc': 'Technology transfer and product pipeline',
      'about.journey.step5.year': 'Beyond 2025',
      'about.journey.step5.desc': 'Scaling manufacturing for regional impact',

      // Footer
      'footer.mission': 'Building a healthier future through innovation, advanced manufacturing and global partnerships.',
      'footer.quickLinks': 'Quick Links',
      'footer.howWeCanHelp': 'How we can help',
      'footer.query': 'For Query: ',
      'footer.address': 'Building No 4180, Unit 6708, Northern Ring Branch Road, Al Wadi, Riyadh-13313, Saudi Arabia',
      'footer.rights': 'Vaccine Industrial Company (VIC). All rights reserved.'
    },

    ar: {
      // Navbar & General
      'nav.home': 'الرئيسية',
      'nav.products': 'منتجاتنا',
      'nav.about': 'من نحن',
      'nav.partners': 'شركاؤنا',
      'nav.news': 'الأخبار والإعلام',
      'nav.careers': 'الوظائف',
      'nav.pharmacovigilance': 'اليقظة الدوائية',
      'nav.contact': 'اتصل بنا',
      'nav.contactUsBtn': 'تواصل معنا',

      // Hero Banner
      'hero.eyebrowLine1': 'نحو وطن أكثر صحة.',
      'hero.eyebrowLine2': 'وغد أكثر إشراقاً.',
      'hero.titleLine1': 'حماية الأرواح.',
      'hero.titleLine2': 'بناء مستقبل',
      'hero.titleLine3Prefix': 'أكثر ',
      'hero.titleAccent': 'صحة.',
      'hero.description': 'شركة متقدمة لتصنيع اللقاحات في المملكة العربية السعودية، تعمل على دفع عجلة الابتكار والتوطين والأمن الصحي الإقليمي.',
      'hero.exploreProducts': 'استكشف منتجاتنا',
      'hero.watchFilm': 'مشاهدة الفيديو التعريفي',
      'hero.facilityCampus': 'مجمع شركة لقاح للتصنيع',
      'hero.facilityLocation': 'الرياض، المملكة العربية السعودية',
      'hero.watchVideo': 'مشاهدة الفيديو التعريفي',
      'hero.videoModalTag': 'شركة اللقاحات الصناعية',
      'hero.videoModalTitle': 'نظرة عامة على الشركة',
      'hero.feature1': 'توطين التصنيع',
      'hero.feature2': 'شراكات عالمية',
      'hero.feature3': 'مدفوعون بالابتكار',
      'hero.feature4': 'مجتمعات أكثر صحة',

      // About VIC Section
      'aboutVic.eyebrow': 'نبذة عن الشركة',
      'aboutVic.headingLine1': 'مدفوعون بالعلم.',
      'aboutVic.headingLine2': 'ملهمون بالإنسانية.',
      'aboutVic.desc': 'تعد شركة اللقاحات الصناعية القابضة (VIC)، التي تأسست عام 2022 في الرياض بقيادة د. خالد الموسی، أحد رواد التقنية الحيوية في المملكة، أول شركة سعودية مكرسة لإنشاء منشأة متطورة للتصنيع الحيوي للقاحات. وتهدف الشركة إلى ترسيخ مكانة المملكة كمركز إقليمي وعالمي للقاحات من خلال تبني أحدث التقنيات والمعايير العالمية وتعزيز الاكتفاء الذاتي الصحي الوطني.',
      'aboutVic.btn': 'تعرف علينا أكثر',
      'aboutVic.badge': 'العلم من أجل غد أكثر صحة',

      // Our Platform Section
      'platform.eyebrow': 'منصتنا المتقدمة',
      'platform.heading': 'ثلاث ركائز لأثر أكبر.',
      'platform.intro': 'نبني قدرات متكاملة لتوفير لقاحات عالية الجودة للمملكة العربية السعودية وخارجها.',
      'platform.card1.number': '٠١',
      'platform.card1.tag': 'توطين',
      'platform.card1.title': 'التصنيع الحيوي',
      'platform.card1.desc': 'تمكين المجتمعات من خلال توطين صناعة اللقاحات الحيوية في المملكة العربية السعودية.',
      'platform.card2.number': '٠٢',
      'platform.card2.tag': 'ابتكار',
      'platform.card2.title': 'البحث والتطوير',
      'platform.card2.desc': 'الارتقاء بالعلوم الحيوية عبر منظومة بحث وتطوير وابتكار رائدة في تقنيات اللقاحات.',
      'platform.card3.number': '٠٣',
      'platform.card3.tag': 'توسيع القدرات',
      'platform.card3.title': 'منتجات موجهة',
      'platform.card3.desc': 'بناء قدرات تصنيعية بمقاييس عالمية لتوفير لقاحات آمنة وفعالة على نطاق واسع.',
      'homeProduct.eyebrow': 'منتجنا',
      'homeProduct.link': 'تعرّف على',
      'homePartners.eyebrow': 'شركاؤنا',
      'homePartners.title': 'معاً نصنع الفرق.',
      'homePartners.description': 'نعمل مع شركاء عالميين وإقليميين رائدين لتوفير لقاحات مبتكرة للمملكة العربية السعودية وخارجها.',
      'visionSupport.eyebrow': 'ندعم',
      'visionSupport.title': 'رؤية السعودية 2030',
      'visionSupport.description': 'تعزيز توطين الرعاية الصحية من خلال تصنيع اللقاحات بمستوى عالمي ونقل التقنية والتميز العلمي.',
      'visionSupport.item1': 'توطين الرعاية الصحية',
      'visionSupport.item2': 'التصنيع المتقدم',
      'visionSupport.item3': 'نقل التقنية',
      'visionSupport.item4': 'الأمن الصحي الوطني',

      // Latest News Section
      'news.eyebrow': 'آخر الأخبار',
      'news.mediaEyebrow': 'آخر الأخبار والإعلام',
      'news.homeHeading': 'آخر مستجدات رحلتنا.',
      'news.viewAll': 'عرض جميع الأخبار',
      'news.readMore': 'اقرأ المزيد',
      'news.item1.date': '٣٠ أكتوبر ٢٠٢٥',
      'news.item1.title': 'شركة اللقاحات الصناعية توقع مذكرة تفاهم استراتيجية مع CSL Seqirus ووزارة الصحة لتوطين تصنيع لقاحات الإنفلونزا المعتمدة على الخلايا',
      'news.item2.date': '١٩ يناير ٢٠٢٥',
      'news.item2.title': 'بدء أعمال تشييد أول مصنع للقاحات البشرية في المملكة العربية السعودية',
      'news.item3.date': '٢٦ أكتوبر ٢٠٢٤',
      'news.item3.title': 'تعاون علمي استراتيجي لدعم الابتكار في أبحاث وتطوير اللقاحات الحيوية',
      'news.item4.date': '٠٩ أكتوبر ٢٠٢٤',
      'news.item4.title': 'شركة اللقاحات الصناعية تطلق الفيديو التعريفي الشامل حول رؤيتها المستقبلية',

      // Products Page (Arabic)
      'products.breadcrumb.home': 'الرئيسية',
      'products.breadcrumb.products': 'منتجاتنا',
      'products.hero.titlePart1': 'لقاحات مبتكرة.',
      'products.hero.titlePart2': 'حماية ',
      'products.hero.titleAccent': 'موثوقة.',
      'products.hero.desc': 'تطوير وتصنيع لقاحات عالية الجودة لحماية الأرواح وتعزيز الأمن الصحي العالمي والمحلي.',
      'products.section.eyebrow': 'منتجاتنا الدوائية',
      'products.btn.viewDetails': 'عرض تفاصيل المنتج',
      'products.btn.downloadBrochure': 'تحميل الكتيب التعريفي',
      'products.resources.heading': 'الموارد والتحميلات',
      'products.resources.item1': 'معلومات المنتج الدوائي',
      'products.resources.item2': 'دليل الوصفات الطبية المعتمد',
      'products.resources.item3': 'نشرة معلومات المرضى',
      'products.resources.item4': 'شهادة الجودة والتصنيع الدوائي',
      'products.cta.badge': 'شراكة استراتيجية',
      'products.cta.titlePart1': 'نبني مستقبلاً أكثر صحة، ',
      'products.cta.titleAccent': 'معاً.',
      'products.cta.desc': 'نتعاون مع رواد التقنية الحيوية العالميين ومراكز الأبحاث لتوطين التصنيع المتقدم للقاحات وحماية الصحة العامة.',
      'products.cta.btn': 'استكشف شراكاتنا',

      // Technology Section (Arabic)
      'products.tech.eyebrow': 'تقنياتنا المتقدمة',
      'products.tech.heading': 'تقنية تصنيع اللقاحات القائمة على مزارع الخلايا',
      'products.tech.desc': 'يتم إنتاج لقاح Flucelvax® باستخدام تقنية مزارع الخلايا MDCK المتقدمة، وهي منصة راسخة وقابلة للتوسع لإنتاج لقاحات الإنفلونزا بأعلى معايير الجودة والكفاءة.',
      'products.tech.approach1': 'نهج حديث ومتطور',
      'products.tech.approach2': 'في تصنيع وإنتاج اللقاحات',
      'products.tech.pillar1.title': 'سرعة التكيف والاستجابة',
      'products.tech.pillar1.desc': 'تتيح الاستجابة السريعة والدقيقة لسلالات الإنفلونزا الموسمية والمستجدة.',
      'products.tech.pillar2.title': 'إنتاج خالٍ من البيض',
      'products.tech.pillar2.desc': 'مناسب تماماً للأفراد الذين يعانون من حساسية البيض ومشتقاته.',
      'products.tech.pillar3.title': 'كفاءة تصنيعية متسقة',
      'products.tech.pillar3.desc': 'توفر لقاحات عالية الجودة مع إمدادات دوائية موثوقة ومستدامة.',

      // Modal Tabs & Headers (Arabic)
      'products.modal.tab.overview': 'نظرة عامة',
      'products.modal.tab.specification': 'المواصفات الفنية',
      'products.modal.tab.indication': 'دواعي الاستعمال',
      'products.modal.tab.storage': 'الحفظ والتخزين',
      'products.modal.tab.documents': 'الوثائق الطبية',
      'products.modal.heading.overview': 'نظرة عامة على المنتج',
      'products.modal.heading.quality': 'معايير الجودة والتصنيع',
      'products.modal.heading.specs': 'المواصفات الدوائية',
      'products.modal.indication.desc': 'مخصص للتحصين الفعال ضد مسببات الأمراض الموسمية والوبائية المستهدفة بهذا اللقاح. ويجب أن تتوافق طريقة الإعطاء بدقة مع الإرشادات الوطنية المعتمدة من وزارة الصحة.',
      'products.modal.indication.targetPop': 'الفئة المستهدفة',
      'products.modal.indication.targetVal': 'الأفراد من سن 6 أشهر فما فوق / الفئات الأكثر عرضة للمخاطر الصحية وعامة أفراد المجتمع',
      'products.modal.indication.route': 'طريقة الإعطاء',
      'products.modal.indication.routeVal': 'عن طريق الحقن العضلي بإشراف ممارسين صحيين معتمدين',

      // Product 1: Flucelvax (Arabic)
      'products.flucelvax.name': 'Flucelvax®',
      'products.flucelvax.subtitle': 'لقاح الإنفلونزا الموسمية المعتمد على مزارع الخلايا',
      'products.flucelvax.desc': 'يعتبر Flucelvax® جيلاً متقدماً من لقاحات الإنفلونزا المصنعة بتقنية زراعة الخلايا لتوفير أقصى درجات الحماية من سلالات الإنفلونزا الموسمية.',
      'products.flucelvax.feat1': 'مصنع في مزارع خلايا MDCK الحيوية المتقدمة',
      'products.flucelvax.feat2': 'خالٍ تماماً من البيض ومناسب للأشخاص ذوي الحساسية',
      'products.flucelvax.feat3': 'درجة نقاء استثنائية وجودة تصنيعية متسقة عالمياً',

      // Product 2: Vaxigrip (Arabic)
      'products.vaxigrip.name': 'Vaxigrip®',
      'products.vaxigrip.subtitle': 'لقاح الإنفلونزا (فيروس مجزأ معطل)',
      'products.vaxigrip.desc': 'تم تطوير Vaxigrip® لتوفير استجابة مناعية قوية ضد فيروسات الإنفلونزا المنتشرة، مدعوماً بنتائج سريرية مثبتة على نطاق دولي واسع.',
      'products.vaxigrip.feat1': 'حماية رباعية واسعة النطاق ضد سلالات الإنفلونزا المتداولة',
      'products.vaxigrip.feat2': 'اتساق عالي الجودة بين دفعات الإنتاج مع أعلى معايير النقاء',
      'products.vaxigrip.feat3': 'متطابق كلياً مع توصيات منظمة الصحة العالمية (WHO)',

      // Product 3: Pneumovax (Arabic)
      'products.pneumovax.name': 'Pneumovax®',
      'products.pneumovax.subtitle': 'لقاح المكورات الرئوية متعدد التكافؤ',
      'products.pneumovax.desc': 'لقاح عالي الكفاءة تم تركيبه للحماية من عدوى المكورات الرئوية لدى الفئات الضعيفة والأكثر عرضة للإصابة والمضاعفات التنفسية.',
      'products.pneumovax.feat1': 'تغطية وقائية واسعة النطاق تشمل 23 نمطاً مصلياً رئوياً',
      'products.pneumovax.feat2': 'استجابة مناعية طويلة الأمد ومثبتة سريرياً',
      'products.pneumovax.feat3': 'ينتج وفقاً لأدق معايير ممارسات التصنيع الجيد (GMP)',

      // Product 4: Rotarix (Arabic)
      'products.rotarix.name': 'Rotarix®',
      'products.rotarix.subtitle': 'لقاح الروتا الفموي للرضع',
      'products.rotarix.desc': 'لقاح حي موهن يعطى عن طريق الفم لتوفير حماية مبكرة وفعالة للرضع ضد التهاب المعدة والأمعاء الحاد الناجم عن فيروس الروتا.',
      'products.rotarix.feat1': 'جرعات فموية لطيفة ومناسبة للرضع والأطفال حديثي الولادة',
      'products.rotarix.feat2': 'فعالية إكلينيكية عالية ومثبتة ضد نوبات الإسهال الشديد',
      'products.rotarix.feat3': 'معتمد ومختبر بدقة عبر دراسات سريرية دولية رائدة',

      // About Page (Arabic)
      'about.hero.badge': 'عن الشركة',
      'about.hero.title': 'شركة اللقاحات الصناعية القابضة',
      'about.hero.subtitle': 'ريادة الابتكار وتوطين صناعة اللقاحات في المملكة العربية السعودية',
      'about.hero.desc': 'تعد شركة اللقاحات الصناعية القابضة (VIC) شركة رائدة في مجال التقنية الحيوية ومقرها الرياض، المملكة العربية السعودية، وتكرس جهودها لتعزيز الابتكار في اللقاحات، والتميز في التصنيع، ودعم منظومة الأمن الصحي الوطني.',
            'about.hero.readMore': 'اقرأ المزيد',

      'about.purpose.eyebrow': 'أهدافنا',
      'about.purpose.title': 'الرؤية والرسالة',

      'about.vision.title': 'رؤيتنا',
      'about.vision.p1': 'أن نكون شركة رائدة في تصنيع اللقاحات، متميزة بالريادة العلمية والابتكار ومساهمتنا الفاعلة في بناء مجتمعات أكثر صحة.',
      'about.vision.p2': 'نلتزم بالمساهمة الفاعلة في تحقيق مستهدفات الاستراتيجية الوطنية للتقنية الحيوية ومواءمة جهودنا مع الطموحات الرائدة لرؤية السعودية 2030.',
      'about.vision.p3': 'بعد نجاحنا في توطين صناعة الإنسولين والمنتجات الحيوية المتقدمة داخل المملكة، نركز جهودنا اليوم على تسريع توطين صناعة اللقاحات البشرية وفق أعلى المعايير العالمية.',

      'about.mission.title': 'رسالتنا',
      'about.mission.p1': 'تطوير وتصنيع لقاحات عالية الجودة من خلال الابتكار والشراكات الاستراتيجية والكوادر الوطنية، لتعزيز الأمن الصحي وتحسين جودة الحياة في المملكة العربية السعودية وخارجها.',
      'about.mission.p2': 'تكرس شركة اللقاحات الصناعية القابضة جهودها للارتقاء بابتكار اللقاحات والتميز التصنيعي في المملكة العربية السعودية، وبناء منظومة تقنية حيوية مكتفية ذاتياً لحماية الصحة العامة وتعزيز الأمن الدوائي الوطني.',

      'about.btn.readMore': 'اقرأ المزيد ←',
      'about.btn.readLess': 'اقرأ أقل ↑',

      'about.overview.badge': 'نظرة عامة على الشركة',
      'about.overview.title': 'ريادة التقنية الحيوية وصناعة اللقاحات في المملكة',
      'about.overview.p1': 'تعد شركة اللقاحات الصناعية القابضة (VIC) شركة وطنية رائدة في مجال التقنية الحيوية، تتخذ من العاصمة الرياض مقراً رئيسياً لها. تأسست في يناير 2022 بمبادرة من الدكتور خالد الموسى، الخبير الاستشاري الرائد في إدارة الرعاية الصحية والتقنية الحيوية ومؤسس الشركة السعودية للصناعات الحيوية المتقدمة للإنسولين والمستحضرات الحيوية (2010–2020).',
      'about.overview.p2': 'أسس الدكتور الموسى العديد من المشاريع الرائدة، من بينها شركة الابتكار للتقنية الحيوية للأبحاث والتطوير بالتعاون مع مدينة الملك عبدالعزيز للعلوم والتقنية (KACST) ومركز أبحاث اللقاحات في كلية بايلور للطب بالولايات المتحدة، إضافة إلى معهد تدريب التقنية الحيوية وشركة بيوإيرا للهندسة الصناعية.',
      'about.overview.p3': 'يحظى الدكتور الموسى بعضوية اللجنة العليا للبحث والتطوير والابتكار برئاسة صاحب السمو الملكي ولي العهد رئيس مجلس الوزراء الأمير محمد بن سلمان، والمنبثقة عن مجلس الشؤون الاقتصادية والتنمية، تقديراً لمساهماته النوعية في توطين الصناعات المعرفية والطبية.',
      'about.overview.p4': 'تعد شركة اللقاحات الصناعية أول شركة سعودية متخصصة في تأسيس منشأة متكاملة للتصنيع الحيوي للقاحات، بهدف تحويل المملكة إلى مركز إقليمي ودولي لصناعة اللقاحات وتعزيز الاكتفاء الذاتي لمنظومة الرعاية الصحية.',
      'about.overview.p5': 'يجري تطوير المنشأة الصناعية عبر ثلاث مراحل استراتيجية متتالية على مدى سبع سنوات، لتأهيل قدرات تصنيعية متقدمة وفق أرقى معايير ممارسات التصنيع الجيد العالمية (GMP)، والمساهمة في استدامة سلاسل الإمداد الطبية الدولية.',
      'about.overview.highlight': 'تواصل شركة اللقاحات الصناعية مسيرتها بخطى واثقة لتلبية الاحتياجات الصحية الوطنية وترسيخ مكانة المملكة الرائدة عالمياً في تصنيع اللقاحات والتقنيات الحيوية، لبناء غدٍ أكثر صحة وأماناً.',

      'about.v2030.badge': 'الاستراتيجية الوطنية',
      'about.v2030.title': 'متوافقون مع رؤية السعودية 2030',
      'about.v2030.desc': 'تفخر شركة اللقاحات الصناعية بدعم رؤية المملكة 2030 من خلال توطين التصنيع المتقدم للقاحات، وتعزيز الأمن الصحي، وتوليد وظائف نوعية عالية القيمة، ودفع عجلة الابتكار لمنظومة صحية مستدامة وقادرة على الصمود.',
      'about.v2030.pillar1': 'برنامج تحول القطاع الصحي',
      'about.v2030.pillar2': 'التنويع الاقتصادي المستدام',
      'about.v2030.pillar3': 'تنمية وتوطين المحتوى المحلي',
      'about.v2030.pillar4': 'الابتكار والاستدامة الحيوية',

      'about.leadership.badge': 'فريق القيادة والشركاء المؤسسون',
      'about.leadership.title': 'الشركاء المؤسسون',
      'about.leadership.subtitle': 'نخبة من القادة والأطباء وخبراء التقنية الحيوية والرواد التنفيذيين يقودون مسيرة شركة اللقاحات الصناعية.',
      'about.leadership.viewProfile': 'عرض السيرة الذاتية',

      // Our Journey Section (Arabic)
      'about.journey.eyebrow': 'محطتنا الرئيسية',
      'about.journey.titleLine1': 'نبني',
      'about.journey.titleLine2': 'للأجيال',
      'about.journey.desc': 'منذ تأسيسنا في عام 2022 وحتى تطوير قدرات تصنيعية متقدمة، نواصل المضي بخطى واثقة نحو مستقبل يعزز الأمن الصحي للمملكة العربية السعودية والمنطقة.',
      'about.journey.step1.year': '2022',
      'about.journey.step1.desc': 'تأسيس الشركة في الرياض',
      'about.journey.step2.year': '2023',
      'about.journey.step2.desc': 'إبرام شراكات استراتيجية رائدة',
      'about.journey.step3.year': '2024',
      'about.journey.step3.desc': 'بدء تطوير مجمع التصنيع الحيوي',
      'about.journey.step4.year': '2025',
      'about.journey.step4.desc': 'نقل التقنية وتوسيع محفظة اللقاحات',
      'about.journey.step5.year': 'ما بعد 2025',
      'about.journey.step5.desc': 'توسيع نطاق التصنيع لأثر إقليمي مستدام',

      // Footer
      'footer.mission': 'بناء مستقبل صحي مزدهر من خلال الابتكار، والتصنيع المتقدم، والشراكات العالمية المستدامة.',
      'footer.quickLinks': 'روابط سريعة',
      'footer.howWeCanHelp': 'كيف يمكننا مساعدتك',
      'footer.query': 'للاستفسارات: ',
      'footer.address': 'مبنى 4180، وحدة 6708، طريق الدائري الشمالي الفرعي، الوادي، الرياض 13313، المملكة العربية السعودية',
      'footer.rights': 'شركة اللقاحات الصناعية (VIC). جميع الحقوق محفوظة.'
    }
  };

  constructor() {
    // Check saved language preference in localStorage
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('vic_language') as Language;
      if (savedLang === 'ar' || savedLang === 'en') {
        this.currentLang.set(savedLang);
      }
    }

    // Reactively update HTML document dir & lang attributes
    effect(() => {
      const lang = this.currentLang();
      if (typeof document !== 'undefined') {
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        if (lang === 'ar') {
          document.documentElement.classList.add('lang-ar');
          document.body.classList.add('lang-ar');
        } else {
          document.documentElement.classList.remove('lang-ar');
          document.body.classList.remove('lang-ar');
        }
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('vic_language', lang);
      }
    });
  }

  setLanguage(lang: Language): void {
    this.currentLang.set(lang);
  }

  isRtl(): boolean {
    return this.currentLang() === 'ar';
  }

  translate(key: string, fallback = ''): string {
    const lang = this.currentLang();
    return this.translations[lang]?.[key] || this.translations['en']?.[key] || fallback || key;
  }
}
