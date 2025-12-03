/**
 * Vercel Serverless Function Entry Point
 */

// Import the compiled Express app
const { app } = require('../server/dist/server.js');

// Export for Vercel serverless
module.exports = app;