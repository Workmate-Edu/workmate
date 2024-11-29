import { NextResponse } from "next/server";
import sendEmail from "@/lib/email";

export async function GET() {
  try {
    // Test sending email
    await sendEmail({
      to: "test@example.com", // Replace with your email for testing
      subject: "Test Email from Workmate",
      template: "signup",
      replacements: {
        name: "Test User",
        email: "test@example.com",
        username: "testuser",
        loginLink: `${process.env.NEXTAUTH_URL}/login`
      }
    });

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully!"
    });
  } catch (error) {
    console.error("Error sending test email:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    }, { status: 500 });
  }
}
