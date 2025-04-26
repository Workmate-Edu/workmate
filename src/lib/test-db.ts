const { connectDB } = require('./mongodb');

async function testConnection() {
  try {
    console.log('Testing MongoDB Atlas connection...');
    console.log('Database:', process.env.MONGODB_DB);
    console.log('Cluster:', process.env.MONGODB_URI?.split('@')[1]?.split('/')[0]);
    
    const mongoose = await connectDB();
    
    if (mongoose.connection.readyState === 1) {
      console.log('✓ Atlas connection test successful');
      console.log('Connected to database:', mongoose.connection.db.databaseName);
      console.log('Connected to cluster:', mongoose.connection.host);
    } else {
      console.log('✕ Atlas connection test failed');
      console.log('Connection state:', mongoose.connection.readyState);
    }
  } catch (error) {
    console.error('✕ Atlas connection test failed:', error);
    process.exit(1);
  }
}

testConnection();
