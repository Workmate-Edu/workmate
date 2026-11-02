import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/user";
import { ChildAssessment } from "@/models/child-assessment";
import { parentOnboardingSchema } from '@/lib/parent-onboarding';
import bcrypt from "bcryptjs";

// 👉 GET handler to fetch parent's children
export async function GET(req: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parent = await User.findById(session.user.id)
      .select('parentProfile.children parentProfile.onboarding')
      .populate({
        path: "parentProfile.children",
        model: "User",
        select: "name username email image studentProfile gender role"
      })
      .lean() as { parentProfile: { children: any[] } | undefined };

    const children = parent?.parentProfile?.children?.map((child: any) => ({
      id: child._id,
      name: child.name,
      username: child.username,
      email: child.email,
      image: child.image,
      gender: child.gender,
      grade: child.studentProfile?.grade,
      subjects: child.studentProfile?.subjects || [],
    })) || [];

    // Fetch assessment status for each child
    const childrenWithAssessments = await Promise.all(
      children.map(async (child) => {
        const assessment = await ChildAssessment.findOne({ 
          childId: child.id,
          type: 'parent_questionnaire'
        }).select('status').lean();

        return {
          ...child,
          assessmentStatus: {
            exists: !!assessment,
            status: assessment?.status || 'none',
            canCreate: !assessment || assessment.status === 'none',
            canEdit: assessment?.status === 'pending'
          }
        };
      })
    );

    // Learners added during parent signup belong to the learning plan; they are
    // not child login accounts. Surface them here without fabricating or linking
    // a student User document by name.
    const onboarding = parentOnboardingSchema.safeParse(parent?.parentProfile?.onboarding);
    const learningPlanLearners = onboarding.success ? onboarding.data.learners
      .filter(learner => Boolean(learner.learnerId))
      .map(learner => ({
        id: learner.learnerId!,
        name: learner.name,
        grade: learner.level,
        ageGroup: learner.ageGroup,
        subjects: learner.subjects.map(name => ({ name, progress: 0 })),
        source: 'learning-plan' as const,
        assessmentStatus: { exists: false, status: 'none', canCreate: false, canEdit: false },
      })) : [];

    return NextResponse.json({ children: [...childrenWithAssessments, ...learningPlanLearners] });
  } catch (error) {
    console.error("[CHILDREN_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// 👉 POST handler to add a new child
export async function POST(req: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      name,
      username,
      password,
      phone,
      gender,
      educationLevel,
      grade,
      ageGroup,
      subjects,
      image
    } = await req.json();

    if (!name || !username || !password || !phone || !gender || !educationLevel || !grade || !ageGroup || !subjects?.length) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    if (image !== undefined && image !== '' && (typeof image !== 'string' || !image.startsWith('https://'))) {
      return NextResponse.json({ error: 'Choose a valid profile image' }, { status: 400 });
    }

    // Validate phone number
    if (!phone.startsWith('+')) {
      return NextResponse.json({ error: "Phone number must include country code" }, { status: 400 });
    }

    const normalizedUsername = username.toLowerCase();
    const generatedEmail = `${normalizedUsername}@workmateteam.com`;

    const existingUser = await User.findOne({ $or: [{ username: normalizedUsername }, { email: generatedEmail }] });
    if (existingUser) {
      return NextResponse.json({ error: "Username or email already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const childUser = await User.create({
      name,
      username: normalizedUsername,
      email: generatedEmail,
      password: hashedPassword,
      phone, // Add phone number
      ...(image ? { image } : {}),
      role: "student",
      gender,
      emailVerified: true,
      studentProfile: {
        registeredAs: "child",
        parent: session.user.id,
        grade,
        phone, // Add phone to student profile
        subjects: subjects.map((s: any) => ({
          name: s.name,
          area: s.area,
          progress: 0
        }))
      }
    });

    await User.findByIdAndUpdate(session.user.id, {
      $push: { "parentProfile.children": childUser._id }
    });

    return NextResponse.json({
      success: true,
      child: {
        id: childUser._id,
        name: childUser.name,
        username: childUser.username,
        email: childUser.email,
        grade,
        gender,
        educationLevel,
        ...(image ? { image } : {})
      }
    });

  } catch (error) {
    console.error("[ADD_CHILD_STUDENT_ERROR]", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Internal server error"
    }, { status: 500 });
  }
}
