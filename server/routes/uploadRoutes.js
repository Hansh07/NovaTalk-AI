const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

const upload = multer({ dest: 'uploads/' });

// POST /api/upload - Upload a file locally
router.post('/', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Determine resource type based on mime type
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
    console.error('Local upload error:', error);
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
});

module.exports = router;
