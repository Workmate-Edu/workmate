import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"
import type { Document } from 'mongoose'

interface StudentDocument extends Document {
  studentProfile: {
    subjects: Subject[];
    assignedTeachers: TeacherAssignment[];
  };
}

interface Subject {
  _id: string;
  name: string;
  area: string;
  progress?: number;
}

interface TeacherAssignment {
  teacherId: {
    _id: string;
    name: string;
    email: string;
  };
  subjects: Array<{
    name: string;
    area: string;
  }>;
}

interface CourseArea {
  area: string;
  subjects: Array<{
    id: string;
    name: string;
    teacher: {
      id: string;
      name: string;
      email: string;
    };
    progress: number;
  }>;
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'student') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const student = await User.findById(session.user.id)
      .select('studentProfile.subjects studentProfile.assignedTeachers')
      .populate('studentProfile.assignedTeachers.teacherId', 'name email')
      .lean() as StudentDocument

    if (!student?.studentProfile) {
      return NextResponse.json([])
    }

    // Group courses by area
    const coursesByArea = student.studentProfile.subjects?.reduce<CourseArea[]>((acc, subject: Subject) => {
      // Find teacher assigned to this subject
      const teacherAssignment = student.studentProfile.assignedTeachers?.find((at: TeacherAssignment) => 
        at.subjects.some((s) => s.name === subject.name && s.area === subject.area)
      )

      if (!teacherAssignment) {
        return acc // Skip subjects without assigned teachers
      }

      const teacher = teacherAssignment.teacherId

      // Initialize area if it doesn't exist
      if (!acc.find((a: CourseArea) => a.area === subject.area)) {
        acc.push({
          area: subject.area,
          subjects: []
        })
      }

      // Add subject to its area
      const areaIndex = acc.findIndex((a: CourseArea) => a.area === subject.area)
      acc[areaIndex].subjects.push({
        id: `${subject._id}-${subject.name}`,
        name: subject.name,
        teacher: {
          id: teacher._id,
          name: teacher.name,
          email: teacher.email
        },
        progress: subject.progress || 0
      })

      return acc
    }, []) || []

    return NextResponse.json(coursesByArea)

  } catch (error) {
    console.error('[STUDENT_COURSES_ERROR]', error)
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    )
  }
}