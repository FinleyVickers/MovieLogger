const express = require('express');
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get user's logged movies
router.get('/logs', (req, res) => {
  try {
    const logs = db.prepare(`
      SELECT ml.*, m.title, m.year, m.poster_url, m.tmdb_id 
      FROM movie_logs ml
      LEFT JOIN movies m ON ml.movie_id = m.id
      WHERE ml.user_id = ?
      ORDER BY ml.watched_date DESC
    `).all(req.user.userId);
    
    res.json({ logs });
  } catch (error) {
    console.error('Error fetching movie logs:', error);
    res.status(500).json({ message: 'Server error fetching movie logs' });
  }
});

// Log a movie as watched
router.post('/log', (req, res) => {
  try {
    const { 
      movie_id, tmdb_id, title, year, director, 
      poster_url, backdrop_url, watched_date, 
      rating, review 
    } = req.body;
    
    // Validate input
    if ((!movie_id && !tmdb_id) || !watched_date || !title) {
      return res.status(400).json({ message: 'Movie details and watched date are required' });
    }

    let movieId = movie_id;

    // If this is a TMDB movie, first add it to movies table if it doesn't exist
    if (tmdb_id) {
      const existingMovie = db.prepare('SELECT id FROM movies WHERE tmdb_id = ?').get(tmdb_id);
      if (existingMovie) {
        movieId = existingMovie.id;
      } else {
        const result = db.prepare(`
          INSERT INTO movies (title, year, director, poster_url, backdrop_url, tmdb_id)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(title, year || null, director || null, poster_url || null, backdrop_url || null, tmdb_id);
        movieId = result.lastInsertRowid;
      }
    }
    
    // Check if movie is already logged by user
    const existingLog = db.prepare(
      'SELECT * FROM movie_logs WHERE user_id = ? AND movie_id = ?'
    ).get(req.user.userId, movieId);
    
    if (existingLog) {
      // Update existing log
      db.prepare(`
        UPDATE movie_logs 
        SET watched_date = ?, rating = ?, review = ? 
        WHERE id = ?
      `).run(watched_date, rating || null, review || null, existingLog.id);
      
      return res.json({
        message: 'Movie log updated successfully',
        log_id: existingLog.id
      });
    } else {
      // Insert new log
      const result = db.prepare(`
        INSERT INTO movie_logs (user_id, movie_id, watched_date, rating, review)
        VALUES (?, ?, ?, ?, ?)
      `).run(req.user.userId, movieId, watched_date, rating || null, review || null);
      
      return res.status(201).json({
        message: 'Movie logged successfully',
        log_id: result.lastInsertRowid
      });
    }
  } catch (error) {
    console.error('Error logging movie:', error);
    res.status(500).json({ message: 'Server error logging movie' });
  }
});

// Delete a movie log
router.delete('/log/:id', (req, res) => {
  try {
    const log = db.prepare('SELECT * FROM movie_logs WHERE id = ? AND user_id = ?').get(req.params.id, req.user.userId);
    
    if (!log) {
      return res.status(404).json({ message: 'Movie log not found' });
    }
    
    db.prepare('DELETE FROM movie_logs WHERE id = ?').run(req.params.id);
    
    res.json({ message: 'Movie log deleted successfully' });
  } catch (error) {
    console.error('Error deleting movie log:', error);
    res.status(500).json({ message: 'Server error deleting movie log' });
  }
});

// Get user's watchlist
router.get('/watchlist', (req, res) => {
  try {
    const watchlist = db.prepare(`
      SELECT w.*, m.title, m.year, m.poster_url, m.tmdb_id 
      FROM watchlist w
      LEFT JOIN movies m ON w.movie_id = m.id
      WHERE w.user_id = ?
      ORDER BY w.added_date DESC
    `).all(req.user.userId);
    
    res.json({ watchlist });
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    res.status(500).json({ message: 'Server error fetching watchlist' });
  }
});

// Add movie to watchlist
router.post('/watchlist', (req, res) => {
  try {
    const { movie_id, tmdb_id, title, year, poster_url, backdrop_url } = req.body;
    
    // Validate input
    if ((!movie_id && !tmdb_id) || !title) {
      return res.status(400).json({ message: 'Movie details are required' });
    }

    let movieId = movie_id;

    // If this is a TMDB movie, first add it to movies table if it doesn't exist
    if (tmdb_id) {
      const existingMovie = db.prepare('SELECT id FROM movies WHERE tmdb_id = ?').get(tmdb_id);
      if (existingMovie) {
        movieId = existingMovie.id;
      } else {
        const result = db.prepare(`
          INSERT INTO movies (title, year, poster_url, backdrop_url, tmdb_id)
          VALUES (?, ?, ?, ?, ?)
        `).run(title, year || null, poster_url || null, backdrop_url || null, tmdb_id);
        movieId = result.lastInsertRowid;
      }
    }
    
    // Check if movie is already in watchlist
    const existingEntry = db.prepare(
      'SELECT * FROM watchlist WHERE user_id = ? AND movie_id = ?'
    ).get(req.user.userId, movieId);

    if (existingEntry) {
      return res.json({
        message: 'Movie is already in watchlist',
        watchlist_id: existingEntry.id
      });
    }
    
    // Add to watchlist
    const result = db.prepare(
      'INSERT INTO watchlist (user_id, movie_id) VALUES (?, ?)'
    ).run(req.user.userId, movieId);
    
    res.status(201).json({
      message: 'Movie added to watchlist',
      watchlist_id: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    res.status(500).json({ message: 'Server error adding to watchlist' });
  }
});

// Remove movie from watchlist
router.delete('/watchlist/:id', (req, res) => {
  try {
    const watchlistItem = db.prepare(
      'SELECT * FROM watchlist WHERE id = ? AND user_id = ?'
    ).get(req.params.id, req.user.userId);
    
    if (!watchlistItem) {
      return res.status(404).json({ message: 'Watchlist item not found' });
    }
    
    db.prepare('DELETE FROM watchlist WHERE id = ?').run(req.params.id);
    
    res.json({ message: 'Movie removed from watchlist' });
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    res.status(500).json({ message: 'Server error removing from watchlist' });
  }
});

module.exports = router; 