import { NextResponse } from "next/server";
import sendEmail from "@/lib/email";
import { getAuthSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const session = await getAuthSession();
    if (!session?.user || session.user.role !== 'admin' || !session.user.email) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    // Test sending signup email
    await sendEmail({
      to: session.user.email,
      subject: "Welcome to Workmate - Complete Your Registration",
      template: "signup",
      replacements: {
        name: "Test User",
        email: session.user.email,
        verificationLink: `${process.env.NEXTAUTH_URL}/verify-email?token=test-token`,
        supportEmail: process.env.SUPPORT_EMAIL || "support@workmate.com",
        loginUrl: `${process.env.NEXTAUTH_URL}/sign-in`,
        websiteUrl: process.env.NEXTAUTH_URL || "https://workmate.com",
        companyName: "Workmate",
        companyAddress: ""
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
