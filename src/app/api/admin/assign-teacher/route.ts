import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"
import { ChildAssessment } from "@/models/child-assessment"
import { InitialAssessment } from "@/models/initial-assessment"
import sendEmail from "@/lib/sendSmtpMail"
import { sendSessionNotification } from "@/lib/notification-service"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    const body = await req.json()
    const { studentId, studentType, assignments } = body

    await connectDB()

    // First validate assessment exists - support both pending and assigned states
    if (studentType === 'child') {
      const assessment = await ChildAssessment.findOne({ 
        childId: studentId,
        status: { $in: ['pending', 'assigned'] }  // Allow both states
      });
      if (!assessment) {
        throw new Error("No pending or assigned child assessment found");
      }
    } else {
      const assessment = await InitialAssessment.findOne({ 
        studentId,
        status: { $in: ['pending', 'assigned'] }  // Allow both states
      });
      if (!assessment) {
        throw new Error("No pending or assigned initial assessment found");
      }
    }

    // Update teacher arrays
    for (const assignment of assignments) {
      // Update teacher's lists
      await User.findByIdAndUpdate(
        assignment.teacherId,
        { 
          $addToSet: { 
            'teacherProfile.assignedStudents': studentId,
            'students': studentId 
          }
        },
        { new: true }
      )

      // Update student's lists
      await User.findByIdAndUpdate(
        studentId,
        {
          $addToSet: {
            'teachers': assignment.teacherId,
            'studentProfile.assignedTeachers': {
              teacherId: assignment.teacherId,
              subjects: [{
                name: assignment.subject.name,
                area: assignment.subject.area
              }]
            }
          }
        },
        { new: true }
      )

      // Verify updates
      const [updatedTeacher, updatedStudent] = await Promise.all([
        User.findById(assignment.teacherId)
          .select('teacherProfile.assignedStudents students')
          .lean(),
        User.findById(studentId)
          .select('teachers studentProfile.assignedTeachers')
          .lean()
      ])

      console.log('Assignment verification:', {
        teacher: {
          id: assignment.teacherId,
          assignedStudents: updatedTeacher?.teacherProfile?.assignedStudents?.length || 0,
          students: updatedTeacher?.students?.length || 0
        },
        student: {
          id: studentId,
          teachers: updatedStudent?.teachers?.length || 0,
          assignedTeachers: updatedStudent?.studentProfile?.assignedTeachers?.length || 0
        }
      })
    }

    // Fetch student with all needed fields including parentId
    const student = await User.findById(studentId)
      .select('name email grade studentProfile')  // Include studentProfile for parent info
      .lean()

    if (!student) throw new Error("Student not found")

    // Fetch parent if student is registered as child
    let parent = null
    if (student.studentProfile?.registeredAs === 'child' && student.studentProfile?.parent) {
      parent = await User.findById(student.studentProfile.parent)
        .select('name email')
        .lean()

      console.log('Parent found:', {
        id: parent?._id,
        name: parent?.name,
        email: parent?.email
      })
    }

    // Group assignments by teacher to avoid duplicate emails
    const teacherAssignments = new Map()

    // Process assignments
    for (const assignment of assignments) {
      const teacher = await User.findById(assignment.teacherId)
        .select('name email')
        .lean()
      
      if (!teacher?.email) continue

      // Send notifications
      await Promise.all([
        // Teacher notification
        sendSessionNotification({
          userId: teacher._id.toString(),
          type: 'teacher_assigned',
          title: 'New Student Assigned',
          message: `You have been assigned to teach ${student.name} - ${assignment.subject.name}`,
          data: { 
            studentId: student._id,
            subjectName: assignment.subject.name,
            subjectArea: assignment.subject.area
          }
        }),

        // Student notification
        sendSessionNotification({
          userId: student._id.toString(),
          type: 'teacher_assigned',
          title: 'New Teacher Assigned',
          message: `${teacher.name} has been assigned as your ${assignment.subject.name} teacher`,
          data: {
            teacherId: teacher._id,
            subjectName: assignment.subject.name,
            subjectArea: assignment.subject.area
          }
        }),

        // Parent notification if student is a child
        parent && sendSessionNotification({
          userId: parent._id.toString(),
          type: 'teacher_assigned',
          title: `New Teacher for ${student.name}`,
          message: `${teacher.name} has been assigned as ${student.name}'s ${assignment.subject.name} teacher`,
          data: {
            teacherId: teacher._id,
            studentId: student._id,
            subjectName: assignment.subject.name,
            subjectArea: assignment.subject.area
          }
        })
      ]);

      // Group subjects for each teacher for email
      if (!teacherAssignments.has(teacher._id.toString())) {
        teacherAssignments.set(teacher._id.toString(), {
          teacher,
          subjects: []
        })
      }
      teacherAssignments.get(teacher._id.toString()).subjects.push(assignment.subject)
    }

    // Update assessment status
    if (studentType === 'child') {
      await ChildAssessment.findOneAndUpdate(
        { childId: studentId, status: 'pending' },
        { 
          status: 'assigned',
          $set: {
            'adminReview.assignedAt': new Date(),
            'adminReview.assignedSubjects': assignments.map(a => ({
              name: a.subject.name,
              area: a.subject.area,
              teacherId: a.teacherId
            }))
          }
        }
      );
    } else {
      await InitialAssessment.findOneAndUpdate(
        { studentId, status: 'pending' },
        { 
          status: 'assigned',
          $set: {
            'results.assignedAt': new Date(),
            'results.assignedSubjects': assignments.map(a => ({
              name: a.subject.name,
              area: a.subject.area,
              teacherId: a.teacherId
            }))
          }
        }
      );
    }

    // Send emails
    try {
      // 1. Send one email per teacher with all their assigned subjects
      for (const { teacher, subjects } of teacherAssignments.values()) {
        await sendEmail({
          to: teacher.email,
          subject: "New Student Assignment",
          template: "teacher-assignment",
          replacements: {
            teacherName: teacher.name,
            studentName: student.name,
            subjects: subjects.map(s => `${s.name} (${s.area})`).join(', '),
            grade: student.grade || 'N/A',
            parentInfo: parent?.email || student.email,  // Use parent email if exists
            dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/teacher`
          }
        })
        console.log('✓ Teacher email sent to:', teacher.email)
      }

      // 2. Send parent/student email
      if (parent?.email) {
        await sendEmail({
          to: parent.email,
          subject: "Teachers Assigned for Your Child",
          template: "parent-teacher-assigned",
          replacements: {
            parentName: parent.name,
            childName: student.name,
            teacherName: Array.from(teacherAssignments.values())
              .map(({ teacher }) => teacher.name)
              .join(', '),
            subjects: Array.from(teacherAssignments.values())
              .flatMap(({ subjects }) => subjects)
              .map(s => `${s.name} (${s.area})`)
              .join(', '),
            grade: student.grade || 'N/A',
            dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/parent`
          }
        })
        console.log('✓ Parent email sent to:', parent.email)
      } else if (student.email) {
        // Send to independent student
        await sendEmail({
          to: student.email,
          subject: "Your Teachers Have Been Assigned",
          template: "student-teacher-assigned",
          replacements: {
            studentName: student.name,
            teacherName: Array.from(teacherAssignments.values())
              .map(({ teacher }) => teacher.name)
              .join(', '),
            subjects: Array.from(teacherAssignments.values())
              .flatMap(({ subjects }) => subjects)
              .map(s => `${s.name} (${s.area})`)
              .join(', '),
            dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/student`
          }
        })
        console.log('✓ Student email sent to:', student.email)
      }

    } catch (emailError) {
      console.error('Error sending emails:', emailError)
    }

    return NextResponse.json({ 
      success: true,
      message: `Teachers assigned and ${studentType} assessment updated successfully`
    })
  } catch (error: any) {
    console.error('Error in assign-teacher:', error)
    return NextResponse.json(
      { error: error.message || "Failed to assign teacher" },
      { status: 500 }
    )
  }
}
