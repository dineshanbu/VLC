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
      'nav.contact': 'Contact Us',
      'nav.contactUsBtn': 'Contact Us',

      // Hero Banner
      'hero.titleLine1': 'Protecting Lives.',
      'hero.titleLine2': 'Building',
      'hero.titleLine3Prefix': 'Healthier ',
      'hero.titleAccent': 'Futures.',
      'hero.description': "Saudi Arabia's next-generation vaccine manufacturing company, advancing innovation, localization and global health.",
      'hero.watchVideo': 'Watch Corporate Video',
      'hero.videoModalTag': 'VACCINE INDUSTRIAL COMPANY',
      'hero.videoModalTitle': 'Corporate Overview',

      // About VIC Section
      'aboutVic.eyebrow': 'ABOUT VIC',
      'aboutVic.headingLine1': 'Driven by Science.',
      'aboutVic.headingLine2': 'Inspired by Humanity.',
      'aboutVic.desc': 'Vaccine Industrial Holding LLC (VIC), founded in 2022 in Riyadh by Dr. Khaled Almosa, a national biotech leader, is Saudi Arabia’s first company dedicated to establishing an advanced vaccine biomanufacturing facility. VIC aims to position the Kingdom as a regional and global vaccine hub by adopting advanced technologies, meeting global manufacturing standards, and strengthening national healthcare self-sufficiency.',
      'aboutVic.btn': 'Learn More About Us',

      // Our Platform Section
      'platform.eyebrow': 'OUR PLATFORM',
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

      // Latest News Section
      'news.eyebrow': 'LATEST NEWS',
      'news.viewAll': 'View All News',
      'news.readMore': 'Read More',
      'news.item1.date': 'October 30, 2025',
      'news.item1.title': 'VIC Signs Strategic MoU with CSL Seqirus and Saudi MoH to Localise Cell-Based Influenza Vaccine Manufacturing',
      'news.item2.date': 'January 19, 2025',
      'news.item2.title': 'Construction of Saudi Arabia’s first human vaccine factory begins',
      'news.item3.date': 'October 26, 2024',
      'news.item3.title': 'Exciting Collaboration for Innovation in Vaccine Research and Development!',
      'news.item4.date': 'October 9, 2024',
      'news.item4.title': 'Vaccine Industrial Company Unveils New Company Introduction Video',

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
      'nav.contact': 'اتصل بنا',
      'nav.contactUsBtn': 'تواصل معنا',

      // Hero Banner
      'hero.titleLine1': 'حماية الأرواح.',
      'hero.titleLine2': 'بناء مستقبل',
      'hero.titleLine3Prefix': 'أكثر ',
      'hero.titleAccent': 'صحة.',
      'hero.description': 'الجيل القادم من شركات تصنيع اللقاحات في المملكة العربية السعودية، لتعزيز الابتكار والتوطين والأمن الصحي العالمي.',
      'hero.watchVideo': 'مشاهدة الفيديو التعريفي',
      'hero.videoModalTag': 'شركة اللقاحات الصناعية',
      'hero.videoModalTitle': 'نظرة عامة على الشركة',

      // About VIC Section
      'aboutVic.eyebrow': 'نبذة عن الشركة',
      'aboutVic.headingLine1': 'مدفوعون بالعلم.',
      'aboutVic.headingLine2': 'ملهمون بالإنسانية.',
      'aboutVic.desc': 'تعد شركة اللقاحات الصناعية القابضة (VIC)، التي تأسست عام 2022 في الرياض بقيادة د. خالد الموسی، أحد رواد التقنية الحيوية في المملكة، أول شركة سعودية مكرسة لإنشاء منشأة متطورة للتصنيع الحيوي للقاحات. وتهدف الشركة إلى ترسيخ مكانة المملكة كمركز إقليمي وعالمي للقاحات من خلال تبني أحدث التقنيات والمعايير العالمية وتعزيز الاكتفاء الذاتي الصحي الوطني.',
      'aboutVic.btn': 'تعرف علينا أكثر',

      // Our Platform Section
      'platform.eyebrow': 'منصتنا المتقدمة',
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

      // Latest News Section
      'news.eyebrow': 'آخر الأخبار',
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
