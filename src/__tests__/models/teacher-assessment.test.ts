import mongoose from 'mongoose';
import { TeacherAssessment } from '@/models/assessment';
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

describe('TeacherAssessment Model', () => {
  it('should create a teacher assessment with valid data', async () => {
    const validAssessmentData = {
      title: 'Math Quiz',
      description: 'Basic arithmetic test',
      type: 'quiz',
      subject: 'Math',
      teacherId: new mongoose.Types.ObjectId(),
      studentId: new mongoose.Types.ObjectId(), // Add required studentId
      dueDate: new Date(),
      questions: [{
        id: '1',
        type: 'multiple_choice',
        question: 'What is 2 + 2?',
        options: ['3', '4', '5', '6'],
        points: 10
      }],
      points: 10
    };

    const assessment = new TeacherAssessment(validAssessmentData);
    const savedAssessment = await assessment.save();

    expect(savedAssessment.title).toBe(validAssessmentData.title);
    expect(savedAssessment.status).toBe('draft'); // default status
    expect(savedAssessment.questions).toHaveLength(1);
  });

  it('should fail to create assessment without required fields', async () => {
    const invalidAssessmentData = {
      title: 'Math Quiz'
      // missing required fields
    };

    const assessment = new TeacherAssessment(invalidAssessmentData);
    
    await expect(assessment.save()).rejects.toThrow();
  });

  it('should update assessment status correctly', async () => {
    const assessment = new TeacherAssessment({
      title: 'Math Quiz',
      description: 'Basic arithmetic test',
      type: 'quiz',
      subject: 'Math',
      teacherId: new mongoose.Types.ObjectId(),
      studentId: new mongoose.Types.ObjectId(), // Add required studentId
      dueDate: new Date(),
      points: 10
    });

    await assessment.save();
    
    // Test each valid status transition
    assessment.status = 'active';
    await assessment.save();
    expect(assessment.status).toBe('active');

    assessment.status = 'submitted';
    await assessment.save();
    expect(assessment.status).toBe('submitted');

    assessment.status = 'graded';
    await assessment.save();
    expect(assessment.status).toBe('graded');
  });

  it('should validate assessment type', async () => {
    const assessment = new TeacherAssessment({
      title: 'Math Quiz',
      description: 'Basic arithmetic test',
      type: 'invalid_type', // invalid type
      subject: 'Math',
      teacherId: new mongoose.Types.ObjectId(),
      dueDate: new Date(),
      points: 10
    });

    await expect(assessment.save()).rejects.toThrow();
  });
});