import mongoose from 'mongoose'
import { MongoClient } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {}

let clientPromise: Promise<MongoClient>
let client: MongoClient

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

// Export a module-scoped MongoClient promise
export { clientPromise }

// Mongoose connection
export async function connectDB() {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection
    }
    return await mongoose.connect(uri)
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw error
  }
}

export async function disconnectDB() {
  try {
    await mongoose.disconnect()
  } catch (error) {
    console.error('MongoDB disconnection error:', error)
    throw error
  }
}

export const connection = mongoose.connection
