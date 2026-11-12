const { getPool } = require('../config/db');

const defaults = {
  landing: {
    section_key: 'landing',
    title: 'The Largest Human Vaccines Facility in the Middle East and First of Its Kind in Saudi Arabia',
    title_ar: 'أكبر منشأة للقاحات البشرية في الشرق الأوسط، والأولى من نوعها في المملكة العربية السعودية',
    badge: '', badge_ar: '',
    description: "Saudi Arabia's advanced vaccine manufacturing company, advancing innovation, localization and regional health security.",
    description_ar: 'شركة متقدمة لتصنيع اللقاحات في المملكة العربية السعودية، تعمل على دفع عجلة الابتكار والتوطين والأمن الصحي الإقليمي.',
    button_text: 'Watch Corporate Film', button_text_ar: 'شاهد فيلم الشركة', button_url: '', image_url: 'about-normalized.mp4', image_url_ar: 'about-normalized.mp4'
  },
  supporting: {
    section_key: 'supporting',
    title: 'SAUDI VISION 2030', title_ar: 'رؤية السعودية 2030', badge: 'SUPPORTING', badge_ar: 'ندعم',
    description: 'Advancing healthcare localization through world-class vaccine manufacturing, technology transfer and scientific excellence.',
    description_ar: 'تعزيز توطين الرعاية الصحية من خلال تصنيع اللقاحات بمستوى عالمي ونقل التقنية والتميز العلمي.',
    image_url: 'saudi-vision-biotech-strategy.png'
  },
  platform: {
    section_key: 'platform', badge: 'OUR PLATFORM', badge_ar: 'منصتنا المتقدمة',
    title: 'Three Pillars for Greater Impact.', title_ar: 'ثلاث ركائز لأثر أكبر.',
    description: 'We are building end-to-end capabilities to deliver high-quality vaccines for Saudi Arabia and beyond.',
    description_ar: 'نبني قدرات متكاملة لتوفير لقاحات عالية الجودة للمملكة العربية السعودية وخارجها.',
    image_url: '',
    content_json: [
      { tag: 'LOCALIZE', tag_ar: 'توطين', description: 'Empowering national capabilities through local manufacturing.', description_ar: 'تمكين القدرات الوطنية من خلال توطين تصنيع اللقاحات.', image_url: 'slide_Images/vic_top1.webp' },
      { tag: 'INNOVATE', tag_ar: 'ابتكار', description: 'Advancing science through research and development.', description_ar: 'الارتقاء بالعلوم الحيوية عبر منظومة بحث وتطوير رائدة.', image_url: 'purple_glove_vial_needle_macro.jpg' },
      { tag: 'SCALE', tag_ar: 'توسيع القدرات', description: 'Building world-class manufacturing capabilities.', description_ar: 'بناء قدرات تصنيعية بمقاييس عالمية.', image_url: 'p4.webp' }
    ]
  },
  about: {
    section_key: 'about', badge: 'ABOUT VIC', badge_ar: 'نبذة عن الشركة',
    title: 'Driven by Science.', title_ar: 'مدفوعون بالعلم.',
    title_line2: 'Inspired by Humanity.', title_line2_ar: 'ملهمون بالإنسانية.',
    description: 'Vaccine Industrial Company, founded in 2022 in Riyadh by Dr. Khaled Almosa, a national biotech leader, is Saudi Arabia’s first company dedicated to establishing an advanced vaccine biomanufacturing facility. VIC aims to position the Kingdom as a regional and global vaccine hub by adopting advanced technologies, meeting global manufacturing standards, and strengthening national healthcare self-sufficiency.',
    description_ar: 'تعد شركة اللقاحات الصناعية القابضة (VIC)، التي تأسست عام 2022 في الرياض بقيادة د. خالد الموسى، أحد رواد التقنية الحيوية في المملكة، أول شركة سعودية مكرسة لإنشاء منشأة متطورة للتصنيع الحيوي للقاحات. وتهدف الشركة إلى ترسيخ مكانة المملكة كمركز إقليمي وعالمي للقاحات من خلال تبني أحدث التقنيات والمعايير العالمية وتعزيز الاكتفاء الذاتي الصحي الوطني.',
    image_url: 'vc-company.jpg',
    video_url: 'watch-normalized.mp4',
    corporate_video_url: 'watch-normalized.mp4'
  },
  our_office: {
    section_key: 'our_office', badge: 'OUR OFFICE', badge_ar: 'مكتبنا',
    title: '', title_ar: '', description: '', description_ar: '', button_text: '', button_text_ar: '', button_url: '', image_url: '/uploads/facility-gallery/vlc0.webp'
  }
};

exports.getContent = async (_req, res, next) => {
  try {
    const [rows] = await getPool().query('SELECT * FROM home_page_content');
    const content = { ...defaults };
    for (const row of rows) {
      const sectionDefaults = content[row.section_key] || {};
      let content_json = row.content_json;
      try { if (typeof content_json === 'string') content_json = JSON.parse(content_json); } catch (_error) { content_json = null; }
      content[row.section_key] = {
        ...sectionDefaults,
        ...row,
        title: ['landing', 'about'].includes(row.section_key)
          && Number(row[row.section_key === 'landing' ? 'landing_title_customized' : 'about_title_customized']) !== 1
          ? (row.title || sectionDefaults.title || '')
          : (row.title ?? sectionDefaults.title ?? ''),
        title_ar: ['landing', 'about'].includes(row.section_key)
          && Number(row[row.section_key === 'landing' ? 'landing_title_customized' : 'about_title_customized']) !== 1
          ? (row.title_ar || sectionDefaults.title_ar || '')
          : (row.title_ar ?? sectionDefaults.title_ar ?? ''),
        title_line2: row.section_key === 'about' && Number(row.about_title_customized) !== 1
          ? (row.title_line2 || sectionDefaults.title_line2 || '')
          : (row.title_line2 ?? sectionDefaults.title_line2 ?? ''),
        title_line2_ar: row.section_key === 'about' && Number(row.about_title_customized) !== 1
          ? (row.title_line2_ar || sectionDefaults.title_line2_ar || '')
          : (row.title_line2_ar ?? sectionDefaults.title_line2_ar ?? ''),
        image_url_ar: row.image_url_ar || row.image_url || sectionDefaults.image_url || '',
        video_url: row.video_url || sectionDefaults.video_url || null,
        corporate_video_url: row.corporate_video_url || sectionDefaults.corporate_video_url || null,
        content_json: content_json || sectionDefaults.content_json
      };
    }
    res.json({ success: true, content });
  } catch (error) { next(error); }
};

exports.updateCorporateVideo = async (req, res, next) => {
  try {
    const uploadedVideo = req.file;
    if (!uploadedVideo) return res.status(400).json({ success: false, message: 'Choose a corporate video to upload.' });
    const corporate_video_url = `/uploads/${uploadedVideo.filename}`;
    await getPool().query(
      `INSERT INTO home_page_content (section_key, corporate_video_url)
       VALUES ('about', ?)
       ON DUPLICATE KEY UPDATE corporate_video_url = VALUES(corporate_video_url)`,
      [corporate_video_url]
    );
    res.json({ success: true, message: 'Corporate video saved.', corporate_video_url });
  } catch (error) { next(error); }
};

exports.updateSection = async (req, res, next) => {
  try {
    const { section_key } = req.params;
    if (!defaults[section_key]) return res.status(404).json({ success: false, message: 'Unknown home page section.' });
    const current = defaults[section_key];
    const title = req.body.title ?? current.title;
    const title_ar = req.body.title_ar ?? current.title_ar;
    const title_line2 = req.body.title_line2 ?? current.title_line2 ?? null;
    const title_line2_ar = req.body.title_line2_ar ?? current.title_line2_ar ?? null;
    const badge = req.body.badge ?? current.badge;
    const badge_ar = req.body.badge_ar ?? current.badge_ar;
    const description = req.body.description ?? current.description;
    const description_ar = req.body.description_ar ?? current.description_ar;
    const button_text = req.body.button_text ?? current.button_text ?? '';
    const button_text_ar = req.body.button_text_ar ?? current.button_text_ar ?? '';
    const button_url = req.body.button_url ?? current.button_url ?? '';
    const uploadedImage = req.files?.image?.[0];
    const image_url = uploadedImage ? `/uploads/${uploadedImage.filename}` : (req.body.image_url ?? current.image_url);
    const uploadedImageAr = req.files?.image_ar?.[0];
    const image_url_ar = uploadedImageAr ? `/uploads/${uploadedImageAr.filename}` : (req.body.image_url_ar ?? image_url);
    const uploadedVideo = req.files?.video?.[0];
    const video_url = uploadedVideo ? `/uploads/${uploadedVideo.filename}` : (req.body.video_url || current.video_url || null);
    const landing_title_customized = section_key === 'landing' ? 1 : 0;
    const about_title_customized = section_key === 'about' ? 1 : 0;
    let content_json = current.content_json || null;
    if (req.body.content_json) {
      try { content_json = JSON.parse(req.body.content_json); } catch (_error) { return res.status(400).json({ success: false, message: 'Invalid platform card content.' }); }
    }
    if (section_key === 'platform' && Array.isArray(content_json)) {
      content_json = content_json.map((card, index) => ({
        ...card,
        image_url: req.files?.[`card_image_${index}`]?.[0]
          ? `/uploads/${req.files[`card_image_${index}`][0].filename}`
          : (card.image_url || current.content_json?.[index]?.image_url || '')
      }));
    }
    await getPool().query(`INSERT INTO home_page_content
      (section_key, badge, badge_ar, title, title_ar, landing_title_customized, about_title_customized, title_line2, title_line2_ar, description, description_ar, image_url, image_url_ar, video_url, content_json, button_text, button_text_ar, button_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE badge=VALUES(badge), badge_ar=VALUES(badge_ar), title=VALUES(title), title_ar=VALUES(title_ar), title_line2=VALUES(title_line2), title_line2_ar=VALUES(title_line2_ar),
      landing_title_customized=VALUES(landing_title_customized), about_title_customized=VALUES(about_title_customized),
      description=VALUES(description), description_ar=VALUES(description_ar), image_url=VALUES(image_url), image_url_ar=VALUES(image_url_ar), video_url=VALUES(video_url), content_json=VALUES(content_json),
      button_text=VALUES(button_text), button_text_ar=VALUES(button_text_ar), button_url=VALUES(button_url)`,
    [section_key, badge, badge_ar, title, title_ar, landing_title_customized, about_title_customized, title_line2, title_line2_ar, description, description_ar, image_url, image_url_ar, video_url, content_json ? JSON.stringify(content_json) : null, button_text, button_text_ar, button_url]);
    res.json({ success: true, message: 'Home page section saved.', section: { section_key, badge, badge_ar, title, title_ar, landing_title_customized, about_title_customized, title_line2, title_line2_ar, description, description_ar, image_url, image_url_ar, video_url, content_json, button_text, button_text_ar, button_url } });
  } catch (error) { next(error); }
};
