require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./database');
const authRoutes = require('./routes/auth');
const moviesRoutes = require('./routes/movies');
const userMoviesRoutes = require('./routes/userMovies');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', moviesRoutes);
app.use('/api/user-movies', userMoviesRoutes);

// Simple test route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to MovieLogger API' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 