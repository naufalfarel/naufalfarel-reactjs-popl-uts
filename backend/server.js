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

// MongoDB connection
const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/tabbycare";

// Log connection attempt
console.log("🔄 Attempting to connect to MongoDB...");
if (!process.env.MONGODB_URI) {
  console.warn("⚠️  MONGODB_URI not found in .env file, using default: mongodb://localhost:27017/tabbycare");
  console.warn("⚠️  Please create .env file in backend folder with: MONGODB_URI=your_connection_string");
}

// Disable buffering - return error immediately if not connected
mongoose.set('bufferCommands', false);

// Connect to MongoDB with retry
const connectMongoDB = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🔄 MongoDB connection attempt ${i + 1}/${retries}...`);
      
      await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 60000,
      });
      
      console.log("✅ MongoDB Connected Successfully");
      console.log(`📊 Database: ${mongoose.connection.name}`);
      console.log(`🌐 Host: ${mongoose.connection.host}`);
      
      try {
        await seedEdukasiData();
      } catch (seedError) {
        console.error("⚠️  Error seeding edukasi data:", seedError.message);
      }
      
      return true;
    } catch (err) {
      console.error(`❌ MongoDB Connection Error (Attempt ${i + 1}/${retries}):`, err.message);
      
      if (i < retries - 1) {
        console.log(`⏳ Retrying in 5 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      } else {
        console.error("❌ Failed to connect to MongoDB after all retries");
        console.error("📋 Troubleshooting steps:");
        console.error("   1. Check if MONGODB_URI is set in .env file");
        console.error("   2. Verify MongoDB Atlas IP whitelist (allow 0.0.0.0/0 for testing)");
        console.error("   3. Check your internet connection");
        console.error("   4. Verify MongoDB Atlas cluster is running");
        console.error("   5. Check connection string format: mongodb+srv://username:password@cluster.mongodb.net/dbname");
      }
    }
  }
  return false;
};

// Start connection
connectMongoDB();

// MongoDB connection event handlers
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  Mongoose disconnected from MongoDB');
});

// Handle process termination
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
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
    database: {
      status: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      readyState: mongoose.connection.readyState,
    },
  });
});

// Database status route
app.get("/api/health", (req, res) => {
  const dbStatus = {
    connected: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    state: ["disconnected", "connected", "connecting", "disconnecting"][mongoose.connection.readyState] || "unknown",
    host: mongoose.connection.host || "unknown",
    name: mongoose.connection.name || "unknown",
  };
  
  res.json({
    success: dbStatus.connected,
    database: dbStatus,
    server: "running",
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
