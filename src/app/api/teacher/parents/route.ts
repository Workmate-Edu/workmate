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
    const teacher = await User.findById(session.user.id)
      .select('assignedStudents')
      .lean();

    if (!teacher?.assignedStudents?.length) {
      return NextResponse.json({ parents: [] });
    }

    // Find students and populate their parent info
    const students = await User.find({
      _id: { $in: teacher.assignedStudents },
      role: 'student'
    })
    .populate('parent', 'name email')
    .lean();

    // Extract unique parents
    const uniqueParents = new Map();
    students.forEach(student => {
      if (student.parent) {
        const parentId = student.parent._id.toString();
        if (!uniqueParents.has(parentId)) {
          uniqueParents.set(parentId, {
            _id: parentId,
            name: student.parent.name,
            email: student.parent.email,
            children: [{ id: student._id, name: student.name }]
          });
        } else {
          const parent = uniqueParents.get(parentId);
          parent.children.push({ id: student._id, name: student.name });
        }
      }
    });

    return NextResponse.json({ 
      parents: Array.from(uniqueParents.values()) 
    });

  } catch (error) {
    console.error("[TEACHER_PARENTS_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch parents" },
      { status: 500 }
    );
  }
}
