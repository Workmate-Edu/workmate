import { User } from "@/models/user"
import { InitialAssessment } from "@/models/initial-assessment"
import { ChildAssessment } from "@/models/child-assessment"

export async function getDashboardStats() {
  try {
    const [students, teachers, initialAssessments, childAssessments] = await Promise.all([
      // Fix: Group students by `studentProfile.registeredAs`
      User.aggregate([
        { $match: { role: 'student' } },
        {
          $group: {
            _id: '$studentProfile.registeredAs',
            total: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } }
          }
        }
      ]),

      // Teacher counts
      User.aggregate([
        { $match: { role: 'teacher' } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ['$isActive', true] },
                      { $eq: ['$teacherProfile.verificationStatus', 'approved'] }
                    ]
                  },
                  1,
                  0
                ]
              }
            },
            pending: {
              $sum: {
                $cond: [{ $eq: ['$teacherProfile.verificationStatus', 'pending'] }, 1, 0]
              }
            }
          }
        }
      ]),

      InitialAssessment.countDocuments({ status: 'pending' }),
      ChildAssessment.countDocuments({ status: 'pending' })
    ])

    // Process student counts
    const studentCounts = {
      independent: { total: 0, active: 0 },
      child: { total: 0, active: 0 }
    }

    students.forEach(group => {
      const type = group._id === 'child' ? 'child' : 'independent'
      studentCounts[type] = {
        total: group.total,
        active: group.active
      }
    })

    return {
      students: {
        total: studentCounts.independent.total + studentCounts.child.total,
        active: studentCounts.independent.active + studentCounts.child.active,
        independent: studentCounts.independent,
        children: studentCounts.child
      },
      teachers: {
        total: teachers[0]?.total || 0,
        active: teachers[0]?.active || 0,
        pending: teachers[0]?.pending || 0
      },
      assessments: {
        total: initialAssessments + childAssessments,
        initial: initialAssessments,
        child: childAssessments
      }
    }
  } catch (error) {
    console.error('[GET_DASHBOARD_STATS_ERROR]', error)
    throw error
  }
}
