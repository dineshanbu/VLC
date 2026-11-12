import { LeaderProfileModalData } from '../components/leader-profile-modal/leader-profile-modal';

export interface LocalizedLeaderProfile extends LeaderProfileModalData {}

export interface LeaderProfileSource extends Omit<Partial<LeaderProfileModalData>, 'bioSections'> {
  name: string;
  title: string;
  role: string;
  badge: string;
  name_ar?: string;
  title_ar?: string;
  role_ar?: string;
  badge_ar?: string;
  // API payloads may contain parsed arrays or JSON strings, depending on the
  // endpoint/cache that supplied the leader.
  bio_sections?: unknown;
  bio_sections_ar?: unknown;
  bioSections?: unknown;
  bioSectionsAr?: unknown;
}
export const ARABIC_LEADER_FALLBACKS: Record<string, LocalizedLeaderProfile> = {
    almosa: {
      name: 'د. خالد الموسى',
      title: 'المؤسس ورئيس مجلس إدارة شركة اللقاحات الصناعية القابضة',
      role: 'رائد صناعة التقنية الحيوية في المملكة واستشاري إدارة أول، والمُلقب بـ "عراب تصنيع التقنية الحيوية في المملكة العربية السعودية".',
      badge: 'المؤسس ورئيس مجلس الإدارة',
      initials: 'خ م',
      image: '/uploads/1791464700410-121578282-Dr.Khaled-Almosa.webp',
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
      image: '/uploads/1791464656591-379501210-H.E-Dr.-Hussein-AlGazairy-1-1.webp',
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
      image: '/uploads/1791464748885-690717555-Professor-Aws-Alshamsan-1-1.webp',
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
      image: 'mr.-turki-al-dayel-director-1.jpg',
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
      image: 'mr.-abdulrahman-almalik-1.jpg',
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
      image: 'prof-abdullah-alotaibi.webp',
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
const BADGE_TRANSLATIONS: Record<string, string> = {
  'Founder & Chairman': 'المؤسس ورئيس مجلس الإدارة',
  'Scientific Board': 'الهيئة العلمية',
  'Advisory Board': 'الهيئة الاستشارية',
  'Medical Board': 'الهيئة الطبية',
  'Executive Board': 'مجلس الإدارة التنفيذي',
  'Board of Directors': 'مجلس الإدارة',
  'Executive Management': 'الإدارة التنفيذية'
};

export function findArabicLeaderFallback(leader: LeaderProfileSource): LocalizedLeaderProfile | undefined {
  const name = leader.name.toLowerCase();
  if (name.includes('khaled') || name.includes('almosa')) return ARABIC_LEADER_FALLBACKS['almosa'];
  if (name.includes('hussein') || (name.includes('algazairy') && (name.includes('h.e') || name.includes('dr.')))) return ARABIC_LEADER_FALLBACKS['hussein'];
  if (name.includes('aws') || name.includes('alshamsan')) return ARABIC_LEADER_FALLBACKS['alshamsan'];
  if (name.includes('abdulrazak') || name.includes('abdul razak') || name.includes('drabdul')) return ARABIC_LEADER_FALLBACKS['abdulrazak'];
  if (name.includes('turki') || name.includes('dayel')) return ARABIC_LEADER_FALLBACKS['turki'];
  if (name.includes('abdulrahman') || name.includes('almalik') || name.includes('malik')) return ARABIC_LEADER_FALLBACKS['almalik'];
  if (name.includes('abdullah') || name.includes('alotaibi') || name.includes('otaibi')) return ARABIC_LEADER_FALLBACKS['alotaibi'];
  return undefined;
}

function normalizeBioSections(value: unknown): LeaderProfileModalData['bioSections'] {
  let sections = value;
  if (typeof sections === 'string') {
    try {
      sections = JSON.parse(sections);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(sections)) return [];

  return sections
    .filter((section): section is Record<string, unknown> => !!section && typeof section === 'object')
    .map(section => {
      const normalizeItems = (items: unknown): string[] => {
        if (typeof items === 'string') return items.trim() ? [items] : [];
        if (!Array.isArray(items)) return [];
        return items.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
      };
      return {
        heading: typeof section['heading'] === 'string' ? section['heading'] : '',
        paragraphs: normalizeItems(section['paragraphs']),
        items: normalizeItems(section['items'])
      };
    })
    .filter(section => section.heading.trim().length > 0 || !!section.paragraphs?.length || !!section.items?.length);
}

function sectionsWithContent(sections: LeaderProfileModalData['bioSections']): boolean {
  return sections.some(section =>
    [...(section.paragraphs || []), ...(section.items || [])].some(value => value.trim().length > 0)
  );
}

export function localizeLeaderName(leader: LeaderProfileSource, isArabic: boolean): string {
  if (!isArabic) return leader.name;
  return leader.name_ar || findArabicLeaderFallback(leader)?.name || leader.name;
}

export function localizeLeaderTitle(leader: LeaderProfileSource, isArabic: boolean): string {
  if (!isArabic) return leader.title;
  return leader.title_ar || findArabicLeaderFallback(leader)?.title || leader.title;
}

export function localizeLeaderRole(leader: LeaderProfileSource, isArabic: boolean): string {
  if (!isArabic) return leader.role;
  return leader.role_ar || findArabicLeaderFallback(leader)?.role || leader.role;
}

export function localizeLeaderBadge(leader: LeaderProfileSource, isArabic: boolean): string {
  if (!isArabic) return leader.badge;
  const fallback = findArabicLeaderFallback(leader);
  return leader.badge_ar || BADGE_TRANSLATIONS[leader.badge] || fallback?.badge || leader.badge;
}

export function localizeLeaderBioSections(leader: LeaderProfileSource, isArabic: boolean): LeaderProfileModalData['bioSections'] {
  const englishCandidates = [leader.bioSections, leader.bio_sections].map(normalizeBioSections);
  const englishSections = englishCandidates.find(sectionsWithContent) || englishCandidates.find(sections => sections.length > 0) || [];
  if (!isArabic) return englishSections;

  const arabicCandidates = [leader.bioSectionsAr, leader.bio_sections_ar].map(normalizeBioSections);
  // Some API records contain placeholder Arabic sections with only a heading
  // (or an empty paragraph). Don't let those suppress the complete localized
  // profile fallback below.
  const arabicSections = arabicCandidates.find(sectionsWithContent);
  if (arabicSections) return arabicSections;

  const fallbackSections = normalizeBioSections(findArabicLeaderFallback(leader)?.bioSections);
  return sectionsWithContent(fallbackSections) ? fallbackSections : englishSections;
}

export function localizeLeaderProfile(leader: LeaderProfileSource, isArabic: boolean): LeaderProfileModalData {
  return {
    id: leader.id,
    name: localizeLeaderName(leader, isArabic),
    title: localizeLeaderTitle(leader, isArabic),
    role: localizeLeaderRole(leader, isArabic),
    badge: localizeLeaderBadge(leader, isArabic),
    initials: leader.initials,
    image: leader.image,
    bioSections: localizeLeaderBioSections(leader, isArabic)
  };
}
