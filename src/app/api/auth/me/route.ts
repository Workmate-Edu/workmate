import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { jwtVerify } from "jose"
import connectDB from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import User from "@/models/user.model"

export async function GET() {
  try {
    const headersList = headers()
    const authorization = headersList.get("authorization")

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    const token = authorization.split(" ")[1]
    
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined')
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    const userId = payload.id as string

    // Connect to MongoDB
    await connectDB()
    
    // Use Mongoose model instead of direct MongoDB access
    const user = await User.findOne(
      { _id: new ObjectId(userId) },
      {
        _id: 1,
        name: 1,
        email: 1,
        role: 1,
        image: 1,
      }
    ).lean()

    if (!user) {
      console.error("[USER_ME_ERROR] User not found:", userId)
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
      }
    })
  } catch (error) {
    console.error("[USER_ME_ERROR]", error)
    // Return more specific error messages based on the error type
    if (error instanceof Error && error.message.includes('JWT')) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}
