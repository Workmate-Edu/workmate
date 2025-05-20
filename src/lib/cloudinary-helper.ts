export function getCloudinaryUrl(url: string, options: { download?: boolean } = {}) {
  if (!url) return ''

  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

    // For file downloads
    if (options.download) {
      return url.replace('/upload/', '/upload/fl_attachment/')
    }

    // For viewing PDFs and other raw files
    if (url.includes('/raw/upload/')) {
      // Convert to a viewable format
      return url.replace('/raw/upload/', '/upload/fl_attachment/')
    }

    return url
  } catch (error) {
    console.error('Error processing Cloudinary URL:', error)
    return url
  }
}
