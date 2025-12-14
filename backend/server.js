const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config();

// Import logger and middleware
const logger = require("./Utils/logger");
const { requestLogger, errorLogger } = require("./middleware/logger");

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

// Request logging middleware (should be early in the chain)
app.use(requestLogger);

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Database connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/tabbycare")
  .then(async () => {
    logger.info("MongoDB Connected", { uri: process.env.MONGODB_URI || "mongodb://localhost:27017/tabbycare" });
    // Auto-seed edukasi content if database is empty
    await seedEdukasiData();
  })
  .catch((err) => {
    logger.error("MongoDB Connection Error", { error: err.message, stack: err.stack });
  });

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

// Error handling middleware (use errorLogger first, then send response)
app.use(errorLogger);
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
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
  logger.info("Server started", { 
    port: PORT, 
    url: `http://localhost:${PORT}`,
    environment: process.env.NODE_ENV || "development"
  });

  // Setup cron jobs for notifications
  setupCronJobs();
});
