require('dotenv').config();

// Database connection configuration
// Use public URL for external connections, fallback to individual params
const connection = process.env.MYSQL_PUBLIC_URL || process.env.MYSQL_URL || {
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'room_booking_system',
  charset: 'utf8mb4',
  ssl: {
    rejectUnauthorized: false
  }
};

module.exports = {
  development: {
    client: 'mysql2',
    connection: connection,
    migrations: {
      directory: './database/migrations'
    },
    seeds: {
      directory: './database/seeds'
    },
    pool: {
      min: 2,
      max: 10
    }
  },
  
  production: {
    client: 'mysql2',
    connection: connection,
    migrations: {
      directory: './database/migrations'
    },
    seeds: {
      directory: './database/seeds'
    },
    pool: {
      min: 2,
      max: 10
    }
  }
};