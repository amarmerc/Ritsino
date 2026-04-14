const pool = require('../config/db');
const { spin } = require('../utils/slotEngine');

const VALID_BETS = [50, 100, 250, 500];

// POST /api/game/spin
exports.doSpin = async (req, res) => {
  try {
    const { betAmount } = req.body;
    const userId = req.userId;

    // Validate bet amount
    if (!VALID_BETS.includes(betAmount)) {
      return res.status(400).json({ 
        error: `Invalid bet. Must be one of: ${VALID_BETS.join(', ')}` 
      });
    }

    // Check user has enough points
    const userResult = await pool.query('SELECT points FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (userResult.rows[0].points < betAmount) {
      return res.status(400).json({ error: 'Insufficient points' });
    }

    // Generate spin result (server-side)
    const spinResult = spin(betAmount);

    // Process spin in database atomically
    const dbResult = await pool.query(
      'SELECT * FROM fn_process_spin($1, $2, $3, $4)',
      [userId, betAmount, JSON.stringify(spinResult), spinResult.totalWin]
    );

    const { new_points, rescued } = dbResult.rows[0];

    res.json({
      ...spinResult,
      newPoints: new_points,
      rescued,
      rescueMessage: rescued ? '¡Te has quedado sin puntos! Aquí tienes 1.000 para seguir jugando 🎰' : null,
    });
  } catch (err) {
    console.error('Spin error:', err);
    if (err.message && err.message.includes('Insufficient points')) {
      return res.status(400).json({ error: 'Insufficient points' });
    }
    res.status(500).json({ error: 'Server error during spin' });
  }
};

// GET /api/game/config
exports.getConfig = (req, res) => {
  res.json({
    validBets: VALID_BETS,
    gridCols: 6,
    gridRows: 5,
  });
};
