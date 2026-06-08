const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg'];

export const IMAGE_VALIDATION = {
  maxSizeBytes: MAX_IMAGE_SIZE_BYTES,
  allowedTypes: ALLOWED_IMAGE_TYPES,
} as const;

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Image must be PNG or JPEG';
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return 'Image must be smaller than 5MB';
  }

  return null;
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }
      reject(new Error('Failed to convert image to base64'));
    };
    reader.onerror = () => {
      reject(reader.error ?? new Error('Failed to read image file'));
    };
    reader.readAsDataURL(file);
  });
}
