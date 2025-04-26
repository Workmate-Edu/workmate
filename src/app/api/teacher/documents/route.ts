import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectDB } from "@/lib/mongodb"
import { CourseDocument } from "@/models/course-document"
import authOptions from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const body = await req.json()

    // Validate that at least one subject is selected or document is marked as general
    if (!body.isGeneral && (!body.subjects || body.subjects.length === 0)) {
      return NextResponse.json(
        { error: "Please select at least one subject or mark as general" },
        { status: 400 }
      )
    }

    const document = await CourseDocument.create({
      teacherId: session.user.id,
      subjects: body.subjects || [],
      name: body.name,
      description: body.description || "",
      url: body.url,
      format: body.format,
      size: body.size,
      publicId: body.publicId,
      isGeneral: body.isGeneral || false
    })

    return NextResponse.json(document)
  } catch (error: any) {
    console.error('[DOCUMENT_UPLOAD_ERROR]', error)
    return NextResponse.json(
      { error: error.message || "Failed to create document" },
      { status: error.status || 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const documents = await CourseDocument.find({
      teacherId: session.user.id
    }).sort({ createdAt: -1 }) // Show newest first
    
    return NextResponse.json(documents)
  } catch (error: any) {
    console.error('[DOCUMENTS_FETCH_ERROR]', error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch documents" },
      { status: error.status || 500 }
    )
  }
}
