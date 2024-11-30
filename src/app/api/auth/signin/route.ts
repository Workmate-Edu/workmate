import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/user.model';

export async function POST(request: NextRequest) {
  // Log the entire request for debugging
  console.log('[SIGNIN_API_DEBUG] Request Details:', {
    method: request.method,
    url: request.url,
    headers: Object.fromEntries(request.headers.entries()),
  });

  try {
    // Ensure database connection
    await connectDB();

    // Parse request body
    const contentType = request.headers.get('content-type');
    console.log('[SIGNIN_API_DEBUG] Content-Type:', contentType);

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('[SIGNIN_API_ERROR] Request body parsing error:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body' }, 
        { status: 400 }
      );
    }

    // Log parsed body (excluding password)
    console.log('[SIGNIN_API_DEBUG] Parsed Body:', {
      email: body.email,
      passwordProvided: !!body.password
    });

    // Validate input
    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: 'Email and password are required' }, 
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ 
      email: body.email.toLowerCase() 
    }).select('+password');

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'Invalid email or password' }, 
        { status: 401 }
      );
    }

    // Check email verification
    if (!user.emailVerified) {
      return NextResponse.json(
        { error: 'Please verify your email before signing in' }, 
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(body.password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' }, 
        { status: 401 }
      );
    }

    // Prepare user response (exclude sensitive info)
    const { password: _, ...userResponse } = user.toObject();

    return NextResponse.json({
      message: 'Sign in successful',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    }, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error: any) {
    console.error('[SIGNIN_API_ERROR] Unexpected Error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    return NextResponse.json(
      { 
        error: 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}
