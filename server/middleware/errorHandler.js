const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.stack);

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ 
      success: false, 
      message: `File too large. Max size: ${parseInt(process.env.MAX_FILE_SIZE) / 1024 / 1024}MB` 
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ success: false, message: messages.join(', ') });
  }

  // Duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({ success: false, message: 'Duplicate field value entered' });
  }

  // Default error
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;