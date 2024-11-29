import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/user.model";
import sendEmail from "@/lib/email";
import { createVerificationToken } from "@/lib/tokens";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const { email, password, name, username, role } = body;

    // Log the received data
    console.log('Received sign-up data:', { email, name, username, role });

    if (!email || !password || !name || !username || !role) {
      console.log('Missing fields:', { 
        hasEmail: !!email, 
        hasPassword: !!password, 
        hasName: !!name, 
        hasUsername: !!username, 
        hasRole: !!role 
      });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate role
    if (!["student", "teacher", "parent"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role selected" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const userExists = await User.findOne({ 
      $or: [{ email }, { username }]
    });

    if (userExists) {
      const field = userExists.email === email ? "email" : "username";
      return NextResponse.json(
        { error: `This ${field} is already registered. Please try another ${field} or sign in.` },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create new user
    const user = new User({
      email,
      name,
      username,
      password: hashedPassword,
      role,
      emailVerified: false,
    });

    // Save the user to database
    const savedUser = await user.save();
    console.log('Saved user to database:', savedUser.toObject());

    // Create verification token
    const verificationToken = await createVerificationToken(savedUser._id.toString());

    // Send verification email
    try {
      const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken.token}`;
      
      await sendEmail({
        to: email,
        subject: "Verify your Workmate account",
        template: "verify-email",
        replacements: {
          name,
          verificationLink: verificationUrl
        }
      });
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);
      // Continue with signup even if email fails
    }

    // Remove password from response
    const userWithoutPassword = {
      ...savedUser.toObject(),
      password: undefined
    };

    return NextResponse.json({
      message: "Account created successfully! Please check your email to verify your account.",
      user: userWithoutPassword,
    }, { status: 201 });
  } catch (error) {
    console.error("[SIGN_UP_ERROR]", error);
    return NextResponse.json(
      { error: "An error occurred during sign up. Please try again." },
      { status: 500 }
    );
  }
}
