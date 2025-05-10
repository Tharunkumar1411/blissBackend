# Node.js Server Application

A basic Node.js server application built with Express.js.

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following content:
```
PORT=3000
NODE_ENV=development
```

## Running the Application

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on port 3000 by default. You can change this by modifying the PORT in the .env file.

## API Endpoints

- `GET /`: Welcome message 