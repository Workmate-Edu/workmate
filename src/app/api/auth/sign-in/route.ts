import { NextResponse } from "next/server";
import User from "@/models/user.model";
import connectDB from "@/lib/mongodb";
import { compare } from "bcryptjs";
import { SignJWT } from "jose";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, password } = await req.json();
    console.log('Login attempt with:', { email, password: '***' });

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find user by email or username
    const user = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: email.toLowerCase() }
      ]
    }).select('+password');

    console.log('Found user:', user ? {
      id: user._id,
      email: user.email,
      username: user.username,
      hasPassword: !!user.password
    } : null);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email/username or password" },
        { status: 401 }
      );
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return NextResponse.json(
        { error: "Please verify your email before signing in" },
        { status: 401 }
      );
    }

    // Verify password
    if (!user.password) {
      console.log('User has no password set');
      return NextResponse.json(
        { error: "Invalid email/username or password" },
        { status: 401 }
      );
    }

    const isValidPassword = await compare(password, user.password);
    console.log('Password validation result:', isValidPassword);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email/username or password" },
        { status: 401 }
      );
    }

    // Create JWT token using jose
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);

    // Return user data and token
    const userData = {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        username: user.username,
      },
      token
    };
    console.log('Returning user data:', userData);

    // Create response with user data
    const response = NextResponse.json(userData);

    // Set auth token cookie in response
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    });

    return response;
  } catch (error) {
    console.error("[SIGN_IN_ERROR]", error);
    return NextResponse.json(
      { error: "An error occurred during sign in" },
      { status: 500 }
    );
  }
}
