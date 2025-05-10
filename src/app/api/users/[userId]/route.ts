import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/user";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectDB();

    const user = await User.findById(params.userId)
      .select('name email role studentProfile parentId')
      .populate('parentId', 'name email role')
      .lean();

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const transformedUser = {
      ...user,
      type: user.parentId ? 'child' : 'independent',
      parent: user.parentId ? {
        _id: user.parentId._id,
        name: user.parentId.name,
        email: user.parentId.email
      } : null
    };

    return NextResponse.json(transformedUser);
  } catch (error) {
    console.error("Error fetching user:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
