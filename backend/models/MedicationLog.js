const mongoose = require("mongoose");

const medicationLogSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  medicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Obat",
    required: true,
  },
  scheduledTime: {
    type: Date,
    required: true,
  },
  takenAt: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ["pending", "taken", "missed", "skipped"],
    default: "pending",
  },
  notes: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries
medicationLogSchema.index({ patientId: 1, medicationId: 1, scheduledTime: -1 });
medicationLogSchema.index({ status: 1, scheduledTime: 1 });

// Method to calculate adherence
medicationLogSchema.statics.calculateAdherence = async function (
  patientId,
  startDate,
  endDate
) {
  const logs = await this.find({
    patientId,
    scheduledTime: {
      $gte: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      $lte: endDate || new Date(),
    },
  });

  const total = logs.length;
  const taken = logs.filter((log) => log.status === "taken").length;
  const missed = logs.filter((log) => log.status === "missed").length;

  return {
    total,
    taken,
    missed,
    adherenceRate: total > 0 ? Math.round((taken / total) * 100) : 0,
  };
};

module.exports = mongoose.model("MedicationLog", medicationLogSchema);
