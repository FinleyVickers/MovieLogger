import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaStar, FaRegStar, FaPlus, FaCheck, FaCalendarAlt, FaClock } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/api';
import './MovieDetail.css';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [review, setReview] = useState('');
  const [watchDate, setWatchDate] = useState('');
  const [inWatchlist, setInWatchlist] = useState(false);
  const [hasWatched, setHasWatched] = useState(false);
  const [userLog, setUserLog] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch movie details
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_URL}/movies/${id}`);
        setMovie(response.data.movie);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching movie:', error);
        setError('Failed to load movie details.');
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  // Fetch user specific data if authenticated
  useEffect(() => {
    if (isAuthenticated && movie) {
      fetchUserMovieData();
    }
  }, [isAuthenticated, movie]);

  const fetchUserMovieData = async () => {
    try {
      // Check if movie is in user's watchlist
      const watchlistResponse = await axios.get(`${API_URL}/user-movies/watchlist`);
      const movieId = movie.id || movie.tmdb_id;
      const isInWatchlist = watchlistResponse.data.watchlist.some(
        item => (item.movie_id === movieId) || (item.tmdb_id === movie.tmdb_id)
      );
      setInWatchlist(isInWatchlist);

      // Check if user has watched this movie
      const logsResponse = await axios.get(`${API_URL}/user-movies/logs`);
      const movieLog = logsResponse.data.logs.find(
        log => (log.movie_id === movieId) || (log.tmdb_id === movie.tmdb_id)
      );
      
      if (movieLog) {
        setHasWatched(true);
        setUserLog(movieLog);
        setUserRating(movieLog.rating || 0);
        setReview(movieLog.review || '');
        setWatchDate(new Date(movieLog.watched_date).toISOString().split('T')[0]);
      }
    } catch (error) {
      console.error('Error fetching user movie data:', error);
    }
  };

  const handleAddToWatchlist = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setSubmitting(true);
      
      if (inWatchlist) {
        // Remove from watchlist
        const watchlistResponse = await axios.get(`${API_URL}/user-movies/watchlist`);
        const watchlistItem = watchlistResponse.data.watchlist.find(
          item => (item.movie_id === movie.id) || (item.tmdb_id === movie.tmdb_id)
        );
        
        if (watchlistItem) {
          await axios.delete(`${API_URL}/user-movies/watchlist/${watchlistItem.id}`);
          setInWatchlist(false);
          setSuccessMessage('Removed from your watchlist');
        }
      } else {
        // Add to watchlist
        await axios.post(`${API_URL}/user-movies/watchlist`, {
          movie_id: movie.id,
          tmdb_id: movie.tmdb_id,
          title: movie.title,
          year: movie.year,
          poster_url: movie.poster_url
        });
        setInWatchlist(true);
        setSuccessMessage('Added to your watchlist');
      }
    } catch (error) {
      console.error('Error updating watchlist:', error);
      setError('Failed to update watchlist');
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleLogMovie = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      const movieData = {
        movie_id: movie.id,
        tmdb_id: movie.tmdb_id,
        title: movie.title,
        year: movie.year,
        director: movie.director,
        poster_url: movie.poster_url,
        backdrop_url: movie.backdrop_url,
        watched_date: watchDate,
        rating: userRating || null,
        review: review || null
      };

      await axios.post(`${API_URL}/user-movies/log`, movieData);

      setHasWatched(true);
      fetchUserMovieData();
      setSuccessMessage('Movie logged successfully');
    } catch (error) {
      console.error('Error logging movie:', error);
      setError('Failed to log movie');
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const renderStars = (count) => {
    return Array(10).fill(0).map((_, i) => (
      <button 
        key={i} 
        type="button"
        onClick={() => setUserRating(i + 1)}
        className="star-btn"
      >
        {i < count ? <FaStar className="star filled" /> : <FaRegStar className="star" />}
      </button>
    ));
  };

  const formatRuntime = (minutes) => {
    if (!minutes) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return <div className="loader">Loading movie details...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!movie) {
    return <div className="alert alert-danger">Movie not found</div>;
  }

  // Placeholder image for movies without posters
  const placeholderImage = 'https://via.placeholder.com/300x450?text=No+Poster';

  return (
    <div className="movie-detail">
      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}
      
      <div className="movie-header">
        <div className="movie-poster-container">
          <img 
            src={movie.poster_url || placeholderImage} 
            alt={movie.title} 
            className="movie-detail-poster"
          />
        </div>
        
        <div className="movie-info-container">
          <h1 className="movie-title">{movie.title}</h1>
          
          <div className="movie-meta">
            {movie.year && (
              <span className="movie-year">{movie.year}</span>
            )}
            {movie.runtime && (
              <span className="movie-runtime">
                <FaClock /> {formatRuntime(movie.runtime)}
              </span>
            )}
          </div>

          {movie.genres && (
            <div className="movie-genres">{movie.genres}</div>
          )}
          
          {movie.director && (
            <div className="movie-director">
              <strong>Director:</strong> {movie.director}
            </div>
          )}

          {movie.overview && (
            <div className="movie-overview">{movie.overview}</div>
          )}
          
          <div className="movie-actions">
            <button 
              className={`btn ${inWatchlist ? 'btn-success' : 'btn-primary'}`}
              onClick={handleAddToWatchlist}
              disabled={submitting}
            >
              {inWatchlist ? (
                <>
                  <FaCheck /> In Watchlist
                </>
              ) : (
                <>
                  <FaPlus /> Add to Watchlist
                </>
              )}
            </button>
          </div>

          {isAuthenticated && (
            <div className="movie-log-section">
              <h2>{hasWatched ? 'Update Your Log' : 'Log This Movie'}</h2>
              <form onSubmit={handleLogMovie}>
                <div className="form-group">
                  <label>
                    <FaCalendarAlt /> Watch Date:
                  </label>
                  <div className="date-input-container">
                    <input
                      type="date"
                      value={watchDate}
                      onChange={(e) => setWatchDate(e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Rating:</label>
                  <div className="rating-stars">
                    {renderStars(userRating)}
                    {userRating > 0 && (
                      <span className="rating-number">{userRating}/10</span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Review:</label>
                  <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    className="form-input"
                    rows="4"
                    placeholder="Write your thoughts about the movie..."
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting || !watchDate}
                >
                  {hasWatched ? 'Update Log' : 'Log Movie'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetail; 