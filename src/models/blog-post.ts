import mongoose, { Schema } from 'mongoose';

// Nested schema for comments
const commentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

// Blog post schema
const blogPostSchema = new Schema({
  title: { type: String, required: true },
  subtitle: { type: String, default: "" },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ["draft", "published"], default: "published" },
  image: { type: String, default: "" },
  imageCredit: { type: String, default: "" },
  category: { type: [String], default: [] },
  tags: { type: [String], default: [] },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  comments: { type: [commentSchema], default: [] },
  viewCount: { type: Number, default: 0 }
}, { timestamps: true });

export const BlogPost = mongoose.models.BlogPost || mongoose.model('BlogPost', blogPostSchema);
