import { createMocks } from 'node-mocks-http'
import { POST } from '@/app/api/assessments/route'
import { TeacherAssessment } from '@/models/assessment'
import { connectTestDB, disconnectTestDB, clearTestDB } from '@/lib/test-utils'
import mongoose from 'mongoose'

// Mock auth module
jest.mock('@/lib/auth', () => require('../mocks/auth').default)

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(() => Promise.resolve({
    user: { id: 'test-teacher-id', role: 'teacher' }
  }))
}))

describe('Teacher Assessment API', () => {
  beforeAll(async () => {
    await connectTestDB()
  })

  afterEach(async () => {
    await clearTestDB()
  })

  afterAll(async () => {
    await disconnectTestDB()
  })

  it('should create assessment with studentId', async () => {
    const mockData = {
      title: 'Test Assessment',
      description: 'Test Description',
      type: 'quiz',
      studentId: new mongoose.Types.ObjectId().toString(),
      subject: 'stem-math',
      status: 'active',
      dueDate: new Date().toISOString(),
      questions: [{
        id: '1',
        type: 'text',
        question: 'Test Question',
        points: 10
      }]
    }

    const { req } = createMocks({
      method: 'POST',
      body: mockData
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.studentId).toBe(mockData.studentId)
  })

  // ...rest of tests...
})
