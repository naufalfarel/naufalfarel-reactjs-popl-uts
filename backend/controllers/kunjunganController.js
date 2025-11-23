const Kunjungan = require("../models/Kunjungan");
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
      jenisKunjungan,
      catatan,
      reminderBefore: reminderBefore || 24,
    };

    const kunjungan = await Kunjungan.create(kunjunganData);

    // Create notification reminder
    await createKunjunganNotification(kunjungan);

    res.status(201).json({
      success: true,
      message: "Medical visit scheduled successfully",
      data: { kunjungan },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create medical visit",
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
    res.status(500).json({
      success: false,
      message: "Failed to get medical visits",
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
        message: "Medical visit not found",
      });
    }

    res.status(200).json({
      success: true,
      data: { kunjungan },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get medical visit",
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
        message: "Medical visit not found",
      });
    }

    // Update fields
    kunjungan.judulKunjungan = judulKunjungan || kunjungan.judulKunjungan;
    kunjungan.tanggalKunjungan = tanggalKunjungan || kunjungan.tanggalKunjungan;
    kunjungan.waktuKunjungan = waktuKunjungan || kunjungan.waktuKunjungan;
    kunjungan.lokasi = lokasi
      ? typeof lokasi === "string"
        ? JSON.parse(lokasi)
        : lokasi
      : kunjungan.lokasi;
    kunjungan.dokter = dokter
      ? typeof dokter === "string"
        ? JSON.parse(dokter)
        : dokter
      : kunjungan.dokter;
    kunjungan.jenisKunjungan = jenisKunjungan || kunjungan.jenisKunjungan;
    kunjungan.catatan = catatan !== undefined ? catatan : kunjungan.catatan;
    kunjungan.reminderBefore = reminderBefore || kunjungan.reminderBefore;
    kunjungan.status = status || kunjungan.status;

    await kunjungan.save();

    // Update notification if date/time changed
    if (tanggalKunjungan || waktuKunjungan || reminderBefore) {
      await Notification.deleteMany({
        userId: req.userId,
        title: { $regex: kunjungan.judulKunjungan },
        status: "pending",
      });
      await createKunjunganNotification(kunjungan);
    }

    res.status(200).json({
      success: true,
      message: "Medical visit updated successfully",
      data: { kunjungan },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update medical visit",
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
        message: "Medical visit not found",
      });
    }

    kunjungan.hasilKunjungan = {
      diagnosa,
      tindakan,
      resepObat,
      catatanDokter,
    };
    kunjungan.status = "completed";

    await kunjungan.save();

    res.status(200).json({
      success: true,
      message: "Visit result updated successfully",
      data: { kunjungan },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update visit result",
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
        message: "Medical visit not found",
      });
    }

    // Delete related notifications
    await Notification.deleteMany({
      userId: req.userId,
      title: { $regex: kunjungan.judulKunjungan },
    });

    await kunjungan.deleteOne();

    res.status(200).json({
      success: true,
      message: "Medical visit deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete medical visit",
      error: error.message,
    });
  }
};

// Get Upcoming Visits
exports.getUpcomingVisits = async (req, res) => {
  try {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

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
    res.status(500).json({
      success: false,
      message: "Failed to get upcoming visits",
      error: error.message,
    });
  }
};

// Helper function to create visit notification
async function createKunjunganNotification(kunjungan) {
  const [hours, minutes] = kunjungan.waktuKunjungan.split(":");
  const visitDateTime = new Date(kunjungan.tanggalKunjungan);
  visitDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

  // Calculate reminder time
  const reminderTime = new Date(visitDateTime);
  reminderTime.setHours(reminderTime.getHours() - kunjungan.reminderBefore);

  // Only create if reminder is in the future
  if (reminderTime > new Date()) {
    await Notification.create({
      userId: kunjungan.userId,
      obatId: null,
      title: `Reminder: ${kunjungan.judulKunjungan}`,
      message: `Jadwal kunjungan Anda ${kunjungan.reminderBefore} jam lagi di ${kunjungan.lokasi.namaRumahSakit}`,
      scheduledTime: reminderTime,
      type: "warning",
    });
  }
}
