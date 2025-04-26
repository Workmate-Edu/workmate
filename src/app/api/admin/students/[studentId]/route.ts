import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"
import { InitialAssessment } from "@/models/initial-assessment"
import { ChildAssessment } from "@/models/child-assessment"
import authOptions from "@/lib/auth"
import { StudentProgress } from "@/models/student-progress"

export async function GET(req: Request, { params }: { params: { studentId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const [student, progressData] = await Promise.all([
      User.findById(params.studentId)
        .select('name email username isActive gender studentProfile createdAt')
        .populate({
          path: 'studentProfile.assignedTeachers.teacherId',
          select: 'name email subjects teacherProfile.rating'
        })
        .lean(),

      StudentProgress.find({ studentId: params.studentId })
        .sort({ weekNumber: -1 })
        .lean()
    ])

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Map current teacher assignments
    const subjectTeacherMap = student.studentProfile?.assignedTeachers?.reduce((acc, at) => {
      at.subjects.forEach(s => {
        acc[`${s.name}-${s.area}`.toLowerCase()] = {
          teacherId: at.teacherId._id,
          name: at.teacherId.name,
          email: at.teacherId.email,
          rating: at.teacherId.teacherProfile?.rating,
          assignedAt: at.startDate
        }
      })
      return acc
    }, {}) || {}

    // Group progress by subject
    const progressBySubject = progressData.reduce((acc, progress) => {
      const key = `${progress.subjectId}`.toLowerCase();
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push({
        weekNumber: progress.weekNumber,
        scores: progress.scores,
        averageScore: progress.averageScore,
        createdAt: progress.createdAt
      });
      return acc;
    }, {});

    // Format student data
    const formattedStudent = {
      id: student._id,
      name: student.name,
      email: student.email,
      username: student.username,
      type: student.studentProfile?.registeredAs || 'independent',
      status: student.isActive ? 'active' : 'inactive',
      gender: student.gender,
      grade: student.studentProfile?.grade,
      subjects: student.studentProfile?.subjects?.map(s => ({
        name: s.name,
        area: s.area,
        progress: s.progress || 0,
        teacher: subjectTeacherMap[`${s.name}-${s.area}`.toLowerCase()] || null,
        isAssigned: Boolean(subjectTeacherMap[`${s.name}-${s.area}`.toLowerCase()]),
        progressHistory: progressBySubject[`${s.area}-${s.name}`.toLowerCase()] || []
      })) || [],
      assessmentStatus: student.studentProfile?.assessmentStatus || 'none',
      assessments: [],
      currentAssignments: Object.entries(subjectTeacherMap).map(([key, value]) => {
        const [name, area] = key.split('-')
        return {
          subject: { name, area },
          teacher: {
            id: value.teacherId,
            name: value.name
          }
        }
      }),
      createdAt: student.createdAt
    }

    // Get assessments separately
    const assessments = await Promise.all([
      InitialAssessment.findOne({ studentId: params.studentId })
        .sort({ createdAt: -1 })
        .lean(),
      ChildAssessment.findOne({ childId: params.studentId })
        .sort({ createdAt: -1 })
        .lean()
    ])

    const [initialAssessment, childAssessment] = assessments

    // Add assessment if exists
    if (initialAssessment || childAssessment) {
      const assessment = initialAssessment || childAssessment
      formattedStudent.assessments.push({
        id: assessment._id,
        type: initialAssessment ? 'initial' : 'child',
        status: assessment.status,
        createdAt: assessment.createdAt,
        submittedAt: assessment.submittedAt,
        responses: assessment.responses
      })
    }

    console.log('Sending formatted student with progress:', formattedStudent)

    return NextResponse.json(formattedStudent)

  } catch (error) {
    console.error('[STUDENT_DETAILS_ERROR]', error)
    return NextResponse.json(
      { error: "Failed to fetch student details" },
      { status: 500 }
    )
  }
}