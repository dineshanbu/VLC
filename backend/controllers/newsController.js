const fs = require('fs');
const path = require('path');
const { getPool } = require('../config/db');

const defaultPageSettings = {
  hero_eyebrow: 'Latest from VIC',
  hero_eyebrow_ar: 'أحدث أخبار VIC',
  hero_title: 'Stories of Innovation. Impacting Lives.',
  hero_title_ar: 'قصص الابتكار... حياة أفضل.',
  hero_description: 'Explore the latest news, press releases, and media resources from Vaccine Industrial Company (VIC).',
  hero_description_ar: 'استكشف أحدث الأخبار والبيانات الصحفية والوسائط الإعلامية من شركة اللقاحات الصناعية (VIC).',
  hero_button_text: 'View Latest News',
  hero_button_text_ar: 'عرض آخر الأخبار',
  hero_image: 'home_banner.webp',
  hero_image_ar: 'home_banner.webp'
};

async function ensureNewsPageSettingsTable(pool) {
  await pool.query(`CREATE TABLE IF NOT EXISTS news_page_settings (
    id TINYINT UNSIGNED PRIMARY KEY,
    hero_eyebrow VARCHAR(150) NOT NULL,
    hero_eyebrow_ar VARCHAR(150) NOT NULL,
    hero_title VARCHAR(500) NOT NULL,
    hero_title_ar VARCHAR(500) NOT NULL,
    hero_description TEXT NOT NULL,
    hero_description_ar TEXT NOT NULL,
    hero_button_text VARCHAR(150) NOT NULL,
    hero_button_text_ar VARCHAR(150) NOT NULL,
    hero_image VARCHAR(500) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  const [columns] = await pool.query('SHOW COLUMNS FROM news_page_settings');
  if (!columns.some(column => column.Field === 'hero_image_ar')) {
    await pool.query('ALTER TABLE news_page_settings ADD COLUMN hero_image_ar VARCHAR(500) NULL AFTER hero_image');
  }
  await pool.query('UPDATE news_page_settings SET hero_image_ar = hero_image WHERE hero_image_ar IS NULL OR hero_image_ar = ""');
}

exports.getPageSettings = async (_req, res, next) => {
  try {
    const pool = getPool();
    await ensureNewsPageSettingsTable(pool);
    const [rows] = await pool.query('SELECT * FROM news_page_settings WHERE id = 1');
    const settings = rows[0] || { id: 1, ...defaultPageSettings };
    res.json({ success: true, settings: { ...settings, hero_image_ar: settings.hero_image_ar || settings.hero_image } });
  } catch (error) { next(error); }
};

exports.updatePageSettings = async (req, res, next) => {
  try {
    const pool = getPool();
    await ensureNewsPageSettingsTable(pool);
    const values = { ...defaultPageSettings, ...req.body };
    if (req.files?.hero_image?.[0]) values.hero_image = `/uploads/${req.files.hero_image[0].filename}`;
    if (req.files?.hero_image_ar?.[0]) values.hero_image_ar = `/uploads/${req.files.hero_image_ar[0].filename}`;
    values.hero_image_ar = values.hero_image_ar || values.hero_image;
    const fields = Object.keys(defaultPageSettings);
    await pool.query(`INSERT INTO news_page_settings (id, ${fields.join(', ')}) VALUES (1, ${fields.map(() => '?').join(', ')})
      ON DUPLICATE KEY UPDATE ${fields.map(field => `${field} = VALUES(${field})`).join(', ')}`,
    fields.map(field => values[field] || ''));
    const [rows] = await pool.query('SELECT * FROM news_page_settings WHERE id = 1');
    res.json({ success: true, message: 'News page banner settings saved.', settings: { ...rows[0], hero_image_ar: rows[0].hero_image_ar || rows[0].hero_image } });
  } catch (error) { next(error); }
};

// Helper to generate slug
function generateSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// GET /api/news (Public and Admin with filters)
exports.getAllNews = async (req, res) => {
  try {
    const pool = getPool();
    const { category, search, status } = req.query;

    let query = 'SELECT * FROM news_articles WHERE 1=1';
    const params = [];

    // If public request and no status specified, show only Published
    if (status && status !== 'All') {
      query += ' AND status = ?';
      params.push(status);
    } else if (!req.user && !status) {
      query += " AND status = 'Published'";
    }

    if (category && category !== 'All') {
      query += ' AND (category = ? OR JSON_CONTAINS(categories, JSON_QUOTE(?)))';
      params.push(category, category);
    }

    if (search) {
      query += ' AND (title LIKE ? OR summary LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term);
    }

    query += ` ORDER BY COALESCE(
      STR_TO_DATE(date_str, '%b %e, %Y'),
      STR_TO_DATE(date_str, '%M %e, %Y'),
      STR_TO_DATE(date_str, '%Y-%m-%d'),
      STR_TO_DATE(formatted_date, '%M %e, %Y'),
      STR_TO_DATE(formatted_date, '%b %e, %Y'),
      created_at
    ) DESC, id DESC`;

    const [articles] = await pool.query(query, params);

    // Parse categories JSON
    const parsedArticles = articles.map(a => {
      let cats = [];
      try {
        cats = typeof a.categories === 'string' ? JSON.parse(a.categories) : a.categories || [a.category];
      } catch (e) {
        cats = [a.category];
      }
      return {
        ...a,
        categories: cats
      };
    });

    res.json({ success: true, count: parsedArticles.length, articles: parsedArticles });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch news', error: error.message });
  }
};

// GET /api/news/:slugOrId
exports.getNewsBySlugOrId = async (req, res) => {
  try {
    const pool = getPool();
    const identifier = req.params.slugOrId;

    const [rows] = await pool.query(
      'SELECT * FROM news_articles WHERE slug = ? OR id = ?',
      [identifier, isNaN(identifier) ? -1 : parseInt(identifier)]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'News article not found' });
    }

    // Increment views
    await pool.query('UPDATE news_articles SET views = views + 1 WHERE id = ?', [rows[0].id]);

    const article = rows[0];
    try {
      article.categories = typeof article.categories === 'string' ? JSON.parse(article.categories) : article.categories;
    } catch (e) {
      article.categories = [article.category];
    }

    res.json({ success: true, article });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching article', error: error.message });
  }
};

exports.uploadInlineImage = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'An image file is required.' });
  const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif', 'image/bmp']);
  if (!allowedImageTypes.has(req.file.mimetype)) {
    return res.status(415).json({ success: false, message: 'Only image files can be pasted into an article.' });
  }

  try {
    const pool = getPool();
    const fileUrl = `/uploads/${req.file.filename}`;
    const bytes = req.file.size || 0;
    const units = ['Bytes', 'KB', 'MB', 'GB'];
    const unitIndex = bytes ? Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1) : 0;
    const fileSize = bytes ? `${(bytes / Math.pow(1024, unitIndex)).toFixed(1)} ${units[unitIndex]}` : '0 Bytes';
    const title = path.basename(req.file.originalname, path.extname(req.file.originalname)).slice(0, 200) || 'Pasted article image';
    const [result] = await pool.query(`
      INSERT INTO media_assets (title, description, category, format, file_size, file_name, file_url)
      VALUES (?, ?, ?, 'IMAGE', ?, ?, ?)
    `, [title, 'Uploaded by pasting into a news article.', 'News & Media', fileSize, req.file.filename, fileUrl]);

    res.status(201).json({
      success: true,
      url: fileUrl,
      media: { id: result.insertId, title, category: 'News & Media', format: 'IMAGE', file_size: fileSize, file_name: req.file.filename, file_url: fileUrl }
    });
  } catch (error) {
    if (req.file.path) await fs.promises.unlink(req.file.path).catch(() => undefined);
    res.status(500).json({ success: false, message: 'Image was uploaded but could not be added to Media & Upload.', error: error.message });
  }
};

exports.translateNewsToArabic = async (req, res) => {
  try {
    const endpoint = (process.env.LIBRETRANSLATE_URL || 'https://libretranslate.com/translate').trim();
    const apiKey = process.env.LIBRETRANSLATE_API_KEY;
    if (!apiKey && /libretranslate\.com/i.test(endpoint)) {
      return res.status(503).json({ success: false, message: 'Add LIBRETRANSLATE_API_KEY to the backend environment to enable automatic Arabic translation.' });
    }

    const translate = async (text, format = 'text') => {
      if (!text) return '';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: text,
          source: 'en',
          target: 'ar',
          format,
          ...(apiKey ? { api_key: apiKey } : {})
        })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.translatedText) {
        throw new Error(result.error || `Translation service returned status ${response.status}.`);
      }
      return result.translatedText;
    };

    const [title_ar, summary_ar, content_html_ar] = await Promise.all([
      translate(String(req.body.title || '').trim()),
      translate(String(req.body.summary || '').trim()),
      translate(String(req.body.content_html || '').trim(), 'html')
    ]);
    res.json({ success: true, translations: { title_ar, summary_ar, content_html_ar } });
  } catch (error) {
    res.status(502).json({ success: false, message: error.message || 'Could not translate this article. Please try again.' });
  }
};

// POST /api/news (Admin create with optional image upload)
exports.createNews = async (req, res) => {
  try {
    const {
      title,
      title_ar,
      category,
      categories,
      date_str,
      formatted_date,
      read_time,
      badge,
      summary,
      summary_ar,
      content_html,
      content_html_ar,
      official_link,
      status
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Article title is required.' });
    }

    const pool = getPool();
    let slug = generateSlug(title);

    // Ensure unique slug
    const [existingSlug] = await pool.query('SELECT id FROM news_articles WHERE slug = ?', [slug]);
    if (existingSlug.length > 0) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    let imageUrl = req.body.image || null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    let parsedCategories = [];
    if (categories) {
      parsedCategories = typeof categories === 'string' ? JSON.parse(categories) : categories;
    } else if (category) {
      parsedCategories = [category];
    }

    const now = new Date();
    const defaultDateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const defaultFormattedDate = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const [result] = await pool.query(`
      INSERT INTO news_articles 
      (slug, title, title_ar, category, categories, date_str, formatted_date, read_time, image, badge, summary, summary_ar, content_html, content_html_ar, official_link, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      slug,
      title.trim(),
      title_ar || null,
      category || 'Company Updates',
      JSON.stringify(parsedCategories),
      date_str || defaultDateStr,
      formatted_date || defaultFormattedDate,
      read_time || '3 min read',
      imageUrl,
      badge || (category ? category.toUpperCase() : 'NEWS'),
      summary || '',
      summary_ar || '',
      content_html || '',
      content_html_ar || '',
      official_link || null,
      status || 'Published'
    ]);

    res.status(201).json({
      success: true,
      message: 'News article published successfully',
      article: {
        id: result.insertId,
        slug,
        title,
        title_ar: title_ar || null,
        summary_ar: summary_ar || '',
        content_html_ar: content_html_ar || '',
        category: category || 'Company Updates',
        image: imageUrl,
        status: status || 'Published'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create news article', error: error.message });
  }
};

// PUT /api/news/:id
exports.updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    const [rows] = await pool.query('SELECT * FROM news_articles WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    const article = rows[0];
    const {
      title,
      title_ar,
      category,
      categories,
      date_str,
      formatted_date,
      read_time,
      badge,
      summary,
      summary_ar,
      content_html,
      content_html_ar,
      official_link,
      status
    } = req.body;

    let imageUrl = article.image;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.image !== undefined) {
      imageUrl = req.body.image;
    }

    let parsedCategories = article.categories;
    if (categories) {
      parsedCategories = typeof categories === 'string' ? JSON.parse(categories) : categories;
    }

    await pool.query(`
      UPDATE news_articles 
      SET title = ?, title_ar = ?, category = ?, categories = ?, date_str = ?, formatted_date = ?, read_time = ?,
          image = ?, badge = ?, summary = ?, summary_ar = ?, content_html = ?, content_html_ar = ?, official_link = ?, status = ?
      WHERE id = ?
    `, [
      title || article.title,
      title_ar !== undefined ? (title_ar || null) : article.title_ar,
      category || article.category,
      JSON.stringify(parsedCategories),
      date_str || article.date_str,
      formatted_date || article.formatted_date,
      read_time || article.read_time,
      imageUrl,
      badge || article.badge,
      summary !== undefined ? summary : article.summary,
      summary_ar !== undefined ? summary_ar : article.summary_ar,
      content_html !== undefined ? content_html : article.content_html,
      content_html_ar !== undefined ? content_html_ar : article.content_html_ar,
      official_link !== undefined ? official_link : article.official_link,
      status || article.status,
      id
    ]);

    res.json({
      success: true,
      message: 'Article updated successfully',
      article: {
        id: parseInt(id),
        title: title || article.title,
        title_ar: title_ar !== undefined ? (title_ar || null) : article.title_ar,
        summary_ar: summary_ar !== undefined ? summary_ar : article.summary_ar,
        content_html_ar: content_html_ar !== undefined ? content_html_ar : article.content_html_ar,
        image: imageUrl,
        status: status || article.status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update article', error: error.message });
  }
};

// DELETE /api/news/:id
exports.deleteNews = async (req, res) => {
  try {
    const pool = getPool();
    const [result] = await pool.query('DELETE FROM news_articles WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    res.json({ success: true, message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete article', error: error.message });
  }
};
