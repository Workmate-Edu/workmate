import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/user.model";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (session.user.role !== "teacher") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await req.json();
    const {
      bio,
      subjects,
      qualifications,
      teachingExperience,
      hourlyRate,
      availability,
    } = body;

    await connectDB();

    const user = await User.findById(session.user.id);

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Update user profile
    user.bio = bio;
    user.subjects = subjects;
    user.qualifications = qualifications;
    user.teachingExperience = teachingExperience;
    user.hourlyRate = hourlyRate;
    user.availability = availability;

    await user.save();

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        subjects: user.subjects,
        qualifications: user.qualifications,
        teachingExperience: user.teachingExperience,
        hourlyRate: user.hourlyRate,
        availability: user.availability,
      },
    });
  } catch (error) {
    console.error("[TEACHER_ONBOARDING_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
