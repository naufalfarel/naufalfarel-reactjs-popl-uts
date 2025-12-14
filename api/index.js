// Vercel serverless function wrapper for Express backend
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Import routes
const authRoutes = require("../backend/routes/auth");
const obatRoutes = require("../backend/routes/obat");
const notificationRoutes = require("../backend/routes/notification");
const progresRoutes = require("../backend/routes/progres");
const kunjunganRoutes = require("../backend/routes/kunjungan");
const edukasiRoutes = require("../backend/routes/edukasi");
const familyRoutes = require("../backend/routes/family");
const profileRoutes = require("../backend/routes/profile");

// Import controllers for initialization
const { seedEdukasiData } = require("../backend/controllers/edukasiController");
const {
  setupCronJobs,
} = require("../backend/controllers/notificationController");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (if using Vercel Blob Storage, adjust this)
app.use("/uploads", express.static(path.join(__dirname, "../backend/uploads")));

// Database connection (cached for serverless)
let cachedDb = null;

const connectDatabase = async () => {
  if (cachedDb) {
    return cachedDb;
  }

  try {
    const db = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/tabbycare",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    cachedDb = db;
    console.log("✅ MongoDB Connected");

    // Auto-seed edukasi content if database is empty (only once)
    await seedEdukasiData();

    return db;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    throw error;
  }
};

// Initialize database connection
connectDatabase().catch(console.error);

// Setup cron jobs (only in serverless environment, they may not work as expected)
// Consider using Vercel Cron Jobs or external cron service
if (process.env.VERCEL_ENV === "production") {
  // Note: node-cron doesn't work well in serverless
  // Use Vercel Cron Jobs instead: https://vercel.com/docs/cron-jobs
  console.log("⚠️ Cron jobs should be configured via Vercel Cron Jobs");
}

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/obat", obatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/progres", progresRoutes);
app.use("/api/kunjungan", kunjunganRoutes);
app.use("/api/edukasi", edukasiRoutes);
app.use("/api/family", familyRoutes);
app.use("/api/profile", profileRoutes);

// Test route
app.get("/api", (req, res) => {
  res.json({
    message: "TabbyCare API Server",
    version: "1.0.0",
    environment: process.env.VERCEL_ENV || "development",
    endpoints: {
      auth: "/api/auth",
      obat: "/api/obat",
      notifications: "/api/notifications",
      progres: "/api/progres",
      kunjungan: "/api/kunjungan",
      edukasi: "/api/edukasi",
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Export for Vercel serverless
module.exports = app;
