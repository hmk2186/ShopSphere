const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Disk Storage for local fallback
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|webp|avif/;
  const extname = allowedExtensions.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedExtensions.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, webp, avif) are permitted'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: fileFilter,
});

// Helper to upload a file to Cloudinary OR return local path
const processImageUpload = async (file, folder = 'shopsphere') => {
  if (!file) return null;

  if (isCloudinaryConfigured) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: folder,
        use_filename: true,
      });
      // Remove temporary local file after Cloudinary upload
      fs.unlink(file.path, (err) => {
        if (err) console.error('Failed to delete temp upload:', err);
      });
      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (err) {
      console.warn('[Cloudinary] Upload failed, falling back to local file:', err.message);
    }
  }

  // Local fallback URL
  const relativePath = `/uploads/${file.filename}`;
  return {
    url: relativePath,
    publicId: file.filename,
  };
};

module.exports = {
  upload,
  processImageUpload,
};
