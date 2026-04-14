const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config({ path: process.env.NODE_ENV === 'production' ? '/app/.env' : '../.env' });

const authRoutes = require('./src/routes/auth');
const gameRoutes = require('./src/routes/game');
const rankingsRoutes = require('./src/routes/rankings');
const userRoutes = require('./src/routes/user');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/rankings', rankingsRoutes);
app.use('/api/user', userRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎰 Ritsino server running on port ${PORT}`);
});
