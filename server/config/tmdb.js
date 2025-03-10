const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

module.exports = {
  TMDB_API_KEY,
  TMDB_BASE_URL,
  TMDB_IMAGE_BASE_URL,
  posterPath: (path) => path ? `${TMDB_IMAGE_BASE_URL}/w500${path}` : null,
  backdropPath: (path) => path ? `${TMDB_IMAGE_BASE_URL}/original${path}` : null
}; 