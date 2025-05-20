import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/user";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectDB();

    const user = await User.findById(params.userId)
      // we only need the basics + studentProfile
      .select("name email role studentProfile")
      // and populate the embedded parent reference
      .populate("studentProfile.parent", "name email role")
      .lean();

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Pull out the populated parent (if any)
    const parentDoc = (user.studentProfile as any)?.parent;
    const transformedUser = {
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
      // mark child vs independent
      type:  user.studentProfile?.registeredAs === "child"
             ? "child"
             : "independent",
      parent: parentDoc
        ? {
            _id:   parentDoc._id,
            name:  parentDoc.name,
            email: parentDoc.email,
            role:  parentDoc.role,
          }
        : null
    };

    return NextResponse.json(transformedUser);
  } catch (error) {
    console.error("[USER_FETCH_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
