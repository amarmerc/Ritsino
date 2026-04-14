const pool = require('../config/db');

// GET /api/rankings/university/:id
exports.universityRanking = async (req, res) => {
  try {
    const universityId = parseInt(req.params.id);
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);

    const result = await pool.query(
      'SELECT * FROM fn_ranking_university($1, $2)',
      [universityId, limit]
    );

    // Get university info
    const univResult = await pool.query(
      'SELECT acronym, full_name FROM universities WHERE id = $1',
      [universityId]
    );

    res.json({
      university: univResult.rows[0] || null,
      rankings: result.rows,
    });
  } catch (err) {
    console.error('University ranking error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/rankings/my-university
exports.myUniversityRanking = async (req, res) => {
  try {
    const userId = req.userId;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);

    // Get user's university
    const userResult = await pool.query(
      'SELECT university_id FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const universityId = userResult.rows[0].university_id;

    const result = await pool.query(
      'SELECT * FROM fn_ranking_university($1, $2)',
      [universityId, limit]
    );

    const univResult = await pool.query(
      'SELECT acronym, full_name FROM universities WHERE id = $1',
      [universityId]
    );

    // Get user's rank
    const rankResult = await pool.query(
      'SELECT fn_user_university_rank($1) as rank',
      [userId]
    );

    res.json({
      university: univResult.rows[0] || null,
      myRank: rankResult.rows[0]?.rank || 0,
      rankings: result.rows,
    });
  } catch (err) {
    console.error('My university ranking error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/rankings/global
exports.globalRanking = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);

    const result = await pool.query(
      'SELECT * FROM fn_ranking_global($1)',
      [limit]
    );

    res.json({
      rankings: result.rows,
    });
  } catch (err) {
    console.error('Global ranking error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/rankings/universities
exports.universitiesRanking = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM fn_ranking_universities()');

    res.json({
      rankings: result.rows,
    });
  } catch (err) {
    console.error('Universities ranking error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
