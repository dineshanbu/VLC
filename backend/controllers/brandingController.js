const { getPool } = require('../config/db');

const defaults = {
  header_logo: 'logo_navbar_white.webp',
  footer_logo: 'logo_navbar_white.webp',
  home_banner_logo: 'logo_navbar_white.webp'
};
const defaultDimensions = {
  header_logo: { width: 200, height: 50 },
  footer_logo: { width: 206, height: 80 },
  home_banner_logo: { width: 300, height: 116 }
};
const defaultFooterSettings = {
  email: 'info@vaccine.com.sa',
  copyright_en: 'Vaccine Industrial Company (VIC). All Rights Reserved.',
  copyright_ar: 'شركة لقاح للصناعة (VIC). جميع الحقوق محفوظة.',
  quick_links_title_en: 'Quick Links',
  quick_links_title_ar: 'روابط سريعة',
  how_we_can_help_en: 'How we can help',
  how_we_can_help_ar: 'كيف يمكننا مساعدتك',
  query_label_en: 'For Query:',
  query_label_ar: 'للاستفسارات:',
  address_en: 'Building No 4180, Unit 6708, Northern Ring Branch Road, Al Wadi, Riyadh-13313, Saudi Arabia',
  address_ar: 'مبنى 4180، وحدة 6708، طريق الدائري الشمالي الفرعي، الوادي، الرياض 13313، المملكة العربية السعودية',
  quick_links: [
    { label_en: 'Home', label_ar: 'الرئيسية', url: '/' },
    { label_en: 'About Us', label_ar: 'من نحن', url: '/about' },
    { label_en: 'Products', label_ar: 'منتجاتنا', url: '/products' },
    { label_en: 'Partners', label_ar: 'شركاؤنا', url: '/partners' },
    { label_en: 'News & Media', label_ar: 'الأخبار والإعلام', url: '/news' },
    { label_en: 'Careers', label_ar: 'الوظائف', url: '/careers' },
    { label_en: 'Pharmacovigilance', label_ar: 'اليقظة الدوائية', url: '/pharmacovigilance' },
    { label_en: 'Contact Us', label_ar: 'اتصل بنا', url: '/contact' }
  ]
};

let tableReady;
let dimensionsTableReady;
async function ensureTable() {
  if (!tableReady) {
    tableReady = getPool().query(`CREATE TABLE IF NOT EXISTS site_logo_settings (
      id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
      header_logo VARCHAR(500) NOT NULL,
      footer_logo VARCHAR(500) NOT NULL,
      home_banner_logo VARCHAR(500) NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)
      .catch(error => { tableReady = null; throw error; });
  }
  await tableReady;
}

async function ensureDimensionsTable() {
  if (!dimensionsTableReady) {
    dimensionsTableReady = getPool().query(`CREATE TABLE IF NOT EXISTS site_logo_dimensions (
      id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
      header_width SMALLINT UNSIGNED NOT NULL DEFAULT 200,
      header_height SMALLINT UNSIGNED NOT NULL DEFAULT 50,
      footer_width SMALLINT UNSIGNED NOT NULL DEFAULT 206,
      footer_height SMALLINT UNSIGNED NOT NULL DEFAULT 80,
      home_width SMALLINT UNSIGNED NOT NULL DEFAULT 300,
      home_height SMALLINT UNSIGNED NOT NULL DEFAULT 116,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`).then(async () => {
      const [columns] = await getPool().query('SHOW COLUMNS FROM site_logo_dimensions');
      const existing = new Set(columns.map(column => column.Field));
      if (!existing.has('home_width')) {
        await getPool().query('ALTER TABLE site_logo_dimensions ADD COLUMN home_width SMALLINT UNSIGNED NOT NULL DEFAULT 300');
      }
      if (!existing.has('home_height')) {
        await getPool().query('ALTER TABLE site_logo_dimensions ADD COLUMN home_height SMALLINT UNSIGNED NOT NULL DEFAULT 116');
      }
    })
      .catch(error => { dimensionsTableReady = null; throw error; });
  }
  await dimensionsTableReady;
}

async function ensureFooterTable() {
  await getPool().query(`CREATE TABLE IF NOT EXISTS site_footer_settings (
    id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
    settings_json LONGTEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
}

async function readFooterSettings() {
  await ensureFooterTable();
  const [rows] = await getPool().query('SELECT settings_json FROM site_footer_settings WHERE id = 1');
  let stored = {};
  try { if (rows[0]?.settings_json) stored = JSON.parse(rows[0].settings_json); } catch (_) {}
  return { ...defaultFooterSettings, ...stored };
}

async function readSettings() {
  await ensureTable();
  await ensureDimensionsTable();
  const [[logoRows], [dimensionRows]] = await Promise.all([
    getPool().query('SELECT header_logo, footer_logo, home_banner_logo FROM site_logo_settings WHERE id = 1'),
    getPool().query('SELECT header_width, header_height, footer_width, footer_height, home_width, home_height FROM site_logo_dimensions WHERE id = 1')
  ]);
  const row = dimensionRows[0] || {};
  return {
    logos: { ...defaults, ...(logoRows[0] || {}) },
    dimensions: {
      header_logo: { width: Number(row.header_width) || defaultDimensions.header_logo.width, height: Number(row.header_height) || defaultDimensions.header_logo.height },
      footer_logo: { width: Number(row.footer_width) || defaultDimensions.footer_logo.width, height: Number(row.footer_height) || defaultDimensions.footer_logo.height },
      home_banner_logo: { width: Number(row.home_width) || defaultDimensions.home_banner_logo.width, height: Number(row.home_height) || defaultDimensions.home_banner_logo.height }
    }
  };
}

exports.getLogos = async (_req, res, next) => {
  try {
    res.json({ success: true, ...await readSettings() });
  } catch (error) { next(error); }
};

exports.updateLogos = async (req, res, next) => {
  try {
    const settings = await readSettings();
    const { logos } = settings;
    for (const key of Object.keys(defaults)) {
      const uploaded = req.files?.[key]?.[0];
      if (uploaded) logos[key] = `/uploads/${uploaded.filename}`;
    }
    await getPool().query(`INSERT INTO site_logo_settings (id, header_logo, footer_logo, home_banner_logo)
      VALUES (1, ?, ?, ?)
      ON DUPLICATE KEY UPDATE header_logo = VALUES(header_logo), footer_logo = VALUES(footer_logo), home_banner_logo = VALUES(home_banner_logo)`,
    [logos.header_logo, logos.footer_logo, logos.home_banner_logo]);
    const readDimension = (field, fallback, min, max) => {
      const value = Number(req.body?.[field]);
      return Number.isFinite(value) ? Math.min(max, Math.max(min, Math.round(value))) : fallback;
    };
    const dimensions = {
      header_logo: {
        width: readDimension('header_logo_width', settings.dimensions.header_logo.width, 100, 360),
        height: readDimension('header_logo_height', settings.dimensions.header_logo.height, 28, 100)
      },
      footer_logo: {
        width: readDimension('footer_logo_width', settings.dimensions.footer_logo.width, 100, 360),
        height: readDimension('footer_logo_height', settings.dimensions.footer_logo.height, 32, 120)
      },
      home_banner_logo: {
        width: readDimension('home_banner_logo_width', settings.dimensions.home_banner_logo.width, 100, 600),
        height: readDimension('home_banner_logo_height', settings.dimensions.home_banner_logo.height, 40, 240)
      }
    };
    await getPool().query(`INSERT INTO site_logo_dimensions (id, header_width, header_height, footer_width, footer_height, home_width, home_height)
      VALUES (1, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE header_width = VALUES(header_width), header_height = VALUES(header_height), footer_width = VALUES(footer_width), footer_height = VALUES(footer_height), home_width = VALUES(home_width), home_height = VALUES(home_height)`,
    [dimensions.header_logo.width, dimensions.header_logo.height, dimensions.footer_logo.width, dimensions.footer_logo.height, dimensions.home_banner_logo.width, dimensions.home_banner_logo.height]);
    res.json({ success: true, message: 'Logo replacements saved.', logos, dimensions });
  } catch (error) { next(error); }
};

exports.getFooterSettings = async (_req, res, next) => {
  try { res.json({ success: true, settings: await readFooterSettings() }); }
  catch (error) { next(error); }
};

exports.updateFooterSettings = async (req, res, next) => {
  try {
    const current = await readFooterSettings();
    const email = String(req.body?.email ?? current.email).trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Enter a valid footer email address.' });
    }
    const rawLinks = req.body?.quick_links ?? current.quick_links;
    if (!Array.isArray(rawLinks) || rawLinks.length > 8) {
      return res.status(400).json({ success: false, message: 'Footer Quick Links must contain no more than 8 links.' });
    }
    const quick_links = [];
    for (const [index, link] of rawLinks.entries()) {
      const url = String(link?.url ?? '').trim().slice(0, 500);
      const safeUrl = url.startsWith('/') && !url.startsWith('//') || /^https:\/\//i.test(url);
      if (!safeUrl || !String(link?.label_en ?? '').trim() || !String(link?.label_ar ?? '').trim()) {
        return res.status(400).json({ success: false, message: `Complete both language labels and a valid URL for Quick Link ${index + 1}.` });
      }
      quick_links.push({
        label_en: String(link.label_en).trim().slice(0, 120),
        label_ar: String(link.label_ar).trim().slice(0, 120),
        url
      });
    }
    const fields = ['copyright_en', 'copyright_ar', 'quick_links_title_en', 'quick_links_title_ar', 'how_we_can_help_en', 'how_we_can_help_ar', 'query_label_en', 'query_label_ar', 'address_en', 'address_ar'];
    const settings = {
      email,
      ...Object.fromEntries(fields.map(field => [field, String(req.body?.[field] ?? current[field]).trim().slice(0, field.startsWith('address_') ? 1000 : 500)])),
      quick_links
    };
    await getPool().query(`INSERT INTO site_footer_settings (id, settings_json) VALUES (1, ?)
      ON DUPLICATE KEY UPDATE settings_json = VALUES(settings_json)`, [JSON.stringify(settings)]);
    res.json({ success: true, message: 'Footer content saved.', settings });
  } catch (error) { next(error); }
};
