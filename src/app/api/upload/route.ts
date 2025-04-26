import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { v2 as cloudinary } from 'cloudinary';
import authOptions from "@/lib/auth";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { file, folder = 'general', fileName } = await req.json();
    
    if (!file || typeof file !== 'string') {
      return new NextResponse("Invalid file data", { status: 400 });
    }

    // Remove data:image/xyz;base64, prefix if present
    const base64Data = file.replace(/^data:([A-Za-z-+/]+);base64,/, '');

    const result = await cloudinary.uploader.upload(file, {
      folder: `workmate/${folder}`,
      public_id: `${folder}_${Date.now()}_${fileName}`,
      resource_type: 'auto',
    });

    return NextResponse.json({
      url: result.secure_url,
      public_id: result.public_id
    });

  } catch (error) {
    console.error("Upload error:", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Upload failed", 
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
