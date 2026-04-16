// This file re-exports the Express app as a Vercel serverless function.
// Vercel auto-detects files in the /api directory as serverless functions.
const app = require('../backend/index');

module.exports = app;
