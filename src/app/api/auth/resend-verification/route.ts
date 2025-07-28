// routes/api/auth/resend-verification.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/user";
import { generateVerificationToken } from "@/lib/tokens";
import sendEmail from "@/lib/sendSmtpMail";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: "Email already verified" }, { status: 400 });
    }

    // Generate a new JWT verification token
    const token = generateVerificationToken(user._id.toString());

    // Build the link your email template expects
    const verificationLink = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

    // Send the “Verify Your Email” message using your HTML template
    await sendEmail({
      to: user.email,
      template: "verify-email",                 
      subject:  "Verify Your Email Address",
      replacements: {
        name: user.name,                      
        role: user.role,                   
        verificationLink,         
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[RESEND_VERIFICATION_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to resend verification" },
      { status: 500 }
    );
  }
}
