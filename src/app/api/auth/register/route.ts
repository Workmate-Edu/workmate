import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/user.model";
import connectDB from "@/lib/mongodb";
import { createVerificationToken } from "@/lib/tokens";
import sendEmail from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, role } = body;

    if (!email || !password || !name || !role) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    await connectDB();

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return new NextResponse("User already exists", { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role,
    });

    // Create verification token
    const verificationToken = await createVerificationToken(user._id.toString());

    // Send verification email using new email system
    try {
      await sendEmail({
        to: user.email,
        subject: "Verify your Workmate account",
        template: "signup",
        replacements: {
          name: user.name,
          email: user.email,
          username: user.name,
          verificationLink: `${process.env.NEXTAUTH_URL}/verify?token=${verificationToken.token}`
        }
      });
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);
      // Continue with registration even if email fails
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      message: "Account created successfully! Please check your email to verify your account."
    });
  } catch (error) {
    console.error("[REGISTER_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
