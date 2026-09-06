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

      contentMap[row.section_key] = {
        ...row,
        content_json
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
    const { title, subtitle, badge, description, content_json } = req.body;

    let image_url = req.body.image_url;
    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    }

    let parsedContent = content_json;
    if (typeof content_json === 'object') {
      parsedContent = JSON.stringify(content_json);
    }

    await pool.query(`
      INSERT INTO about_page_content (section_key, title, subtitle, badge, description, image_url, content_json)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        title = COALESCE(VALUES(title), title),
        subtitle = COALESCE(VALUES(subtitle), subtitle),
        badge = COALESCE(VALUES(badge), badge),
        description = COALESCE(VALUES(description), description),
        image_url = COALESCE(VALUES(image_url), image_url),
        content_json = COALESCE(VALUES(content_json), content_json)
    `, [
      section_key,
      title || '',
      subtitle || '',
      badge || '',
      description || '',
      image_url || null,
      parsedContent || null
    ]);

    const [updated] = await pool.query('SELECT * FROM about_page_content WHERE section_key = ?', [section_key]);

    let formattedJson = null;
    try {
      formattedJson = typeof updated[0].content_json === 'string' ? JSON.parse(updated[0].content_json) : updated[0].content_json;
    } catch (e) {
      formattedJson = null;
    }

    res.json({
      success: true,
      message: `Section "${section_key}" updated successfully.`,
      section: {
        ...updated[0],
        content_json: formattedJson
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
      return {
        ...l,
        bio_sections
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

    res.json({
      success: true,
      leader: {
        ...rows[0],
        bio_sections
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.createLeader = async (req, res, next) => {
  try {
    const pool = getPool();
    const { name, title, role, badge, initials, order_index, status, bio_sections } = req.body;

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

    const calculatedInitials = initials || name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    const [result] = await pool.query(`
      INSERT INTO about_leaders (name, title, role, badge, initials, image, bio_sections, order_index, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name,
      title,
      role || '',
      badge || 'Executive Board',
      calculatedInitials,
      image,
      parsedBio || null,
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
    const { name, title, role, badge, initials, order_index, status, bio_sections } = req.body;

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

    await pool.query(`
      UPDATE about_leaders SET
        name = ?,
        title = ?,
        role = ?,
        badge = ?,
        initials = ?,
        image = ?,
        bio_sections = ?,
        order_index = ?,
        status = ?
      WHERE id = ?
    `, [
      name !== undefined ? name : existing[0].name,
      title !== undefined ? title : existing[0].title,
      role !== undefined ? role : existing[0].role,
      badge !== undefined ? badge : existing[0].badge,
      initials !== undefined ? initials : existing[0].initials,
      image,
      parsedBio,
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
