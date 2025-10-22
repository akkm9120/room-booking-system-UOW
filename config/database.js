const knexLib = require('knex');
const path = require('path');
require('dotenv').config();

// Load knex configuration
const knexConfig = require(path.resolve(__dirname, '..', 'knexfile.js'));

// Choose environment config
const env = process.env.NODE_ENV === 'production' ? 'production' : 'development';

// Initialize knex instance using selected environment
const knex = knexLib(knexConfig[env]);

module.exports = { knex };