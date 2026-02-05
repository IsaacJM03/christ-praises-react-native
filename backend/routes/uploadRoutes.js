const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/authMiddleware');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
['profile', 'post', 'general'].forEach(subDir => {
  const dir = path.join(uploadsDir, subDir);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Disk storage - files are saved directly to disk
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // With multipart/form-data, body fields come after the file
    // So we need to default to 'general' and move the file later if needed
    const typeDir = path.join(uploadsDir, 'general');
    if (!fs.existsSync(typeDir)) {
      fs.mkdirSync(typeDir, { recursive: true });
    }
    cb(null, typeDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '.jpg';
    const filename = `${req.user?.id || 'anon'}-${uniqueSuffix}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Upload single image
router.post('/image', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    console.log('=== Upload Request ===');
    console.log('Body:', req.body);
    console.log('File:', req.file);
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const type = req.body?.type || 'general';
    
    // If type is not 'general', move the file to the correct folder
    let finalPath = req.file.path;
    let finalFilename = req.file.filename;
    
    if (type !== 'general') {
      const targetDir = path.join(uploadsDir, type);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      const newPath = path.join(targetDir, req.file.filename);
      fs.renameSync(req.file.path, newPath);
      finalPath = newPath;
      
      console.log('Moved file from', req.file.path, 'to', newPath);
    }

    const imageUrl = `/uploads/${type}/${finalFilename}`;
    
    console.log('=== File Saved ===');
    console.log('Path:', finalPath);
    console.log('URL:', imageUrl);
    console.log('Size:', req.file.size);
    
    res.json({
      success: true,
      data: {
        url: imageUrl,
        filename: finalFilename,
        size: req.file.size,
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Upload failed: ' + error.message });
  }
});

// Error handling
router.use((error, req, res, next) => {
  console.error('Multer error:', error);
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File too large. Max 10MB allowed.' });
    }
  }
  res.status(500).json({ success: false, message: error.message });
});

module.exports = router;
