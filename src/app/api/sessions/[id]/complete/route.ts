// src/app/api/sessions/[id]/complete/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TeachingSession } from "@/models/teaching-session";
import { User } from "@/models/user";
import sendEmail from "@/lib/sendSmtpMail";
import { Earning } from "@/models/earning";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  console.log(`[COMPLETE_SESSION] Called for sessionId: ${params.id}`);

  // 1) Auth
  const sess = await getServerSession(authOptions);
  if (!sess?.user) {
    console.log("[COMPLETE_SESSION] Unauthorized");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!["admin", "teacher"].includes(sess.user.role)) {
    console.log(`[COMPLETE_SESSION] Forbidden for role ${sess.user.role}`);
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // 2) Fetch the session
    const sessionDoc = await TeachingSession.findById(params.id).lean();
    if (!sessionDoc) {
      console.log("[COMPLETE_SESSION] Not found");
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (sess.user.role === "teacher" &&
        (!sess.user.id || String(sessionDoc.teacherId) !== sess.user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3) Ensure teacher marked it first
    if (sessionDoc.status !== "teacher-completed") {
      console.log(`[COMPLETE_SESSION] Wrong status "${sessionDoc.status}"`);
      return NextResponse.json(
        { error: "Session cannot be marked as completed" },
        { status: 400 }
      );
    }

    // 4) Mark fully completed
    await TeachingSession.findByIdAndUpdate(params.id, {
      status:      "completed",
      completedAt: new Date(),
    });

    // 5) Load teacher & student
    const teacher = sessionDoc.teacherId
      ? await User.findById(sessionDoc.teacherId)
          .select("name email")
          .lean()
      : null;

    const student = sessionDoc.studentId
      ? await User.findById(sessionDoc.studentId)
          .select("name email studentProfile.parent studentProfile.registeredAs")
          .lean()
      : null;

    // 6) Decide review‐request recipient & template
    let reviewEmail = "";
    let reviewName  = "";
    let reviewRole: "student" | "parent" = "student";

    if (
      student?.studentProfile?.registeredAs === "child" &&
      student.studentProfile.parent
    ) {
      // child → parent
      const parent = await User.findById(student.studentProfile.parent)
        .select("name email")
        .lean();
      if (parent) {
        reviewEmail = parent.email;
        reviewName  = parent.name;
        reviewRole  = "parent";
      }
    } else if (student) {
      // independent student
      reviewEmail = student.email;
      reviewName  = student.name;
    }

    const sessionDate = sessionDoc.endTime
      ? new Date(sessionDoc.endTime).toLocaleDateString()
      : "";

    // 7) Send the proper review‐request email
    if (reviewEmail) {
      if (reviewRole === "parent") {
        await sendEmail({
          to: reviewEmail,
          subject: "How was your child's lesson? Leave a review",
          template: "session-review-request-parent",
          replacements: {
            parentName:  reviewName,
            childName:   student?.name ?? "",
            teacherName: teacher?.name ?? "",
            sessionDate,
            subject:     sessionDoc.subject?.name ?? "",
            reviewUrl:   `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/parent/sessions`,
          },
        });
        console.log(`[COMPLETE_SESSION] Parent review email → ${reviewEmail}`);
      } else {
        await sendEmail({
          to: reviewEmail,
          subject: "How was your lesson? Leave a review",
          template: "session-review-request",
          replacements: {
            studentName: reviewName,
            teacherName: teacher?.name ?? "",
            sessionDate,
            subject:     sessionDoc.subject?.name ?? "",
            reviewUrl:   `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/student/sessions`,
          },
        });
        console.log(`[COMPLETE_SESSION] Student review email → ${reviewEmail}`);
      }
    }

    // 8) Calculate & persist the earning
    // `duration` is stored in minutes; fall back to start/end if missing
    const minutes = sessionDoc.duration != null
      ? sessionDoc.duration
      : (new Date(sessionDoc.endTime).getTime() - new Date(sessionDoc.startTime).getTime())
        / 1000 / 60;

    // convert to hours for pay
    const rawHours    = minutes / 60;
    const roundedHours = Math.round(rawHours * 100) / 100; // e.g. 1.5
    const ratePerHour  = 5000;
    const amount       = roundedHours * ratePerHour;

    // human‑friendly duration label
    const durationLabel = minutes < 60
      ? `${minutes} minute${minutes === 1 ? "" : "s"}`
      : `${roundedHours} hour${roundedHours === 1 ? "" : "s"}`;

    const earning = await Earning.create({
      teacherId: sessionDoc.teacherId,
      sessionId: params.id,
      hours:     roundedHours,
      amount,
      date:      sessionDoc.endTime,
      status:    "pending",
    });
    console.log(`[COMPLETE_SESSION] Earning created: ${earning._id}`);

    // 9) Send single combined session+earning notification
    if (teacher?.email) {
      await sendEmail({
        to: teacher.email,
        subject: "🎉 Session Completed & Earnings Unlocked!",
        template: "session-earning-notification",
        replacements: {
          teacherName:  teacher.name,
          studentName:  student?.name ?? "",
          sessionDate,                    // e.g. "7/22/2025"
          hours:        durationLabel,    // "1 hour" or "45 minutes"
          amount:       `₦${amount.toLocaleString()}`,
          status:       earning.status,   // "pending"
          dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/teacher/sessions`,
          earningsUrl:  `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/teacher/earnings`,
        },
      });
      console.log(`[COMPLETE_SESSION] Combined notification → ${teacher.email}`);
    }

    console.log(`[COMPLETE_SESSION] Success for ${params.id}`);
    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("[COMPLETE_SESSION] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    console.log(`[COMPLETE_SESSION] Finished for ${params.id}`);
  }
}
