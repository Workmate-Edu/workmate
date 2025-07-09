import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/user";
import { ChildAssessment } from "@/models/child-assessment";

export async function GET(
  req: Request,
  { params }: { params: { childId: string } }
) {
  try {
    await connectDB();

    const child = await User.findById(params.childId)
      .populate('studentProfile.assignedTeachers.teacherId', 'name email')
      .lean();

    if (!child) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    // Get all subjects with progress from studentProfile.subjects
    const allSubjects = child.studentProfile.subjects.map(subject => ({
      name: subject.name,
      area: subject.area,
      progress: subject.progress || 0  // Get actual progress
    }));

    // Get active courses with progress from studentProfile.subjects
    const activeCourses = child.studentProfile.assignedTeachers?.flatMap(assignment => 
      assignment.subjects.map(subject => {
        // Find matching subject in studentProfile.subjects to get progress
        const matchingSubject = child.studentProfile.subjects.find(
          s => s.name.toLowerCase() === subject.name.toLowerCase() && 
               s.area.toLowerCase() === subject.area.toLowerCase()
        );

        return {
          name: subject.name,
          area: subject.area,
          progress: matchingSubject?.progress || 0,  // Get actual progress
          teacher: {
            id: assignment.teacherId._id,
            name: assignment.teacherId.name,
            email: assignment.teacherId.email
          }
        };
      })
    ) || [];

    return NextResponse.json({
      child: {
        id: child._id,
        name: child.name,
        email: child.email,
        username: child.username,
        grade: child.studentProfile?.grade,
        gender: child.gender,
        allSubjects,
        activeCourses
      }
    });

  } catch (error) {
    console.error('[CHILD_GET_ERROR]', error);
    return NextResponse.json({ error: "Failed to fetch child" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { childId: string } }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const child = await Child.findOneAndDelete({
      _id: params.childId,
      parent: session.user.id
    });

    if (!child) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    // Remove child reference from parent's children array
    await User.findByIdAndUpdate(session.user.id, {
      $pull: { 'parentProfile.children': params.childId }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("[CHILD_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { childId: string } }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, gender, educationLevel, grade, ageGroup, subjects } = await req.json();

    const updatedChild = await Child.findOneAndUpdate(
      { _id: params.childId, parent: session.user.id },
      {
        $set: {
          name,
          gender,
          educationLevel,
          grade,
          ageGroup,
          subjects: subjects.map((subject: { area: string, name: string }) => ({
            area: subject.area,
            name: subject.name,
            progress: 0 // Set initial progress
          }))
        }
      },
      { new: true }
    ).lean();

    if (!updatedChild) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    // Transform the response
    const transformedChild = {
      ...updatedChild,
      id: updatedChild._id,
      subjects: updatedChild.subjects.map(subject => ({
        area: subject.area,
        name: subject.name,
        progress: subject.progress || 0
      }))
    };

    return NextResponse.json({ 
      success: true,
      child: transformedChild
    });

  } catch (error) {
    console.error("[CHILD_UPDATE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
