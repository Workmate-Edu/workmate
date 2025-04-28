import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user.model"
import { Types } from "mongoose"

export async function GET(
  request: Request,
  { params }: { params: { studentId: string } }
) {
  try {
    await connectDB()

    if (!Types.ObjectId.isValid(params.studentId)) {
      return NextResponse.json({ error: "Invalid student ID" }, { status: 400 });
    }

    const student = await User
      .findById(new Types.ObjectId(params.studentId))
      .populate('studentProfile.parent', 'name email')
      .populate('studentProfile.assignedTeachers.teacherId', 'name email')
      .lean();

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const formattedStudent = {
      _id: student._id.toString(),
      name: student.name,
      email: student.email,
      username: student.username,
      role: student.role,
      type: student.studentProfile?.registeredAs || 'independent',
      status: student.isActive ? 'active' : 'inactive',
      gender: student.gender,
      grade: student.studentProfile?.grade,
      subjects: student.studentProfile?.subjects?.map(s => ({
        name: s.name,
        area: s.area,
      })) || [],
      parent: student.studentProfile?.parent ? {
        id: student.studentProfile.parent._id.toString(),
        name: student.studentProfile.parent.name,
        email: student.studentProfile.parent.email
      } : null,
      createdAt: student.createdAt
    };

    console.log('Sending formatted student:', formattedStudent);
    return NextResponse.json(formattedStudent);

  } catch (error) {
    console.error('[STUDENT_DETAILS_ERROR]', error);
    return NextResponse.json(
      { error: "Failed to fetch student details" },
      { status: 500 }
    );
  }
}