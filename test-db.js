// test-db.js
const db = require('./db');

db.query('SELECT NOW()')
  .then(res => {
    console.log('✅ PostgreSQL connected at:', res.rows[0].now);
    process.exit();
  })
  .catch(err => {
    console.error('❌ Error connecting to PostgreSQL:', err.message);
    process.exit(1);
  });
