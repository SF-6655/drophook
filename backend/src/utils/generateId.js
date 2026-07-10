const crypto = require('crypto');

// Generates a short, URL-safe unique session ID
// crypto.randomBytes(8) = 8 bytes = 64 bits of entropy
// Encoded as hex = 16 characters
// Example output: "a3f9b2c1d4e5f607"
// 2^64 combinations — essentially impossible to guess
const generateId = () => crypto.randomBytes(8).toString('hex');

module.exports = { generateId };