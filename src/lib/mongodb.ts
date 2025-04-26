import { MongoClient } from 'mongodb'
import mongoose from 'mongoose'

// Import all models to ensure they're registered
import "@/models/child"
import "@/models/child-assessment"
import "@/models/initial-assessment"
import "@/models/user"

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 30000
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export { clientPromise }

// Mongoose connection for models
export async function connectDB() {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log('Already connected to MongoDB')
      return
    }

    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw error
  }
}

// Cleanup function for tests
export async function disconnect() {
  try {
    await mongoose.disconnect()
    console.log('✅ MongoDB disconnected')
  } catch (error) {
    console.error('❌ MongoDB disconnection error:', error)
    throw error
  }
}

// Set up mongoose event listeners
mongoose.connection.on('connected', () => {
  console.log('🟢 MongoDB connection established')
})

mongoose.connection.on('error', (err) => {
  console.error('🔴 MongoDB connection error:', err)
})

mongoose.connection.on('disconnected', () => {
  console.log('🟡 MongoDB disconnected')
})

process.on('SIGINT', async () => {
  await mongoose.connection.close()
  process.exit(0)
})
