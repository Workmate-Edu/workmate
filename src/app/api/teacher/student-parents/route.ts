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

    // Get teacher with assigned students
    const teacher = await User.findById(session.user.id).lean();

    // Find all student users who are registered as children
    const childStudents = await User.find({
      _id: { $in: teacher.assignedStudents || [] },
      role: 'student',
      'studentProfile.registeredAs': 'child',
      'studentProfile.parent': { $exists: true }
    }).lean();


    // Get unique parent IDs
    const parentIds = [...new Set(
      childStudents
        .map(student => student.studentProfile?.parent)
        .filter(Boolean)
    )];


    // Get parent details
    const parents = await User.find({
      _id: { $in: parentIds },
      role: 'parent'
    })
    .select('_id name email')
    .lean();

    // Transform the data
    const parentsWithChildren = parents.map(parent => ({
      _id: parent._id,
      name: parent.name,
      email: parent.email,
      children: childStudents
        .filter(student => student.studentProfile?.parent?.toString() === parent._id.toString())
        .map(student => ({
          id: student._id,
          name: student.name,
          grade: student.studentProfile?.grade
        }))
    }));

    return NextResponse.json(parentsWithChildren);

  } catch (error) {
    console.error("[TEACHER_PARENTS_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch parents" },
      { status: 500 }
    );
  }
}
