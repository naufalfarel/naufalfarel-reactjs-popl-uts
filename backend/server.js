const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require("./routes/auth");
const obatRoutes = require("./routes/obat");
const notificationRoutes = require("./routes/notification");
const progresRoutes = require("./routes/progres");
const kunjunganRoutes = require("./routes/kunjungan");
const edukasiRoutes = require("./routes/edukasi");
const familyRoutes = require("./routes/family");
const profileRoutes = require("./routes/profile");

// Import notification controller for cron
const { setupCronJobs } = require("./controllers/notificationController");
// Import edukasi controller for auto-seed
const { seedEdukasiData } = require("./controllers/edukasiController");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (only for local development, not needed for Cloudinary)
// Note: In production with Cloudinary, files are served from Cloudinary CDN
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));
}

// Database connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/tabbycare")
  .then(async () => {
    console.log("✅ MongoDB Connected");
    // Auto-seed edukasi content if database is empty
    await seedEdukasiData();
  })
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

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
app.get("/", (req, res) => {
  res.json({
    message: "TabbyCare API Server",
    version: "1.0.0",
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API URL: http://localhost:${PORT}`);

  // Setup cron jobs for notifications
  setupCronJobs();
});
