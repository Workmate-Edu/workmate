import { connectDB } from "@/lib/mongodb";
import { BlogPost } from "@/models/blog-post";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET blog by slug (or by ID if valid ObjectId)
export async function GET(req: Request, { params }: { params: { slug: string } }) {
  await connectDB();
  const slug = params.slug?.toString();
  if (!slug) return NextResponse.json({ error: "No slug provided" }, { status: 400 });

  // Do NOT increment viewCount here, only fetch the blog
  let post = await BlogPost.findOne({ slug })
    .populate('author', 'name')
    .populate('comments.user', 'name');

  if (!post && mongoose.Types.ObjectId.isValid(slug) && slug.length === 24) {
    post = await BlogPost.findById(slug)
      .populate('author', 'name')
      .populate('comments.user', 'name');
  }

  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(post);
}

// PUT update blog by slug (author only)
export async function PUT(req: Request, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const update = await req.json();
  await connectDB();

  // Accept both slug and ObjectId for legacy/compat
  let post = await BlogPost.findOne({ slug: params.slug, author: session.user.id });
  if (!post && mongoose.Types.ObjectId.isValid(params.slug) && params.slug.length === 24) {
    post = await BlogPost.findOne({ _id: params.slug, author: session.user.id });
  }
  if (!post) {
    return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });
  }

  // Only update allowed fields
  const allowedFields = [
    "title", "subtitle", "content", "image", "imageCredit", "category", "tags", "status"
  ];
  for (const key of allowedFields) {
    if (key in update) post[key] = update[key];
  }
  await post.save();

  return NextResponse.json(post);
}

// DELETE blog by slug (author only)
export async function DELETE(req: Request, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  let post = await BlogPost.findOneAndDelete({ slug: params.slug, author: session.user.id });
  if (!post && mongoose.Types.ObjectId.isValid(params.slug) && params.slug.length === 24) {
    post = await BlogPost.findOneAndDelete({ _id: params.slug, author: session.user.id });
  }

  if (!post) {
    return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
