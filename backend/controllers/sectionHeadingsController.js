const { getPool } = require('../config/db');

let tableReady;
async function ensureTable() {
  if (!tableReady) {
    tableReady = getPool().query(`CREATE TABLE IF NOT EXISTS site_section_headings (
      heading_key VARCHAR(190) PRIMARY KEY,
      title_en TEXT NOT NULL,
      title_ar TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  }
  try { await tableReady; } catch (error) { tableReady = null; throw error; }
}

exports.getHeadings = async (_req, res, next) => {
  try {
    await ensureTable();
    const [rows] = await getPool().query('SELECT heading_key, title_en, title_ar FROM site_section_headings');
    res.json({ success: true, headings: Object.fromEntries(rows.map(row => [row.heading_key, { en: row.title_en, ar: row.title_ar }])) });
  } catch (error) { next(error); }
};

exports.saveHeadings = async (req, res, next) => {
  try {
    await ensureTable();
    const headings = req.body?.headings;
    if (!headings || typeof headings !== 'object' || Array.isArray(headings)) {
      return res.status(400).json({ success: false, message: 'Provide a section heading map to save.' });
    }
    const db = getPool();
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      for (const [key, value] of Object.entries(headings)) {
        if (!/^[a-z0-9._-]{1,190}$/i.test(key) || !value || typeof value.en !== 'string' || typeof value.ar !== 'string') continue;
        await connection.query(`INSERT INTO site_section_headings (heading_key, title_en, title_ar) VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE title_en = VALUES(title_en), title_ar = VALUES(title_ar)`, [key, value.en.trim(), value.ar.trim()]);
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally { connection.release(); }
    return exports.getHeadings(req, res, next);
  } catch (error) { next(error); }
};
