const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  // Informasi Pribadi
  tanggalLahir: {
    type: Date,
  },
  jenisKelamin: {
    type: String,
    enum: ["Laki-laki", "Perempuan"],
  },
  alamat: {
    jalan: String,
    kota: String,
    provinsi: String,
    kodePos: String,
  },

  // Informasi Medis
  jenisTBC: {
    type: String,
    enum: [
      "TBC Paru",
      "TBC Ekstraparu",
      "TBC Resisten Obat (MDR-TB)",
      "TBC Laten",
      "Lainnya",
    ],
  },
  tanggalDiagnosa: {
    type: Date,
  },
  beratBadanAwal: {
    type: Number,
  },
  tingkatKeparahan: {
    type: String,
    enum: ["Ringan", "Sedang", "Berat"],
  },

  // Dokter & Rumah Sakit
  dokter: {
    nama: String,
    spesialis: String,
    rumahSakit: String,
    noTelepon: String,
  },
  rumahSakit: {
    nama: String,
    alamat: String,
    noTelepon: String,
  },

  // Riwayat Pengobatan
  riwayatPengobatan: [
    {
      tanggal: Date,
      keterangan: String,
      diagnosis: String,
      tindakan: String,
      obatDiberikan: String,
      catatanDokter: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  // Alergi & Kondisi Lain
  alergi: [String],
  penyakitPenyerta: [String],
  riwayatPenyakitKeluarga: String,

  // Emergency Contact
  kontakDarurat: {
    nama: String,
    hubungan: String,
    noTelepon: String,
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

profileSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Profile", profileSchema);
