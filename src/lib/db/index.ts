import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema/event'

// Check if the DATABASE_URL environment variable is set
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

// Create the PostgreSQL connection
const client = postgres(process.env.DATABASE_URL)

// Create the database instance
export const db = drizzle(client, { schema })

// Export the schema for use in other files
export { schema }
