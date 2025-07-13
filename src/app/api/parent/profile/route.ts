// app/api/parent/profile/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/user";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "parent") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  // select the entire parentProfile subdoc
  const parent = await User.findById(session.user.id)
    .select("name email username phone parentProfile children")
    .lean();

  if (!parent) {
    return NextResponse.json({ error: "Parent not found" }, { status: 404 });
  }

  return NextResponse.json(parent);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "parent") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, phone, parentProfile } = body;

  // basic validation
  if (!phone) {
    return NextResponse.json(
      { error: "Missing required fields", details: { phone: !!phone } },
      { status: 400 }
    );
  }

  await connectDB();

  // build update object
  const updateData: any = {
    name,
    phone,
    // overwrite each key in the subdoc
    "parentProfile.interestedInLearning": !!parentProfile.interestedInLearning,
    "parentProfile.educationLevel": parentProfile.educationLevel || "",
    "parentProfile.subjects": Array.isArray(parentProfile.subjects)
      ? parentProfile.subjects
      : [],
    // you can also update children if needed here
    "parentProfile.children": Array.isArray(parentProfile.children)
      ? parentProfile.children
      : [],
    "parentProfile.lastUpdated": new Date(),
  };

  const updated = await User.findByIdAndUpdate(
    session.user.id,
    { $set: updateData },
    { new: true }
  )
    .select("name email username phone parentProfile children")
    .lean();

  if (!updated) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  console.log("Parent profile updated:", {
    parentId: session.user.id,
    timestamp: new Date(),
  });

  return NextResponse.json({
    success: true,
    message: "Profile updated successfully",
    parent: updated,
  });
}
