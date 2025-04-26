import { User } from "@/models/user"
import { Child } from "@/models/child"
import { InitialAssessment } from "@/models/initial-assessment"
import { ChildAssessment } from "@/models/child-assessment"
import mongoose from "mongoose"

const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

async function executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (error.code === 112 || error.errorLabels?.has('TransientTransactionError')) {
        if (attempt < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
          continue;
        }
      }
      throw error;
    }
  }
  throw lastError;
}

interface AssessmentSubmission {
  type: 'initial' | 'child'
  studentId?: string
  childId?: string
  subject?: {
    name: string
    area: string
  }
  responses: Array<{
    category: string
    questions: Array<{
      questionId: string
      question: string
      answer: string | string[]
      notes?: string
    }>
  }>
}

export async function submitAssessment(params: {
  type: 'initial' | 'parent_questionnaire'
  studentId?: string
  parentId?: string
  subject?: {
    name: string
    area: string
  }
  responses: Array<{
    category: string
    questions: Array<{
      questionId: string
      question: string
      answer: string | string[] // Update type to allow arrays
      notes?: string
    }>
  }>
}) {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const { type, studentId, parentId, subject, responses } = params;

    if (type === 'initial') {
      if (!studentId || !subject?.name || !subject?.area) {
        throw new Error('Missing required fields for initial assessment');
      }

      const assessment = await InitialAssessment.create([{
        type: 'initial',
        studentId,
        subject: {
          name: subject.name,
          area: subject.area
        },
        responses,
        status: 'pending',
        submittedAt: new Date()
      }], { session })

      // Update user's learnerProfile
      await User.findByIdAndUpdate(
        studentId,
        {
          $set: {
            'learnerProfile.assessmentStatus': 'pending',
            'learnerProfile.assessments': [{
              type: 'initial',
              assessmentId: assessment[0]._id,
              assessmentType: 'InitialAssessment',
              status: 'pending',
              submittedAt: new Date()
            }]
          }
        },
        { session }
      )

      await session.commitTransaction()
      return { assessmentId: assessment[0]._id }
    }

    if (type === 'parent_questionnaire') {
      // Create assessment record
      const assessment = await ChildAssessment.create([{
        type: 'parent_questionnaire',
        childId: studentId,
        parentId,
        responses: responses.map(section => ({
          ...section,
          questions: section.questions.map(q => ({
            ...q,
            answer: Array.isArray(q.answer) ? q.answer : q.answer
          }))
        })),
        status: 'pending',
        submittedAt: new Date()
      }], { session });

      // Update user's profile
      await User.findByIdAndUpdate(
        studentId,
        {
          $set: {
            'learnerProfile.assessmentStatus': 'pending'
          },
          $push: {
            'learnerProfile.assessments': {
              type: 'parent_questionnaire',
              assessmentId: assessment[0]._id,
              assessmentType: 'ChildAssessment',
              status: 'pending',
              submittedAt: new Date()
            }
          }
        },
        { session, new: true }
      );

      await session.commitTransaction();
      return { assessmentId: assessment[0]._id };
    }

    throw new Error('Invalid assessment type');
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}

export async function getAssessmentDetails(id: string, type: 'initial' | 'child') {
  const Model = type === 'initial' ? InitialAssessment : ChildAssessment
  
  const assessment = await Model.findById(id)
    .populate(type === 'initial' ? 'studentId' : 'childId')
    .populate('assignedTeacher.teacherId')
    .lean()

  return assessment
}

export async function syncChildAssessmentStatus(childId: string) {
  try {
    // Check if any assessment exists for this child
    const assessment = await ChildAssessment.findOne({
      childId,
      status: { $in: ['pending', 'assigned'] }
    }).lean()

    // Update child status based on assessment existence
    await Child.findByIdAndUpdate(childId, {
      $set: {
        assessmentStatus: assessment ? assessment.status : 'none',
        assessmentProgress: {
          statusHistory: [{
            status: assessment ? assessment.status : 'none',
            updatedAt: new Date(),
            notes: assessment ? 'Assessment status synced' : 'Assessment reset to none'
          }]
        }
      }
    })

    return true
  } catch (error) {
    console.error('[SYNC_ASSESSMENT_STATUS_ERROR]', error)
    throw error
  }
}

export async function syncAssessmentStatus(userId: string, type: 'student' | 'child') {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const AssessmentModel = type === 'student' ? InitialAssessment : ChildAssessment
    const latestAssessment = await AssessmentModel.findOne({
      [type === 'student' ? 'studentId' : 'childId']: userId
    }).sort({ createdAt: -1 }).lean()

    await User.findByIdAndUpdate(userId, {
      $set: {
        'learnerProfile.assessmentStatus': latestAssessment ? latestAssessment.status : 'none',
        'learnerProfile.assessments': latestAssessment ? [{
          type: type === 'student' ? 'initial' : 'parent_questionnaire',
          assessmentId: latestAssessment._id,
          assessmentType: type === 'student' ? 'InitialAssessment' : 'ChildAssessment',
          status: latestAssessment.status,
          submittedAt: latestAssessment.submittedAt
        }] : []
      }
    }, { session })

    await session.commitTransaction()
    return true
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}
