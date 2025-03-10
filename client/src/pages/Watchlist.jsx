import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaTrash, FaCheck } from 'react-icons/fa';
import { API_URL } from '../config/api';
import './Watchlist.css';

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/user-movies/watchlist`);
      setWatchlist(response.data.watchlist);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      setError('Failed to load your watchlist');
      setLoading(false);
    }
  };

  const handleRemoveFromWatchlist = async (watchlistId) => {
    if (!confirm('Are you sure you want to remove this movie from your watchlist?')) {
      return;
    }
    
    try {
      await axios.delete(`${API_URL}/user-movies/watchlist/${watchlistId}`);
      setWatchlist(watchlist.filter(item => item.id !== watchlistId));
      setSuccessMessage('Movie removed from watchlist');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      setError('Failed to remove movie from watchlist');
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading) {
    return <div className="loader">Loading your watchlist...</div>;
  }

  // Placeholder image for movies without posters
  const placeholderImage = 'https://via.placeholder.com/300x450?text=No+Poster';

  return (
    <div className="watchlist-page">
      <div className="watchlist-header">
        <h1>Your Watchlist</h1>
        <p>Movies you want to watch</p>
      </div>

      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {watchlist.length === 0 ? (
        <div className="empty-state">
          <p>Your watchlist is empty.</p>
          <p>
            <Link to="/" className="btn btn-primary">
              Browse Movies
            </Link>
          </p>
        </div>
      ) : (
        <div className="movie-grid">
          {watchlist.map((item) => (
            <div key={item.id} className="watchlist-card">
              <Link to={`/movie/${item.movie_id}`} className="movie-poster-container">
                <img
                  src={item.poster_url || placeholderImage}
                  alt={item.title}
                  className="movie-poster"
                />
                <div className="watchlist-overlay">
                  <div className="watchlist-actions">
                    <Link to={`/movie/${item.movie_id}`} className="btn btn-primary btn-sm">
                      <FaCheck /> Mark as Watched
                    </Link>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRemoveFromWatchlist(item.id)}
                    >
                      <FaTrash /> Remove
                    </button>
                  </div>
                </div>
              </Link>
              <div className="movie-info">
                <h3 className="movie-title">
                  <Link to={`/movie/${item.movie_id}`}>{item.title}</Link>
                </h3>
                {item.year && <div className="movie-year">{item.year}</div>}
                <div className="added-date">
                  Added: {new Date(item.added_date).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist; 