const mongoose = require("mongoose");

const edukasiSchema = new mongoose.Schema({
  judul: {
    type: String,
    required: true,
    trim: true,
  },
  kategori: {
    type: String,
    enum: [
      "tentang_tbc",
      "pengobatan",
      "nutrisi",
      "gaya_hidup",
      "pencegahan",
      "tips_kesehatan",
    ],
    required: true,
  },
  konten: {
    type: String,
    required: true,
  },
  ringkasan: {
    type: String,
    trim: true,
  },
  gambar: {
    type: String,
    default: null,
  },
  sumberReferensi: {
    type: String,
    trim: true,
  },
  tags: [
    {
      type: String,
      trim: true,
    },
  ],
  author: {
    type: String,
    default: "TabbyCare Team",
  },
  viewCount: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  publishedAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for search
edukasiSchema.index({ judul: "text", konten: "text", tags: "text" });

module.exports = mongoose.model("Edukasi", edukasiSchema);
