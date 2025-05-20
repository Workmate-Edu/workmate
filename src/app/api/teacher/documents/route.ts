import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { TeachingMaterial } from "@/models/teaching-material"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'teacher') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const documents = await TeachingMaterial.find({
      teacherId: session.user.id
    })
    .sort({ createdAt: -1 })
    .lean()

    // Transform response
    const formattedDocs = documents.map(doc => ({
      id: doc._id.toString(),
      name: doc.name,
      description: doc.description,
      url: doc.url,
      format: doc.format,
      size: doc.size,
      subjects: doc.subjects,
      isGeneral: doc.isGeneral,
      publicId: doc.publicId,
      createdAt: doc.createdAt
    }))

    return NextResponse.json(formattedDocs)

  } catch (error) {
    console.error('[DOCUMENTS_GET_ERROR]:', error)
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'teacher') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    await connectDB()

    const document = await TeachingMaterial.create({
      teacherId: session.user.id,
      name: body.name,
      description: body.description,
      url: body.url,
      format: body.format,
      size: body.size,
      subjects: body.subjects,
      isGeneral: body.isGeneral,
      publicId: body.publicId
    })

    return NextResponse.json(document)

  } catch (error) {
    console.error('[DOCUMENT_CREATE_ERROR]:', error)
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    )
  }
}
