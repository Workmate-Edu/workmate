const { default: connectDB } = require('./mongodb');

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    await connectDB();
    console.log('Connection test completed.');
  } catch (error) {
    console.error('Connection test failed:', error);
    process.exit(1);
  }
}

testConnection();
