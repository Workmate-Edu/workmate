import mongoose, { Schema } from 'mongoose';

const teachingMaterialSchema = new Schema({
  teacherId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  url: {
    type: String,
    required: true
  },
  format: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  subjects: [{
    id: String,
    name: String,
    area: String
  }],
  isGeneral: {
    type: Boolean,
    default: false
  },
  publicId: String
}, {
  timestamps: true
})

export const TeachingMaterial = mongoose.models.TeachingMaterial || 
  mongoose.model('TeachingMaterial', teachingMaterialSchema)
