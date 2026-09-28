// ============================================
// DATABASE CONNECTION
// ============================================

const { Pool } = require("pg");

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "barber_booking",
    password: "bigmash",
    port: 5433
});

module.exports = pool;






/*const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

module.exports = pool;



const { Pool } = require('pg');// Import the Pool class from the pg module to manage PostgreSQL connections
require('dotenv').config();// Load environment variables from .env file

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});// Create a new instance of the Pool class with configuration options from environment variables

module.exports = pool;// Export the pool instance for use in other parts of the application*/