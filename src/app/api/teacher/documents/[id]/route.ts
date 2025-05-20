import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { v2 as cloudinary } from 'cloudinary'
import { connectDB } from "@/lib/mongodb"
import { CourseDocument } from "@/models/course-document"
import authOptions from "@/lib/auth"

interface Subject {
  id: string;
  name: string;
  area: string;
}

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const document = await CourseDocument.findById(params.id)
    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    // Verify ownership
    if (document.teacherId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    // Get the subject ID from the request body
    const body = await req.json()
    const { subjectId } = body

    // If it's a general document or no specific subject ID provided, delete the entire document
    if (document.isGeneral || !subjectId) {
      if (document.publicId) {
        const resourceType = document.format.startsWith('image/') ? 'image' : 'raw'
        await cloudinary.uploader.destroy(document.publicId, { resource_type: resourceType })
      }
      await CourseDocument.findByIdAndDelete(params.id)
      return NextResponse.json({ success: true })
    }

    // For subject-specific documents, check if we should remove just one subject
    const updatedSubjects = document.subjects.filter((subject: Subject) => subject.id !== subjectId)

    // If this was the last subject, delete the entire document
    if (updatedSubjects.length === 0) {
      if (document.publicId) {
        const resourceType = document.format.startsWith('image/') ? 'image' : 'raw'
        await cloudinary.uploader.destroy(document.publicId, { resource_type: resourceType })
      }
      await CourseDocument.findByIdAndDelete(params.id)
    } else {
      // Otherwise, update the document with the remaining subjects
      await CourseDocument.findByIdAndUpdate(params.id, {
        subjects: updatedSubjects
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[DOCUMENT_DELETE_ERROR]', error)
    return NextResponse.json(
      { error: error.message || "Failed to delete document" },
      { status: error.status || 500 }
    )
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const material = await TeachingMaterial.findById(params.id)
      .lean()
      .select('name description url format size publicId') // Include all needed fields
    
    if (!material) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    // Ensure complete URL is returned
    const formattedMaterial = {
      ...material,
      url: material.url.replace(/\.\.\./, '') // Remove any ellipsis
    }

    return NextResponse.json(formattedMaterial)
  } catch (error) {
    console.error('[DOCUMENT_GET_ERROR]:', error)
    return NextResponse.json(
      { error: "Failed to fetch document" },
      { status: 500 }
    )
  }
}