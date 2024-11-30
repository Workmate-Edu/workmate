import mongoose from 'mongoose';
import { MongoClient, MongoClientOptions } from 'mongodb';

declare global {
  var mongoose: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
  };
  var mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!process.env.MONGODB_URI && !process.env.MONGODB_URI_PRODUCTION) {
  throw new Error(
    'Please define the MONGODB_URI or MONGODB_URI_PRODUCTION environment variable inside .env.local'
  );
}

const MONGODB_URI = (process.env.MONGODB_URI || process.env.MONGODB_URI_PRODUCTION || '').trim();

// Mongoose connection options
const mongooseOptions: mongoose.ConnectOptions = {
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 10000,
};

// MongoDB client options
const mongoClientOptions: MongoClientOptions = {
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 10000,
};

if (process.env.NODE_ENV === 'development') {
  if (!global.mongoose) {
    global.mongoose = { conn: null, promise: null };
  }
}

export async function connectDB(): Promise<mongoose.Connection> {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log('🟢 Using existing MongoDB connection');
      return mongoose.connection;
    }

    if (!global.mongoose.promise) {
      console.log('🟡 Creating new MongoDB connection...');
      global.mongoose.promise = mongoose.connect(MONGODB_URI, mongooseOptions).then(m => m.connection);
    }

    const conn = await global.mongoose.promise;
    console.log('🟢 MongoDB connected successfully');
    return conn;
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    throw error;
  }
}

// For NextAuth.js MongoDB Adapter
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global.mongoClientPromise) {
    client = new MongoClient(MONGODB_URI, mongoClientOptions);
    global.mongoClientPromise = client.connect();
  }
  clientPromise = global.mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(MONGODB_URI, mongoClientOptions);
  clientPromise = client.connect();
}

// Export a function to get the MongoClient promise
export function getMongoClient() {
  return clientPromise;
}

export default connectDB;
