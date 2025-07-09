import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { BlogPost } from "@/models/blog-post";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Types } from "mongoose";


// GET blog posts
export async function GET(req: Request) {
  await connectDB();
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const mine = url.searchParams.get("mine");

  let filter: any = {};
  if (status) filter.status = status;

  if (mine === "1") {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json([], { status: 401 });
    filter.author = session.user.id;
  }

  const posts = await BlogPost.find(filter)
    .sort({ createdAt: -1 })
    .populate('author', 'name')
    .populate('comments.user', 'name'); // <-- ADD THIS LINE

  return NextResponse.json(posts);
}

// CREATE blog post
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const {
      title,
      subtitle = "",
      content,
      image = "",
      imageCredit = "",
      category = [],
      tags = [],
      status
    } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required." }, { status: 400 });
    }

    const categoryArr: string[] = Array.isArray(category)
      ? category
      : typeof category === "string" && category.trim()
        ? [category.trim()]
        : [];

    const tagsArr: string[] = Array.isArray(tags)
      ? tags
      : typeof tags === "string" && tags.trim()
        ? [tags.trim()]
        : [];

    // Generate slug and ensure uniqueness
    let baseSlug = title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .substring(0, 100);

    await connectDB();

    // Check for existing slug and append a number if needed
    let slug = baseSlug;
    let count = 1;
    while (await BlogPost.findOne({ slug })) {
      slug = `${baseSlug}-${count++}`;
    }

    const newPost = await BlogPost.create({
      title,
      subtitle,
      content,
      slug,
      image,
      imageCredit,
      category: categoryArr,
      tags: tagsArr,
      author: session.user.id,
      status: status === "draft" ? "draft" : "published",
      viewCount: 0
    });

    return NextResponse.json(newPost);
  } catch (error: any) {
    // Handle duplicate key error for slug
    if (error?.code === 11000 && error?.keyPattern?.slug) {
      return NextResponse.json(
        { error: "A blog post with this title already exists. Please use a different title." },
        { status: 409 }
      );
    }
    console.error("Error creating blog post:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while creating the blog post." },
      { status: 500 }
    );
  }
}


export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id || !Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid blog id" }, { status: 400 });
    }
    await connectDB();
    const post = await BlogPost.findById(id);
    if (!post) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }
    if (post.author.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await BlogPost.deleteOne({ _id: id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while deleting the blog post." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const { id, ...updateFields } = body;
    if (!id || !Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid blog id" }, { status: 400 });
    }
    await connectDB();
    const post = await BlogPost.findById(id);
    if (!post) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }
    if (post.author.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    // Only allow updating certain fields
    const allowedFields = [
      "title", "subtitle", "content", "image", "imageCredit", "category", "tags", "status"
    ];
    for (const key of Object.keys(updateFields)) {
      if (allowedFields.includes(key)) {
        post[key] = updateFields[key];
      }
    }
    await post.save();
    return NextResponse.json(post);
  } catch (error) {
    console.error("Error updating blog post:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while updating the blog post." },
      { status: 500 }
    );
  }
}
