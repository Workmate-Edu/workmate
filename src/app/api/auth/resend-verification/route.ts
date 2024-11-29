import { NextResponse } from "next/server";
import User from "@/models/user.model";
import connectDB from "@/lib/mongodb";
import { createVerificationToken } from "@/lib/tokens";
import sendEmail from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" }, 
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find user by email
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      emailVerified: false 
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found or already verified" }, 
        { status: 404 }
      );
    }

    // Create new verification token
    const verificationToken = await createVerificationToken(user._id.toString());

    // Send verification email
    try {
      const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken.token}`;
      
      await sendEmail({
        to: email,
        subject: "Resend Email Verification - Workmate",
        template: "verify-email",
        replacements: {
          name: user.name,
          verificationLink: verificationUrl
        }
      });
    } catch (emailError) {
      console.error("Error resending verification email:", emailError);
      return NextResponse.json(
        { error: "Failed to send verification email" }, 
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: "Verification email resent successfully",
        email: user.email
      }, 
      { status: 200 }
    );
  } catch (error) {
    console.error("[RESEND_VERIFICATION_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}
