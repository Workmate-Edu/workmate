import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { v2 as cloudinary } from 'cloudinary';
import { authOptions } from '@/lib/auth';

export const runtime = 'nodejs';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !['teacher', 'parent'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Only teachers and parents can upload profile images' }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    if (!(file instanceof File) || !file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Choose an image file' }, { status: 400 });
    }
    if (file.size > MAX_PROFILE_IMAGE_BYTES) {
      return NextResponse.json({ error: 'Profile images must be 5 MB or smaller' }, { status: 400 });
    }

    const data = Buffer.from(await file.arrayBuffer()).toString('base64');
    const result = await cloudinary.uploader.upload(`data:${file.type};base64,${data}`, {
      resource_type: 'image',
      folder: 'workmate/profile-images',
      transformation: [{ width: 512, height: 512, crop: 'fill', gravity: 'face' }],
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    console.error('[PROFILE_IMAGE_UPLOAD_ERROR]', error);
    return NextResponse.json({ error: 'Unable to upload profile image' }, { status: 500 });
  }
}
