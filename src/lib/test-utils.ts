import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

let mongod: MongoMemoryServer

export const connectTestDB = async () => {
  mongod = await MongoMemoryServer.create()
  const uri = mongod.getUri()
  await mongoose.connect(uri)
}

export const disconnectTestDB = async () => {
  await mongoose.disconnect()
  await mongod.stop()
}

export const clearTestDB = async () => {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
}
