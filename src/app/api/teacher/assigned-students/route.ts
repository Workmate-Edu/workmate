import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/user";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'teacher') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get teacher's data with assignedStudents
    const teacher = await User.findById(session.user.id)
      .select('teacherProfile.assignedStudents')
      .lean();

    if (!teacher?.teacherProfile?.assignedStudents?.length) {
      return NextResponse.json([]);
    }

    // Fetch assigned students' details
    const students = await User.find({
      _id: { $in: teacher.teacherProfile.assignedStudents }
    })
    .select('name email studentProfile')
    .lean();

    return NextResponse.json(students);

  } catch (error) {
    console.error('[ASSIGNED_STUDENTS_ERROR]:', error);
    return NextResponse.json(
      { error: "Failed to fetch assigned students" },
      { status: 500 }
    );
  }
}
