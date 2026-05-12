/**
 * Client-side image compression before base64 encoding.
 * Resizes large images and re-encodes as JPEG at reduced quality.
 */

const MAX_DIMENSION = 2048; // px
const JPEG_QUALITY = 0.82;

export interface CompressedImage {
  blob: Blob;
  mimeType: string;
  originalBytes: number;
  compressedBytes: number;
}

export async function compressImage(file: File): Promise<CompressedImage> {
  const originalBytes = file.size;

  // Only compress actual images (not PDFs)
  if (!file.type.startsWith('image/')) {
    return { blob: file, mimeType: file.type, originalBytes, compressedBytes: file.size };
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
      width = Math.round(width * scale);
      height = Math.round(height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context unavailable'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas toBlob failed'));
            return;
          }
          resolve({
            blob,
            mimeType: 'image/jpeg',
            originalBytes,
            compressedBytes: blob.size,
          });
        },
        'image/jpeg',
        JPEG_QUALITY,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image for compression'));
    };

    img.src = objectUrl;
  });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
