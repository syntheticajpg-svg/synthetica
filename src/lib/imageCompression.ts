import imageCompression from 'browser-image-compression';

export const compressImage = async (file: File, maxSizeMB: number = 0.1): Promise<File> => {
  if (!file.type.startsWith('image/')) return file; // Skip videos or non-images

  const options = {
    maxSizeMB: maxSizeMB,
    maxWidthOrHeight: 1024,
    useWebWorker: true,
    initialQuality: 0.6,
    fileType: 'image/jpeg'
  };

  try {
    const compressedBlob = await imageCompression(file, options);
    // Convert Blob back to File
    const compressedFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
      type: 'image/jpeg',
      lastModified: Date.now()
    });
    return compressedFile;
  } catch (error) {
    console.error('Compression error:', error);
    return file; // Return original if compression fails
  }
};
