import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Child } from "@/models/child";

export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find all children where parent ID matches the logged-in user
    const children = await Child.find(
      { parentId: session.user.id },
      'name dateOfBirth grade' // Only select necessary fields
    ).sort({ name: 1 }); // Sort alphabetically

    return NextResponse.json(children);

  } catch (error) {
    console.error("[MY_CHILDREN_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch children" },
      { status: 500 }
    );
  }
}
