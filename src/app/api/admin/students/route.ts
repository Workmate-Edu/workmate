import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Get independent students - Update query to match schema
    const independentStudents = await User.find({
      role: 'student',
      'studentProfile.registeredAs': { $ne: 'child' } // Changed condition
    })
    .select('name email studentProfile username status')
    .lean();

    console.log('Raw independent students:', independentStudents);

    // Format independent students with proper field mapping
    const formattedIndependent = independentStudents.map(student => ({
      id: student._id,
      name: student.name,
      email: student.email,
      username: student.username,
      type: 'independent',
      subjects: student.studentProfile?.subjects || [],
      grade: student.studentProfile?.grade,
      status: student.status || 'active',
      assignedTeacher: student.studentProfile?.assignedTeacher,
      assessmentStatus: student.studentProfile?.assessmentStatus || 'none'
    }));

    console.log('Formatted independent:', formattedIndependent);

    // Get children students
    const childStudents = await User.find({
      role: 'student',
      'studentProfile.registeredAs': 'child'
    })
    .select('name email studentProfile status')
    .populate('studentProfile.parent', 'name email')
    .lean();

    console.log('Raw child students:', childStudents);

    // Format children
    const formattedChildren = childStudents.map(child => ({
      id: child._id,
      name: child.name,
      email: child.email,
      type: 'child',
      grade: child.studentProfile?.grade,
      subjects: child.studentProfile?.subjects || [],
      status: child.status || 'active',
      parentName: child.studentProfile?.parent?.name,
      parentEmail: child.studentProfile?.parent?.email,
      assignedTeacher: child.studentProfile?.assignedTeacher,
      assessmentStatus: child.studentProfile?.assessmentStatus || 'none'
    }));

    console.log('Response data:', {
      independent: formattedIndependent,
      children: formattedChildren
    });

    return NextResponse.json({
      independent: formattedIndependent,
      children: formattedChildren
    });

  } catch (error) {
    console.error('[STUDENTS_GET_ERROR]', error);
    return NextResponse.json(
      { error: "Failed to fetch students", details: error.message },
      { status: 500 }
    );
  }
}
