import { NextResponse } from "next/server";
import User from "@/models/user.model";
import connectDB from "@/lib/mongodb";
import { getVerificationTokenByToken } from "@/lib/tokens";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return new NextResponse("Missing token", { status: 400 });
    }

    await connectDB();

    const verificationToken = await getVerificationTokenByToken(token);

    if (!verificationToken) {
      return new NextResponse("Invalid or expired token", { status: 400 });
    }

    const user = await User.findById(verificationToken.userId);

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Update user
    user.emailVerified = true;
    await user.save();
    console.log('User after verification:', user.toObject());

    // Delete verification token
    await verificationToken.deleteOne();

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        username: user.username,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error("[VERIFY_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
