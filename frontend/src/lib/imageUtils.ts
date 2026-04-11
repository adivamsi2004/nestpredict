/**
 * Compresses an image to fit within a target size (e.g., 800KB for Firestore limit).
 * @param dataUrl The original image as a data URL.
 * @param maxWidth Max width of the target image.
 * @param maxHeight Max height of the target image.
 * @param quality Quality of the JPEG compression (0 to 1).
 * @returns Promise that resolves with the compressed data URL.
 */
export async function compressImage(
  dataUrl: string,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions while maintaining aspect ratio
      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      const result = canvas.toDataURL("image/jpeg", quality);
      resolve(result);
    };

    img.onerror = (err) => reject(err);
    img.src = dataUrl;
  });
}

/**
 * Extracts base64 part from data URL.
 */
export function getBase64FromDataUrl(dataUrl: string): string {
  if (dataUrl.includes(",")) {
    return dataUrl.split(",")[1];
  }
  return dataUrl;
}
