import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";

interface MongooseError extends Error {
  code?: string | number;
}

export async function GET() {
  try {
    console.log("\n=== Testing Database Connection ===");
    console.log("🔄 Initializing connection test...");
    
    await connectDB();
    
    const connectionState = mongoose.connection.readyState;
    const stateMap = {
      0: "Disconnected",
      1: "Connected",
      2: "Connecting",
      3: "Disconnecting",
      99: "Uninitialized"
    };
    
    // Ensure we have a valid connection and database
    if (!mongoose.connection.db) {
      throw new Error('Database connection not established');
    }

    // Get list of collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    
    console.log("\n✅ Connection test completed");
    console.log(`📊 Connection state: ${stateMap[connectionState]}`);
    console.log(`🗄️  Database: ${mongoose.connection.db.databaseName}`);
    console.log(`📚 Collections: ${collectionNames.join(", ")}`);
    
    return NextResponse.json({ 
      status: "Connected successfully to MongoDB!",
      connectionDetails: {
        state: stateMap[connectionState],
        database: mongoose.connection.db.databaseName,
        collections: collectionNames,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
      }
    });
  } catch (error) {
    console.error("\n❌ Database connection error:", error);
    
    // Type guard for Error objects
    const isError = (err: unknown): err is Error => {
      return err instanceof Error;
    };

    // Type guard for Mongoose errors
    const isMongooseError = (err: unknown): err is MongooseError => {
      return isError(err) && ('code' in err || err instanceof mongoose.Error);
    };

    // Get detailed error information
    const errorDetails = {
      message: isError(error) ? error.message : 'Unknown error occurred',
      code: isMongooseError(error) ? error.code : undefined,
      name: isError(error) ? error.name : 'UnknownError',
      stack: process.env.NODE_ENV === 'development' && isError(error) ? error.stack : undefined
    };
    
    return NextResponse.json(
      { 
        error: "Failed to connect to database",
        details: errorDetails,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
