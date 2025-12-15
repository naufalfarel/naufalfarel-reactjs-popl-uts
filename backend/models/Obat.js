const mongoose = require("mongoose");

const obatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  namaObat: {
    type: String,
    required: [true, "Nama obat is required"],
    trim: true,
  },
  dosis: {
    type: String,
    required: [true, "Dosis is required"],
    trim: true,
  },
  frekuensi: {
    type: String,
    required: [true, "Frekuensi is required"],
    enum: ["1x sehari", "2x sehari", "3x sehari", "sesuai kebutuhan"],
    default: "1x sehari",
  },
  waktuKonsumsi: [
    {
      type: String, // Format: "08:00", "14:00", "20:00"
      required: true,
    },
  ],
  tanggalMulai: {
    type: Date,
    required: [true, "Tanggal mulai is required"],
  },
  tanggalSelesai: {
    type: Date,
    required: [true, "Tanggal selesai is required"],
  },
  catatan: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ["aktif", "selesai", "dibatalkan"],
    default: "aktif",
  },
  reminderActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update updatedAt on save
obatSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Obat", obatSchema);
