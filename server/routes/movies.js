const express = require('express');
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');
const axios = require('axios');
const { TMDB_API_KEY, TMDB_BASE_URL, posterPath, backdropPath } = require('../config/tmdb');

const router = express.Router();

// Get all movies
router.get('/', (req, res) => {
  try {
    const movies = db.prepare('SELECT * FROM movies ORDER BY title').all();
    res.json({ movies });
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ message: 'Server error fetching movies' });
  }
});

// Search movies from TMDB
router.get('/search/tmdb/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        query,
        language: 'en-US',
        page: 1,
        include_adult: false
      }
    });

    const movies = response.data.results.map(movie => ({
      tmdb_id: movie.id,
      title: movie.title,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      poster_url: posterPath(movie.poster_path),
      backdrop_url: backdropPath(movie.backdrop_path),
      overview: movie.overview
    }));

    res.json({ movies });
  } catch (error) {
    console.error('Error searching TMDB:', error);
    res.status(500).json({ message: 'Server error searching movies' });
  }
});

// Get TMDB movie details
const fetchTMDBMovieDetails = async (tmdbId) => {
  const response = await axios.get(`${TMDB_BASE_URL}/movie/${tmdbId}`, {
    params: {
      api_key: TMDB_API_KEY,
      language: 'en-US',
      append_to_response: 'credits'
    }
  });

  const movie = response.data;
  return {
    tmdb_id: movie.id,
    title: movie.title,
    year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
    director: movie.credits?.crew?.find(person => person.job === 'Director')?.name || null,
    poster_url: posterPath(movie.poster_path),
    backdrop_url: backdropPath(movie.backdrop_path),
    overview: movie.overview,
    release_date: movie.release_date,
    runtime: movie.runtime,
    genres: movie.genres?.map(genre => genre.name).join(', ')
  };
};

// Get a single movie by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if this is a TMDB movie ID
    if (id.startsWith('tmdb-')) {
      const tmdbId = id.replace('tmdb-', '');
      try {
        const movie = await fetchTMDBMovieDetails(tmdbId);
        return res.json({ movie });
      } catch (error) {
        console.error('Error fetching TMDB movie:', error);
        return res.status(404).json({ message: 'Movie not found' });
      }
    }
    
    // If not a TMDB ID, look for local movie
    const movie = db.prepare('SELECT * FROM movies WHERE id = ?').get(id);
    
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    
    res.json({ movie });
  } catch (error) {
    console.error('Error fetching movie:', error);
    res.status(500).json({ message: 'Server error fetching movie' });
  }
});

// Search local movies
router.get('/search/:query', (req, res) => {
  try {
    const { query } = req.params;
    const movies = db.prepare('SELECT * FROM movies WHERE title LIKE ? ORDER BY title').all(`%${query}%`);
    res.json({ movies });
  } catch (error) {
    console.error('Error searching movies:', error);
    res.status(500).json({ message: 'Server error searching movies' });
  }
});

// Add a new movie (admin only in a real app)
router.post('/', authenticateToken, (req, res) => {
  try {
    const { title, year, director, poster_url, backdrop_url, tmdb_id } = req.body;
    
    // Validate input
    if (!title) {
      return res.status(400).json({ message: 'Movie title is required' });
    }
    
    // Check if movie already exists
    if (tmdb_id) {
      const existingMovie = db.prepare('SELECT * FROM movies WHERE tmdb_id = ?').get(tmdb_id);
      if (existingMovie) {
        return res.json({ 
          message: 'Movie already exists', 
          movie: existingMovie 
        });
      }
    }
    
    // Insert new movie
    const result = db.prepare(
      'INSERT INTO movies (title, year, director, poster_url, backdrop_url, tmdb_id) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(title, year || null, director || null, poster_url || null, backdrop_url || null, tmdb_id || null);
    
    const newMovie = db.prepare('SELECT * FROM movies WHERE id = ?').get(result.lastInsertRowid);
    
    res.status(201).json({
      message: 'Movie added successfully',
      movie: newMovie
    });
  } catch (error) {
    console.error('Error adding movie:', error);
    res.status(500).json({ message: 'Server error adding movie' });
  }
});

module.exports = router; 