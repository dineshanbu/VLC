const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool } = require('../config/db');

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or credentials.' });
    }

    const user = rows[0];

    if (user.status !== 'Active') {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password.' });
    }

    // Update last login
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    // Sign JWT token
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      },
      process.env.JWT_SECRET || 'vic_biotech_super_secret_jwt_key_2026!',
      { expiresIn: '7d' }
    );

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      status: user.status,
      avatar: user.avatar,
      phone: user.phone
    };

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during authentication', error: error.message });
  }
};

// GET /api/auth/me
exports.getCurrentUser = async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT id, name, email, role, department, status, avatar, phone, last_login, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching profile', error: error.message });
  }
};

// PUT /api/auth/update-profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, department, currentPassword, newPassword } = req.body;
    const pool = getPool();

    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
    const user = rows[0];

    // If changing password, verify old password
    let updatedPassword = user.password;
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Current password is required to set new password' });
      }
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }
      updatedPassword = await bcrypt.hash(newPassword, 10);
    }

    await pool.query(
      `UPDATE users SET name = ?, phone = ?, department = ?, password = ? WHERE id = ?`,
      [name || user.name, phone || user.phone, department || user.department, updatedPassword, user.id]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: name || user.name,
        email: user.email,
        role: user.role,
        department: department || user.department,
        phone: phone || user.phone
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating profile', error: error.message });
  }
};
