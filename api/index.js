// Vercel serverless function wrapper for Express backend
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Force timezone to Asia/Jakarta in Vercel runtime
process.env.TZ = "Asia/Jakarta";

const app = express();

// Middleware
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

// Body parser - IMPORTANT: Don't parse multipart/form-data here, let multer handle it
// Only parse JSON and urlencoded, multer will handle file uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Log file upload configuration
console.log("📦 File Upload Configuration:");
console.log("  VERCEL_ENV:", process.env.VERCEL_ENV || "Not Set");
console.log("  Storage:", process.env.VERCEL === "1" || process.env.VERCEL_ENV ? "Base64 (MongoDB)" : "Local Disk");

// Serve uploaded files (if using Vercel Blob Storage, adjust this)
app.use("/uploads", express.static(path.join(__dirname, "../backend/uploads")));

// Database connection (cached for serverless)
let cachedDb = null;
let isConnecting = false;

const connectDatabase = async () => {
  // Return cached connection if available
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }

  // Prevent multiple simultaneous connection attempts
  if (isConnecting) {
    // Wait for existing connection attempt
    while (isConnecting) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (cachedDb && mongoose.connection.readyState === 1) {
      return cachedDb;
    }
  }

  isConnecting = true;

  try {
    // Close existing connection if any
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    const db = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/tabbycare",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      }
    );

    cachedDb = db;
    console.log("✅ MongoDB Connected");

    // Auto-seed edukasi content if database is empty (only once)
    try {
      const {
        seedEdukasiData,
      } = require("../backend/controllers/edukasiController");
      await seedEdukasiData();
    } catch (seedError) {
      console.error("⚠️ Error seeding edukasi:", seedError.message);
      // Don't throw, just log
    }

    isConnecting = false;
    return db;
  } catch (error) {
    isConnecting = false;
    console.error("❌ MongoDB Connection Error:", error);
    throw error;
  }
};

// Middleware to ensure database connection before handling requests
const ensureDbConnection = async (req, res, next) => {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      return next();
    }

    // Try to connect
    await connectDatabase();
    next();
  } catch (error) {
    console.error("❌ Database connection error in middleware:", error);
    console.error("MONGODB_URI:", process.env.MONGODB_URI ? "Set" : "NOT SET");

    return res.status(500).json({
      success: false,
      message: "Database connection failed",
      error:
        process.env.NODE_ENV === "development" ||
        process.env.VERCEL_ENV !== "production"
          ? error.message
          : "Internal server error. Please check server logs.",
    });
  }
};

// Apply database connection middleware to all API routes (except health check)
app.use((req, res, next) => {
  // Skip DB check for health check endpoint
  if (req.path === "/api" || req.path === "/api/health") {
    return next();
  }
  ensureDbConnection(req, res, next);
});

// Import routes (after database connection setup)
const authRoutes = require("../backend/routes/auth");
const obatRoutes = require("../backend/routes/obat");
const notificationRoutes = require("../backend/routes/notification");
const progresRoutes = require("../backend/routes/progres");
const kunjunganRoutes = require("../backend/routes/kunjungan");
const edukasiRoutes = require("../backend/routes/edukasi");
const familyRoutes = require("../backend/routes/family");
const profileRoutes = require("../backend/routes/profile");

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/obat", obatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/progres", progresRoutes);
app.use("/api/kunjungan", kunjunganRoutes);
app.use("/api/edukasi", edukasiRoutes);
app.use("/api/family", familyRoutes);
app.use("/api/profile", profileRoutes);

// Health check route (no DB connection required)
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "TabbyCare API Server",
    version: "1.0.0",
    environment:
      process.env.VERCEL_ENV || process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// Test route
app.get("/api", async (req, res) => {
  try {
    // Check database connection
    const dbStatus =
      mongoose.connection.readyState === 1 ? "connected" : "disconnected";

    res.json({
      message: "TabbyCare API Server",
      version: "1.0.0",
      environment:
        process.env.VERCEL_ENV || process.env.NODE_ENV || "development",
      database: dbStatus,
      endpoints: {
        auth: "/api/auth",
        obat: "/api/obat",
        notifications: "/api/notifications",
        progres: "/api/progres",
        kunjungan: "/api/kunjungan",
        edukasi: "/api/edukasi",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Error handling middleware (must be last)
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message || err);
  console.error("Path:", req.path);
  console.error("Method:", req.method);
  if (err.stack) {
    console.error("Stack:", err.stack);
  }

  // Handle specific error types
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      error: err.message,
    });
  }

  if (
    err.name === "MongoError" ||
    err.name === "MongooseError" ||
    err.name === "MongoServerError"
  ) {
    return res.status(500).json({
      success: false,
      message: "Database error",
      error:
        process.env.NODE_ENV === "development" ||
        process.env.VERCEL_ENV !== "production"
          ? err.message
          : "Database operation failed",
    });
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Authentication error",
      error: err.message,
    });
  }

  // Generic error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong!",
    error:
      process.env.NODE_ENV === "development" ||
      process.env.VERCEL_ENV !== "production"
        ? err.message
        : "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

// Export for Vercel serverless
module.exports = app;
