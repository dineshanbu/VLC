const { getPool, seedJobPostings } = require('../config/db');

// Helper to safely parse JSON or array
function parseJsonArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        // Fallback below
      }
    }
    // If not JSON array, split by newlines
    return trimmed.split('\n').map(s => s.trim().replace(/^[-*•]\s*/, '')).filter(Boolean);
  }
  return [];
}

// GET /api/careers (Public & Admin list jobs)
exports.getAllJobs = async (req, res) => {
  try {
    const pool = getPool();
    const { status, department, location, experience, q, search } = req.query;
    const searchTerm = q || search;

    let query = `
      SELECT jp.*,
        (SELECT COUNT(*) FROM job_applications ja WHERE ja.job_id = jp.id) as applications_count
      FROM job_postings jp
      WHERE 1=1
    `;
    const params = [];

    // Filter by status: If 'All', no filter. If not specified and public request, default to 'Active'
    if (status && status !== 'All') {
      query += ' AND jp.status = ?';
      params.push(status);
    } else if (!req.user && !status) {
      query += " AND jp.status = 'Active'";
    }

    // Filter by department / category
    if (department && department !== 'All' && department !== 'All Departments') {
      query += ' AND jp.department = ?';
      params.push(department);
    }

    // Filter by location
    if (location && location !== 'All' && location !== 'All Locations') {
      query += ' AND jp.location = ?';
      params.push(location);
    }

    // Filter by experience
    if (experience && experience !== 'All' && experience !== 'Experience Level') {
      query += ' AND jp.experience = ?';
      params.push(experience);
    }

    // Search query
    if (searchTerm && searchTerm.trim()) {
      const term = `%${searchTerm.trim()}%`;
      query += ' AND (jp.title LIKE ? OR jp.department LIKE ? OR jp.location LIKE ? OR jp.overview LIKE ? OR jp.description LIKE ?)';
      params.push(term, term, term, term, term);
    }

    query += ' ORDER BY jp.id DESC';

    const [rawJobs] = await pool.query(query, params);

    // Format jobs with parsed arrays and consistent fields
    const jobs = rawJobs.map(job => {
      const responsibilities = parseJsonArray(job.responsibilities);
      const qualifications = parseJsonArray(job.qualifications || job.requirements);
      const overview = job.overview || job.description || '';

      return {
        ...job,
        overview,
        description: overview,
        responsibilities,
        qualifications,
        requirements: qualifications.join('\n')
      };
    });

    res.json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch jobs', error: error.message });
  }
};

// GET /api/careers/departments (Unique categories with active counts)
exports.getDepartments = async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(`
      SELECT department, COUNT(*) as count,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active_count
      FROM job_postings
      GROUP BY department
      ORDER BY count DESC
    `);

    res.json({
      success: true,
      departments: rows
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch departments', error: error.message });
  }
};

// GET /api/careers/:id
exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    let query = 'SELECT * FROM job_postings WHERE id = ?';
    let params = [id];

    // Check if id is a job_code string
    if (isNaN(Number(id))) {
      query = 'SELECT * FROM job_postings WHERE job_code = ?';
    }

    const [rows] = await pool.query(query, params);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Job posting not found' });
    }

    const job = rows[0];
    const responsibilities = parseJsonArray(job.responsibilities);
    const qualifications = parseJsonArray(job.qualifications || job.requirements);
    const overview = job.overview || job.description || '';

    res.json({
      success: true,
      job: {
        ...job,
        overview,
        description: overview,
        responsibilities,
        qualifications,
        requirements: qualifications.join('\n')
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch job details', error: error.message });
  }
};

// POST /api/careers (Admin create job)
exports.createJob = async (req, res) => {
  try {
    const {
      job_code,
      title,
      department,
      location,
      type,
      experience,
      overview,
      description,
      requirements,
      responsibilities,
      qualifications,
      status
    } = req.body;

    if (!title || !department) {
      return res.status(400).json({ success: false, message: 'Title and department are required.' });
    }

    const finalOverview = overview || description || '';
    const respArray = parseJsonArray(responsibilities);
    const qualArray = parseJsonArray(qualifications || requirements);
    const finalJobCode = job_code || `vic-${department.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 3)}-${Date.now().toString().slice(-3)}`;

    const pool = getPool();
    const [result] = await pool.query(`
      INSERT INTO job_postings (job_code, title, department, location, type, experience, overview, description, requirements, responsibilities, qualifications, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      finalJobCode,
      title,
      department,
      location || 'Sudair Industrial City, KSA',
      type || 'Full-Time',
      experience || '3+ years',
      finalOverview,
      finalOverview,
      qualArray.join('\n'),
      JSON.stringify(respArray),
      JSON.stringify(qualArray),
      status || 'Active'
    ]);

    res.status(201).json({
      success: true,
      message: 'Job posting created successfully',
      jobId: result.insertId,
      job_code: finalJobCode
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create job', error: error.message });
  }
};

// PUT /api/careers/:id (Admin update job)
exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      job_code,
      title,
      department,
      location,
      type,
      experience,
      overview,
      description,
      requirements,
      responsibilities,
      qualifications,
      status
    } = req.body;

    const finalOverview = overview || description || '';
    const respArray = parseJsonArray(responsibilities);
    const qualArray = parseJsonArray(qualifications || requirements);

    const pool = getPool();
    await pool.query(`
      UPDATE job_postings
      SET job_code = COALESCE(?, job_code),
          title = ?,
          department = ?,
          location = ?,
          type = ?,
          experience = ?,
          overview = ?,
          description = ?,
          requirements = ?,
          responsibilities = ?,
          qualifications = ?,
          status = ?
      WHERE id = ?
    `, [
      job_code || null,
      title,
      department,
      location || 'Sudair Industrial City, KSA',
      type || 'Full-Time',
      experience || '3+ years',
      finalOverview,
      finalOverview,
      qualArray.join('\n'),
      JSON.stringify(respArray),
      JSON.stringify(qualArray),
      status || 'Active',
      id
    ]);

    res.json({ success: true, message: 'Job posting updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update job', error: error.message });
  }
};

// DELETE /api/careers/:id (Admin delete job)
exports.deleteJob = async (req, res) => {
  try {
    const pool = getPool();
    await pool.query('DELETE FROM job_postings WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Job posting deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete job', error: error.message });
  }
};

// POST /api/careers/apply (Public candidate application)
exports.applyJob = async (req, res) => {
  try {
    const {
      job_id,
      job_code,
      fullName,
      candidate_name,
      email,
      phone,
      linkedIn,
      resume_url,
      resumeName,
      coverNote,
      cover_letter
    } = req.body;

    const name = candidate_name || fullName || (req.file ? req.file.originalname.replace(/\.[^/.]+$/, '') : '');
    const candidateEmail = email || 'talent-drop@applicant.vic';
    const candidatePhone = phone || 'Not provided';

    if (!name) {
      return res.status(400).json({ success: false, message: 'Candidate name is required.' });
    }

    const pool = getPool();
    let targetJobId = job_id ? parseInt(job_id) : null;

    if (!targetJobId && job_code) {
      const [jobs] = await pool.query('SELECT id FROM job_postings WHERE job_code = ? LIMIT 1', [job_code]);
      if (jobs.length > 0) {
        targetJobId = jobs[0].id;
      }
    }

    const finalCover = [
      cover_letter || coverNote || '',
      linkedIn ? `LinkedIn: ${linkedIn}` : ''
    ].filter(Boolean).join('\n\n');

    // If file was uploaded via multer, use /uploads/<filename>
    let finalResume = '';
    if (req.file) {
      finalResume = `/uploads/${req.file.filename}`;
    } else {
      finalResume = resume_url || resumeName || '';
    }

    const [result] = await pool.query(`
      INSERT INTO job_applications (job_id, candidate_name, email, phone, resume_url, cover_letter, status)
      VALUES (?, ?, ?, ?, ?, ?, 'Submitted')
    `, [targetJobId, name, candidateEmail, candidatePhone, finalResume, finalCover]);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      applicationId: result.insertId,
      resume_url: finalResume
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to submit application', error: error.message });
  }
};

// GET /api/careers/applications (Admin list applications)
exports.getApplications = async (req, res) => {
  try {
    const pool = getPool();
    const { status, job_id } = req.query;

    let query = `
      SELECT ja.*, jp.title as job_title, jp.department as job_department, jp.job_code
      FROM job_applications ja
      LEFT JOIN job_postings jp ON ja.job_id = jp.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'All') {
      query += ' AND ja.status = ?';
      params.push(status);
    }

    if (job_id && job_id !== 'All') {
      query += ' AND ja.job_id = ?';
      params.push(job_id);
    }

    query += ' ORDER BY ja.id DESC';

    const [applications] = await pool.query(query, params);
    res.json({ success: true, count: applications.length, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch applications', error: error.message });
  }
};

// PUT /api/careers/applications/:id/status (Admin update application status)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ['Submitted', 'Reviewing', 'Shortlisted', 'Interviewed', 'Rejected', 'Hired'];
    if (status && !allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Allowed: ${allowed.join(', ')}` });
    }

    const pool = getPool();
    await pool.query(`
      UPDATE job_applications
      SET status = COALESCE(?, status)
      WHERE id = ?
    `, [status, id]);

    res.json({ success: true, message: 'Application status updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update application status', error: error.message });
  }
};

// POST /api/careers/seed (Admin reseed or sync default positions)
exports.seedJobs = async (req, res) => {
  try {
    const pool = getPool();
    const force = req.body.force === true;
    await seedJobPostings(pool, force);
    const [jobs] = await pool.query('SELECT COUNT(*) as count FROM job_postings');
    res.json({ success: true, message: 'Job positions synchronized successfully', totalJobs: jobs[0].count });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to seed jobs', error: error.message });
  }
};
