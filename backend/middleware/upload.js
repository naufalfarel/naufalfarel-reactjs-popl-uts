const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Check if running on Vercel (read-only filesystem)
const isVercel = process.env.VERCEL === "1" || process.env.VERCEL_ENV;

// Create uploads directory if it doesn't exist (only if not on Vercel)
const uploadDirObat = path.join(__dirname, "../uploads/obat");
const uploadDirProgres = path.join(__dirname, "../uploads/progres");

if (!isVercel) {
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
} else {
  console.warn(
    "⚠️ Running on Vercel - file uploads to local filesystem are not supported. Consider using Vercel Blob Storage or Cloudinary."
  );
}

// Storage configuration
// Use memory storage for Vercel (read-only filesystem)
const storage = isVercel
  ? multer.memoryStorage() // Store in memory for Vercel
  : multer.diskStorage({
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
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: fileFilter,
});

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

module.exports = { upload, handleUploadError };
