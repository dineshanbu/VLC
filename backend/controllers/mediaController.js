const path = require('path');
const fs = require('fs');
const { getPool } = require('../config/db');
const { createMediaPoster, ensureIosCompatibleVideo } = require('../services/mediaPosterService');

const fallbackPoster = path.join(__dirname, '../../public/slide_Images/vlc0.webp');

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
      query += ' AND (title LIKE ? OR title_ar LIKE ? OR description LIKE ? OR file_name LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    query += ' ORDER BY id DESC';

    const [media] = await pool.query(query, params);
    for (const item of media) {
      if (item.format === 'VIDEO') item.poster_url = `/api/media/${item.id}/poster`;
    }
    res.json({ success: true, count: media.length, media });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch media assets', error: error.message });
  }
};

// GET /api/media/:id/poster (generate and cache a mobile-friendly preview frame)
exports.getMediaPoster = async (req, res) => {
  try {
    const [rows] = await getPool().query('SELECT file_name, format FROM media_assets WHERE id = ?', [req.params.id]);
    if (!rows.length || rows[0].format !== 'VIDEO') {
      return res.status(404).send('Media poster not found.');
    }

    try {
      const posterPath = await createMediaPoster(rows[0].file_name);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      return res.type('image/jpeg').sendFile(posterPath);
    } catch (posterError) {
      console.warn('[Media poster] Could not generate preview:', posterError.message);
      if (fs.existsSync(fallbackPoster)) {
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.sendFile(fallbackPoster);
      }
      return res.status(503).send('Video preview is unavailable.');
    }
  } catch (error) {
    res.status(500).send('Could not load video preview.');
  }
};

// POST /api/media (Upload file & metadata)
exports.uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const { title, title_ar, description, category } = req.body;
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
      INSERT INTO media_assets (title, title_ar, description, category, format, file_size, file_name, file_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      displayTitle,
      title_ar?.trim() || null,
      description || '',
      category || 'General',
      format,
      fileSizeStr,
      req.file.filename,
      fileUrl
    ]);

    if (format === 'VIDEO') {
      ensureIosCompatibleVideo(req.file.filename).catch(() => {});
    }

    res.status(201).json({
      success: true,
      message: 'Media asset uploaded successfully',
      media: {
        id: result.insertId,
        title: displayTitle,
        title_ar: title_ar?.trim() || null,
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

// PUT /api/media/:id (update bilingual media title and description)
exports.updateMedia = async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM media_assets WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Media asset not found.' });

    const current = rows[0];
    const title = req.body.title !== undefined ? String(req.body.title).trim() : current.title;
    if (!title) return res.status(400).json({ success: false, message: 'English media title is required.' });
    const title_ar = req.body.title_ar !== undefined ? (String(req.body.title_ar).trim() || null) : current.title_ar;
    const description = req.body.description !== undefined ? req.body.description : current.description;

    await pool.query('UPDATE media_assets SET title = ?, title_ar = ?, description = ? WHERE id = ?', [title, title_ar, description, req.params.id]);
    res.json({ success: true, message: 'Media titles updated.', media: { ...current, title, title_ar, description } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update media title.', error: error.message });
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
