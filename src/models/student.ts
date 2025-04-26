import { Schema, model, models } from 'mongoose'

const studentSchema = new Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  subjects: [{
    _id: { type: String, required: true },
    name: String,    // e.g. 'Algebra', 'Geometry'
    area: String,    // e.g. 'Math', 'Science'
    teacher: { type: Schema.Types.ObjectId, ref: 'User' },
    isTeaching: { type: Boolean, default: true }
  }]
}, {
  timestamps: true
})

export const Student = models.Student || model('Student', studentSchema)
