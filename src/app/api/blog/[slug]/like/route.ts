import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { BlogPost } from "@/models/blog-post";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const post = await BlogPost.findOne({ slug: params.slug });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const userId = session.user.id;
  const liked = post.likes.includes(userId);
  if (liked) {
    post.likes.pull(userId);
  } else {
    post.likes.push(userId);
  }
  await post.save();
  return NextResponse.json({ liked: !liked, likes: post.likes.length });
}
