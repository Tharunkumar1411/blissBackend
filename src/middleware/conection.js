const { Client } = require('pg');

// Configure your PostgreSQL credentials
const client = new Client({
  host: 'localhost',       // or your DB server IP
  port: 5432,              // default PostgreSQL port
  user: 'myuser',        // your DB username
  password: 'tharun1411',  // your DB password
  database: 'postgres'   // your database name
});

client.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('Connection error', err.stack));

module.exports = client;
