import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/user";

export async function GET(request: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teachers = await User.find(
      { role: 'teacher' },
      '_id name email assignedStudents'
    ).lean();

    const formattedTeachers = teachers.map(teacher => ({
      _id: teacher._id.toString(),
      userId: teacher._id.toString(),
      name: teacher.name,
      email: teacher.email,
      assignedStudents: teacher.assignedStudents?.map(String) || []
    }));

    return NextResponse.json(formattedTeachers);

  } catch (error) {
    console.error("[TEACHERS_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch teachers" },
      { status: 500 }
    );
  }
}
