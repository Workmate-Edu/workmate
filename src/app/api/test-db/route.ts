import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';

interface MongooseError extends Error {
  code?: string | number;
}

export async function GET() {
  try {
    // Connect to the database
    await connectDB();

    // Ensure we have a valid connection and database
    if (!mongoose.connection.db) {
      throw new Error('Database connection not established');
    }

    // Get list of collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);

    return NextResponse.json({
      success: true,
      collections: collectionNames,
      connectionState: mongoose.connection.readyState
    });

  } catch (error) {
    // Type guard for Error objects
    const isError = (err: unknown): err is Error => {
      return err instanceof Error;
    };

    // Type guard for Mongoose errors
    const isMongooseError = (err: unknown): err is MongooseError => {
      return isError(err) && ('code' in err || err instanceof mongoose.Error);
    };

    // Get error details based on type
    const errorDetails = {
      message: isError(error) ? error.message : 'Unknown error occurred',
      code: isMongooseError(error) ? error.code : undefined,
      name: isError(error) ? error.name : 'UnknownError',
      connectionState: mongoose.connection.readyState
    };

    console.error("[TEST_DB_ERROR]", errorDetails);

    return NextResponse.json(
      { 
        success: false,
        error: errorDetails
      },
      { status: 500 }
    );
  }
}
