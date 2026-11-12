export interface ManufacturingStage {
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  image_url: string;
  bullets: string[];
  bullets_ar: string[];
}

export interface ManufacturingSupportedFormat {
  name: string;
  name_ar: string;
}

export interface ManufacturingMetric {
  value: string;
  label: string;
  label_ar: string;
  description: string;
  description_ar: string;
}

export interface ManufacturingGrowthPhase {
  title: string;
  title_ar: string;
  description: string;
  description_ar: string;
  bullets: string[];
  bullets_ar: string[];
  image_url: string;
}

export interface ManufacturingPlatformContent {
  hero: {
    badge: string; badge_ar: string; title: string; title_ar: string;
    description: string; description_ar: string; button_text: string; button_text_ar: string;
    button_url: string; image_url: string; image_url_ar?: string;
  };
  journey: {
    title: string; title_ar: string; subtitle: string; subtitle_ar: string;
    stages: ManufacturingStage[];
    supported_formats: { eyebrow: string; eyebrow_ar: string; title: string; title_ar: string; items: ManufacturingSupportedFormat[] };
  };
  overview: { title: string; title_ar: string; subtitle: string; subtitle_ar: string; metrics: ManufacturingMetric[]; image_url: string };
  growth: { title: string; title_ar: string; subtitle: string; subtitle_ar: string; phases: ManufacturingGrowthPhase[] };
}

export const defaultManufacturingPlatformContent: ManufacturingPlatformContent = {
  hero: {
    badge: 'MANUFACTURING PLATFORM', badge_ar: 'منصة التصنيع',
    title: 'Integrated Manufacturing. Built for Tomorrow.', title_ar: 'تصنيع متكامل. جاهز للمستقبل.',
    description: 'An advanced manufacturing ecosystem bringing together formulation, aseptic fill & finish, digital automation, quality control and cold-chain infrastructure within one integrated site.',
    description_ar: 'منظومة تصنيع متقدمة تجمع بين التركيب والتعبئة المعقمة والأتمتة الرقمية ومراقبة الجودة وسلسلة التبريد في موقع متكامل.',
    button_text: 'Contact Business Development', button_text_ar: 'تواصل مع تطوير الأعمال',
    button_url: '/contact', image_url: 'home_banner.webp', image_url_ar: 'home_banner.webp'
  },
  journey: {
    title: 'Our Manufacturing Journey',
    title_ar: 'رحلتنا في التصنيع',
    subtitle: 'From formulation to cold storage – one integrated site.',
    subtitle_ar: 'من التركيب إلى التخزين البارد – موقع متكامل واحد.',
    stages: [
      { name: 'Formulation, Fill & Finish', name_ar: 'التركيب والتعبئة والإكمال', description: '', description_ar: '', image_url: 'about_vic_lab.webp', bullets: ['Lyophilizer (freeze dryer)', 'Combi line for PFS, vials and cartridges'], bullets_ar: ['مجفف بالتجميد', 'خط متكامل للمحاقن المعبأة مسبقًا والقوارير والخراطيش'] },
      { name: 'Secondary Packaging', name_ar: 'التغليف الثانوي', description: '', description_ar: '', image_url: 'modal_vials_banner.jpg', bullets: ['PFS plunger rod assembly line with labelling', 'Vial labeller', 'Cartoner', 'Case packager', 'Palletizer'], bullets_ar: ['خط تجميع مكبس المحقنة المعبأة مسبقًا مع وضع الملصقات', 'آلة وضع الملصقات على القوارير', 'آلة تعبئة العلب الكرتونية', 'آلة تعبئة الصناديق', 'جهاز ترتيب المنصات'] },
      { name: 'Digital Automation, Serialization & Track and Trace', name_ar: 'الأتمتة الرقمية والتسلسل والتتبع', description: '', description_ar: '', image_url: 'platform_home.webp', bullets: ['Advanced digital automation', 'Track & trace system', 'Serialization and aggregation', 'Flexible multi-package configuration'], bullets_ar: ['أتمتة رقمية متقدمة', 'نظام التتبع والتعقب', 'التسلسل الرقمي والتجميع', 'تهيئة مرنة متعددة العبوات'] },
      { name: 'QC Laboratory', name_ar: 'مختبر مراقبة الجودة', description: '', description_ar: '', image_url: 'about_vic_lab.webp', bullets: ['Equipped for all required testing'], bullets_ar: ['مجهز لإجراء جميع الاختبارات المطلوبة'] },
      { name: 'Cold Storage', name_ar: 'التخزين البارد', description: '', description_ar: '', image_url: 'home_banner.webp', bullets: ['2 to 8 °C', '600-pallet warehouse space, expandable up to 700'], bullets_ar: ['من 2 إلى 8 درجات مئوية', 'مستودع يتسع لـ600 منصة نقالة، قابل للتوسعة إلى 700'] }
    ],
    supported_formats: {
      eyebrow: 'Combi line',
      eyebrow_ar: 'خط إنتاج متكامل',
      title: 'Supported formats',
      title_ar: 'الأشكال المدعومة',
      items: [
        { name: 'Pre-filled syringes (PFS)', name_ar: 'محاقن معبأة مسبقًا (PFS)' },
        { name: 'Vials', name_ar: 'قوارير' },
        { name: 'Cartridges', name_ar: 'خراطيش' }
      ]
    }
  },
  overview: {
    title: 'Platform Overview', title_ar: 'نظرة عامة على المنصة', subtitle: 'Integrated capabilities. Scalable capacity. Future ready.', subtitle_ar: 'إمكانات متكاملة. سعة قابلة للتوسع. جاهزية للمستقبل.',
    image_url: 'banner_for_all.webp',
    metrics: [
      { value: '50–70 Mn', label: 'doses per year', label_ar: 'جرعة سنويًا', description: 'Aseptic production design capacity, based on formulation, fill-finish and multi-dose secondary packaging.', description_ar: 'الطاقة التصميمية للإنتاج المعقم وفقًا للتركيب والتعبئة والتغليف الثانوي متعدد الجرعات.' },
      { value: '600', label: 'pallet spaces', label_ar: 'مساحة للمنصات', description: 'Warehouse at 2 to 8°C, expandable up to 700 pallets.', description_ar: 'مستودع بدرجة حرارة من 2 إلى 8 مئوية، قابل للتوسع إلى 700 منصة.' },
      { value: '3', label: 'formats', label_ar: 'أشكال للمنتجات', description: 'PFS, vials and cartridges on one combi line.', description_ar: 'محاقن معبأة مسبقًا وقوارير وخراطيش على خط إنتاج متكامل.' }
    ]
  },
  growth: {
    title: 'Built for Growth', title_ar: 'مصمم للنمو', subtitle: 'Purpose-built infrastructure with dedicated space for future growth.', subtitle_ar: 'بنية تحتية مخصصة ومساحات جاهزة للتوسع مستقبلًا.',
    phases: [
      { title: 'Current Platform', title_ar: 'المنصة الحالية', description: 'Purpose-built operations ready to support integrated manufacturing.', description_ar: 'عمليات مصممة لدعم التصنيع المتكامل.', bullets: ['Formulation, fill & finish', 'Secondary packaging with serialization', 'Cold storage at 2–8°C'], bullets_ar: ['التركيب والتعبئة والإكمال', 'التغليف الثانوي مع التسلسل الرقمي', 'تخزين بارد بدرجة 2–8 مئوية'], image_url: 'banner_for_all.webp' },
      { title: 'Expansion Ready', title_ar: 'جاهزية للتوسع', description: 'Dedicated space and infrastructure to scale capabilities.', description_ar: 'مساحة وبنية تحتية مخصصة لتوسيع الإمكانات.', bullets: ['Available for an additional filling line', 'Space for an additional packaging line', 'Flexible site planning'], bullets_ar: ['إمكانية إضافة خط تعبئة', 'مساحة لخط تغليف إضافي', 'تخطيط مرن للموقع'], image_url: 'vc-company.jpg' },
      { title: 'Future Drug Substance', title_ar: 'المادة الدوائية المستقبلية', description: 'Designed to support future drug substance manufacturing.', description_ar: 'مصمم لدعم تصنيع المواد الدوائية مستقبلًا.', bullets: ['Built on evolving business needs', 'Aligned with strategic priorities', 'Room for future capabilities'], bullets_ar: ['مواكبة لاحتياجات الأعمال المتغيرة', 'متوافق مع الأولويات الاستراتيجية', 'مساحة لإمكانات مستقبلية'], image_url: 'platform_home.webp' }
    ]
  }
};

export function mergeManufacturingPlatformContent(value: unknown): ManufacturingPlatformContent {
  const merge = (base: any, incoming: any): any => {
    if (Array.isArray(base)) {
      return Array.isArray(incoming) ? incoming.map((item, index) => merge(base[index] ?? {}, item)) : base;
    }
    if (base && typeof base === 'object') {
      const source = incoming && typeof incoming === 'object' && !Array.isArray(incoming) ? incoming : {};
      return Object.fromEntries(Object.entries(base).map(([key, fallback]) => [key, merge(fallback, source[key])]));
    }
    return incoming ?? base;
  };
  const content = merge(defaultManufacturingPlatformContent, value) as ManufacturingPlatformContent;
  const textValue = (input: unknown, language: 'en' | 'ar', fallback = ''): string => {
    if (typeof input === 'string') return input;
    if (typeof input === 'number') return String(input);
    if (input && typeof input === 'object' && !Array.isArray(input)) {
      const source = input as Record<string, unknown>;
      const keys = language === 'ar'
        ? ['ar', 'arabic', 'text_ar', 'label_ar', 'name_ar', 'value_ar', 'bullet_ar', 'description_ar']
        : ['en', 'english', 'text_en', 'label_en', 'name_en', 'value_en', 'bullet_en', 'text', 'label', 'name', 'value', 'title', 'description', 'content', 'bullet'];
      for (const key of keys) if (typeof source[key] === 'string') return source[key] as string;
    }
    return fallback;
  };

  content.journey.stages = content.journey.stages.map((stage, index) => {
    const fallback = defaultManufacturingPlatformContent.journey.stages[index];
    const rawBullets: unknown[] = Array.isArray(stage.bullets) ? stage.bullets : fallback?.bullets || [];
    const rawArabic: unknown[] = Array.isArray(stage.bullets_ar) ? stage.bullets_ar : [];
    return {
      ...stage,
      name: textValue(stage.name, 'en', fallback?.name || ''),
      name_ar: textValue(stage.name_ar, 'ar', fallback?.name_ar || ''),
      description: textValue(stage.description, 'en', fallback?.description || ''),
      description_ar: textValue(stage.description_ar, 'ar', fallback?.description_ar || ''),
      bullets: rawBullets.map((bullet, bulletIndex) => textValue(bullet, 'en', fallback?.bullets[bulletIndex] || '')),
      bullets_ar: rawBullets.map((bullet, bulletIndex) => textValue(
        rawArabic[bulletIndex] ?? (bullet && typeof bullet === 'object' ? bullet : undefined),
        'ar',
        fallback?.bullets_ar[bulletIndex] || ''
      ))
    };
  });

  const formats = content.journey.supported_formats;
  const fallbackFormats = defaultManufacturingPlatformContent.journey.supported_formats;
  formats.items = formats.items.map((item, index) => ({
    name: textValue(item?.name ?? item, 'en', fallbackFormats.items[index]?.name || ''),
    name_ar: textValue(item?.name_ar ?? item, 'ar', fallbackFormats.items[index]?.name_ar || '')
  }));
  return content;
}
