import { NextResponse } from "next/server";
import sendEmail from "@/lib/email";

export async function GET() {
  try {
    // Test sending signup email
    await sendEmail({
      to: "ibrahim.saliman.zainab@gmail.com",
      subject: "Welcome to Workmate - Complete Your Registration",
      template: "signup",
      replacements: {
        name: "Test User",
        email: "ibrahim.saliman.zainab@gmail.com",
        verificationLink: `${process.env.NEXTAUTH_URL}/verify-email?token=test-token`,
        supportEmail: process.env.SUPPORT_EMAIL || "support@workmate.com",
        loginUrl: `${process.env.NEXTAUTH_URL}/sign-in`,
        websiteUrl: process.env.NEXTAUTH_URL || "https://workmate.com",
        companyName: "Workmate",
        companyAddress: "123 Education Street, Learning City"
      }
    });

    return NextResponse.json({
      success: true,
      message: "Test signup email sent successfully!"
    });
  } catch (error) {
    console.error("Error sending test signup email:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    }, { status: 500 });
  }
}
