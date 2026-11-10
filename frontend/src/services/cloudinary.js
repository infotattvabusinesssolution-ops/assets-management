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
    console.warn('Backend upload encountered error, falling back to local reader:', backendErr);
    // Strategy 3: Local Data URL fallback (in case remote services are completely unreachable)
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error('Failed to read file locally'));
        reader.readAsDataURL(file);
      });

      return {
        name: file.name,
        size: file.size,
        formattedSize: formatBytes(file.size),
        url: dataUrl,
        secure_url: dataUrl,
        public_id: `local_${Date.now()}`,
        format: file.name.split('.').pop().toLowerCase(),
        resource_type: resourceType,
        source: 'local_data_url'
      };
    } catch (finalErr) {
      console.error('All upload strategies failed:', backendErr);
      throw new Error(backendErr?.message || 'Failed to process document upload.');
    }
  }
}

// In-memory cache for upload policies (key -> { policy, expiresAt })
const policyCache = new Map();

/**
 * Fetch dynamic upload policy from backend database
 * @param {string} policyKey - e.g. 'asset_photos' or 'asset_documents'
 * @returns {Promise<{ policyKey, maxFiles, maxSizeMB, maxSizeBytes, allowedFormats, allowedExtensions, mimeTypes }>}
 */
export async function fetchUploadPolicy(policyKey = 'asset_photos') {
  const cached = policyCache.get(policyKey);
  const now = Date.now();
  if (cached && cached.expiresAt > now) {
    return cached.policy;
  }

  const fallbackPolicies = {
    asset_photos: {
      policyKey: 'asset_photos',
      maxFiles: 5,
      maxSizeMB: 10,
      maxSizeBytes: 10 * 1024 * 1024,
      allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
      acceptString: '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp'
    },
    asset_documents: {
      policyKey: 'asset_documents',
      maxFiles: 10,
      maxSizeMB: 25,
      maxSizeBytes: 25 * 1024 * 1024,
      allowedFormats: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'csv', 'jpg', 'png'],
      allowedExtensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv', '.jpg', '.png'],
      acceptString: '.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.jpg,.png'
    }
  };

  try {
    const res = await api.get(`/uploads/policy/${policyKey}`);
    if (res?.success && res.policy) {
      const p = res.policy;
      const formats = Array.isArray(p.allowedFormats) ? p.allowedFormats : ['jpg', 'jpeg', 'png', 'webp'];
      const extensions = formats.map(fmt => `.${fmt.toLowerCase()}`);
      const acceptString = extensions.join(',');

      const policyObj = {
        policyKey: p.policyKey || policyKey,
        maxFiles: Number(p.maxFiles) || 5,
        maxSizeMB: Number(p.maxSizeMB) || 10,
        maxSizeBytes: (Number(p.maxSizeMB) || 10) * 1024 * 1024,
        allowedFormats: formats,
        allowedExtensions: extensions,
        acceptString
      };

      policyCache.set(policyKey, { policy: policyObj, expiresAt: now + 60 * 1000 }); // cache 60s
      return policyObj;
    }
  } catch (err) {
    console.warn(`Failed to fetch dynamic policy for ${policyKey}, using defaults:`, err);
  }

  const fallback = fallbackPolicies[policyKey] || fallbackPolicies.asset_photos;
  policyCache.set(policyKey, { policy: fallback, expiresAt: now + 30 * 1000 });
  return fallback;
}

/**
 * Validate a file against a dynamic upload policy
 * @param {File} file
 * @param {Object} policy
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateFileWithPolicy(file, policy) {
  if (!file) return { valid: false, error: 'No file selected.' };
  if (!policy) return { valid: true };

  const fileName = file.name || '';
  const ext = fileName.split('.').pop()?.toLowerCase();

  // Extension check
  if (Array.isArray(policy.allowedFormats) && policy.allowedFormats.length > 0) {
    const isAllowed = policy.allowedFormats.some(f => f.toLowerCase() === ext);
    if (!isAllowed) {
      return {
        valid: false,
        error: `File format ".${ext}" is not allowed. Permitted formats: ${policy.allowedFormats.map(f => f.toUpperCase()).join(', ')}.`
      };
    }
  }

  // Size check
  const maxBytes = policy.maxSizeBytes || (policy.maxSizeMB ? policy.maxSizeMB * 1024 * 1024 : 10 * 1024 * 1024);
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `File "${fileName}" (${formatBytes(file.size)}) exceeds the maximum allowed limit of ${policy.maxSizeMB || Math.round(maxBytes / (1024 * 1024))}MB.`
    };
  }

  return { valid: true };
}

/**
 * Upload multiple files to Cloudinary / backend with individual error tracking
 * @param {File[]} files
 * @param {Object} options
 * @returns {Promise<{ uploaded: Array, failed: Array }>}
 */
export async function uploadMultipleToCloudinary(files = [], options = {}) {
  const uploaded = [];
  const failed = [];

  for (const file of files) {
    try {
      const result = await uploadToCloudinary(file, options);
      uploaded.push(result);
    } catch (err) {
      failed.push({ file, error: err.message || 'Upload failed' });
    }
  }

  return { uploaded, failed };
}

