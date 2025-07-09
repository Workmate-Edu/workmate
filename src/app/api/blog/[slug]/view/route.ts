// /app/api/blog/[slug]/view/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { BlogPost } from "@/models/blog-post";
import mongoose from "mongoose";

export async function PUT(req: Request, { params }: { params: { slug: string } }) {
  await connectDB();

  const slug = params.slug?.toString();
  if (!slug) {
    return NextResponse.json({ error: "No slug provided" }, { status: 400 });
  }

  let post = await BlogPost.findOneAndUpdate(
    { slug },
    { $inc: { viewCount: 1 } },
    { new: true }
  );

  // If not found by slug, try by ObjectId (fallback)
  if (!post && mongoose.Types.ObjectId.isValid(slug)) {
    post = await BlogPost.findByIdAndUpdate(
      slug,
      { $inc: { viewCount: 1 } },
      { new: true }
    );
  }

  if (!post) {
    return NextResponse.json({ error: "Blog not found" }, { status: 404 });
  }

  return NextResponse.json({ viewCount: post.viewCount || 0 });
}
