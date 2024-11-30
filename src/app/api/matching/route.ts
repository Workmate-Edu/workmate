import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/user.model";
import { TeacherMatcher } from "@/lib/matching/matcher";
import { analyzeLearningStyle } from "@/lib/matching/learning-style";
import type { MatchPreferences, Teacher } from "@/lib/matching/types";

export async function POST(req: Request) {
  try {
    await connectDB();
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (session.user.role !== "student") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await req.json();
    const { preferences, learningStyleAnswers } = body;

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

    if (!teachers.length) {
      return NextResponse.json({
        matches: [],
        learningStyle,
      });
    }

    // Find matches
    const matches = await TeacherMatcher.findMatches(
      teachers as unknown as Teacher[],
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

        if (!teacher) {
          return null;
        }

        return {
          ...match,
          teacher: {
            id: teacher._id,
            name: teacher.name,
            bio: teacher.bio,
            subjects: teacher.subjects,
            experience: teacher.teachingExperience,
            hourlyRate: teacher.hourlyRate,
            averageRating: teacher.ratings && teacher.ratings.length > 0
              ? teacher.ratings.reduce((a, b) => a + b, 0) / teacher.ratings.length
              : null,
          },
        };
      })
    );

    // Filter out any null matches
    const validMatches = topMatches.filter((match): match is NonNullable<typeof match> => match !== null);

    return NextResponse.json({
      matches: validMatches,
      learningStyle,
    });
  } catch (error) {
    console.error("[MATCHING_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
