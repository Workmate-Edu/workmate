export const uploadMessageFile = async (file: File) => {
  try {
    // Convert file to base64
    const base64Data = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    const response = await fetch('/api/upload', { // Changed from /api/messages/upload to /api/upload
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file: base64Data,
        folder: 'messages',
        fileName: file.name
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return await response.json();
  } catch (error) {
    console.error('Message file upload error:', error);
    throw error;
  }
};
