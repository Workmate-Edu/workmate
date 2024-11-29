import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/user.model";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, token, password } = await req.json();

    if (!email || !token || !password) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as {
        email: string;
        parentId: string;
        exp: number;
      };
    } catch (error) {
      return new NextResponse("Invalid or expired token", { status: 400 });
    }

    // Check if token matches email
    if (decoded.email !== email) {
      return new NextResponse("Invalid token for this email", { status: 400 });
    }

    // Find the user
    const user = await User.findOne({ email });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Verify user has pending parent invite
    if (!user.pendingParentInvite) {
      return new NextResponse("Invalid registration attempt", { status: 400 });
    }

    // Hash password and update user
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.emailVerified = true;
    user.pendingParentInvite = false;
    user.parentId = decoded.parentId;

    await user.save();

    return new NextResponse("Registration completed successfully", { status: 200 });
  } catch (error) {
    console.error("[STUDENT_WITH_PARENT_REGISTRATION_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
