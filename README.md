# MovieLogger

MovieLogger is a web application that allows users to track and log movies they've watched, similar to Letterboxd. Users can create an account, add movies to their watchlist, log watched movies with ratings and reviews, and browse their movie history.

## Features

- **User Authentication**: Register and login to save your personal movie data
- **Movie Logging**: Log movies you've watched with dates, ratings, and reviews
- **Watchlist**: Keep track of movies you want to watch
- **User Profile**: View your movie history and ratings
- **Movie Search**: Find movies to add to your log or watchlist

## Tech Stack

### Backend
- Node.js with Express
- SQLite database (using better-sqlite3)
- JWT for authentication

### Frontend
- React with hooks
- React Router for navigation
- Axios for API requests
- CSS for styling

## Getting Started

### Prerequisites

- Node.js (v14 or higher recommended)
- npm or yarn package manager

### Installation

1. Clone the repository
```
git clone <repository-url>
cd MovieLogger
```

2. Install backend dependencies
```
cd server
npm install
```

3. Install frontend dependencies
```
cd ../client
npm install
```

### Configuration

1. Create a `.env` file in the server directory with the following variables:
```
PORT=3001
JWT_SECRET=your_secret_key
NODE_ENV=development
```

2. Create a `.env` file in the client directory with the following variables:
```
VITE_API_URL=http://localhost:3001/api
```

### Running the Application

1. Start the backend server:
```
cd server
npm run dev
```

2. Start the frontend development server:
```
cd ../client
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173` (or the port specified by Vite)

## Database Schema

- **users**: User account information
- **movies**: Movie information including title, year, director, etc.
- **movie_logs**: Records of watched movies, with ratings and reviews
- **watchlist**: Movies users want to watch in the future

## Future Improvements

- Integration with external movie API (TMDB, OMDB) for more comprehensive movie data
- Social features to follow other users and see their movie logs
- Statistics and visualizations for viewing habits
- Mobile application

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by Letterboxd and other movie tracking platforms
- Built using modern web technologies and best practices

## Database Setup

The application uses SQLite for data storage. To set up your local database:

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies if you haven't already:
   ```bash
   npm install
   ```

3. Initialize the database:
   ```bash
   node data/init-db.js
   ```

This will create a new `movielogger.db` file with the correct schema. The database file is gitignored to protect user data.

Note: If you need to reinitialize the database, you'll need to manually delete the existing `movielogger.db` file first. 