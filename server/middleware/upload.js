const multer = require('multer');
const path = require('path');
const fs = require('fs');

const imageUploadDir = path.join(__dirname, '../uploads/images');
const audioUploadDir = path.join(__dirname, '../uploads/audio');

// Create directories if they don't exist
[imageUploadDir, audioUploadDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Storage configuration for images
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('[UPLOAD] Saving image to:', imageUploadDir);
    cb(null, imageUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `img_${req.user?.id || 'anonymous'}_${Date.now()}${path.extname(file.originalname)}`;
    console.log('[UPLOAD] Image filename:', uniqueName);
    cb(null, uniqueName);
  },
});

// Storage configuration for audio
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, audioUploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `audio_${req.user?.id || 'anonymous'}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filters
const imageFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    console.log('[UPLOAD] Image type accepted:', file.mimetype);
    cb(null, true);
  } else {
    console.log('[UPLOAD] Image type rejected:', file.mimetype);
    cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'), false);
  }
};

const audioFilter = (req, file, cb) => {
  const allowed = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp4', 'audio/m4a'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only audio files (MP3, WAV, OGG, WebM, M4A) are allowed'), false);
};

const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024;

// Create multer instances
const uploadImage = multer({ 
  storage: imageStorage, 
  fileFilter: imageFilter, 
  limits: { fileSize: maxSize } 
}).single('image');  // IMPORTANT: field name must be 'image'

const uploadAudio = multer({ 
  storage: audioStorage, 
  fileFilter: audioFilter, 
  limits: { fileSize: maxSize } 
}).single('audio');

// Middleware wrappers
const handleImageUpload = (req, res, next) => {
  console.log('[UPLOAD] handleImageUpload called');
  uploadImage(req, res, (err) => {
    if (err) {
      console.error('[UPLOAD] Upload error:', err.message);
      return res.status(400).json({ success: false, message: err.message });
    }
    if (!req.file) {
      console.error('[UPLOAD] No file received');
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }
    console.log('[UPLOAD] File received:', req.file.filename);
    next();
  });
};

const handleAudioUpload = (req, res, next) => {
  uploadAudio(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
};

module.exports = { handleImageUpload, handleAudioUpload };