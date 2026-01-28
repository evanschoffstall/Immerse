/**
 * Upload configuration constants
 * Centralized configuration for image upload validation and processing
 */
export const UPLOAD_CONFIG = {
  /** Maximum file size in bytes (10MB) */
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024,

  /** Maximum file size in megabytes for display */
  MAX_FILE_SIZE_MB: 10,

  /** Maximum dimension (width or height) for resized images */
  MAX_DIMENSION: 1200,

  /** JPEG/WebP quality setting (0-100) */
  QUALITY: 80,

  /** Output format for all uploaded images */
  OUTPUT_FORMAT: 'webp' as const,

  /** Allowed MIME types for image uploads */
  ALLOWED_MIME_TYPES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
  ] as const,

  /** Display-friendly list of allowed file types */
  ALLOWED_TYPES_DISPLAY: 'JPG, PNG, WebP, and GIF',
} as const;

/**
 * Validates an image file against upload constraints
 * @param file - The file to validate
 * @throws {Error} If file size exceeds limit or file type is not allowed
 */
export function validateImageFile(file: File): void {
  // Validate file size
  if (file.size > UPLOAD_CONFIG.MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `File size exceeds ${UPLOAD_CONFIG.MAX_FILE_SIZE_MB}MB limit`
    );
  }

  // Validate file type
  if (!UPLOAD_CONFIG.ALLOWED_MIME_TYPES.includes(file.type as any)) {
    throw new Error(
      `Invalid file type. Only ${UPLOAD_CONFIG.ALLOWED_TYPES_DISPLAY} are allowed.`
    );
  }
}
