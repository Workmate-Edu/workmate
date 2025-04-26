import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/user";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 'teacher') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get student and populate parent info
    const student = await User.findById(params.userId)
      .select('studentProfile')
      .populate('studentProfile.parent', '_id name email')
      .lean();

    if (!student?.studentProfile?.parent) {
      return NextResponse.json(null);
    }

    return NextResponse.json(student.studentProfile.parent);

  } catch (error) {
    console.error("[GET_PARENT_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch parent" },
      { status: 500 }
    );
  }
}
