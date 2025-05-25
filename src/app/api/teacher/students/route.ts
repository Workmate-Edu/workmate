import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/user";

export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 'teacher') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get teacher with explicit field selection
    const teacher = await User.findById(session.user.id)
      .select('assignedStudents students teacherProfile')
      .lean();

    // Use both arrays to ensure all students are included
    const studentIds = [...new Set([
      ...(teacher?.assignedStudents || []),
      ...(teacher?.students || [])
    ])];

    if (!studentIds.length) {
      return NextResponse.json([]);
    }

    // Get all assigned students
    const students = await User.find({
      _id: { $in: studentIds }
    })
    .select('_id name email studentProfile grade')
    .lean();

    // Transform data for response
    const formattedStudents = students.map(student => ({
      id: student._id,
      name: student.name,
      email: student.email,
      isChild: student.studentProfile?.registeredAs === 'child',
      grade: student.studentProfile?.grade || student.grade,
      parentId: student.studentProfile?.parent
    }));

    console.log('Found students:', formattedStudents); // Debug log
    return NextResponse.json(formattedStudents);

  } catch (error) {
    console.error("[TEACHER_STUDENTS_ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}
