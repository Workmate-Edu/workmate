import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env.local') });

// Enable mongoose debug mode
mongoose.set('debug', true);

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    
    const MONGODB_URI = process.env.NODE_ENV === 'production'
      ? process.env.MONGODB_URI_PRODUCTION
      : process.env.MONGODB_URI;

    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }

    console.log('\n=== MongoDB Connection Info ===');
    console.log('🔄 Connecting to MongoDB...');
    console.log(`📚 Database URI: ${MONGODB_URI.split('@')[1]}`);
    console.log(`🌐 Your IP Address: 102.91.4.22`);

    // More detailed error handling
    mongoose.connection.on('error', (error) => {
      console.error('\n❌ Mongoose connection error:', error);
    });

    mongoose.connection.on('connecting', () => {
      console.log('🔄 Mongoose connecting...');
    });

    mongoose.connection.on('connected', () => {
      console.log('✅ Mongoose connected!');
    });

    mongoose.connection.on('disconnected', () => {
      console.log('❌ Mongoose disconnected!');
    });

    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000, // Increased timeout
      socketTimeoutMS: 45000,
      family: 4,
      retryWrites: true,
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Wait to see the connection status
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (mongoose.connection.readyState === 1) {
      console.log('\n=== MongoDB Connection Status ===');
      console.log('✨ MongoDB connected successfully');
      console.log(`🏃 Status: Connected`);
      console.log(`🗄️  Database: ${mongoose.connection.db.databaseName}`);
      console.log('===========================\n');
    } else {
      console.log(`\n❌ Connection failed. State: ${mongoose.connection.readyState}`);
    }

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ MongoDB connection error:', error);
    if (error.name === 'MongoServerSelectionError') {
      console.log('\n🔍 Troubleshooting tips:');
      console.log('1. Check if MongoDB Atlas cluster is active');
      console.log('2. Verify username and password in connection string');
      console.log('3. Check if cluster name and database name are correct');
      console.log('4. Your IP (102.91.4.22) should be whitelisted');
      console.log('5. Check if your network allows MongoDB connections (port 27017)');
    }
    process.exit(1);
  }
}

testConnection();
