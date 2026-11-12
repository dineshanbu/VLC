const fs = require('fs');
const path = require('path');
const { getPool } = require('../config/db');

const facilityImages = [
  ['slide_Images/vic_top1.webp', 'VIC facility aerial view'],
  ['slide_Images/vic_main1.webp', 'VIC manufacturing facility'],
  ['slide_Images/vic_rdi.webp', 'VIC research and development facility'],
  ['slide_Images/vic_side.webp', 'VIC facility campus view'],
  ['slide_Images/vic_side_2.webp', 'VIC facility entrance'],
  ['slide_Images/vic_side_3.webp', 'VIC facility exterior'],
  ['slide_Images/vic_main2.webp', 'VIC production campus']
];

const defaultContent = {
  title: 'State-of-the-Art Facility: Pioneering Excellence in Vaccine Manufacturing',
  title_ar: '',
  lead: 'Welcome to our cutting-edge facility, where innovation meets precision in the pursuit of safeguarding global health. Our state-of-the-art manufacturing hub is designed to push the boundaries of vaccine production, setting new benchmarks for quality, efficiency, and reliability.',
  lead_ar: '',
  paragraph_one: 'Discover a facility that blends advanced technology with meticulous attention to detail, ensuring the seamless execution of every stage in the vaccine manufacturing process. From research and development laboratories to manufacturing suites equipped with the latest advancements, our facility is a testament to our commitment to excellence.',
  paragraph_one_ar: '',
  paragraph_two: 'At the heart of our operations is a team of dedicated professionals, experts in their respective fields, working collaboratively to bring forth groundbreaking vaccines. Explore our facility to witness the convergence of expertise, cutting-edge technology, and a shared passion for advancing healthcare.',
  paragraph_two_ar: ''
};

async function ensureDefaults(pool) {
  // Keep the existing public asset paths intact. These files live in the
  // frontend's public folder, not in the backend upload directory.
  await pool.query(`INSERT IGNORE INTO home_facility_content
    (id, title, title_ar, lead, lead_ar, paragraph_one, paragraph_one_ar, paragraph_two, paragraph_two_ar)
    VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)`, Object.values(defaultContent));

  // Seed the original gallery only once. A persistent state row is required
  // because an intentionally empty gallery must stay empty on later requests.
  await pool.query(`CREATE TABLE IF NOT EXISTS home_facility_gallery_state (
    id TINYINT UNSIGNED PRIMARY KEY,
    initialized TINYINT(1) NOT NULL DEFAULT 0
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  await pool.query('INSERT IGNORE INTO home_facility_gallery_state (id, initialized) VALUES (1, 0)');

  const connection = await pool.getConnection();
  let existingRows;
  try {
    await connection.beginTransaction();
    const [stateRows] = await connection.query('SELECT initialized FROM home_facility_gallery_state WHERE id = 1 FOR UPDATE');
    const [rows] = await connection.query('SELECT id, file_name, image_url FROM home_facility_images');
    existingRows = rows;

    if (!stateRows[0]?.initialized) {
      // Existing rows mean an administrator has already curated this gallery;
      // preserve that exact selection instead of filling missing defaults.
      if (rows.length === 0) {
        for (const [index, [imageUrl, altText]] of facilityImages.entries()) {
          const fileName = path.basename(imageUrl);
          await connection.query(
            `INSERT INTO home_facility_images (title, alt_text, image_url, file_name, source_type, order_index)
             VALUES (?, ?, ?, ?, 'legacy', ?)`,
            [altText, altText, imageUrl, fileName, index]
          );
        }
      }
      await connection.query('UPDATE home_facility_gallery_state SET initialized = 1 WHERE id = 1');
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  const normalizeName = value => path.basename(value || '').replace(/\.[^.]+$/, '').replace(/[^a-z0-9]/gi, '').toLowerCase();
  const publicImageByName = new Map(facilityImages.map(([url, title]) => [normalizeName(url), { url, title }]));
  for (const row of existingRows) {
    const known = publicImageByName.get(normalizeName(row.file_name || row.image_url));
    if (known && (row.image_url || '').startsWith('/uploads/facility-gallery/') && !fs.existsSync(path.join(__dirname, '../uploads/facility-gallery', path.basename(row.image_url)))) {
      await pool.query("UPDATE home_facility_images SET image_url = ?, source_type = 'legacy' WHERE id = ?", [known.url, row.id]);
    }
  }
}

exports.getContent = async (_req, res, next) => {
  try {
    const pool = getPool();
    await ensureDefaults(pool);
    const [rows] = await pool.query('SELECT * FROM home_facility_content WHERE id = 1');
    res.json({ success: true, content: rows[0] || defaultContent });
  } catch (error) { next(error); }
};

exports.updateContent = async (req, res, next) => {
  try {
    const pool = getPool();
    await ensureDefaults(pool);
    const fields = Object.keys(defaultContent);
    const values = fields.map(field => typeof req.body[field] === 'string' ? req.body[field].trim() : '');
    await pool.query(`UPDATE home_facility_content SET ${fields.map(field => `${field} = ?`).join(', ')} WHERE id = 1`, values);
    const [rows] = await pool.query('SELECT * FROM home_facility_content WHERE id = 1');
    res.json({ success: true, content: rows[0] });
  } catch (error) { next(error); }
};

exports.getImages = async (_req, res, next) => {
  try {
    const pool = getPool();
    await ensureDefaults(pool);
    const [images] = await pool.query(
      "SELECT * FROM home_facility_images WHERE status = 'Active' ORDER BY order_index ASC, id ASC"
    );
    res.json({ success: true, images });
  } catch (error) {
    next(error);
  }
};

exports.getAllImages = async (_req, res, next) => {
  try {
    const pool = getPool();
    await ensureDefaults(pool);
    const [images] = await pool.query('SELECT * FROM home_facility_images ORDER BY order_index ASC, id ASC');
    res.json({ success: true, images });
  } catch (error) {
    next(error);
  }
};

exports.createImage = async (req, res, next) => {
  try {
    const { title, alt_text, image_url, status } = req.body;
    if (!req.file && !image_url?.trim()) {
      return res.status(400).json({ success: false, message: 'Upload an image or provide an image URL.' });
    }

    const pool = getPool();
    const savedUrl = req.file ? `/uploads/facility-gallery/${req.file.filename}` : image_url.trim();
    const sourceType = req.file ? 'upload' : 'url';
    const fileName = req.file ? req.file.filename : path.basename(image_url.trim().split('?')[0]);
    // New uploads lead the carousel; existing slides retain their relative order.
    await pool.query('UPDATE home_facility_images SET order_index = order_index + 1');
    const [result] = await pool.query(
      `INSERT INTO home_facility_images (title, alt_text, image_url, file_name, source_type, order_index, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title?.trim() || 'Facility image', alt_text?.trim() || title?.trim() || 'VIC facility image', savedUrl, fileName, sourceType, 0, status || 'Active']
    );
    const [rows] = await pool.query('SELECT * FROM home_facility_images WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Facility image added.', image: rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.updateImage = async (req, res, next) => {
  try {
    const pool = getPool();
    const [currentRows] = await pool.query('SELECT * FROM home_facility_images WHERE id = ?', [req.params.id]);
    if (!currentRows.length) return res.status(404).json({ success: false, message: 'Facility image not found.' });

    const current = currentRows[0];
    const suppliedUrl = req.body.image_url?.trim();
    const imageUrl = req.file ? `/uploads/facility-gallery/${req.file.filename}` : (suppliedUrl || current.image_url);
    const sourceType = req.file ? 'upload' : (suppliedUrl ? 'url' : current.source_type);
    const fileName = req.file ? req.file.filename : (suppliedUrl ? path.basename(suppliedUrl.split('?')[0]) : current.file_name);
    await pool.query(
      `UPDATE home_facility_images
       SET title = ?, alt_text = ?, image_url = ?, file_name = ?, source_type = ?, status = ?
       WHERE id = ?`,
      [req.body.title?.trim() || current.title, req.body.alt_text?.trim() || current.alt_text, imageUrl, fileName, sourceType, req.body.status || current.status, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM home_facility_images WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Facility image updated.', image: rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.reorderImages = async (req, res, next) => {
  try {
    if (!Array.isArray(req.body.items)) return res.status(400).json({ success: false, message: 'A list of image positions is required.' });
    const pool = getPool();
    await Promise.all(req.body.items.map(({ id, order_index }) =>
      pool.query('UPDATE home_facility_images SET order_index = ? WHERE id = ?', [order_index, id])
    ));
    res.json({ success: true, message: 'Gallery order saved.' });
  } catch (error) {
    next(error);
  }
};

exports.deleteImage = async (req, res, next) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM home_facility_images WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Facility image not found.' });
    const image = rows[0];
    if (image.source_type === 'upload' && image.file_name) {
      const filePath = path.join(__dirname, '../uploads/facility-gallery', image.file_name);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await pool.query('DELETE FROM home_facility_images WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Facility image removed.' });
  } catch (error) {
    next(error);
  }
};
