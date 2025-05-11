const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const router = require('./src/route/index');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Node.js server!' });
});

// Use router
app.use(router);

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log('Server running on port 3000');
});
