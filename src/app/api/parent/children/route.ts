import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/user";
import bcrypt from "bcryptjs";

// 👉 GET handler to fetch parent's children
export async function GET(req: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parent = await User.findById(session.user.id)
      .populate({
        path: "parentProfile.children",
        model: "User",
        select: "name username email studentProfile gender role"
      })
      .lean() as { parentProfile: { children: any[] } | undefined };

    const children = parent?.parentProfile?.children?.map((child: any) => ({
      id: child._id,
      name: child.name,
      username: child.username,
      email: child.email,
      gender: child.gender,
      grade: child.studentProfile?.grade,
      subjects: child.studentProfile?.subjects || [],
    })) || [];

    return NextResponse.json({ children });
  } catch (error) {
    console.error("[CHILDREN_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// 👉 POST handler to add a new child
export async function POST(req: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      name,
      username,
      password,
      phone,
      gender,
      educationLevel,
      grade,
      ageGroup,
      subjects
    } = await req.json();

    if (!name || !username || !password || !phone || !gender || !educationLevel || !grade || !ageGroup || !subjects?.length) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Validate phone number
    if (!phone.startsWith('+')) {
      return NextResponse.json({ error: "Phone number must include country code" }, { status: 400 });
    }

    const normalizedUsername = username.toLowerCase();
    const generatedEmail = `${normalizedUsername}@workmateteam.com`;

    const existingUser = await User.findOne({ $or: [{ username: normalizedUsername }, { email: generatedEmail }] });
    if (existingUser) {
      return NextResponse.json({ error: "Username or email already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const childUser = await User.create({
      name,
      username: normalizedUsername,
      email: generatedEmail,
      password: hashedPassword,
      phone, // Add phone number
      role: "student",
      gender,
      emailVerified: true,
      studentProfile: {
        registeredAs: "child",
        parent: session.user.id,
        grade,
        phone, // Add phone to student profile
        subjects: subjects.map((s: any) => ({
          name: s.name,
          area: s.area,
          progress: 0
        }))
      }
    });

    await User.findByIdAndUpdate(session.user.id, {
      $push: { "parentProfile.children": childUser._id }
    });

    return NextResponse.json({
      success: true,
      child: {
        id: childUser._id,
        name: childUser.name,
        username: childUser.username,
        email: childUser.email,
        grade,
        gender,
        educationLevel
      }
    });

  } catch (error) {
    console.error("[ADD_CHILD_STUDENT_ERROR]", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Internal server error"
    }, { status: 500 });
  }
}
