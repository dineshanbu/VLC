const bcrypt = require('bcryptjs');
const { getPool } = require('../config/db');

// GET /api/users
exports.getAllUsers = async (req, res) => {
  try {
    const pool = getPool();
    const { search, role, status } = req.query;

    let query = 'SELECT id, name, email, role, department, status, avatar, phone, last_login, created_at FROM users WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR department LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (role && role !== 'All') {
      query += ' AND role = ?';
      params.push(role);
    }

    if (status && status !== 'All') {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY id DESC';

    const [users] = await pool.query(query, params);
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
  }
};

// GET /api/users/:id
exports.getUserById = async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT id, name, email, role, department, status, avatar, phone, last_login, created_at FROM users WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching user', error: error.message });
  }
};

// POST /api/users
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, department, status, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const pool = getPool();
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(`
      INSERT INTO users (name, email, password, role, department, status, phone)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      name.trim(),
      email.trim().toLowerCase(),
      hashedPassword,
      role || 'Admin',
      department || 'Administration',
      status || 'Active',
      phone || ''
    ]);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: result.insertId,
        name,
        email,
        role: role || 'Admin',
        department: department || 'Administration',
        status: status || 'Active',
        phone
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create user', error: error.message });
  }
};

// PUT /api/users/:id
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, department, status, phone, password } = req.body;
    const pool = getPool();

    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = rows[0];
    let updatePassword = user.password;
    if (password && password.trim().length > 0) {
      updatePassword = await bcrypt.hash(password, 10);
    }

    await pool.query(`
      UPDATE users 
      SET name = ?, email = ?, role = ?, department = ?, status = ?, phone = ?, password = ?
      WHERE id = ?
    `, [
      name || user.name,
      email ? email.trim().toLowerCase() : user.email,
      role || user.role,
      department || user.department,
      status || user.status,
      phone !== undefined ? phone : user.phone,
      updatePassword,
      req.params.id
    ]);

    res.json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: parseInt(req.params.id),
        name: name || user.name,
        email: email || user.email,
        role: role || user.role,
        department: department || user.department,
        status: status || user.status,
        phone: phone !== undefined ? phone : user.phone
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update user', error: error.message });
  }
};

// DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const pool = getPool();
    // Prevent user from deleting self
    if (req.user.id == req.params.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own active session account.' });
    }

    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete user', error: error.message });
  }
};
