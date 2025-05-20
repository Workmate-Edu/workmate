// src/app/api/users/[userId]/parent/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/user";

export async function GET(
  _req: Request,
  { params }: { params: { userId: string } }
) {
  // 1) Authorize only teachers
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2) Connect and fetch the student record
  await connectDB();
  const student = await User.findById(params.userId)
    .select("studentProfile")
    .populate("studentProfile.parent", "_id name email role")
    .lean();

  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  // 3) Extract and return the populated parent (or null)
  const parent = (student.studentProfile as any)?.parent || null;
  return NextResponse.json(parent);
}
