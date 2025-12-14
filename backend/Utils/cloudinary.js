const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Convert buffer to base64 data URL
const bufferToBase64 = (buffer, mimetype) => {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error("Invalid buffer provided");
  }
  
  const base64 = buffer.toString('base64');
  return `data:${mimetype};base64,${base64}`;
};

// Check if string is base64 data URL
const isBase64DataUrl = (str) => {
  if (!str || typeof str !== 'string') return false;
  return str.startsWith('data:') && str.includes(';base64,');
};

// Extract mimetype from base64 data URL
const extractMimetypeFromDataUrl = (dataUrl) => {
  if (!isBase64DataUrl(dataUrl)) return null;
  const match = dataUrl.match(/^data:([^;]+);base64,/);
  return match ? match[1] : null;
};

// Create uploads directory for local storage (fallback for non-Vercel environments)
const uploadDir = path.join(__dirname, "../uploads");
const uploadDirObat = path.join(uploadDir, "obat");
const uploadDirProgres = path.join(uploadDir, "progres");

if (!fs.existsSync(uploadDirObat)) {
  try {
    fs.mkdirSync(uploadDirObat, { recursive: true });
  } catch (error) {
    // Ignore error if directory creation fails (e.g., on Vercel)
  }
}
if (!fs.existsSync(uploadDirProgres)) {
  try {
    fs.mkdirSync(uploadDirProgres, { recursive: true });
  } catch (error) {
    // Ignore error if directory creation fails (e.g., on Vercel)
  }
}

// Local storage configuration (fallback for local development)
const localStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = req.baseUrl.includes("progres")
      ? uploadDirProgres
      : uploadDirObat;
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const prefix = req.baseUrl.includes("progres") ? "progres" : "obat";
    cb(null, prefix + "-" + uniqueSuffix + ext);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files (jpeg, jpg, png, gif, webp) are allowed!"));
  }
};

// Create upload middleware
// For Vercel: use memory storage and convert to base64
// For local: use disk storage
const isVercel = process.env.VERCEL === "1" || process.env.VERCEL_ENV;

const createUploadMiddleware = (folder = "tabbycare") => {
  if (isVercel) {
    console.log("📤 Using memory storage (Vercel) - files will be stored as base64");
    return multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max for base64 (to avoid MongoDB document size limits)
      fileFilter: fileFilter,
    });
  } else {
    console.log("📁 Using local disk storage");
    return multer({
      storage: localStorage,
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
      fileFilter: fileFilter,
    });
  }
};

// Main upload instance
const upload = createUploadMiddleware();

// Middleware to handle upload errors
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size too large. Maximum 5MB allowed.",
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  next();
};

// Cleanup local file (only for disk storage)
const cleanupLocalFile = (filePath) => {
  if (filePath && !isVercel && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log("🗑️ Local file deleted:", filePath);
    } catch (error) {
      console.error("Error deleting local file:", error);
    }
  }
};

module.exports = {
  upload,
  handleUploadError,
  cleanupLocalFile,
  bufferToBase64,
  isBase64DataUrl,
  extractMimetypeFromDataUrl,
  // Legacy exports for backward compatibility (will be removed in controllers)
  uploadToCloudinary: async (buffer, mimetype) => {
    // Convert buffer to base64 data URL
    return {
      secure_url: bufferToBase64(buffer, mimetype || 'image/jpeg'),
    };
  },
  deleteFromCloudinary: async () => {
    // No-op for base64 storage (data is in MongoDB)
    return { result: 'ok' };
  },
  extractPublicId: (url) => {
    // No-op for base64 storage
    return null;
  },
};
