const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';
const JWT_EXPIRY = '7d';

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { username, email, password, universityId } = req.body;

    if (!username || !email || !password || !universityId) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters' });
    }

    // Check if university exists
    const univResult = await pool.query('SELECT id FROM universities WHERE id = $1', [universityId]);
    if (univResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid university' });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Username or email already taken' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user with 10000 default points
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, university_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, points, university_id`,
      [username, email, passwordHash, universityId]
    );

    const user = result.rows[0];

    // Get university info
    const univ = await pool.query('SELECT acronym, full_name FROM universities WHERE id = $1', [user.university_id]);

    // Generate JWT
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        points: user.points,
        university: univ.rows[0],
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const result = await pool.query(
      `SELECT u.*, un.acronym as university_acronym, un.full_name as university_name
       FROM users u
       JOIN universities un ON u.university_id = un.id
       WHERE u.email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        points: user.points,
        totalSpins: user.total_spins,
        totalWon: user.total_won,
        university: {
          id: user.university_id,
          acronym: user.university_acronym,
          fullName: user.university_name,
        },
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// GET /api/auth/me
exports.me = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.email, u.points, u.total_spins, u.total_won,
              u.university_id, un.acronym as university_acronym, un.full_name as university_name,
              u.created_at
       FROM users u
       JOIN universities un ON u.university_id = un.id
       WHERE u.id = $1`,
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      points: user.points,
      totalSpins: user.total_spins,
      totalWon: user.total_won,
      university: {
        id: user.university_id,
        acronym: user.university_acronym,
        fullName: user.university_name,
      },
      createdAt: user.created_at,
    });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/auth/universities
exports.getUniversities = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, acronym, full_name FROM universities ORDER BY acronym');
    res.json(result.rows);
  } catch (err) {
    console.error('Universities error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
