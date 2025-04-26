import mongoose from 'mongoose';
import { InitialAssessment } from '@/models/initial-assessment';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('InitialAssessment Model', () => {
  it('should create an initial assessment with valid data', async () => {
    const validAssessmentData = {
      type: 'initial',
      studentId: new mongoose.Types.ObjectId(),
      subject: {
        name: 'Math',
        area: 'stem',
        level: 'beginner'
      },
      responses: [{
        category: 'proficiency',
        questions: [{
          questionId: '1',
          question: 'How would you rate your math skills?',
          answer: 'intermediate'
        }]
      }],
      previousExperience: {
        level: 'beginner',
        duration: '1 year',
        certificates: ['Basic Math']
      },
      studyPreferences: {
        preferredTimes: ['morning'],
        weeklyCommitment: 5,
        learningGoals: ['master_fundamentals']
      }
    };

    const assessment = new InitialAssessment(validAssessmentData);
    const savedAssessment = await assessment.save();

    expect(savedAssessment.type).toBe('initial');
    expect(savedAssessment.status).toBe('pending');
    expect(savedAssessment.responses).toHaveLength(1);
  });

  it('should fail to create assessment without required fields', async () => {
    const invalidAssessmentData = {
      type: 'initial'
      // missing required fields
    };

    const assessment = new InitialAssessment(invalidAssessmentData);
    await expect(assessment.save()).rejects.toThrow();
  });

  it('should update assessment status through workflow', async () => {
    const assessment = new InitialAssessment({
      type: 'initial',
      studentId: new mongoose.Types.ObjectId(),
      subject: {
        name: 'Math',
        area: 'stem'
      }
    });

    await assessment.save();
    expect(assessment.status).toBe('pending');

    assessment.status = 'assigned';
    await assessment.save();
    expect(assessment.status).toBe('assigned');

    assessment.status = 'completed';
    await assessment.save();
    expect(assessment.status).toBe('completed');
  });

  it('should assign a teacher correctly', async () => {
    const assessment = new InitialAssessment({
      type: 'initial',
      studentId: new mongoose.Types.ObjectId(),
      subject: {
        name: 'Math',
        area: 'stem'
      }
    });

    await assessment.save();

    const teacherId = new mongoose.Types.ObjectId();
    const adminId = new mongoose.Types.ObjectId();

    assessment.assignedTeacher = {
      teacherId,
      assignedAt: new Date(),
      assignedBy: adminId
    };
    assessment.status = 'assigned';

    await assessment.save();

    expect(assessment.assignedTeacher.teacherId).toEqual(teacherId);
    expect(assessment.status).toBe('assigned');
  });
});