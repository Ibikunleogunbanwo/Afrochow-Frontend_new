/**
 * Utility functions for storing File objects across page navigations
 * Uses sessionStorage with custom serialization
 */

const FILE_STORAGE_KEY = 'vendor_registration_files';

/**
 * Convert File to a serializable object
 */
async function fileToSerializable(file) {
  if (!file || !(file instanceof File)) return null;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        data: reader.result, // base64 data URL
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Convert serializable object back to File.
 * Uses atob() to decode the base64 data URL — works in all browsers and
 * avoids fetch(data:) which is blocked in many production environments.
 */
function serializableToFile(obj) {
  if (!obj || !obj.data) return null;

  try {
    // data is a base64 data URL: "data:<type>;base64,<data>"
    const commaIndex = obj.data.indexOf(',');
    if (commaIndex === -1) return null;

    const base64 = obj.data.slice(commaIndex + 1);
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: obj.type });
    const file = new File([blob], obj.name, {
      type: obj.type,
      lastModified: obj.lastModified,
    });
    return Promise.resolve(file);
  } catch (error) {
    console.error('Error converting to File:', error);
    return null;
  }
}

/**
 * Save file objects to sessionStorage
 */
export async function saveFiles(files) {
  if (typeof window === 'undefined') return;

  try {
    const serializable = {};

    if (files.profileImageFile) {
      serializable.profileImageFile = await fileToSerializable(files.profileImageFile);
    }
    if (files.businessLicense) {
      serializable.businessLicense = await fileToSerializable(files.businessLicense);
    }
    if (files.logoFile) {
      serializable.logoFile = await fileToSerializable(files.logoFile);
    }
    if (files.bannerFile) {
      serializable.bannerFile = await fileToSerializable(files.bannerFile);
    }

    sessionStorage.setItem(FILE_STORAGE_KEY, JSON.stringify(serializable));
  } catch (error) {
    console.error('Error saving files:', error);
  }
}

/**
 * Load file objects from sessionStorage
 */
export async function loadFiles() {
  if (typeof window === 'undefined') return null;

  try {
    const saved = sessionStorage.getItem(FILE_STORAGE_KEY);
    if (!saved) return null;

    const serializable = JSON.parse(saved);
    const files = {};

    if (serializable.profileImageFile) {
      files.profileImageFile = await serializableToFile(serializable.profileImageFile);
    }
    if (serializable.businessLicense) {
      files.businessLicense = await serializableToFile(serializable.businessLicense);
    }
    if (serializable.logoFile) {
      files.logoFile = await serializableToFile(serializable.logoFile);
    }
    if (serializable.bannerFile) {
      files.bannerFile = await serializableToFile(serializable.bannerFile);
    }

    return files;
  } catch (error) {
    console.error('Error loading files:', error);
    return null;
  }
}

/**
 * Clear files from sessionStorage
 */
export function clearFiles() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(FILE_STORAGE_KEY);
}
