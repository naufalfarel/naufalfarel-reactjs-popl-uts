const Kunjungan = require("../models/kunjungan");
const Notification = require("../models/Notification");

// Create Medical Visit
exports.createKunjungan = async (req, res) => {
  try {
    const {
      judulKunjungan,
      tanggalKunjungan,
      waktuKunjungan,
      lokasi,
      dokter,
      jenisKunjungan,
      catatan,
      reminderBefore,
    } = req.body;

    // Validation
    if (!judulKunjungan || !tanggalKunjungan || !waktuKunjungan) {
      return res.status(400).json({
        success: false,
        message: "Judul, tanggal, dan waktu kunjungan wajib diisi",
      });
    }

    if (!lokasi || !lokasi.namaRumahSakit) {
      return res.status(400).json({
        success: false,
        message: "Nama rumah sakit wajib diisi",
      });
    }

    const kunjunganData = {
      userId: req.userId,
      judulKunjungan,
      tanggalKunjungan,
      waktuKunjungan,
      lokasi: typeof lokasi === "string" ? JSON.parse(lokasi) : lokasi,
      dokter: dokter
        ? typeof dokter === "string"
          ? JSON.parse(dokter)
          : dokter
        : undefined,
      jenisKunjungan: jenisKunjungan || "kontrol_rutin",
      catatan: catatan || "",
      reminderBefore: reminderBefore || 24,
    };

    const kunjungan = await Kunjungan.create(kunjunganData);

    // Create notification reminder
    try {
      await createKunjunganNotification(kunjungan);
    } catch (notifError) {
      console.error("Error creating notification:", notifError);
      // Don't fail the request if notification creation fails
    }

    res.status(201).json({
      success: true,
      message: "Kunjungan medis berhasil dijadwalkan",
      data: { kunjungan },
    });
  } catch (error) {
    console.error("Error creating kunjungan:", error);
    res.status(500).json({
      success: false,
      message: "Gagal membuat kunjungan medis",
      error: error.message,
    });
  }
};

// Get All Medical Visits
exports.getAllKunjungan = async (req, res) => {
  try {
    const { status, upcoming } = req.query;

    const filter = { userId: req.userId };

    if (status) {
      filter.status = status;
    }

    if (upcoming === "true") {
      filter.tanggalKunjungan = { $gte: new Date() };
      filter.status = "scheduled";
    }

    const kunjunganList = await Kunjungan.find(filter).sort({
      tanggalKunjungan: 1,
    });

    res.status(200).json({
      success: true,
      count: kunjunganList.length,
      data: { kunjunganList },
    });
  } catch (error) {
    console.error("Error getting kunjungan:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mendapatkan daftar kunjungan",
      error: error.message,
    });
  }
};

// Get Medical Visit by ID
exports.getKunjunganById = async (req, res) => {
  try {
    const kunjungan = await Kunjungan.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!kunjungan) {
      return res.status(404).json({
        success: false,
        message: "Kunjungan tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      data: { kunjungan },
    });
  } catch (error) {
    console.error("Error getting kunjungan by id:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mendapatkan data kunjungan",
      error: error.message,
    });
  }
};

// Update Medical Visit
exports.updateKunjungan = async (req, res) => {
  try {
    const {
      judulKunjungan,
      tanggalKunjungan,
      waktuKunjungan,
      lokasi,
      dokter,
      jenisKunjungan,
      catatan,
      reminderBefore,
      status,
    } = req.body;

    const kunjungan = await Kunjungan.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!kunjungan) {
      return res.status(404).json({
        success: false,
        message: "Kunjungan tidak ditemukan",
      });
    }

    // Update fields (only update if provided)
    if (judulKunjungan !== undefined) kunjungan.judulKunjungan = judulKunjungan;
    if (tanggalKunjungan !== undefined)
      kunjungan.tanggalKunjungan = tanggalKunjungan;
    if (waktuKunjungan !== undefined) kunjungan.waktuKunjungan = waktuKunjungan;
    if (lokasi !== undefined) {
      kunjungan.lokasi =
        typeof lokasi === "string" ? JSON.parse(lokasi) : lokasi;
    }
    if (dokter !== undefined) {
      kunjungan.dokter = dokter
        ? typeof dokter === "string"
          ? JSON.parse(dokter)
          : dokter
        : undefined;
    }
    if (jenisKunjungan !== undefined) kunjungan.jenisKunjungan = jenisKunjungan;
    if (catatan !== undefined) kunjungan.catatan = catatan;
    if (reminderBefore !== undefined) kunjungan.reminderBefore = reminderBefore;
    if (status !== undefined) kunjungan.status = status;

    await kunjungan.save();

    // Update notification if date/time changed
    if (
      tanggalKunjungan !== undefined ||
      waktuKunjungan !== undefined ||
      reminderBefore !== undefined
    ) {
      try {
        await Notification.deleteMany({
          userId: req.userId,
          title: { $regex: kunjungan.judulKunjungan },
          status: "pending",
        });
        await createKunjunganNotification(kunjungan);
      } catch (notifError) {
        console.error("Error updating notification:", notifError);
        // Don't fail the request if notification update fails
      }
    }

    res.status(200).json({
      success: true,
      message: "Kunjungan berhasil diupdate",
      data: { kunjungan },
    });
  } catch (error) {
    console.error("Error updating kunjungan:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengupdate kunjungan",
      error: error.message,
    });
  }
};

// Update Visit Result
exports.updateHasilKunjungan = async (req, res) => {
  try {
    const { diagnosa, tindakan, resepObat, catatanDokter } = req.body;

    const kunjungan = await Kunjungan.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!kunjungan) {
      return res.status(404).json({
        success: false,
        message: "Kunjungan tidak ditemukan",
      });
    }

    kunjungan.hasilKunjungan = {
      diagnosa: diagnosa || "",
      tindakan: tindakan || "",
      resepObat: resepObat || "",
      catatanDokter: catatanDokter || "",
    };
    kunjungan.status = "completed";

    await kunjungan.save();

    res.status(200).json({
      success: true,
      message: "Hasil kunjungan berhasil diupdate",
      data: { kunjungan },
    });
  } catch (error) {
    console.error("Error updating hasil kunjungan:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengupdate hasil kunjungan",
      error: error.message,
    });
  }
};

// Delete Medical Visit
exports.deleteKunjungan = async (req, res) => {
  try {
    const kunjungan = await Kunjungan.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!kunjungan) {
      return res.status(404).json({
        success: false,
        message: "Kunjungan tidak ditemukan",
      });
    }

    // Delete related notifications
    try {
      await Notification.deleteMany({
        userId: req.userId,
        title: { $regex: kunjungan.judulKunjungan },
      });
    } catch (notifError) {
      console.error("Error deleting notifications:", notifError);
      // Continue with deletion even if notification deletion fails
    }

    await kunjungan.deleteOne();

    res.status(200).json({
      success: true,
      message: "Kunjungan berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting kunjungan:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menghapus kunjungan",
      error: error.message,
    });
  }
};

// Get Upcoming Visits
exports.getUpcomingVisits = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    nextWeek.setHours(23, 59, 59, 999);

    const upcomingVisits = await Kunjungan.find({
      userId: req.userId,
      tanggalKunjungan: {
        $gte: today,
        $lte: nextWeek,
      },
      status: "scheduled",
    }).sort({ tanggalKunjungan: 1 });

    res.status(200).json({
      success: true,
      count: upcomingVisits.length,
      data: { upcomingVisits },
    });
  } catch (error) {
    console.error("Error getting upcoming visits:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mendapatkan kunjungan mendatang",
      error: error.message,
    });
  }
};

// Helper function to create visit notification
async function createKunjunganNotification(kunjungan) {
  try {
    if (
      !kunjungan.waktuKunjungan ||
      !kunjungan.tanggalKunjungan ||
      !kunjungan.lokasi
    ) {
      return;
    }

    const [hours, minutes] = kunjungan.waktuKunjungan.split(":");
    if (!hours || !minutes) {
      console.error("Invalid waktuKunjungan format:", kunjungan.waktuKunjungan);
      return;
    }

    const visitDateTime = new Date(kunjungan.tanggalKunjungan);
    visitDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // Calculate reminder time
    const reminderTime = new Date(visitDateTime);
    reminderTime.setHours(
      reminderTime.getHours() - (kunjungan.reminderBefore || 24)
    );

    // Only create if reminder is in the future
    if (reminderTime > new Date()) {
      await Notification.create({
        userId: kunjungan.userId,
        obatId: null,
        title: `Reminder: ${kunjungan.judulKunjungan}`,
        message: `Jadwal kunjungan Anda ${
          kunjungan.reminderBefore || 24
        } jam lagi di ${kunjungan.lokasi.namaRumahSakit || "rumah sakit"}`,
        scheduledTime: reminderTime,
        type: "warning",
      });
    }
  } catch (error) {
    console.error("Error in createKunjunganNotification:", error);
    throw error;
  }
}
