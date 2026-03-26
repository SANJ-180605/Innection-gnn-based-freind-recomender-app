require('dotenv').config();

console.log('=== Environment Variables Check ===');
console.log('PORT:', process.env.PORT || 'Not set');
console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set');
console.log('MONGODB_URI:', process.env.MONGODB_URI || 'Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✓ Set (hidden)' : '✗ Not set');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'Not set');
console.log('===================================');

if (!process.env.MONGODB_URI) {
    console.log('❌ ERROR: MONGODB_URI not set in .env file');
    console.log('Please add MONGODB_URI to your .env file');
} else {
    console.log('✅ MongoDB URI is configured');
}
