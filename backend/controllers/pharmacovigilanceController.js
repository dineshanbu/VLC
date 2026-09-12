const { getPool } = require('../config/db');

exports.submitReport = async (req, res) => {
  try {
    const { reporterName, contactNumber, email, productName, occupation, sideEffectDescription, otherInfo } = req.body;
    if (!reporterName || !contactNumber || !productName || !sideEffectDescription) {
      return res.status(400).json({ success: false, message: 'Please complete all required report fields.' });
    }
    const [result] = await getPool().query(
      `INSERT INTO pharmacovigilance_reports (reporter_name, contact_number, email, product_name, occupation, side_effect_description, other_info)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [reporterName.trim(), contactNumber.trim(), email?.trim() || null, productName.trim(), occupation || null, sideEffectDescription.trim(), otherInfo?.trim() || null]
    );
    res.status(201).json({ success: true, message: 'Safety report submitted successfully.', reportId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to submit safety report.' });
  }
};

exports.getReports = async (req, res) => {
  try {
    const { status = 'All', search = '' } = req.query;
    let query = 'SELECT * FROM pharmacovigilance_reports WHERE 1=1';
    const params = [];
    if (status !== 'All') { query += ' AND status = ?'; params.push(status); }
    if (search) { query += ' AND (reporter_name LIKE ? OR email LIKE ? OR product_name LIKE ? OR side_effect_description LIKE ?)'; const term = `%${search}%`; params.push(term, term, term, term); }
    query += ' ORDER BY created_at DESC';
    const [reports] = await getPool().query(query, params);
    res.json({ success: true, count: reports.length, reports });
  } catch (error) { res.status(500).json({ success: false, message: 'Failed to fetch safety reports.' }); }
};

exports.updateReport = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const [result] = await getPool().query('UPDATE pharmacovigilance_reports SET status = COALESCE(?, status), notes = COALESCE(?, notes) WHERE id = ?', [status ?? null, notes ?? null, req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Report not found.' });
    res.json({ success: true, message: 'Safety report updated.' });
  } catch (error) { res.status(500).json({ success: false, message: 'Failed to update safety report.' }); }
};
