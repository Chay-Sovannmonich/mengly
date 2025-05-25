const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authRoutes = require('./authRoutes');
const { authenticateToken } = require('./auth');

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000', // Change to your frontend domain
  credentials: true
}));

app.use('/auth', authRoutes);

app.get('/', (req, res) => res.send('API is working!'));


app.get('/dashboard', authenticateToken, (req, res) => {
  res.json({ message: `Welcome user ${req.user.userId}` });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
