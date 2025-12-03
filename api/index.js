/**
 * Vercel Serverless Function Entry Point
 */

// Import the compiled Express app from the TypeScript build
const { app } = require('../server/dist/server.js');

// Export the Express app as a Vercel serverless function
module.exports = app;