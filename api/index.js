/**
 * Vercel Serverless Function Entry Point
 */

// Import the Express app (Vercel compiles TypeScript automatically)
const app = require('../server/src/server.ts');

// Export the Express app
module.exports = app.default || app.app || app;