import mongoose, { Schema, model, models } from 'mongoose'

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: String,
  username: { type: String, unique: true, sparse: true },
  role: { 
    type: String, 
    enum: ['student', 'teacher', 'parent', 'admin'], 
    required: true 
  },
  image: String,
  emailVerified: Date
}, {
  timestamps: true
})

export const User = models.User || model('User', userSchema)

export type UserDocument = mongoose.Document & {
  name: string
  email: string
  password?: string
  username?: string
  role: 'student' | 'teacher' | 'parent' | 'admin'
  image?: string
  emailVerified?: Date
}

// No default export, only named exports
