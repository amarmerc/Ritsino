const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'ritsino',
  password: process.env.POSTGRES_PASSWORD || 'ritsino_secret',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'ritsino',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL error:', err);
});

// Test connection
pool.query('SELECT NOW()')
  .then(() => console.log('✅ PostgreSQL connected'))
  .catch(err => console.error('❌ PostgreSQL connection error:', err.message));

module.exports = pool;
