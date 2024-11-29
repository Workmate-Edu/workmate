import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
  var mongoClientPromise: Promise<MongoClient> | undefined;
}

// Explicitly log the environment variables for debugging
console.log('Environment Variables:', {
  MONGODB_URI: process.env.MONGODB_URI ? 'Present' : 'Missing',
  MONGODB_URI_PRODUCTION: process.env.MONGODB_URI_PRODUCTION ? 'Present' : 'Missing'
});

const MONGODB_URI = (process.env.MONGODB_URI || process.env.MONGODB_URI_PRODUCTION || '').trim();

if (!MONGODB_URI) {
  console.error('❌ CRITICAL: No MongoDB URI found in environment variables');
  throw new Error(
    'Please define the MONGODB_URI or MONGODB_URI_PRODUCTION environment variable inside .env.local'
  );
}

// MongoDB Client Options
const options = {
  connectTimeoutMS: 10000, // 10 seconds
  socketTimeoutMS: 45000,  // 45 seconds
  serverSelectionTimeoutMS: 10000, // 10 seconds
  maxPoolSize: 10,
  minPoolSize: 5,
  retryWrites: true,
  w: 'majority',
  ssl: true,
  tls: true,
};

// Cached values for Mongoose connection
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// MongoDB Client for NextAuth Adapter
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  if (!global.mongoClientPromise) {
    client = new MongoClient(MONGODB_URI, options);
    global.mongoClientPromise = client.connect()
      .catch((err) => {
        console.error('MongoDB Client Connection Error:', err);
        throw err;
      });
  }
  clientPromise = global.mongoClientPromise;
} else {
  client = new MongoClient(MONGODB_URI, options);
  clientPromise = client.connect()
    .catch((err) => {
      console.error('MongoDB Client Connection Error:', err);
      throw err;
    });
}

// Export for NextAuth
export default clientPromise;

// Export for Mongoose
export async function connectDB() {
  if (cached.conn) {
    console.log('✅ Using cached MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      ...options,
      bufferCommands: false,
    };

    // Ensure mongoose is in a clean state
    if (mongoose.connection && mongoose.connection.readyState !== 0) {
      try {
        await mongoose.disconnect();
      } catch (disconnectError) {
        console.warn('⚠️ Error during previous connection disconnect:', disconnectError);
      }
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('✅ MongoDB connected successfully');
        return mongoose;
      })
      .catch((err) => {
        console.error('MongoDB Mongoose Connection Error:', err);
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
