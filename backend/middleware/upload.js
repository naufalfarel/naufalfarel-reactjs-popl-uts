const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Check if running on Vercel
const isVercel = process.env.VERCEL === "1" || process.env.VERCEL_ENV;

// Log configuration for debugging
console.log("📦 Upload Middleware Configuration:");
console.log("  VERCEL:", isVercel ? "✅ Yes" : "❌ No");
console.log("  Storage:", isVercel ? "Memory (base64)" : "Disk (local)");

// Storage configuration
// Vercel: Memory storage (convert to base64)
// Local: Disk storage
let storage;

if (isVercel) {
  // Use memory storage for Vercel (read-only filesystem)
  // Files will be converted to base64 and stored in MongoDB
  storage = multer.memoryStorage();
  console.log("📤 Using memory storage - files will be stored as base64 in MongoDB");
} else {
  // Use disk storage for local development
  const uploadDirObat = path.join(__dirname, "../uploads/obat");
  const uploadDirProgres = path.join(__dirname, "../uploads/progres");

  // Create uploads directory if it doesn't exist
  if (!fs.existsSync(uploadDirObat)) {
    try {
      fs.mkdirSync(uploadDirObat, { recursive: true });
    } catch (error) {
      console.warn("⚠️ Could not create upload directory:", error.message);
    }
  }
  if (!fs.existsSync(uploadDirProgres)) {
    try {
      fs.mkdirSync(uploadDirProgres, { recursive: true });
    } catch (error) {
      console.warn("⚠️ Could not create upload directory:", error.message);
    }
  }

  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      // Determine upload directory based on route
      const uploadDir = req.baseUrl.includes("progres")
        ? uploadDirProgres
        : uploadDirObat;
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      // Generate unique filename
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      const prefix = req.baseUrl.includes("progres") ? "progres" : "obat";
      cb(null, prefix + "-" + uniqueSuffix + ext);
    },
  });
}

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
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

// Multer upload configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: isVercel ? 5 * 1024 * 1024 : 10 * 1024 * 1024, // 5MB for Vercel (base64), 10MB for local
    fieldSize: isVercel ? 5 * 1024 * 1024 : 10 * 1024 * 1024, // 5MB for Vercel, 10MB for local
  },
  fileFilter: fileFilter,
});

// Log multer configuration
console.log("📤 Multer configured with:", {
  storage: storage.constructor.name,
  maxFileSize: isVercel ? "5MB (base64)" : "10MB (disk)",
  allowedTypes: ["jpeg", "jpg", "png", "gif", "webp"],
});

// Middleware to handle upload errors
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      const maxSize = isVercel ? "5MB" : "10MB";
      return res.status(400).json({
        success: false,
        message: `File size too large. Maximum ${maxSize} allowed.`,
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

module.exports = { upload, handleUploadError };
