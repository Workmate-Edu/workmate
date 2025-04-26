import mongoose, { Schema } from 'mongoose';
import { User } from "@/models/user"

const teacherRelationshipSchema = new Schema({
  teacherId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User', // All students are in User model
    required: true
  },
  studentType: {
    type: String,
    enum: ['independent', 'child'],
    required: true
  },
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: function() { return this.studentType === 'child' }
  },
  subjects: [{
    name: String,
    area: String
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active'
  },
  startDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const TeacherRelationship = mongoose.models.TeacherRelationship || 
  mongoose.model('TeacherRelationship', teacherRelationshipSchema);

  

export async function establishTeachingRelationship({ 
  teacherId, 
  studentId,
  parentId,
  studentType,
  subjects,
  status = 'active'
}: {
  teacherId: string;
  studentId: string;
  parentId?: string;
  studentType: 'independent' | 'child';
  subjects: Array<{ name: string; area: string }>;
  status?: string;
}) {
  if (!teacherId || !studentId || !subjects?.length || !studentType) {
    throw new Error('Missing required fields for teaching relationship');
  }

  if (studentType === 'child' && !parentId) {
    throw new Error('Parent ID required for child students');
  }

  // Optional: Avoid duplicate for exact same subject-teacher-student
  const existing = await TeacherRelationship.findOne({
    teacherId,
    studentId,
    'subjects.name': { $in: subjects.map(s => s.name) }
  });

  if (existing) {
    // You may either return or allow new assignment for new subjects
    return existing;
  }

  return await TeacherRelationship.create({
    teacherId,
    studentId,
    parentId,
    studentType,
    subjects,
    status,
    startDate: new Date()
  });
}

export async function updateRelationshipStatus(relationshipId: string, {
  newStatus,
  updatedBy,
  note
}: {
  newStatus: 'active' | 'inactive' | 'completed'
  updatedBy: string
  note?: string
}) {
  const now = new Date()
  const updateData = {
    status: newStatus,
    'history': {
      status: newStatus,
      updatedAt: now,
      updatedBy,
      note: note || `Status updated to ${newStatus}`
    }
  }

  await Promise.all([
    User.updateMany(
      { 'studentProfile.teacherRelationship.relationshipId': relationshipId },
      { $set: { 'studentProfile.teacherRelationship.status': newStatus },
        $push: { 'studentProfile.teacherRelationship.history': updateData.history }
      }
    ),
    User.updateMany(
      { 'teacherProfile.studentRelationships.relationshipId': relationshipId },
      { $set: { 'teacherProfile.studentRelationships.$.status': newStatus },
        $push: { 'teacherProfile.studentRelationships.$.history': updateData.history }
      }
    )
  ])

  return true
}
