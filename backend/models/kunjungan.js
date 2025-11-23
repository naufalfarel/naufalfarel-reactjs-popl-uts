const mongoose = require("mongoose");

const kunjunganSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  judulKunjungan: {
    type: String,
    required: [true, "Judul kunjungan is required"],
    trim: true,
  },
  tanggalKunjungan: {
    type: Date,
    required: [true, "Tanggal kunjungan is required"],
  },
  waktuKunjungan: {
    type: String, // Format: "14:00"
    required: [true, "Waktu kunjungan is required"],
  },
  lokasi: {
    namaRumahSakit: {
      type: String,
      required: true,
      trim: true,
    },
    alamat: {
      type: String,
      trim: true,
    },
  },
  dokter: {
    nama: {
      type: String,
      trim: true,
    },
    spesialis: {
      type: String,
      trim: true,
    },
  },
  jenisKunjungan: {
    type: String,
    enum: [
      "kontrol_rutin",
      "pemeriksaan_lab",
      "konsultasi",
      "vaksinasi",
      "lainnya",
    ],
    default: "kontrol_rutin",
  },
  catatan: {
    type: String,
    trim: true,
  },
  reminderBefore: {
    type: Number, // in hours before appointment
    default: 24, // 1 day before
  },
  status: {
    type: String,
    enum: ["scheduled", "completed", "cancelled", "missed"],
    default: "scheduled",
  },
  hasilKunjungan: {
    diagnosa: { type: String, default: null },
    tindakan: { type: String, default: null },
    resepObat: { type: String, default: null },
    catatanDokter: { type: String, default: null },
  },
  notificationSent: {
    type: Boolean,
    default: false,
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
kunjunganSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
kunjunganSchema.index({ userId: 1, tanggalKunjungan: 1, status: 1 });

module.exports = mongoose.model("Kunjungan", kunjunganSchema);
