export const getFileUrl = (url: string, type: string) => {
  if (!url) return '';

  // Force download for PDFs and other documents
  if (type.includes('pdf') || type.includes('document')) {
    const downloadUrl = url.includes('?') ? `${url}&fl_attachment` : `${url}?fl_attachment`;
    return downloadUrl.replace('/upload/', '/upload/fl_attachment/');
  }

  return url;
};

export const openFile = (url: string, type: string, filename: string) => {
  const fileUrl = getFileUrl(url, type);
  
  if (type.includes('pdf')) {
    // For PDFs, open in new tab with PDF viewer
    window.open(fileUrl, '_blank');
  } else if (type.includes('image')) {
    // For images, open in new tab
    window.open(fileUrl, '_blank');
  } else {
    // For other files, force download
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
