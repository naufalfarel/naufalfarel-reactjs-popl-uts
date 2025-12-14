const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configure Cloudinary
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Check if Cloudinary is configured
function isCloudinaryConfigured() {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

// Check if Cloudinary is enabled (alias for isCloudinaryConfigured)
function isCloudinaryEnabled() {
  return isCloudinaryConfigured();
}

// Create Cloudinary storage for Multer
const createCloudinaryStorage = (folder = "tabbycare") => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folder,
      allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
      transformation: [
        {
          width: 1000,
          height: 1000,
          crop: "limit",
          quality: "auto",
        },
      ],
    },
  });
};

// Upload buffer to Cloudinary
const uploadToCloudinary = async (buffer, folder = "tabbycare") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
        transformation: [
          {
            width: 1000,
            height: 1000,
            crop: "limit",
            quality: "auto",
          },
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    uploadStream.end(buffer);
  });
};

// Delete file from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw error;
  }
};

// Extract public ID from Cloudinary URL
const extractPublicId = (url) => {
  if (!url) return null;
  
  // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{format}
  // or: https://res.cloudinary.com/{cloud_name}/image/upload/{public_id}.{format}
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
  if (match) {
    // Remove folder prefix if present (e.g., "tabbycare/obat/..." -> "tabbycare/obat/...")
    return match[1].replace(/\.[^.]+$/, ""); // Remove file extension
  }
  return null;
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
  isCloudinaryConfigured,
  isCloudinaryEnabled,
  createCloudinaryStorage,
  uploadToCloudinary,
  deleteFromCloudinary,
  extractPublicId,
};
