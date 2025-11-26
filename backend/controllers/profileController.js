const Profile = require("../models/Profile");
const User = require("../models/User");

// Get Profile
exports.getProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne({ userId: req.userId }).populate(
      "userId",
      "name email phone"
    );

    // If profile doesn't exist, create empty one
    if (!profile) {
      profile = await Profile.create({ userId: req.userId });
      profile = await Profile.findById(profile._id).populate(
        "userId",
        "name email phone"
      );
    }

    res.status(200).json({
      success: true,
      data: { profile },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get profile",
      error: error.message,
    });
  }
};

// Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const {
      tanggalLahir,
      jenisKelamin,
      alamat,
      jenisTBC,
      tanggalDiagnosa,
      beratBadanAwal,
      tingkatKeparahan,
      dokter,
      rumahSakit,
      alergi,
      penyakitPenyerta,
      riwayatPenyakitKeluarga,
      kontakDarurat,
    } = req.body;

    let profile = await Profile.findOne({ userId: req.userId });

    if (!profile) {
      profile = await Profile.create({ userId: req.userId });
    }

    // Update fields
    if (tanggalLahir) profile.tanggalLahir = tanggalLahir;
    if (jenisKelamin) profile.jenisKelamin = jenisKelamin;
    if (alamat) profile.alamat = alamat;
    if (jenisTBC) profile.jenisTBC = jenisTBC;
    if (tanggalDiagnosa) profile.tanggalDiagnosa = tanggalDiagnosa;
    if (beratBadanAwal) profile.beratBadanAwal = beratBadanAwal;
    if (tingkatKeparahan) profile.tingkatKeparahan = tingkatKeparahan;
    if (dokter) profile.dokter = dokter;
    if (rumahSakit) profile.rumahSakit = rumahSakit;
    if (alergi) profile.alergi = alergi;
    if (penyakitPenyerta) profile.penyakitPenyerta = penyakitPenyerta;
    if (riwayatPenyakitKeluarga)
      profile.riwayatPenyakitKeluarga = riwayatPenyakitKeluarga;
    if (kontakDarurat) profile.kontakDarurat = kontakDarurat;

    await profile.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: { profile },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

// Add Medical History
exports.addMedicalHistory = async (req, res) => {
  try {
    const {
      tanggal,
      keterangan,
      diagnosis,
      tindakan,
      obatDiberikan,
      catatanDokter,
    } = req.body;

    let profile = await Profile.findOne({ userId: req.userId });

    if (!profile) {
      profile = await Profile.create({ userId: req.userId });
    }

    profile.riwayatPengobatan.push({
      tanggal: tanggal || new Date(),
      keterangan,
      diagnosis,
      tindakan,
      obatDiberikan,
      catatanDokter,
    });

    await profile.save();

    res.status(201).json({
      success: true,
      message: "Medical history added successfully",
      data: { profile },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add medical history",
      error: error.message,
    });
  }
};

// Delete Medical History
exports.deleteMedicalHistory = async (req, res) => {
  try {
    const { historyId } = req.params;

    const profile = await Profile.findOne({ userId: req.userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    profile.riwayatPengobatan = profile.riwayatPengobatan.filter(
      (item) => item._id.toString() !== historyId
    );

    await profile.save();

    res.status(200).json({
      success: true,
      message: "Medical history deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete medical history",
      error: error.message,
    });
  }
};
