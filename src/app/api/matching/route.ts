import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/user.model";
import { TeacherMatcher } from "@/lib/matching/matcher";
import { analyzeLearningStyle } from "@/lib/matching/learning-style";
import type { MatchPreferences } from "@/lib/matching/types";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (session.user.role !== "student") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await req.json();
    const { preferences, learningStyleAnswers } = body;

    await connectDB();

    // Get student's learning style
    const learningStyle = analyzeLearningStyle(learningStyleAnswers);

    // Find all available teachers
    const teachers = await User.find({
      role: "teacher",
      emailVerified: true,
      // Add any other required teacher criteria
    }).select([
      "subjects",
      "availability",
      "teachingExperience",
      "ratings",
      "hourlyRate",
      "teachingStyle",
      "languages",
      "specializations",
    ]);

    // Find matches
    const matches = await TeacherMatcher.findMatches(
      teachers,
      preferences as MatchPreferences,
      learningStyle
    );

    // Get top 10 matches with teacher details
    const topMatches = await Promise.all(
      matches.slice(0, 10).map(async (match) => {
        const teacher = await User.findById(match.teacherId).select([
          "name",
          "bio",
          "subjects",
          "teachingExperience",
          "hourlyRate",
          "ratings",
        ]);

        return {
          ...match,
          teacher: {
            id: teacher._id,
            name: teacher.name,
            bio: teacher.bio,
            subjects: teacher.subjects,
            experience: teacher.teachingExperience,
            hourlyRate: teacher.hourlyRate,
            averageRating:
              teacher.ratings.length > 0
                ? teacher.ratings.reduce((a, b) => a + b, 0) / teacher.ratings.length
                : null,
          },
        };
      })
    );

    return NextResponse.json({
      matches: topMatches,
      learningStyle,
    });
  } catch (error) {
    console.error("[MATCHING_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
