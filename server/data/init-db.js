const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Database file path
const DB_PATH = path.join(__dirname, 'movielogger.db');
const SCHEMA_PATH = path.join(__dirname, 'init.sql');

// Create a new database connection
function initializeDatabase() {
  // Check if database file already exists
  const dbExists = fs.existsSync(DB_PATH);
  
  if (dbExists) {
    console.log('Database file already exists. Please remove it first if you want to reinitialize.');
    process.exit(1);
  }

  // Read the schema file
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');

  // Create and initialize the database
  const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Error creating database:', err);
      process.exit(1);
    }
    console.log('Created new database file.');

    // Execute the schema
    db.exec(schema, (err) => {
      if (err) {
        console.error('Error initializing database schema:', err);
        process.exit(1);
      }
      console.log('Database schema initialized successfully.');
      
      // Close the database connection
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
          process.exit(1);
        }
        console.log('Database initialization complete.');
      });
    });
  });
}

// Run the initialization
initializeDatabase(); 