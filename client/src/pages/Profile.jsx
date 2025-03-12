import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaStar, FaCalendarAlt, FaTrash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/api';

const Profile = () => {
  const { user } = useAuth();
  const [movieLogs, setMovieLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchMovieLogs();
  }, []);

  const fetchMovieLogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/user-movies/logs`);
      setMovieLogs(response.data.logs);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching movie logs:', error);
      setError('Failed to load your movie logs');
      setLoading(false);
    }
  };

  const handleDeleteLog = async (logId) => {
    if (!confirm('Are you sure you want to delete this movie log?')) {
      return;
    }
    
    try {
      await axios.delete(`${API_URL}/user-movies/log/${logId}`);
      setMovieLogs(movieLogs.filter(log => log.id !== logId));
      setSuccessMessage('Movie log deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting movie log:', error);
      setError('Failed to delete movie log');
      setTimeout(() => setError(null), 3000);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <div className="loader">Loading your movie logs...</div>;
  }

  // Placeholder image for movies without posters
  const placeholderImage = 'https://via.placeholder.com/300x450?text=No+Poster';

  return (
    <div className="profile">
      <div className="profile-header">
        <h1>Your Movie Log</h1>
        <p>Welcome back, {user?.username}!</p>
      </div>

      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {movieLogs.length === 0 ? (
        <div className="empty-state">
          <p>You haven't logged any movies yet.</p>
          <p>
            <Link to="/" className="btn btn-primary">
              Browse Movies
            </Link>
          </p>
        </div>
      ) : (
        <div className="movie-logs">
          {movieLogs.map((log) => (
            <div key={log.id} className="movie-log-card">
              <Link to={`/movie/${log.movie_id}`} className="movie-poster-link">
                <img
                  src={log.poster_url || placeholderImage}
                  alt={log.title}
                  className="movie-poster"
                />
              </Link>
              
              <div className="movie-log-details">
                <h3 className="movie-title">
                  <Link to={`/movie/${log.movie_id}`}>{log.title}</Link>
                  {log.year && <span className="movie-year"> ({log.year})</span>}
                </h3>
                
                <div className="log-meta">
                  <div className="watched-date">
                    <FaCalendarAlt />
                    <span>Watched on {formatDate(log.watched_date)}</span>
                  </div>
                  
                  {log.rating && (
                    <div className="rating">
                      <FaStar className="star-icon" />
                      <span>{log.rating}/5</span>
                    </div>
                  )}
                </div>
                
                {log.review && (
                  <div className="review">
                    <p>{log.review}</p>
                  </div>
                )}
                
                <div className="log-actions">
                  <Link to={`/movie/${log.movie_id}`} className="btn btn-primary btn-sm">
                    Edit
                  </Link>
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteLog(log.id)}
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile; 