export function getCloudinaryUrl(url: string, options: { download?: boolean } = {}) {
  if (!url) return ''

  try {
    const isRawFile = url.includes('/raw/upload/')
    const endpoint = options.download ? 'download' : 'view'
    return `/api/files/${endpoint}?url=${encodeURIComponent(url)}`
  } catch (error) {
    console.error('Error processing Cloudinary URL:', error)
    return url
  }
}

export async function downloadFile(url: string, filename: string) {
  try {
    const downloadUrl = getCloudinaryUrl(url, { download: true })
    const response = await fetch(downloadUrl)
    
    if (!response.ok) throw new Error('Download failed')
    
    const blob = await response.blob()
    const blobUrl = window.URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(blobUrl)
  } catch (error) {
    console.error('File download error:', error)
    throw error
  }
}

export function openFile(url: string, type: string) {
  const viewUrl = getCloudinaryUrl(url)
  window.open(viewUrl, '_blank', 'noopener,noreferrer')
}
