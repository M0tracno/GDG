const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const createDirectories = () => {
  const dirs = ['uploads', 'uploads/profiles', 'uploads/courses', 'uploads/messages'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createDirectories();

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';
    
    // Determine the appropriate folder based on file type/route
    if (req.baseUrl.includes('faculty') || req.baseUrl.includes('student')) {
      uploadPath += 'profiles/';
    } else if (req.baseUrl.includes('course')) {
      uploadPath += 'courses/';
    } else if (req.baseUrl.includes('message')) {
      uploadPath += 'messages/';
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images and documents
  const allowedFileTypes = /jpeg|jpg|png|gif|pdf|doc|docx|ppt|pptx|xls|xlsx/;
  const ext = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (ext && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Unsupported file type. Only images and documents are allowed.'));
  }
};

// Export upload middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter
});

module.exports = upload; 