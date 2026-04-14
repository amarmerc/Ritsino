const pool = require('../config/db');

// GET /api/user/profile
exports.getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.email, u.points, u.total_spins, u.total_won,
              un.acronym as university_acronym, un.full_name as university_name,
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

    // Get rank in university
    const rankResult = await pool.query(
      'SELECT fn_user_university_rank($1) as rank',
      [req.userId]
    );

    // Get recent game history
    const historyResult = await pool.query(
      `SELECT bet_amount, win_amount, created_at
       FROM game_history
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 10`,
      [req.userId]
    );

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      points: user.points,
      totalSpins: user.total_spins,
      totalWon: user.total_won,
      university: {
        acronym: user.university_acronym,
        fullName: user.university_name,
      },
      universityRank: rankResult.rows[0]?.rank || 0,
      recentHistory: historyResult.rows,
      createdAt: user.created_at,
    });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
