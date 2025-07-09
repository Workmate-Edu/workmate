// Utility to check if a user (parent, child, or student) has access to a subject based on subscription

import { Subscription } from "@/models/subscription"
import mongoose from "mongoose"

// Returns true if the user (parent/child/student) has access to the subject
export async function hasSubjectAccess({
  userId,
  subject,
  childId
}: {
  userId: string
  subject: string
  childId?: string // undefined for parent/self/independent
}): Promise<boolean> {
  // Find subscription for the user (parent or independent student)
  const subscription = await Subscription.findOne({ userId: new mongoose.Types.ObjectId(userId) }).lean()
  if (!subscription || !Array.isArray(subscription.subjects)) return false

  // For parent self-learning or independent student
  if (!childId || childId === userId) {
    return subscription.subjects.some(
      s => s.subject === subject && (!s.childId || s.childId.toString() === userId)
    )
  }

  // For child
  return subscription.subjects.some(
    s => s.subject === subject && s.childId && s.childId.toString() === childId
  )
}

// Returns an array of allowed subjects for a user (parent, child, or student)
export async function getAllowedSubjectsForUser({
  userId,
  childId
}: {
  userId: string
  childId?: string
}): Promise<string[]> {
  const subscription = await Subscription.findOne({ userId: new mongoose.Types.ObjectId(userId) }).lean()
  if (!subscription || !Array.isArray(subscription.subjects)) return []

  if (!childId || childId === userId) {
    // Parent self-learning or independent student
    return subscription.subjects
      .filter(s => !s.childId || s.childId.toString() === userId)
      .map(s => s.subject)
  }
  // Child
  return subscription.subjects
    .filter(s => s.childId && s.childId.toString() === childId)
    .map(s => s.subject)
}
