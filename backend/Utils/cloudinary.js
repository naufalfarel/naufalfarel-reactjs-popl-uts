const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  createCloudinaryStorage,
  isCloudinaryConfigured,
} = require("../Utils/cloudinary");

// Check if Cloudinary is configured
const isCloudinaryEnabled = () => {
  return isCloudinaryConfigured();
};

// Create uploads directory for local storage
const uploadDir = path.join(__dirname, "../uploads");
const uploadDirObat = path.join(uploadDir, "obat");
const uploadDirProgres = path.join(uploadDir, "progres");

if (!fs.existsSync(uploadDirObat)) {
  fs.mkdirSync(uploadDirObat, { recursive: true });
}
if (!fs.existsSync(uploadDirProgres)) {
  fs.mkdirSync(uploadDirProgres, { recursive: true });
}

// Local storage configuration (fallback)
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

// Create upload middleware based on environment
const createUploadMiddleware = (folder = "tabbycare") => {
  const useCloudinary = isCloudinaryEnabled();

  if (useCloudinary) {
    console.log("📸 Using Cloudinary storage");
    return multer({
      storage: createCloudinaryStorage(folder),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
      fileFilter: fileFilter,
    });
  } else {
    console.log("📁 Using local storage");
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
        message: "File size too large. Maximum 10MB allowed.",
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

// Cleanup local file (only if not using Cloudinary)
const cleanupLocalFile = (filePath) => {
  if (!isCloudinaryEnabled() && filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log("🗑️ Local file deleted:", filePath);
  }
};

module.exports = {
  upload,
  handleUploadError,
  cleanupLocalFile,
  isCloudinaryConfigured: isCloudinaryEnabled,
};
