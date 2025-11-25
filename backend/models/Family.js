const mongoose = require("mongoose");

const familySchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
  },
  relation: {
    type: String,
    required: [true, "Relation is required"],
    enum: ["parent", "spouse", "child", "sibling", "other"],
    default: "other",
  },
  phone: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  emailNotifications: {
    type: Boolean,
    default: true,
  },
  weeklySummary: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries
familySchema.index({ patientId: 1, email: 1 });

module.exports = mongoose.model("Family", familySchema);
