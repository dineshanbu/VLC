const { getPool } = require('../config/db');

const parseJson = value => {
  if (!value) return null;
  try { return typeof value === 'string' ? JSON.parse(value) : value; }
  catch { return null; }
};

const defaultHeroBadges = { badge: 'OUR LEADERSHIP', badge_ar: 'قيادتنا' };

const normalizeHero = value => {
  if (!value || typeof value !== 'object') return value;
  return {
    ...value,
    badge: typeof value.badge === 'string' && value.badge.trim() ? value.badge : defaultHeroBadges.badge,
    badge_ar: typeof value.badge_ar === 'string' && value.badge_ar.trim() ? value.badge_ar : defaultHeroBadges.badge_ar
  };
};

const readContent = async pool => {
  const [rows] = await pool.query('SELECT hero_content, page_content FROM executive_team_content WHERE id = 1');
  return rows.length ? { hero: normalizeHero(parseJson(rows[0].hero_content)), page: parseJson(rows[0].page_content) } : { hero: null, page: null };
};

exports.getContent = async (_req, res, next) => {
  try { res.json({ success: true, content: await readContent(getPool()) }); }
  catch (error) { next(error); }
};

exports.saveHero = async (req, res, next) => {
  try {
    const pool = getPool();
    const content = await readContent(pool);
    const hero = { ...defaultHeroBadges, ...(content.hero || {}) };
    for (const field of ['badge', 'badge_ar', 'title', 'title_ar', 'subtitle', 'subtitle_ar', 'description', 'description_ar', 'image_url', 'image_url_ar']) {
      if (req.body[field] !== undefined) hero[field] = req.body[field];
    }
    const englishImage = req.files?.image?.[0];
    const arabicImage = req.files?.image_ar?.[0];
    if (englishImage) hero.image_url = `/uploads/${englishImage.filename}`;
    hero.image_url_ar = arabicImage ? `/uploads/${arabicImage.filename}` : (hero.image_url_ar || hero.image_url);
    await pool.query(`INSERT INTO executive_team_content (id, hero_content, page_content) VALUES (1, ?, ?)
      ON DUPLICATE KEY UPDATE hero_content = VALUES(hero_content)`, [JSON.stringify(hero), JSON.stringify(content.page || {})]);
    res.json({ success: true, content: await readContent(pool) });
  } catch (error) { next(error); }
};

exports.savePage = async (req, res, next) => {
  try {
    const pool = getPool();
    const content = await readContent(pool);
    const page = req.body && typeof req.body === 'object' ? req.body : {};
    await pool.query(`INSERT INTO executive_team_content (id, hero_content, page_content) VALUES (1, ?, ?)
      ON DUPLICATE KEY UPDATE page_content = VALUES(page_content)`, [JSON.stringify(content.hero || {}), JSON.stringify(page)]);
    res.json({ success: true, content: await readContent(pool) });
  } catch (error) { next(error); }
};

const parseSections = value => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try { return typeof value === 'string' ? JSON.parse(value) : value; }
  catch { return []; }
};

const parseMember = row => ({
  ...row,
  bio_sections: parseSections(row.bio_sections),
  bio_sections_ar: parseSections(row.bio_sections_ar)
});

exports.getMembers = async (req, res, next) => {
  try {
    const pool = getPool();
    const params = [];
    let query = 'SELECT * FROM executive_team_members';
    if (req.query.status && req.query.status !== 'All') {
      query += ' WHERE status = ?';
      params.push(req.query.status);
    }
    query += ' ORDER BY order_index ASC, id ASC';
    const [rows] = await pool.query(query, params);
    const members = rows.map(parseMember);
    res.json({ success: true, count: members.length, members });
  } catch (error) { next(error); }
};

exports.getMember = async (req, res, next) => {
  try {
    const [rows] = await getPool().query('SELECT * FROM executive_team_members WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Executive team member not found.' });
    res.json({ success: true, member: parseMember(rows[0]) });
  } catch (error) { next(error); }
};

exports.createMember = async (req, res, next) => {
  try {
    const { name, name_ar, title, title_ar, role, role_ar, badge, badge_ar, initials, order_index, status } = req.body;
    if (!String(name || '').trim() || !String(title || '').trim()) {
      return res.status(400).json({ success: false, message: 'Name and executive title are required.' });
    }
    const image = req.file ? `/uploads/${req.file.filename}` : (req.body.image || '');
    const bioSections = parseSections(req.body.bio_sections);
    const bioSectionsAr = parseSections(req.body.bio_sections_ar);
    const calculatedInitials = initials || String(name).trim().split(/\s+/).map(part => part[0]).join('').toUpperCase().slice(0, 2);
    const [result] = await getPool().query(`
      INSERT INTO executive_team_members
        (name, name_ar, title, title_ar, role, role_ar, badge, badge_ar, initials, image, bio_sections, bio_sections_ar, order_index, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [name.trim(), name_ar || null, title.trim(), title_ar || null, role || '', role_ar || null, badge || '', badge_ar || null,
      calculatedInitials, image, JSON.stringify(bioSections), JSON.stringify(bioSectionsAr), Number(order_index) || 0, status || 'Active']);
    const [rows] = await getPool().query('SELECT * FROM executive_team_members WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, member: parseMember(rows[0]) });
  } catch (error) { next(error); }
};

exports.updateMember = async (req, res, next) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM executive_team_members WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Executive team member not found.' });
    const existing = rows[0];
    const fields = ['name', 'name_ar', 'title', 'title_ar', 'role', 'role_ar', 'badge', 'badge_ar', 'initials', 'order_index', 'status'];
    const values = fields.map(field => req.body[field] !== undefined ? req.body[field] : existing[field]);
    values[0] = String(values[0] || '').trim();
    values[2] = String(values[2] || '').trim();
    if (!values[0] || !values[2]) return res.status(400).json({ success: false, message: 'Name and executive title are required.' });
    const image = req.file ? `/uploads/${req.file.filename}` : (req.body.image !== undefined ? req.body.image : existing.image);
    const bioSections = req.body.bio_sections !== undefined ? parseSections(req.body.bio_sections) : parseSections(existing.bio_sections);
    const bioSectionsAr = req.body.bio_sections_ar !== undefined ? parseSections(req.body.bio_sections_ar) : parseSections(existing.bio_sections_ar);
    await pool.query(`
      UPDATE executive_team_members SET
        name=?, name_ar=?, title=?, title_ar=?, role=?, role_ar=?, badge=?, badge_ar=?, initials=?, image=?,
        bio_sections=?, bio_sections_ar=?, order_index=?, status=? WHERE id=?
    `, [...values.slice(0, 9), image, JSON.stringify(bioSections), JSON.stringify(bioSectionsAr), Number(values[9]) || 0, values[10], req.params.id]);
    const [updated] = await pool.query('SELECT * FROM executive_team_members WHERE id = ?', [req.params.id]);
    res.json({ success: true, member: parseMember(updated[0]) });
  } catch (error) { next(error); }
};

exports.deleteMember = async (req, res, next) => {
  try {
    const [result] = await getPool().query('DELETE FROM executive_team_members WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Executive team member not found.' });
    res.json({ success: true });
  } catch (error) { next(error); }
};

exports.reorderMembers = async (req, res, next) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ success: false, message: 'Items array is required.' });
    const pool = getPool();
    for (const item of items) {
      if (item.id && item.order_index !== undefined) {
        await pool.query('UPDATE executive_team_members SET order_index = ? WHERE id = ?', [Number(item.order_index) || 0, item.id]);
      }
    }
    res.json({ success: true });
  } catch (error) { next(error); }
};
