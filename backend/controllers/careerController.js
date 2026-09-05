const { getPool } = require('../config/db');

// GET /api/careers (Public & Admin list jobs)
exports.getAllJobs = async (req, res) => {
  try {
    const pool = getPool();
    const { status, department } = req.query;

    let query = 'SELECT * FROM job_postings WHERE 1=1';
    const params = [];

    if (status && status !== 'All') {
      query += ' AND status = ?';
      params.push(status);
    } else if (!req.user && !status) {
      query += " AND status = 'Active'";
    }

    if (department && department !== 'All') {
      query += ' AND department = ?';
      params.push(department);
    }

    query += ' ORDER BY id DESC';

    const [jobs] = await pool.query(query, params);
    res.json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch jobs', error: error.message });
  }
};

// POST /api/careers (Admin create job)
exports.createJob = async (req, res) => {
  try {
    const { title, department, location, type, experience, description, requirements, status } = req.body;
    if (!title || !department) {
      return res.status(400).json({ success: false, message: 'Title and department are required.' });
    }

    const pool = getPool();
    const [result] = await pool.query(`
      INSERT INTO job_postings (title, department, location, type, experience, description, requirements, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title,
      department,
      location || 'Sudair Industrial City, KSA',
      type || 'Full-time',
      experience || '3+ years',
      description || '',
      requirements || '',
      status || 'Active'
    ]);

    res.status(201).json({
      success: true,
      message: 'Job posting created successfully',
      jobId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create job', error: error.message });
  }
};

// PUT /api/careers/:id (Admin update job)
exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, department, location, type, experience, description, requirements, status } = req.body;
    const pool = getPool();

    await pool.query(`
      UPDATE job_postings
      SET title = ?, department = ?, location = ?, type = ?, experience = ?, description = ?, requirements = ?, status = ?
      WHERE id = ?
    `, [title, department, location, type, experience, description, requirements, status, id]);

    res.json({ success: true, message: 'Job updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update job', error: error.message });
  }
};

// DELETE /api/careers/:id
exports.deleteJob = async (req, res) => {
  try {
    const pool = getPool();
    await pool.query('DELETE FROM job_postings WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Job posting deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete job', error: error.message });
  }
};
