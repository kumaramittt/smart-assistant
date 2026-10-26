/**
 * Utility functions for client-side image processing and base64 handling
 */

export interface ParsedImageData {
  mimeType: string;
  base64Data: string;
}

/**
 * Extract clean MIME type and pure base64 payload from data URL or raw string
 */
export function parseDataUrl(dataUrl: string): ParsedImageData | null {
  if (!dataUrl || typeof dataUrl !== 'string') return null;

  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (match) {
    return {
      mimeType: match[1],
      base64Data: match[2],
    };
  }

  // If already pure base64
  return {
    mimeType: 'image/jpeg',
    base64Data: dataUrl,
  };
}

/**
 * Format bytes to readable size (e.g. 1.2 MB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Read File as Data URL and resize if larger than max dimension to optimize Gemini payload
 */
export async function fileToOptimizedDataUrl(file: File, maxDimension = 1600): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = () => {
      const result = reader.result as string;

      // In non-browser environments or SVG/GIF, return as is
      if (typeof window === 'undefined' || typeof Image === 'undefined' || file.type === 'image/svg+xml') {
        return resolve(result);
      }

      const img = new Image();
      img.onerror = () => resolve(result);
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width <= maxDimension && height <= maxDimension && file.size < 1024 * 1024) {
          // File is already small enough, no resizing required
          return resolve(result);
        }

        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(result);

        ctx.drawImage(img, 0, 0, width, height);
        // Compress as image/jpeg or keep PNG
        const targetType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const compressedDataUrl = canvas.toDataURL(targetType, 0.85);
        resolve(compressedDataUrl);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  });
}
