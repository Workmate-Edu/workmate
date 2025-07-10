import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { BlogPost } from "@/models/blog-post";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { content } = await req.json();
  if (!content) return NextResponse.json({ error: "Content required" }, { status: 400 });
  await connectDB();
  const post = await BlogPost.findOne({ slug: params.slug });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  post.comments.push({ user: session.user.id, content });
  await post.save();
  return NextResponse.json({ success: true });
}
