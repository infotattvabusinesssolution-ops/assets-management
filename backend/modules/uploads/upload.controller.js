import path from 'path';
import cloudinary from '../../config/cloudinary.js';

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

export async function uploadSingleFile(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided for upload.' });
    }

    const { originalname, buffer, mimetype, size } = req.file;
    const resourceType = getResourceType(originalname, mimetype);
    const folder = req.body.folder || 'fams_documents';

    const cleanFilename = originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const publicId = `${path.parse(cleanFilename).name}_${Date.now()}`;

    const uploadOptions = {
      folder,
      resource_type: resourceType,
      public_id: publicId,
      use_filename: true,
      unique_filename: true
    };

    const result = await uploadBuffer(buffer, uploadOptions);

    return res.json({
      success: true,
      message: 'File uploaded to Cloudinary successfully',
      file: {
        name: originalname,
        size: size,
        formattedSize: formatBytes(size),
        url: result.secure_url,
        secure_url: result.secure_url,
        public_id: result.public_id,
        format: result.format || path.extname(originalname).replace('.', '').toLowerCase(),
        resource_type: result.resource_type || resourceType
      }
    });
  } catch (err) {
    console.error('[Cloudinary Upload Error]:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to upload document to Cloudinary.'
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

    const uploaded = await Promise.all(
      files.map(async (file) => {
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
          resource_type: result.resource_type || resourceType
        };
      })
    );

    return res.json({
      success: true,
      message: `${uploaded.length} file(s) uploaded to Cloudinary successfully`,
      files: uploaded
    });
  } catch (err) {
    console.error('[Cloudinary Multi-Upload Error]:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to upload documents to Cloudinary.'
    });
  }
}
