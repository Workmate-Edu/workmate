import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/user';
import type { PopulateOptions } from 'mongoose';
import type { UserRole } from '@/types/auth';

export async function GET() {
  try {
    // Use getServerSession instead of auth
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    // Fetch user data with role-specific relations
    const user = await User.findById(session.user.id)
      .select('-password')
      .populate(getRoleSpecificPopulate(session.user.role));

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('[USER_ME_ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Fixed return type to match Mongoose's PopulateOptions
function getRoleSpecificPopulate(role: UserRole): PopulateOptions | string {
  switch (role) {
    case 'teacher':
      return {
        path: 'teacherProfile',
        select: '-__v'
      };
    case 'student':
      return {
        path: 'studentProfile',
        populate: {
          path: 'parent',
          select: 'name email'
        }
      };
    case 'parent':
      return {
        path: 'parentProfile',
        populate: {
          path: 'children',
          select: 'name grade subjects'
        }
      };
    default:
      return {
        path: ''
      };
  }
}
