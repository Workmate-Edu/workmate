import { connectDB, disconnect } from "@/lib/mongodb"
import { User } from "@/models/user"
import { Child } from "@/models/child"
import { ChildAssessment } from "@/models/child-assessment"
import { generateUsername, generateTempPassword } from "@/lib/utils"

async function migrateChildren() {
  try {
    await connectDB()
    
    // 1. Get all children with their assessments and parents
    const children = await Child.find()
      .populate('parent')
      .populate('assignedTeacher.teacherId')
      .lean()

    console.log(`Found ${children.length} children to migrate`)

    for (const child of children) {
      const session = await mongoose.startSession()
      session.startTransaction()

      try {
        // 2. Create new user account for child
        const username = generateUsername(child.name)
        const tempPassword = generateTempPassword()

        const newUser = await User.create([{
          name: child.name,
          username,
          password: tempPassword, // Will be changed on first login
          email: null, // Optional, can be set later
          role: 'student',
          gender: child.gender || 'not_specified',
          isActive: true,
          learnerProfile: {
            type: 'child',
            grade: child.grade,
            parent: child.parent._id,
            subjects: child.subjects.map(s => ({
              name: s.name,
              area: s.area,
              progress: s.progress || 0
            })),
            assignedTeachers: child.assignedTeacher ? [{
              teacherId: child.assignedTeacher.teacherId._id,
              subjects: child.assignedTeacher.subjects,
              assignedAt: child.assignedTeacher.assignedAt,
              status: child.assignedTeacher.status
            }] : []
          }
        }], { session })

        // 3. Update parent's reference
        await User.findByIdAndUpdate(
          child.parent._id,
          {
            $push: {
              'parentProfile.children': newUser[0]._id
            }
          },
          { session }
        )

        // 4. Update teacher's references if assigned
        if (child.assignedTeacher) {
          await User.findByIdAndUpdate(
            child.assignedTeacher.teacherId._id,
            {
              $push: {
                'teacherProfile.assignedStudents': {
                  studentId: newUser[0]._id,
                  type: 'child',
                  subjects: child.assignedTeacher.subjects,
                  assignedAt: child.assignedTeacher.assignedAt
                }
              }
            },
            { session }
          )
        }

        // 5. Update assessment references
        await ChildAssessment.updateMany(
          { childId: child._id },
          { $set: { studentId: newUser[0]._id } },
          { session }
        )

        await session.commitTransaction()

        // 6. Store migration credentials for parent notification
        await storeMigrationCredentials({
          parentId: child.parent._id,
          childId: child._id,
          newUserId: newUser[0]._id,
          username,
          tempPassword
        })

        console.log(`Migrated child: ${child.name}`)
      } catch (error) {
        await session.abortTransaction()
        console.error(`Failed to migrate child ${child.name}:`, error)
      } finally {
        session.endSession()
      }
    }

    console.log('Migration completed')
  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    await disconnect()
  }
}

// Run migration
migrateChildren()
