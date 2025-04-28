import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user.model"
import { Types, Document } from "mongoose"

interface Subject {
  name: string
  area?: string
  _id?: string
}

interface Child {
  _id: string
  name: string
  email: string
  grade: string
  subjects: Subject[]
  parent?: {
    name: string
    email: string
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const children = await User.find({ role: 'student', registeredAs: 'child' })
      .populate('parent', 'name email')
      .lean()

    return NextResponse.json((children as any[]).map(child => ({
      id: child._id?.toString(),
      name: child.name,
      email: child.email,
      type: 'child',
      grade: child.grade,
      subjects: (child.subjects || []).map((s: Subject) => s.name),
      parent: {
        name: child.parent?.name,
        email: child.parent?.email
      }
    })))
  } catch (error) {
    console.error('Error fetching children:', error)
    return NextResponse.json(
      { error: "Failed to fetch children" },
      { status: 500 }
    )
  }
}
