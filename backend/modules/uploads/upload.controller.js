import path from 'path';
import fs from 'fs';
import cloudinary from '../../config/cloudinary.js';
import prisma from '../../config/prisma.js';
import { isDbConnected } from '../../config/db.js';

const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

let policiesTableEnsured = false;

const defaultPolicies = {
  asset_photos: {
    policyKey: 'asset_photos',
    maxFiles: 5,
    maxSizeMB: 10,
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp']
  },
  asset_documents: {
    policyKey: 'asset_documents',
    maxFiles: 10,
    maxSizeMB: 25,
    allowedFormats: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'csv', 'jpg', 'png']
  }
};

export async function ensureUploadPoliciesTable() {
  if (policiesTableEnsured || !isDbConnected()) return;
  try {
    await prisma.$executeRawUnsafe(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='upload_policies' and xtype='U')
      CREATE TABLE upload_policies (
        policy_key NVARCHAR(50) PRIMARY KEY,
        max_files INT DEFAULT 5,
        max_size_mb INT DEFAULT 10,
        allowed_formats NVARCHAR(255) DEFAULT 'jpg,jpeg,png,webp',
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      IF NOT EXISTS (SELECT * FROM upload_policies WHERE policy_key = 'asset_photos')
      INSERT INTO upload_policies (policy_key, max_files, max_size_mb, allowed_formats, updatedAt)
      VALUES ('asset_photos', 5, 10, 'jpg,jpeg,png,webp', CURRENT_TIMESTAMP);

      IF NOT EXISTS (SELECT * FROM upload_policies WHERE policy_key = 'asset_documents')
      INSERT INTO upload_policies (policy_key, max_files, max_size_mb, allowed_formats, updatedAt)
      VALUES ('asset_documents', 10, 25, 'pdf,doc,docx,xls,xlsx,txt,csv,jpg,png', CURRENT_TIMESTAMP);
    `);
    policiesTableEnsured = true;
  } catch (err) {
    console.warn('upload_policies table ensure error:', err.message);
  }
}

export async function getUploadPolicy(policyKey = 'asset_photos') {
  await ensureUploadPoliciesTable();
  if (isDbConnected()) {
    try {
      const rows = await prisma.$queryRawUnsafe(`
        SELECT policy_key, max_files, max_size_mb, allowed_formats
        FROM upload_policies
        WHERE policy_key = '${policyKey.replace(/'/g, "''")}'
      `);
      if (Array.isArray(rows) && rows.length > 0) {
        const row = rows[0];
        const rawFormats = (row.allowed_formats || '')
          .split(',')
          .map(f => f.trim().toLowerCase().replace('.', ''))
          .filter(Boolean);
        return {
          policyKey: row.policy_key,
          maxFiles: Number(row.max_files) || 5,
          maxSizeMB: Number(row.max_size_mb) || 10,
          allowedFormats: rawFormats.length > 0 ? rawFormats : ['jpg', 'jpeg', 'png', 'webp']
        };
      }
    } catch (err) {
      console.warn(`Failed to read upload policy from DB for ${policyKey}:`, err.message);
    }
  }

  return defaultPolicies[policyKey] || defaultPolicies.asset_photos;
}

export function validateFileAgainstPolicy(file, policy) {
  if (!file || !policy) return;
  const ext = path.extname(file.originalname || '').toLowerCase().replace('.', '');
  // Format check
  if (policy.allowedFormats && policy.allowedFormats.length > 0) {
    if (!policy.allowedFormats.includes(ext)) {
      throw new Error(`File format ".${ext}" is not permitted. Permitted formats: ${policy.allowedFormats.join(', ')}.`);
    }
  }
  // Size check
  const maxBytes = (policy.maxSizeMB || 10) * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(`File "${file.originalname}" (${formatBytes(file.size)}) exceeds the maximum allowed size limit of ${policy.maxSizeMB} MB.`);
  }
}

export async function getUploadPolicyHandler(req, res) {
  try {
    const policyKey = req.params.policyKey || req.query.policyKey || 'asset_photos';
    const policy = await getUploadPolicy(policyKey);
    res.json({ success: true, policy });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateUploadPolicyHandler(req, res) {
  try {
    const policyKey = req.params.policyKey || 'asset_photos';
    const { maxFiles, maxSizeMB, allowedFormats } = req.body;
    await ensureUploadPoliciesTable();

    const cleanMaxFiles = Number(maxFiles) || 5;
    const cleanMaxSize = Number(maxSizeMB) || 10;
    const cleanFormats = Array.isArray(allowedFormats)
      ? allowedFormats.map(f => f.trim().toLowerCase().replace('.', '')).join(',')
      : (allowedFormats ? String(allowedFormats).toLowerCase().replace(/\s+/g, '') : 'jpg,jpeg,png,webp');

    if (isDbConnected()) {
      await prisma.$executeRawUnsafe(`
        IF EXISTS (SELECT * FROM upload_policies WHERE policy_key = '${policyKey.replace(/'/g, "''")}')
          UPDATE upload_policies
          SET max_files = ${cleanMaxFiles},
              max_size_mb = ${cleanMaxSize},
              allowed_formats = '${cleanFormats.replace(/'/g, "''")}',
              updatedAt = CURRENT_TIMESTAMP
          WHERE policy_key = '${policyKey.replace(/'/g, "''")}'
        ELSE
          INSERT INTO upload_policies (policy_key, max_files, max_size_mb, allowed_formats, updatedAt)
          VALUES ('${policyKey.replace(/'/g, "''")}', ${cleanMaxFiles}, ${cleanMaxSize}, '${cleanFormats.replace(/'/g, "''")}', CURRENT_TIMESTAMP)
      `);
    }

    const updated = await getUploadPolicy(policyKey);
    res.json({ success: true, message: `Upload policy for "${policyKey}" updated successfully.`, policy: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function getResourceType(originalName = '', mimetype = '') {
  const ext = path.extname(originalName || '').toLowerCase();
  const mime = (mimetype || '').toLowerCase();

  if (
    mime.startsWith('image/') ||
    /\.(jpg|jpeg|png|webp|svg|gif|avif)$/i.test(ext)
  ) {
    return 'image';
  }

  // Non-images (PDFs, spreadsheets, DOCX, TXT) must use 'raw'
  return 'raw';
}

function uploadBuffer(fileBuffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(fileBuffer);
  });
}

async function saveFileLocally(file, req) {
  const { originalname, buffer, mimetype, size } = file;
  const resourceType = getResourceType(originalname, mimetype);
  const ext = path.extname(originalname) || '';
  const cleanBase = path.parse(originalname).name.replace(/[^a-zA-Z0-9_-]/g, '_');
  const uniqueFilename = `${cleanBase}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}${ext}`;
  const targetFilePath = path.join(uploadsDir, uniqueFilename);

  await fs.promises.writeFile(targetFilePath, buffer);

  const protocol = req.protocol || 'http';
  const host = req.get('host') || 'localhost:5000';
  const fileUrl = `${protocol}://${host}/uploads/${uniqueFilename}`;

  return {
    name: originalname,
    size: size,
    formattedSize: formatBytes(size),
    url: fileUrl,
    secure_url: fileUrl,
    public_id: uniqueFilename,
    format: ext.replace('.', '').toLowerCase(),
    resource_type: resourceType,
    storage: 'local'
  };
}

export async function uploadSingleFile(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided for upload.' });
    }

    const folder = req.body.folder || 'fams_documents';
    const policyKey = req.body.policyKey || (folder.includes('asset') && !folder.includes('document') ? 'asset_photos' : 'asset_documents');
    const policy = await getUploadPolicy(policyKey);

    try {
      validateFileAgainstPolicy(req.file, policy);
    } catch (valErr) {
      return res.status(400).json({ success: false, message: valErr.message });
    }

    const { originalname, buffer, mimetype, size } = req.file;

    const cleanFilename = originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const publicId = `${path.parse(cleanFilename).name}_${Date.now()}`;

    const uploadOptions = {
      folder,
      resource_type: resourceType,
      public_id: publicId,
      use_filename: true,
      unique_filename: true
    };

    try {
      const result = await uploadBuffer(buffer, uploadOptions);
      return res.json({
        success: true,
        message: 'File uploaded successfully',
        file: {
          name: originalname,
          size: size,
          formattedSize: formatBytes(size),
          url: result.secure_url,
          secure_url: result.secure_url,
          public_id: result.public_id,
          format: result.format || path.extname(originalname).replace('.', '').toLowerCase(),
          resource_type: result.resource_type || resourceType,
          storage: 'cloudinary'
        }
      });
    } catch (cloudErr) {
      console.warn('[Cloudinary Upload Error, saving file locally]:', cloudErr?.message || cloudErr);
      const localFile = await saveFileLocally(req.file, req);
      return res.json({
        success: true,
        message: 'File saved locally successfully (Cloudinary fallback)',
        file: localFile
      });
    }
  } catch (err) {
    console.error('[Upload Handler Error]:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to process file upload.'
    });
  }
}

export async function uploadMultipleFiles(req, res, next) {
  try {
    const files = req.files || [];
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files provided for upload.' });
    }

    const folder = req.body.folder || 'fams_documents';
    const policyKey = req.body.policyKey || (folder.includes('asset') && !folder.includes('document') ? 'asset_photos' : 'asset_documents');
    const policy = await getUploadPolicy(policyKey);

    for (const file of files) {
      try {
        validateFileAgainstPolicy(file, policy);
      } catch (valErr) {
        return res.status(400).json({ success: false, message: valErr.message });
      }
    }

    const uploaded = await Promise.all(
      files.map(async (file) => {
        try {
          const resourceType = getResourceType(file.originalname, file.mimetype);
          const cleanFilename = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
          const publicId = `${path.parse(cleanFilename).name}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

          const result = await uploadBuffer(file.buffer, {
            folder,
            resource_type: resourceType,
            public_id: publicId
          });

          return {
            name: file.originalname,
            size: file.size,
            formattedSize: formatBytes(file.size),
            url: result.secure_url,
            secure_url: result.secure_url,
            public_id: result.public_id,
            format: result.format || path.extname(file.originalname).replace('.', '').toLowerCase(),
            resource_type: result.resource_type || resourceType,
            storage: 'cloudinary'
          };
        } catch (cloudErr) {
          console.warn(`[Cloudinary Multi-Upload Error for ${file.originalname}, falling back to local]:`, cloudErr?.message || cloudErr);
          return await saveFileLocally(file, req);
        }
      })
    );

    return res.json({
      success: true,
      message: `${uploaded.length} file(s) uploaded successfully`,
      files: uploaded
    });
  } catch (err) {
    console.error('[Multi-Upload Error]:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to upload documents.'
    });
  }
}
