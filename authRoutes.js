const express = require('express');
const jwt = require('jsonwebtoken');
const { generateAccessToken, generateRefreshToken } = require('./auth');
const db = require('./db'); // ✅ connect to PostgreSQL
const bcrypt = require('bcrypt');
require('dotenv').config();

const router = express.Router();

// ✅ Login Route (DB-based)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(403).json({ message: 'User not found' });
    }

    // ✅ Check password using bcrypt
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(403).json({ message: 'Invalid password' });
    }

    // ✅ Generate tokens
    const accessToken = generateAccessToken(user.user_id);
    const refreshToken = generateRefreshToken(user.user_id);

    // ✅ Send tokens in cookies
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: false, // change to true in production
      sameSite: 'Strict',
      maxAge: 15 * 60 * 1000
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ message: 'Login successful' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Refresh Token Route
router.post('/refresh', (req, res) => {
  const token = req.cookies.refresh_token;
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    const newAccessToken = generateAccessToken(user.userId);
    res.cookie('access_token', newAccessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
      maxAge: 15 * 60 * 1000
    });
    res.json({ message: 'Token refreshed' });
  });
});

// ✅ Logout Route
router.post('/logout', (req, res) => {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  res.json({ message: 'Logged out' });
});

module.exports = router;
