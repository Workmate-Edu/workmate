const crypto = require('crypto');

// Generate a 32-byte (256-bit) random key and convert to base64
const key = crypto.randomBytes(32).toString('base64');

console.log('Your MESSAGE_ENCRYPTION_KEY:');
console.log(key);
