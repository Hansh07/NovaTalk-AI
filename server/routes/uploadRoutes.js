const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');
const cloudinary = require('../config/cloudinary');

const upload = multer({ dest: 'uploads/' });

// POST /api/upload - Upload a file (Cloudinary if configured, otherwise local storage)
router.post('/', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const isCloudinaryConfigured = 
      process.env.CLOUDINARY_CLOUD_NAME && 
      process.env.CLOUDINARY_CLOUD_NAME !== 'demo' &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_KEY !== 'demo' &&
      process.env.CLOUDINARY_API_SECRET &&
      process.env.CLOUDINARY_API_SECRET !== 'demo';

    if (isCloudinaryConfigured) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'novatalk',
          resource_type: 'auto',
        });

        // Clean up temp local file
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }

        return res.json({
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          resourceType: result.resource_type,
        });
      } catch (cloudErr) {
        console.error('Cloudinary upload failed, falling back to local storage:', cloudErr.message);
        // fall through to local storage below
      }
    }

    // Local storage fallback
    const resourceType = req.file.mimetype.startsWith('video/') || req.file.mimetype.startsWith('audio/') 
      ? 'video' 
      : (req.file.mimetype.startsWith('image/') ? 'image' : 'raw');

    // Add explicit extension so browser can serve it safely
    const ext = path.extname(req.file.originalname) || '';
    const newFilename = req.file.filename + ext;
    const newPath = path.join(req.file.destination, newFilename);
    fs.renameSync(req.file.path, newPath);

    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const fileUrl = `${baseUrl}/uploads/${newFilename}`;

    res.json({
      url: fileUrl,
      publicId: newFilename,
      format: ext.replace('.', ''),
      resourceType: resourceType,
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
});

module.exports = router;
