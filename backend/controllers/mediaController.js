const path = require('path');
const fs = require('fs');
const { getPool } = require('../config/db');

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// GET /api/media
exports.getAllMedia = async (req, res) => {
  try {
    const pool = getPool();
    const { category, search, format } = req.query;

    let query = 'SELECT * FROM media_assets WHERE 1=1';
    const params = [];

    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (format && format !== 'All') {
      query += ' AND format = ?';
      params.push(format);
    }

    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ? OR file_name LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    query += ' ORDER BY id DESC';

    const [media] = await pool.query(query, params);
    res.json({ success: true, count: media.length, media });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch media assets', error: error.message });
  }
};

// POST /api/media (Upload file & metadata)
exports.uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const { title, description, category } = req.body;
    const pool = getPool();

    const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '');
    let format = 'OTHER';
    if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext)) format = 'IMAGE';
    else if (['pdf'].includes(ext)) format = 'PDF';
    else if (['doc', 'docx'].includes(ext)) format = 'DOC';
    else if (['mp4', 'mov', 'webm'].includes(ext)) format = 'VIDEO';

    const fileSizeStr = formatBytes(req.file.size);
    const fileUrl = `/uploads/${req.file.filename}`;
    const displayTitle = title || req.file.originalname.split('.')[0].replace(/[_-]/g, ' ');

    const [result] = await pool.query(`
      INSERT INTO media_assets (title, description, category, format, file_size, file_name, file_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      displayTitle,
      description || '',
      category || 'General',
      format,
      fileSizeStr,
      req.file.filename,
      fileUrl
    ]);

    res.status(201).json({
      success: true,
      message: 'Media asset uploaded successfully',
      media: {
        id: result.insertId,
        title: displayTitle,
        description,
        category: category || 'General',
        format,
        file_size: fileSizeStr,
        file_name: req.file.filename,
        file_url: fileUrl
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to upload media asset', error: error.message });
  }
};

// DELETE /api/media/:id
exports.deleteMedia = async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM media_assets WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Media asset not found' });
    }

    const media = rows[0];
    const filePath = path.join(__dirname, '../uploads', media.file_name);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.warn('Could not remove file on disk:', e.message);
      }
    }

    await pool.query('DELETE FROM media_assets WHERE id = ?', [req.params.id]);

    res.json({ success: true, message: 'Media asset deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete media', error: error.message });
  }
};
