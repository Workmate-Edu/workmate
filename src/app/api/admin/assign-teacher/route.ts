import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/user";

export async function POST(req: Request) {
  try {
    const { studentId, assignments } = await req.json();
    await connectDB();

    // Group assignments by teacher
    const assignmentsByTeacher = assignments.reduce((acc: any, assignment: any) => {
      if (!acc[assignment.teacherId]) {
        acc[assignment.teacherId] = [];
      }
      acc[assignment.teacherId].push(assignment.subject);
      return acc;
    }, {});

    // Update student's assignedTeachers
    await User.findByIdAndUpdate(
      studentId,
      {
        $pull: {
          // Remove existing assignments for these subjects first
          'studentProfile.assignedTeachers': {
            'subjects': {
              $elemMatch: {
                name: { $in: assignments.map((a: any) => a.subject.name) },
                area: { $in: assignments.map((a: any) => a.subject.area) }
              }
            }
          }
        }
      }
    );

    // Add new assignments
    for (const [teacherId, subjects] of Object.entries(assignmentsByTeacher)) {
      // Check if teacher already exists in assignedTeachers
      const existingTeacher = await User.findOne({
        _id: studentId,
        'studentProfile.assignedTeachers.teacherId': teacherId
      });

      if (existingTeacher) {
        // Add new subjects to existing teacher
        await User.findOneAndUpdate(
          {
            _id: studentId,
            'studentProfile.assignedTeachers.teacherId': teacherId
          },
          {
            $addToSet: {
              'studentProfile.assignedTeachers.$.subjects': {
                $each: subjects
              }
            }
          }
        );
      } else {
        // Add new teacher with subjects
        await User.findByIdAndUpdate(
          studentId,
          {
            $addToSet: {
              'studentProfile.assignedTeachers': {
                teacherId,
                subjects
              }
            }
          }
        );
      }

      // Update teacher's assignedStudents
      await User.findByIdAndUpdate(
        teacherId,
        {
          $addToSet: {
            'teacherProfile.assignedStudents': studentId,
            students: studentId
          }
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Teachers assigned successfully",
      assignments
    });

  } catch (error) {
    console.error('[ASSIGN_TEACHER_ERROR]', error);
    return NextResponse.json(
      { success: false, error: "Failed to assign teachers" },
      { status: 500 }
    );
  }
}
