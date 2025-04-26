import { TeachingRelationship } from "@/models/teaching-relationship"
import mongoose from "mongoose"

export async function assignTeacher({
  teacherId,
  targetId,
  targetType,
  assessmentId,
  subject
}: AssignmentParams) {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const relationshipData = {
      teacherId,
      [targetType === 'independent' ? 'studentId' : 'childId']: targetId,
      subjects: [{
        name: subject.name,
        area: subject.area,
        assignedAt: new Date()
      }],
      status: 'active',
      assessmentId
    }

    await TeachingRelationship.create([relationshipData], { session })
    
    // Update assessment status
    if (assessmentId) {
      // ...update assessment logic
    }

    await session.commitTransaction()
    return { success: true }
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}
