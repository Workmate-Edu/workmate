import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { v2 as cloudinary } from 'cloudinary'
import authOptions from "@/lib/auth"

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const ALLOWED_TYPES = {
  // Images use 'image' resource_type
  'image/jpeg': { resource_type: 'image' },
  'image/png': { resource_type: 'image' },
  'image/jpg': { resource_type: 'image' },
  
  // Documents use 'raw' resource_type
  'application/pdf': { resource_type: 'raw' },
  'application/msword': { resource_type: 'raw' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { resource_type: 'raw' },
  'application/vnd.ms-powerpoint': { resource_type: 'raw' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { resource_type: 'raw' }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Check file type
    const fileConfig = ALLOWED_TYPES[file.type]
    if (!fileConfig) {
      return NextResponse.json({ 
        error: `Unsupported file type: ${file.type}. Allowed types: PDF, Word, PowerPoint, Images` 
      }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Data = buffer.toString('base64')
    const dataURI = `data:${file.type};base64,${base64Data}`

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(dataURI, {
        folder: `assessment-attachments/${session.user.id}`,
        resource_type: fileConfig.resource_type,
        format: file.type.split('/')[1],
        public_id: `${Date.now()}_${file.name.split('.')[0]}`,
        tags: ['assessment'],
      }, (error, result) => {
        if (error) reject(error)
        else resolve(result)
      })
    })

    return NextResponse.json({
      secure_url: (result as any).secure_url,
      public_id: (result as any).public_id,
      format: file.type
    })

  } catch (error) {
    console.error('Assessment file upload error:', error)
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: error.http_code || 500 }
    )
  }
}

export const runtime = 'nodejs'
