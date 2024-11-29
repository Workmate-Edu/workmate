import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'parent'],
    required: [true, 'Please specify a role'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // Fields specific to parents
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  // Fields specific to students
  teachers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  // Fields specific to teachers
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  classes: [{
    name: String,
    description: String,
    schedule: String,
  }],
});

export default mongoose.models.User || mongoose.model('User', userSchema);
