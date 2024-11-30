import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/user.model";

export async function POST(req: Request) {
  try {
    await connectDB();
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    // Get user with password
    const user = await User.findById(session.user.id).select("+password");

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Check if user has a password
    if (!user.password) {
      return new NextResponse("No password set for this account", { status: 400 });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return new NextResponse("Invalid current password", { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and remove requirePasswordChange flag
    user.password = hashedPassword;
    user.requirePasswordChange = false;
    await user.save();

    return NextResponse.json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("[CHANGE_PASSWORD_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
