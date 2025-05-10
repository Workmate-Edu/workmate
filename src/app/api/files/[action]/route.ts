import { NextRequest, NextResponse } from 'next/server'

function generateSignature(publicId: string, options: Record<string, any> = {}) {
  const timestamp = Math.floor(Date.now() / 1000)
  const params = {
    timestamp,
    public_id: publicId,
    ...options
  }

  // Sort parameters alphabetically
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&')

  // Generate signature using URL-safe Base64 encoding
  const signature = crypto
    .subtle
    .digest(
      'SHA-1',
      new TextEncoder().encode(sortedParams + process.env.CLOUDINARY_API_SECRET)
    )
    .then(hash => {
      return btoa(String.fromCharCode(...new Uint8Array(hash)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
    })

  return { signature, timestamp }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const url = searchParams.get('url')
    const action = req.url.split('/').pop()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Extract public_id from URL
    const urlParts = url.split('/upload/')
    if (urlParts.length !== 2) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    const publicId = urlParts[1].split('.')[0]
    const isRawFile = url.includes('/raw/upload/')
    const resourceType = isRawFile ? 'raw' : 'image'

    const options = {
      resource_type: resourceType,
      type: 'upload',
      ...(action === 'download' && { flags: 'attachment' })
    }

    const { signature, timestamp } = await generateSignature(publicId, options)

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY

    const signedUrl = `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/s--${signature}--/v${timestamp}/${publicId}`

    return NextResponse.json({ url: signedUrl })

  } catch (error) {
    console.error('File operation error:', error)
    return NextResponse.json(
      { error: 'Failed to process file' }, 
      { status: 500 }
    )
  }
}

export const runtime = 'edge'
