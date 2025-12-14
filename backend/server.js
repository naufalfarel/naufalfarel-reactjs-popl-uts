const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const logger = require("./Utils/logger");


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

// Import cron setup (IDEMPOTENT)
const { setupCronJobs } = require("./controllers/notificationController");

const app = express();

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Request Logger
app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    logger.info("HTTP Request", {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration_ms: Date.now() - start,
      ip: req.ip,
      userId: req.userId || "guest",
    });
  });

  next();
});


/* =========================
   STATIC FILES
========================= */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =========================
   DATABASE
========================= */
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/tabbycare")
  .then(() => logger.info("MongoDB connected"))
  .catch((err) =>
    logger.error("MongoDB connection error", { error: err.message })
  );

/* =========================
   ROUTES
========================= */
app.use("/api/auth", authRoutes);
app.use("/api/obat", obatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/progres", progresRoutes);
app.use("/api/kunjungan", kunjunganRoutes);
app.use("/api/edukasi", edukasiRoutes);
app.use("/api/family", familyRoutes);
app.use("/api/profile", profileRoutes);

// Health / test route
app.get("/", (req, res) => {
  res.json({
    message: "TabbyCare API Server",
    version: "1.0.0",
    status: "running",
  });
});

/* =========================
   ERROR HANDLING
========================= */
app.use((err, req, res, next) => {
  logger.error("Unhandled error", {
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  res.status(500).json({
    success: false,
    message: "Something went wrong!",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/* =========================
   CRON JOBS (RUN ONCE)
========================= */
if (process.env.NODE_ENV !== "test") {
  setupCronJobs();
}

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info("Server started", {
    port: PORT,
    env: process.env.NODE_ENV || "development",
  });
});

app.use(require("./middlewares/requestLogger"));