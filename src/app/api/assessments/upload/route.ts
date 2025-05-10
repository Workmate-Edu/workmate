import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { v2 as cloudinary } from 'cloudinary'
import authOptions from "@/lib/auth"
import { FILE_UPLOAD_LIMITS } from "@/types/assessment"

const ALLOWED_TYPES = {
  'image/jpeg': { resource_type: 'image', folder: 'images' },
  'image/png': { resource_type: 'image', folder: 'images' },
  'image/jpg': { resource_type: 'image', folder: 'images' },
  'application/pdf': { resource_type: 'raw', folder: 'documents' },
  'application/msword': { resource_type: 'raw', folder: 'documents' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { resource_type: 'raw', folder: 'documents' },
  'application/vnd.ms-powerpoint': { resource_type: 'raw' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { resource_type: 'raw' }
}

// Add sanitization helper
const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
    .replace(/_{2,}/g, '_')          // Replace multiple underscores with single
    .toLowerCase()                    // Convert to lowercase
}

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

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

    // Check file size
    if (file.size > FILE_UPLOAD_LIMITS.maxSize) {
      return NextResponse.json({ 
        error: `File size must be less than ${FILE_UPLOAD_LIMITS.maxSize / (1024 * 1024)}MB` 
      }, { status: 400 })
    }

    // Check file type
    const fileConfig = ALLOWED_TYPES[file.type]
    if (!fileConfig) {
      return NextResponse.json({ 
        error: `Unsupported file type: ${file.type}` 
      }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Data = buffer.toString('base64')
    const dataURI = `data:${file.type};base64,${base64Data}`

    // Sanitize filename for public_id
    const sanitizedFileName = sanitizeFileName(file.name.split('.')[0])
    const timestamp = Date.now()
    const publicId = `assessment-attachments/${session.user.id}/${timestamp}_${sanitizedFileName}`

    console.log('Uploading to Cloudinary with public_id:', publicId)

    try {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload(dataURI, {
          folder: fileConfig.folder,
          public_id: publicId,
          resource_type: fileConfig.resource_type,
          access_mode: 'public', // Make sure files are publicly accessible
          type: 'upload',
          format: file.type.split('/')[1],
          overwrite: true,
          invalidate: true,
          // Add signed URLs for raw files
          sign_url: fileConfig.resource_type === 'raw',
          // Add these parameters for PDFs
          ...(file.type === 'application/pdf' && {
            pages: true,
          })
        }, (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error)
            reject(error)
          } else {
            console.log('Upload success:', result)
            resolve(result)
          }
        })
      })

      // Generate the correct URL based on resource type
      const secureUrl = fileConfig.resource_type === 'raw' 
        ? cloudinary.url((result as any).public_id, {
            resource_type: 'raw',
            secure: true,
            sign_url: true
          })
        : (result as any).secure_url

      return NextResponse.json({
        secure_url: secureUrl,
        public_id: (result as any).public_id,
        format: file.type,
        resource_type: fileConfig.resource_type
      })

    } catch (uploadError: any) {
      console.error('Cloudinary upload error:', uploadError)
      return NextResponse.json({
        error: uploadError.message || "Upload failed",
        details: uploadError
      }, { status: uploadError.http_code || 500 })
    }

  } catch (error: any) {
    console.error('Assessment file upload error:', error)
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: error.http_code || 500 }
    )
  }
}

export const runtime = 'nodejs'

// Add proper response size config
export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = 0
export const maxDuration = 60;
