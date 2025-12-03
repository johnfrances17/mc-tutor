/**
 * Generate Encryption Key Script
 * Creates a secure 256-bit encryption key for AES-256-GCM
 */

const crypto = require('crypto');

console.log('\n🔐 MC Tutor - Encryption Key Generator\n');
console.log('Generating secure 256-bit encryption key...\n');

// Generate 32 random bytes (256 bits)
const encryptionKey = crypto.randomBytes(32).toString('base64');

console.log('✅ Encryption Key Generated!\n');
console.log('Copy this key to your .env file:\n');
console.log('ENCRYPTION_KEY=' + encryptionKey);
console.log('\n⚠️  IMPORTANT:');
console.log('- Keep this key secret');
console.log('- Never commit it to Git');
console.log('- Store it securely');
console.log('- Use different keys for dev and production\n');

// Also generate a JWT secret
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('📝 Bonus: JWT Secret Generated!\n');
console.log('JWT_SECRET=' + jwtSecret);
console.log('\n');
