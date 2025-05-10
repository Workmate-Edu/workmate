import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (file: File) => {
  try {
    // Convert file to base64
    const base64Data = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });

    // Upload to Cloudinary
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        file: base64Data,
        folder: 'messages'
      })
    });

    if (!response.ok) throw new Error('Upload failed');
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

export function getCloudinaryUrl(url: string, options: { download?: boolean } = {}) {
  if (!url) return ''
  
  // Convert to download URL if needed
  if (options.download) {
    return url.replace('/upload/', '/upload/fl_attachment/')
  }

  // For PDFs and other documents, ensure they're accessible
  if (url.includes('/raw/upload/')) {
    return url.replace('/raw/upload/', '/upload/fl_attachment/')
  }

  return url
}
