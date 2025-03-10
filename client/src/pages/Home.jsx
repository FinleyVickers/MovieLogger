import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { API_URL } from '../config/api';
import './Home.css';

const DEBOUNCE_DELAY = 300; // milliseconds

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [searching, setSearching] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(
    async (query) => {
      if (!query.trim()) {
        fetchMovies();
        return;
      }

      try {
        setSearching(true);
        setError(null);
        const response = await axios.get(`${API_URL}/movies/search/tmdb/${encodeURIComponent(query.trim())}`);
        setMovies(response.data.movies);
      } catch (error) {
        console.error('Error searching movies:', error);
        setError('Failed to search movies. Please try again.');
      } finally {
        setSearching(false);
      }
    },
    [] // Empty dependency array since we don't use any external values
  );

  // Effect for handling search term changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      debouncedSearch(searchTerm);
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, debouncedSearch]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/movies`);
      setMovies(response.data.movies);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching movies:', error);
      setError('Failed to load movies. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    fetchMovies();
  };

  // Placeholder image for movies without posters
  const placeholderImage = 'https://via.placeholder.com/300x450?text=No+Poster';

  if (loading) {
    return <div className="loader">Loading movies...</div>;
  }

  return (
    <div className="home">
      <div className="hero">
        <h1>Track Your Movie Journey</h1>
        <p>Search for movies to log, rate, and keep track of all the films you've watched.</p>
        
        <div className="search-form">
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Search for movies..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
            {searching && (
              <div className="search-spinner">
                <div className="spinner"></div>
              </div>
            )}
            {searchTerm && !searching && (
              <button 
                onClick={clearSearch} 
                className="clear-search"
                aria-label="Clear search"
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="movie-section">
        <h2>{searchTerm ? 'Search Results' : 'Recent Movies'}</h2>
        {movies.length === 0 ? (
          <p className="no-movies">
            {searchTerm ? 'No movies found. Try a different search term!' : 'No movies found. Try searching for some!'}
          </p>
        ) : (
          <div className="movie-grid">
            {movies.map((movie) => (
              <Link 
                to={`/movie/${movie.id || `tmdb-${movie.tmdb_id}`}`} 
                key={movie.id || movie.tmdb_id} 
                className="movie-card"
              >
                <img
                  src={movie.poster_url || placeholderImage}
                  alt={movie.title}
                  className="movie-poster"
                />
                <div className="movie-info">
                  <h3 className="movie-title">{movie.title}</h3>
                  {movie.year && <p className="movie-year">{movie.year}</p>}
                  {movie.overview && (
                    <p className="movie-overview">{movie.overview.substring(0, 100)}...</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home; 