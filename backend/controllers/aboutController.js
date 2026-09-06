const { getPool, seedAboutData, defaultAboutContent, defaultLeadersList } = require('../config/db');

// ==========================================
// 1. ABOUT PAGE CONTENT SECTIONS
// ==========================================

exports.getAboutContent = async (req, res, next) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM about_page_content');

    const contentMap = {};
    for (const row of rows) {
      let content_json = null;
      try {
        content_json = typeof row.content_json === 'string' ? JSON.parse(row.content_json) : row.content_json;
      } catch (e) {
        content_json = null;
      }

      let content_json_ar = null;
      try {
        content_json_ar = typeof row.content_json_ar === 'string' ? JSON.parse(row.content_json_ar) : row.content_json_ar;
      } catch (e) {
        content_json_ar = null;
      }

      contentMap[row.section_key] = {
        ...row,
        content_json,
        content_json_ar
      };
    }

    // Fill with default fallback if any section is missing
    for (const key of Object.keys(defaultAboutContent)) {
      if (!contentMap[key]) {
        contentMap[key] = defaultAboutContent[key];
      }
    }

    res.json({
      success: true,
      content: contentMap
    });
  } catch (error) {
    next(error);
  }
};

exports.updateAboutSection = async (req, res, next) => {
  try {
    const pool = getPool();
    const section_key = req.params.section_key;
    const {
      title, title_ar,
      subtitle, subtitle_ar,
      badge, badge_ar,
      description, description_ar,
      content_json, content_json_ar
    } = req.body;

    let image_url = req.body.image_url;
    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    }

    let parsedContent = content_json;
    if (typeof content_json === 'object') {
      parsedContent = JSON.stringify(content_json);
    }

    let parsedContentAr = content_json_ar;
    if (typeof content_json_ar === 'object') {
      parsedContentAr = JSON.stringify(content_json_ar);
    }

    await pool.query(`
      INSERT INTO about_page_content (
        section_key, title, title_ar, subtitle, subtitle_ar, badge, badge_ar, description, description_ar, image_url, content_json, content_json_ar
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        title_ar = VALUES(title_ar),
        subtitle = VALUES(subtitle),
        subtitle_ar = VALUES(subtitle_ar),
        badge = VALUES(badge),
        badge_ar = VALUES(badge_ar),
        description = VALUES(description),
        description_ar = VALUES(description_ar),
        image_url = COALESCE(VALUES(image_url), image_url),
        content_json = VALUES(content_json),
        content_json_ar = VALUES(content_json_ar)
    `, [
      section_key,
      title || '',
      title_ar || '',
      subtitle || '',
      subtitle_ar || '',
      badge || '',
      badge_ar || '',
      description || '',
      description_ar || '',
      image_url || null,
      parsedContent || null,
      parsedContentAr || null
    ]);

    const [updated] = await pool.query('SELECT * FROM about_page_content WHERE section_key = ?', [section_key]);

    let formattedJson = null;
    try {
      formattedJson = typeof updated[0].content_json === 'string' ? JSON.parse(updated[0].content_json) : updated[0].content_json;
    } catch (e) {
      formattedJson = null;
    }

    let formattedJsonAr = null;
    try {
      formattedJsonAr = typeof updated[0].content_json_ar === 'string' ? JSON.parse(updated[0].content_json_ar) : updated[0].content_json_ar;
    } catch (e) {
      formattedJsonAr = null;
    }

    res.json({
      success: true,
      message: `Section "${section_key}" updated successfully.`,
      section: {
        ...updated[0],
        content_json: formattedJson,
        content_json_ar: formattedJsonAr
      }
    });
  } catch (error) {
    next(error);
  }
};


// ==========================================
// 2. LEADERS & FOUNDING PARTNERS CRUD
// ==========================================

exports.getAllLeaders = async (req, res, next) => {
  try {
    const pool = getPool();
    const { status, badge, search } = req.query;

    let query = 'SELECT * FROM about_leaders WHERE 1=1';
    const params = [];

    if (status && status !== 'All') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (badge && badge !== 'All') {
      query += ' AND badge = ?';
      params.push(badge);
    }

    if (search) {
      query += ' AND (name LIKE ? OR title LIKE ? OR role LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY order_index ASC, id ASC';

    const [rows] = await pool.query(query, params);

    const parsedLeaders = rows.map(l => {
      let bio_sections = [];
      try {
        bio_sections = typeof l.bio_sections === 'string' ? JSON.parse(l.bio_sections) : (l.bio_sections || []);
      } catch (e) {
        bio_sections = [];
      }
      let bio_sections_ar = [];
      try {
        bio_sections_ar = typeof l.bio_sections_ar === 'string' ? JSON.parse(l.bio_sections_ar) : (l.bio_sections_ar || []);
      } catch (e) {
        bio_sections_ar = [];
      }
      return {
        ...l,
        bio_sections,
        bio_sections_ar
      };
    });

    const [badges] = await pool.query('SELECT DISTINCT badge FROM about_leaders WHERE badge IS NOT NULL ORDER BY badge ASC');

    res.json({
      success: true,
      count: parsedLeaders.length,
      leaders: parsedLeaders,
      badges: badges.map(b => b.badge)
    });
  } catch (error) {
    next(error);
  }
};

exports.getLeaderById = async (req, res, next) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM about_leaders WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Leader not found.' });
    }

    let bio_sections = [];
    try {
      bio_sections = typeof rows[0].bio_sections === 'string' ? JSON.parse(rows[0].bio_sections) : (rows[0].bio_sections || []);
    } catch (e) {
      bio_sections = [];
    }

    let bio_sections_ar = [];
    try {
      bio_sections_ar = typeof rows[0].bio_sections_ar === 'string' ? JSON.parse(rows[0].bio_sections_ar) : (rows[0].bio_sections_ar || []);
    } catch (e) {
      bio_sections_ar = [];
    }

    res.json({
      success: true,
      leader: {
        ...rows[0],
        bio_sections,
        bio_sections_ar
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.createLeader = async (req, res, next) => {
  try {
    const pool = getPool();
    const {
      name, name_ar,
      title, title_ar,
      role, role_ar,
      badge, badge_ar,
      initials, order_index, status,
      bio_sections, bio_sections_ar
    } = req.body;

    if (!name || !title) {
      return res.status(400).json({ success: false, message: 'Name and Title are required.' });
    }

    let image = req.body.image || '';
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    let parsedBio = bio_sections;
    if (typeof bio_sections === 'object') {
      parsedBio = JSON.stringify(bio_sections);
    }

    let parsedBioAr = bio_sections_ar;
    if (typeof bio_sections_ar === 'object') {
      parsedBioAr = JSON.stringify(bio_sections_ar);
    }

    const calculatedInitials = initials || name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    const [result] = await pool.query(`
      INSERT INTO about_leaders (
        name, name_ar, title, title_ar, role, role_ar, badge, badge_ar, initials, image, bio_sections, bio_sections_ar, order_index, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name,
      name_ar || null,
      title,
      title_ar || null,
      role || '',
      role_ar || null,
      badge || 'Executive Board',
      badge_ar || null,
      calculatedInitials,
      image,
      parsedBio || null,
      parsedBioAr || null,
      parseInt(order_index) || 0,
      status || 'Active'
    ]);

    const [newLeader] = await pool.query('SELECT * FROM about_leaders WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Leader created successfully.',
      leader: newLeader[0]
    });
  } catch (error) {
    next(error);
  }
};

exports.updateLeader = async (req, res, next) => {
  try {
    const pool = getPool();
    const id = req.params.id;
    const {
      name, name_ar,
      title, title_ar,
      role, role_ar,
      badge, badge_ar,
      initials, order_index, status,
      bio_sections, bio_sections_ar
    } = req.body;

    const [existing] = await pool.query('SELECT * FROM about_leaders WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Leader not found.' });
    }

    let image = existing[0].image;
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    } else if (req.body.image !== undefined) {
      image = req.body.image;
    }

    let parsedBio = existing[0].bio_sections;
    if (bio_sections !== undefined) {
      parsedBio = typeof bio_sections === 'object' ? JSON.stringify(bio_sections) : bio_sections;
    }

    let parsedBioAr = existing[0].bio_sections_ar;
    if (bio_sections_ar !== undefined) {
      parsedBioAr = typeof bio_sections_ar === 'object' ? JSON.stringify(bio_sections_ar) : bio_sections_ar;
    }

    await pool.query(`
      UPDATE about_leaders SET
        name = ?,
        name_ar = ?,
        title = ?,
        title_ar = ?,
        role = ?,
        role_ar = ?,
        badge = ?,
        badge_ar = ?,
        initials = ?,
        image = ?,
        bio_sections = ?,
        bio_sections_ar = ?,
        order_index = ?,
        status = ?
      WHERE id = ?
    `, [
      name !== undefined ? name : existing[0].name,
      name_ar !== undefined ? name_ar : existing[0].name_ar,
      title !== undefined ? title : existing[0].title,
      title_ar !== undefined ? title_ar : existing[0].title_ar,
      role !== undefined ? role : existing[0].role,
      role_ar !== undefined ? role_ar : existing[0].role_ar,
      badge !== undefined ? badge : existing[0].badge,
      badge_ar !== undefined ? badge_ar : existing[0].badge_ar,
      initials !== undefined ? initials : existing[0].initials,
      image,
      parsedBio,
      parsedBioAr,
      order_index !== undefined ? parseInt(order_index) : existing[0].order_index,
      status !== undefined ? status : existing[0].status,
      id
    ]);

    const [updated] = await pool.query('SELECT * FROM about_leaders WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Leader updated successfully.',
      leader: updated[0]
    });
  } catch (error) {
    next(error);
  }
};


exports.deleteLeader = async (req, res, next) => {
  try {
    const pool = getPool();
    const id = req.params.id;

    const [existing] = await pool.query('SELECT id FROM about_leaders WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Leader not found.' });
    }

    await pool.query('DELETE FROM about_leaders WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Leader deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

exports.reorderLeaders = async (req, res, next) => {
  try {
    const pool = getPool();
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Invalid payload: items array required.' });
    }

    for (const item of items) {
      if (item.id && item.order_index !== undefined) {
        await pool.query('UPDATE about_leaders SET order_index = ? WHERE id = ?', [item.order_index, item.id]);
      }
    }

    res.json({ success: true, message: 'Leaders order updated.' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 3. RESTORE / SEED OFFICIAL DEFAULTS
// ==========================================

exports.seedAbout = async (req, res, next) => {
  try {
    const pool = getPool();
    await seedAboutData(pool, true);
    res.json({
      success: true,
      message: 'About page content and leadership team restored to official defaults successfully.'
    });
  } catch (error) {
    next(error);
  }
};
