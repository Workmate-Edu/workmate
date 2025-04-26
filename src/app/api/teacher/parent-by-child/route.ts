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

    // Find students who have this teacher in their assignedTeachers array
    // and are registered as children
    const childStudents = await User.find({
      'assignedTeachers': session.user.id,
      'role': 'student',
      'studentProfile.registeredAs': 'child',
    })
    .select('name email studentProfile')
    .populate('studentProfile.parent', '_id name email')
    .lean();

    console.log('Found child students:', childStudents); // Debug log

    // Extract parent info with their children
    const parentMap = new Map();

    childStudents.forEach(student => {
      if (student.studentProfile?.parent) {
        const parent = student.studentProfile.parent;
        const parentId = parent._id.toString();

        if (!parentMap.has(parentId)) {
          parentMap.set(parentId, {
            _id: parentId,
            name: parent.name,
            email: parent.email,
            children: [{ 
              id: student._id,
              name: student.name,
              grade: student.studentProfile.grade
            }]
          });
        } else {
          parentMap.get(parentId).children.push({
            id: student._id,
            name: student.name,
            grade: student.studentProfile.grade
          });
        }
      }
    });

    const parents = Array.from(parentMap.values());
    console.log('Found parents:', parents); // Debug log

    return NextResponse.json(parents);

  } catch (error) {
    console.error("[TEACHER_PARENTS_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch parents" },
      { status: 500 }
    );
  }
}
