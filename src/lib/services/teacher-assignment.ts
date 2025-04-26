import { User } from "@/models/user"
import { Child } from "@/models/child"
import { InitialAssessment } from "@/models/initial-assessment"
import { sendAssignmentNotifications } from "@/lib/email-service"
import { establishTeachingRelationship } from "./teacher-relationship"

interface AssignmentDetails {
  teacherId: string
  studentId?: string
  childId?: string
  adminId: string
  subjects: Array<{ name: string; area: string }>
  source: 'assessment' | 'direct'
}

interface AssignmentContext {
  source: 'assessment' | 'student_profile'
  assessmentId?: string
  studentId: string
  teacherId: string
  adminId: string
}

export async function assignTeacher(context: AssignmentContext) {
  // Single source of truth for assignment logic
  // Handle all relationships and notifications
}

export async function assignTeacher({
  teacherId,
  childId,
  adminId,
  subjects,
  source
}: AssignmentDetails) {
  try {
    // 1. Update child assessment status
    await ChildAssessment.findOneAndUpdate(
      { childId, status: 'pending' },
      { 
        $set: { 
          status: 'teacher_assigned',
          'adminReview.reviewedBy': adminId,
          'adminReview.reviewedAt': new Date()
        }
      }
    )

    // 2. Update child model with new teacher
    await Child.findByIdAndUpdate(childId, {
      $set: {
        assessmentStatus: 'teacher_assigned',
        'assignedTeacher.teacherId': teacherId,
        'assignedTeacher.assignedAt': new Date(),
        'assignedTeacher.status': 'active'
      }
    })

    // 3. Send email notifications
    await sendAssignmentNotifications({
      // ...notification details...
    })

    return { success: true }
  } catch (error) {
    console.error('[TEACHER_ASSIGNMENT_ERROR]', error)
    throw error
  }
}

async function assignTeacherToStudent({
  teacherId,
  studentId,
  adminId,
  subjects,
  source
}: AssignmentDetails) {
  const [teacher, student] = await Promise.all([
    User.findById(teacherId).select('name email teacherProfile').lean(),
    User.findById(studentId).select('name email studentProfile').lean()
  ])

  if (!teacher || !student) {
    throw new Error("Teacher or student not found")
  }

  const formattedSubjects = subjects.map(subject => ({
    name: subject.name,
    area: subject.area,
    progress: 0
  }))

  // Establish relationship
  const relationshipId = await establishTeachingRelationship({
    teacherId,
    studentId,
    status: 'active',
    subjects: formattedSubjects,
    assignmentSource: source,
    assignedBy: adminId
  })

  // Send notifications
  await sendAssignmentNotifications({
    teacher: {
      name: teacher.name,
      email: teacher.email
    },
    student: {
      name: student.name,
      email: student.email
    },
    subject: {
      name: subjects.map(s => s.name).join(', ')
    }
  })

  return { success: true }
}

async function assignTeacherToChild({
  teacherId,
  childId,
  adminId,
  subjects,
  source
}: AssignmentDetails) {
  const [teacher, child] = await Promise.all([
    User.findById(teacherId).select('name email teacherProfile').lean(),
    Child.findById(childId).populate('parent', 'name email').lean()
  ])

  if (!teacher || !child) {
    throw new Error("Teacher or child not found")
  }

  const formattedSubjects = subjects.map(subject => ({
    name: subject.name,
    area: subject.area,
    progress: 0,
    lastSessionDate: null,
    nextSessionDate: null,
    totalSessions: 0
  }))

  // Establish relationship
  const relationshipId = await establishTeachingRelationship({
    teacherId,
    childId,
    status: 'active',
    subjects: formattedSubjects,
    assignmentSource: source,
    assignedBy: adminId
  })

  // Send notifications
  await sendAssignmentNotifications({
    teacher: {
      name: teacher.name,
      email: teacher.email
    },
    child: {
      name: child.name,
      grade: child.grade
    },
    parent: {
      name: child.parent.name,
      email: child.parent.email
    },
    subject: {
      name: subjects.map(s => s.name).join(', ')
    }
  })

  return { success: true }
}
