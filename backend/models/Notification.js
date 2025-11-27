const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  obatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Obat",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  scheduledTime: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "sent", "read", "dismissed"],
    default: "pending",
  },
  sentAt: {
    type: Date,
    default: null,
  },
  type: {
    type: String,
    enum: ["reminder", "warning", "info"],
    default: "reminder",
  },
  isTaken: {
    type: Boolean,
    default: false,
  },
  takenAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries
notificationSchema.index({ userId: 1, status: 1, scheduledTime: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
