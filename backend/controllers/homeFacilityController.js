const fs = require('fs');
const path = require('path');
const { getPool } = require('../config/db');

const facilityImages = [
  ['/uploads/facility-gallery/1789227486983-887709867-updated1.png', 'VIC facility exterior'],
  ['/uploads/facility-gallery/vlc0.png', 'VIC facility exterior'],
  ['/uploads/facility-gallery/Vic main1.png', 'VIC manufacturing facility exterior'],
  ['/uploads/facility-gallery/Vic main2.png', 'VIC manufacturing facility'],
  ['/uploads/facility-gallery/Vic RDI.png', 'VIC research and development facility'],
  ['/uploads/facility-gallery/Vic side 2.png', 'VIC facility side view'],
  ['/uploads/facility-gallery/vic side 3.png', 'VIC facility campus view'],
  ['/uploads/facility-gallery/vic side.png', 'VIC facility exterior view'],
  ['/uploads/facility-gallery/Vic top1.png', 'VIC facility aerial view']
];

async function ensureDefaults(pool) {
  // Migrate old frontend paths once so local `slide_Images` is never used.
  await pool.query(`
    UPDATE home_facility_images
    SET image_url = CONCAT('/uploads/facility-gallery/', file_name), source_type = 'upload'
    WHERE image_url LIKE 'slide_Images/%'
  `);

  const [existingRows] = await pool.query('SELECT file_name FROM home_facility_images');
  const existingNames = new Set(existingRows.map(row => row.file_name));
  for (const [index, [imageUrl, altText]] of facilityImages.entries()) {
    const fileName = path.basename(imageUrl);
    if (existingNames.has(fileName)) continue;
    if (index === 0) await pool.query('UPDATE home_facility_images SET order_index = order_index + 1');
    await pool.query(
      `INSERT INTO home_facility_images (title, alt_text, image_url, file_name, source_type, order_index)
       VALUES (?, ?, ?, ?, 'upload', ?)`,
      [altText, altText, imageUrl, fileName, index === 0 ? 0 : index]
    );
  }
}

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
