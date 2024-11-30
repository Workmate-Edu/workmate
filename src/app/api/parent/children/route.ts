import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/user.model";
import bcrypt from "bcryptjs";
import sendEmail from "@/lib/email";

export async function POST(req: Request) {
  try {
    await connectDB();
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (session.user.role !== "parent") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await req.json();
    const {
      firstName,
      lastName,
      dateOfBirth,
      grade,
      studentId,
      schoolName,
      subjects,
      emailOption,
      email,
    } = body;

    // Get parent user
    const parent = await User.findById(session.user.id);

    if (!parent) {
      return new NextResponse("Parent not found", { status: 404 });
    }

    // Check if email is already in use
    const emailToUse = emailOption === "existing" ? email : `${studentId}@student.workmate.edu`;
    const existingUser = await User.findOne({ email: emailToUse });

    if (existingUser) {
      return new NextResponse(
        "This email is already registered. Please use a different email.",
        { status: 400 }
      );
    }

    // Generate temporary password only if using system-generated email
    const temporaryPassword = emailOption === "generate" ? await generateRandomPassword() : null;

    // Create student account
    const studentUser = await User.create({
      name: `${firstName} ${lastName}`,
      email: emailToUse,
      password: temporaryPassword ? await bcrypt.hash(temporaryPassword, 10) : null,
      role: "student",
      emailVerified: emailOption === "generate", // Only mark as verified if we generate the email
      grade,
      studentId,
      schoolName,
      subjects: subjects.map((subject: string) => ({
        name: subject,
        progress: 0,
      })),
      requirePasswordChange: emailOption === "generate", // Only require password change if we generate the email
    });

    // Add student to parent's children array
    parent.children = parent.children || [];
    parent.children.push(studentUser._id);
    await parent.save();

    // Send appropriate email based on email option
    if (emailOption === "generate" && temporaryPassword) {
      // Send login credentials to parent
      await sendEmail({
        to: session.user.email,
        subject: "Your Child's Workmate Account Details",
        template: "child-credentials",
        replacements: {
          parentName: session.user.name,
          childName: `${firstName} ${lastName}`,
          childEmail: emailToUse,
          temporaryPassword,
          loginUrl: `${process.env.NEXTAUTH_URL}/login`,
        }
      });
    } else if (emailOption === "existing") {
      // Send invitation email to child's email
      await sendEmail({
        to: emailToUse,
        subject: "Welcome to Workmate - Complete Your Registration",
        template: "child-invitation",
        replacements: {
          childName: `${firstName} ${lastName}`,
          parentName: session.user.name,
          signupUrl: `${process.env.NEXTAUTH_URL}/sign-up?email=${encodeURIComponent(emailToUse)}`,
        }
      });
    }

    return NextResponse.json({
      message: emailOption === "generate" 
        ? "Child added successfully. Check your email for their login details."
        : "Child added successfully. An invitation has been sent to their email.",
      child: {
        id: studentUser._id.toString(),
        name: studentUser.name,
        grade: studentUser.grade,
        studentId: studentUser.studentId,
        schoolName: studentUser.schoolName,
        subjects: studentUser.subjects,
      },
    });
  } catch (error) {
    console.error("[ADD_CHILD_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (session.user.role !== "parent") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Get parent user with populated children
    const parent = await User.findById(session.user.id).populate({
      path: "children",
      select: "name grade studentId schoolName subjects",
    });

    if (!parent) {
      return new NextResponse("Parent not found", { status: 404 });
    }

    return NextResponse.json({
      children: parent.children,
    });
  } catch (error) {
    console.error("[GET_CHILDREN_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Helper function to generate a random password
async function generateRandomPassword() {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}
