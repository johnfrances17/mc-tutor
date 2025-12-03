/**
 * Vercel Serverless Function Entry Point
 * This file acts as a bridge between Vercel's serverless infrastructure
 * and our Express application
 */

// Import the compiled server
const app = require('../server/dist/server.js').default;

// Export for Vercel serverless
module.exports = app;
