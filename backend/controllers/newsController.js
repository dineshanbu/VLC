const { getPool } = require('../config/db');

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

    query += ' ORDER BY id DESC';

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

// POST /api/news (Admin create with optional image upload)
exports.createNews = async (req, res) => {
  try {
    const {
      title,
      category,
      categories,
      date_str,
      formatted_date,
      read_time,
      badge,
      summary,
      content_html,
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
      (slug, title, category, categories, date_str, formatted_date, read_time, image, badge, summary, content_html, official_link, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      slug,
      title.trim(),
      category || 'Company Updates',
      JSON.stringify(parsedCategories),
      date_str || defaultDateStr,
      formatted_date || defaultFormattedDate,
      read_time || '3 min read',
      imageUrl,
      badge || (category ? category.toUpperCase() : 'NEWS'),
      summary || '',
      content_html || '',
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
      category,
      categories,
      date_str,
      formatted_date,
      read_time,
      badge,
      summary,
      content_html,
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
      SET title = ?, category = ?, categories = ?, date_str = ?, formatted_date = ?, read_time = ?,
          image = ?, badge = ?, summary = ?, content_html = ?, official_link = ?, status = ?
      WHERE id = ?
    `, [
      title || article.title,
      category || article.category,
      JSON.stringify(parsedCategories),
      date_str || article.date_str,
      formatted_date || article.formatted_date,
      read_time || article.read_time,
      imageUrl,
      badge || article.badge,
      summary !== undefined ? summary : article.summary,
      content_html !== undefined ? content_html : article.content_html,
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
