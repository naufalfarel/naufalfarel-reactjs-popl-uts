const mongoose = require("mongoose");

const progresSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  tanggal: {
    type: Date,
    required: true,
    default: Date.now,
  },
  beratBadan: {
    type: Number,
    required: true,
  },
  suhuBadan: {
    type: Number,
    default: null,
  },
  tekananDarah: {
    sistolik: { type: Number, default: null },
    diastolik: { type: Number, default: null },
  },
  gejala: [
    {
      type: String,
      enum: [
        "batuk",
        "demam",
        "berkeringat_malam",
        "penurunan_berat_badan",
        "sesak_napas",
        "nyeri_dada",
        "lainnya",
      ],
    },
  ],
  tingkatGejala: {
    type: String,
    enum: ["ringan", "sedang", "berat"],
    default: "ringan",
  },
  catatanHarian: {
    type: String,
    trim: true,
  },
  fotoProgres: {
    type: String,
    default: null,
  },
  mood: {
    type: String,
    enum: ["sangat_baik", "baik", "cukup", "kurang_baik", "buruk"],
    default: "baik",
  },
  kepatuhanObat: {
    type: Number,
    default: 100,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

progresSchema.index({ userId: 1, tanggal: -1 });

module.exports = mongoose.model("Progres", progresSchema);
