const { getPool } = require('../config/db');

// POST /api/contacts (Public API - Submit contact message from main page)
exports.submitContactInquiry = async (req, res) => {
  try {
    const { fullName, email, company, phone, subject, message } = req.body;

    if (!fullName || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, valid email, and your message.'
      });
    }

    const pool = getPool();
    const [result] = await pool.query(`
      INSERT INTO contact_inquiries (full_name, email, company, phone, subject, message, status, is_starred)
      VALUES (?, ?, ?, ?, ?, ?, 'New', 0)
    `, [
      fullName.trim(),
      email.trim().toLowerCase(),
      company || '',
      phone || '',
      subject || 'General Inquiry',
      message.trim()
    ]);

    res.status(201).json({
      success: true,
      message: 'Thank you. Your message has been received and routed to our team.',
      inquiryId: result.insertId
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit inquiry', error: error.message });
  }
};

// GET /api/contacts (Admin - List inquiries with filtering & pagination)
exports.getAllInquiries = async (req, res) => {
  try {
    const pool = getPool();
    const { status, starred, search } = req.query;

    let query = 'SELECT * FROM contact_inquiries WHERE 1=1';
    const params = [];

    if (status && status !== 'All') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (starred === 'true' || starred === '1') {
      query += ' AND is_starred = 1';
    }

    if (search) {
      query += ' AND (full_name LIKE ? OR email LIKE ? OR company LIKE ? OR subject LIKE ? OR message LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term, term);
    }

    query += ' ORDER BY created_at DESC';

    const [inquiries] = await pool.query(query, params);
    res.json({ success: true, count: inquiries.length, inquiries });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch inquiries', error: error.message });
  }
};

// GET /api/contacts/:id
exports.getInquiryById = async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM contact_inquiries WHERE id = ?', [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    res.json({ success: true, inquiry: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching inquiry', error: error.message });
  }
};

// PUT /api/contacts/:id (Update status / toggle star / add notes)
exports.updateInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, is_starred, notes } = req.body;
    const pool = getPool();

    const [rows] = await pool.query('SELECT * FROM contact_inquiries WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    const current = rows[0];

    await pool.query(`
      UPDATE contact_inquiries 
      SET status = ?, is_starred = ?, notes = ?
      WHERE id = ?
    `, [
      status !== undefined ? status : current.status,
      is_starred !== undefined ? (is_starred ? 1 : 0) : current.is_starred,
      notes !== undefined ? notes : current.notes,
      id
    ]);

    res.json({
      success: true,
      message: 'Inquiry updated successfully',
      inquiry: {
        id: parseInt(id),
        status: status !== undefined ? status : current.status,
        is_starred: is_starred !== undefined ? (is_starred ? 1 : 0) : current.is_starred,
        notes: notes !== undefined ? notes : current.notes
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update inquiry', error: error.message });
  }
};

// DELETE /api/contacts/:id
exports.deleteInquiry = async (req, res) => {
  try {
    const pool = getPool();
    const [result] = await pool.query('DELETE FROM contact_inquiries WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    res.json({ success: true, message: 'Inquiry deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete inquiry', error: error.message });
  }
};
