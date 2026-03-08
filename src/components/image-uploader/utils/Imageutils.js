/**
 * Image handling utilities
 * Combines preview management with validation
 */

// Validation constants
export const IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
];

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Validate image file
 * @param {File} file - The file to validate
 * @returns {string|null} Error message or null if valid
 */
export function validateImageFile(file) {
    if (!file) return "No file selected";
    if (!IMAGE_TYPES.includes(file.type)) {
        return "Please select a valid image (JPEG, PNG, GIF, WebP)";
    }
    if (file.size > MAX_IMAGE_SIZE) {
        return "Image size must be less than 5MB";
    }
    return null;
}

/**
 * Create a preview URL for a file
 * @param {File} file - The file to create a preview for
 * @returns {string} Blob URL for the file
 */
export function createPreview(file) {
    return URL.createObjectURL(file);
}

/**
 * Revoke a preview URL to free up memory
 * @param {string} preview - The preview URL to revoke
 */
export function revokePreview(preview) {
    if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
    }
}

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size string
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get file extension from filename
 * @param {string} filename - The filename
 * @returns {string} File extension including dot
 */
export function getFileExtension(filename) {
    const lastDotIndex = filename.lastIndexOf('.');
    return lastDotIndex === -1 ? '' : filename.substring(lastDotIndex);
}

/**
 * Validate and create preview in one step
 * @param {File} file - The file to validate and preview
 * @returns {{preview: string|null, error: string|null}} Result object
 */
export function validateAndPreview(file) {
    const error = validateImageFile(file);
    if (error) {
        return { preview: null, error };
    }

    const preview = createPreview(file);
    return { preview, error: null };
}