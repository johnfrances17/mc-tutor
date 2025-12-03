/**
 * Vercel Serverless Function Entry Point
 */

// Import the compiled Express app (default export from TypeScript)
const app = require('../server/dist/server.js').default;

// Export for Vercel serverless
module.exports = app;