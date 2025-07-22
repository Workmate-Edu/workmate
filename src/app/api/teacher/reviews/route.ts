import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { Review } from "@/models/review"
import { User } from "@/models/user"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const teacherId = url.searchParams.get("teacherId")
  const mine = url.searchParams.get("mine")

  await connectDB()

  // If mine=1, return reviews by current user (for all teachers/sessions)
  if (mine === "1") {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json([], { status: 401 })
    // Only return sessionId and teacherId for deduplication
    const reviews = await Review.find({ reviewerId: session.user.id })
      .select("sessionId teacherId")
      .lean()
    return NextResponse.json(reviews)
  }

  // If teacherId is provided, return all reviews for that teacher
  if (teacherId && teacherId !== "all") {
    const reviews = await Review.find({ teacherId }).sort({ createdAt: -1 }).lean()
    return NextResponse.json(reviews)
  }

  // If teacherId=all, return all reviews (admin use)
  if (teacherId === "all") {
    const reviews = await Review.find({}).sort({ createdAt: -1 }).lean()
    return NextResponse.json(reviews)
  }

  return NextResponse.json({ error: "Missing teacherId" }, { status: 400 })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  await connectDB()
  const body = await req.json()
  const { teacherId, sessionId, rating, comment } = body
  if (!teacherId || !sessionId || !rating) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }
  // Only allow parent or student to review
  const reviewerRole = session.user.role === "parent" ? "parent" : "student"
  const review = await Review.create({
    teacherId,
    reviewerId: session.user.id,
    reviewerRole,
    sessionId,
    rating,
    comment
  })
  // Update teacher ratings summary (average/count)
  const agg = await Review.aggregate([
    { $match: { teacherId: review.teacherId } },
    { $group: { _id: "$teacherId", avg: { $avg: "$rating" }, count: { $sum: 1 } } }
  ])
  if (agg.length > 0) {
    // Use updateOne (not PUT) to update teacherProfile.ratings
    await User.updateOne(
      { _id: teacherId },
      { $set: { "teacherProfile.ratings.average": agg[0].avg, "teacherProfile.ratings.count": agg[0].count } }
    )
  }
  return NextResponse.json(review)
}
