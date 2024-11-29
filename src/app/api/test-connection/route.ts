import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";

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
    
    // Get detailed error information
    const errorDetails = {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
