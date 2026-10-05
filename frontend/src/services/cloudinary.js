import { api } from './api';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dk4iwkh0h';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'fams_unsigned';

/**
 * Format bytes into human-readable size
 */
export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Determine Cloudinary resource_type
 */
export function getResourceType(fileName = '', mimeType = '') {
  const ext = (fileName || '').split('.').pop().toLowerCase();
  const mime = (mimeType || '').toLowerCase();

  if (
    mime.startsWith('image/') ||
    ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif', 'avif'].includes(ext)
  ) {
    return 'image';
  }
  // PDF, DOC, DOCX, XLSX, TXT, CSV must use 'raw' in Cloudinary
  return 'raw';
}

/**
 * Upload a File object to Cloudinary with automatic failover between
 * Direct Cloudinary REST API and Backend /api/v1/uploads/file.
 *
 * @param {File} file - Native HTML File object
 * @param {Object} options - { folder, onProgress }
 * @returns {Promise<{ name, size, formattedSize, url, secure_url, public_id, format, resource_type }>}
 */
export async function uploadToCloudinary(file, options = {}) {
  if (!file) throw new Error('No file provided for upload.');

  const folder = options.folder || 'fams_documents';
  const resourceType = getResourceType(file.name, file.type);

  // Strategy 1: Direct Cloudinary Unsigned Upload
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', folder);

    const directEndpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

    const res = await fetch(directEndpoint, {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      const data = await res.json();
      return {
        name: file.name,
        size: file.size,
        formattedSize: formatBytes(file.size),
        url: data.secure_url || data.url,
        secure_url: data.secure_url || data.url,
        public_id: data.public_id,
        format: data.format || file.name.split('.').pop().toLowerCase(),
        resource_type: data.resource_type || resourceType,
        source: 'cloudinary_direct'
      };
    } else {
      console.warn('Direct Cloudinary upload responded with error, trying backend route:', res.status);
    }
  } catch (directErr) {
    console.warn('Direct Cloudinary network error, falling back to backend upload route:', directErr);
  }

  // Strategy 2: Backend Upload Fallback (/api/v1/uploads/file)
  try {
    const backendFormData = new FormData();
    backendFormData.append('file', file);
    backendFormData.append('folder', folder);

    const backendRes = await api.post('/uploads/file', backendFormData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (backendRes?.success && backendRes.file) {
      return {
        ...backendRes.file,
        source: 'backend_cloudinary'
      };
    }
    throw new Error(backendRes?.message || 'Backend upload failed');
  } catch (backendErr) {
    console.error('All upload strategies failed:', backendErr);
    throw new Error(backendErr.message || 'Failed to upload document to Cloudinary.');
  }
}
