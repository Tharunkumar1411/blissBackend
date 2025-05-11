const { Client } = require('pg');

// Configure your PostgreSQL credentials
const client = new Client({
  host: 'localhost',       // or your DB server IP
  port: 5432,              // default PostgreSQL port
  user: 'myuser',        // using postgres superuser
  password: 'tharun1411',  // your DB password
  database: 'postgres'     // your database name
});

client.connect()
  .then(() => {
    console.log('Connected to PostgreSQL');
    // Grant necessary permissions
    return client.query(`
      GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO myuser;
      GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO myuser;
    `);
  })
  .then(() => console.log('Permissions granted successfully'))
  .catch(err => console.error('Connection error', err.stack));

module.exports = client;
