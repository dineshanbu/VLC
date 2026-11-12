const { getPool } = require('../config/db');
const defaults = require('../config/manufacturingPlatformDefaults');
let tableReady;

const ensureTable = async () => {
  if (!tableReady) {
    tableReady = getPool().query(`CREATE TABLE IF NOT EXISTS manufacturing_platform_content (
      id TINYINT UNSIGNED PRIMARY KEY,
      content_json JSON NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  }
  try { await tableReady; } catch (error) { tableReady = null; throw error; }
};

const mergeDefaults = (base, value) => {
  if (Array.isArray(base)) return Array.isArray(value) ? value.map((item, index) => mergeDefaults(base[index] ?? {}, item)) : base;
  if (base && typeof base === 'object') {
    const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    return Object.fromEntries(Object.entries(base).map(([key, fallback]) => [key, mergeDefaults(fallback, source[key])]));
  }
  return value ?? base;
};

const asText = (value, language = 'en', fallback = '') => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const keys = language === 'ar'
      ? ['ar', 'arabic', 'text_ar', 'label_ar', 'name_ar', 'value_ar', 'bullet_ar', 'description_ar']
      : ['en', 'english', 'text_en', 'label_en', 'name_en', 'value_en', 'bullet_en', 'text', 'label', 'name', 'value', 'title', 'description', 'content', 'bullet'];
    for (const key of keys) if (typeof value[key] === 'string') return value[key];
  }
  return fallback;
};

const normalizeContent = content => {
  const journey = content.journey || {};
  const stages = Array.isArray(journey.stages) ? journey.stages : defaults.journey.stages;
  journey.stages = stages.map((stage, index) => {
    const fallback = defaults.journey.stages[index] || {};
    const sourceBullets = Array.isArray(stage.bullets) ? stage.bullets : fallback.bullets || [];
    const sourceArabic = Array.isArray(stage.bullets_ar) ? stage.bullets_ar : [];
    const bullets = sourceBullets.map((bullet, bulletIndex) => asText(bullet, 'en', fallback.bullets?.[bulletIndex] || ''));
    const bullets_ar = sourceBullets.map((bullet, bulletIndex) =>
      asText(sourceArabic[bulletIndex] ?? (bullet && typeof bullet === 'object' ? bullet : undefined), 'ar', fallback.bullets_ar?.[bulletIndex] || '')
    );
    return {
      ...stage,
      name: asText(stage.name, 'en', fallback.name || ''),
      name_ar: asText(stage.name_ar, 'ar', fallback.name_ar || ''),
      description: asText(stage.description, 'en', fallback.description || ''),
      description_ar: asText(stage.description_ar, 'ar', fallback.description_ar || ''),
      bullets,
      bullets_ar
    };
  });

  const formatData = journey.supported_formats || defaults.journey.supported_formats;
  const defaultFormatItems = defaults.journey.supported_formats.items;
  const formatItems = Array.isArray(formatData.items) ? formatData.items : defaultFormatItems;
  journey.supported_formats = {
    ...formatData,
    eyebrow: asText(formatData.eyebrow, 'en', defaults.journey.supported_formats.eyebrow),
    eyebrow_ar: asText(formatData.eyebrow_ar, 'ar', defaults.journey.supported_formats.eyebrow_ar),
    title: asText(formatData.title, 'en', defaults.journey.supported_formats.title),
    title_ar: asText(formatData.title_ar, 'ar', defaults.journey.supported_formats.title_ar),
    items: formatItems.map((item, index) => ({
      name: asText(item?.name ?? item, 'en', defaultFormatItems[index]?.name || ''),
      name_ar: asText(item?.name_ar ?? item, 'ar', defaultFormatItems[index]?.name_ar || '')
    }))
  };
  content.journey = journey;
  return content;
};

const parseContent = value => {
  if (!value) return normalizeContent(mergeDefaults(defaults, {}));
  try { return normalizeContent(mergeDefaults(defaults, typeof value === 'string' ? JSON.parse(value) : value)); }
  catch { return normalizeContent(mergeDefaults(defaults, {})); }
};

exports.getContent = async (_req, res, next) => {
  try {
    await ensureTable();
    const [rows] = await getPool().query('SELECT content_json FROM manufacturing_platform_content WHERE id = 1');
    res.json({ success: true, content: rows.length ? parseContent(rows[0].content_json) : defaults });
  } catch (error) { next(error); }
};

exports.saveContent = async (req, res, next) => {
  try {
    let content;
    try { content = normalizeContent(mergeDefaults(defaults, JSON.parse(req.body.content_json || '{}'))); }
    catch { return res.status(400).json({ success: false, message: 'Invalid manufacturing platform content.' }); }
    if (!content.hero || !content.journey || !content.overview || !content.growth) {
      return res.status(400).json({ success: false, message: 'Complete all manufacturing platform sections before saving.' });
    }

    const fileUrl = name => req.files?.[name]?.[0] ? `/uploads/${req.files[name][0].filename}` : null;
    const heroImage = fileUrl('hero_image');
    if (heroImage) content.hero.image_url = heroImage;
    const heroImageAr = fileUrl('hero_image_ar');
    content.hero.image_url_ar = heroImageAr || content.hero.image_url_ar || content.hero.image_url;
    const overviewImage = fileUrl('overview_image');
    if (overviewImage) content.overview.image_url = overviewImage;
    (content.journey.stages || []).forEach((stage, index) => {
      const image = fileUrl(`journey_image_${index}`);
      if (image) stage.image_url = image;
    });
    (content.growth.phases || []).forEach((phase, index) => {
      const image = fileUrl(`growth_image_${index}`);
      if (image) phase.image_url = image;
    });

    await ensureTable();
    await getPool().query(
      `INSERT INTO manufacturing_platform_content (id, content_json) VALUES (1, ?)
       ON DUPLICATE KEY UPDATE content_json = VALUES(content_json)`,
      [JSON.stringify(content)]
    );
    res.json({ success: true, content });
  } catch (error) { next(error); }
};
