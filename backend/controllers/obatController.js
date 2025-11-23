const Obat = require("../models/Obat");
const Notification = require("../models/Notification");
const path = require("path");
const fs = require("fs");

// Create Medicine
exports.createObat = async (req, res) => {
  try {
    const {
      namaObat,
      dosis,
      frekuensi,
      waktuKonsumsi,
      tanggalMulai,
      tanggalSelesai,
      catatan,
    } = req.body;

    // Parse waktuKonsumsi if it's a string
    const parsedWaktu =
      typeof waktuKonsumsi === "string"
        ? JSON.parse(waktuKonsumsi)
        : waktuKonsumsi;

    const obatData = {
      userId: req.userId,
      namaObat,
      dosis,
      frekuensi,
      waktuKonsumsi: parsedWaktu,
      tanggalMulai,
      tanggalSelesai,
      catatan,
      gambarObat: req.file ? `/uploads/obat/${req.file.filename}` : null,
    };

    const obat = await Obat.create(obatData);

    // Create notifications for this medicine
    await createNotificationsForObat(obat);

    res.status(201).json({
      success: true,
      message: "Medicine added successfully",
      data: { obat },
    });
  } catch (error) {
    // Delete uploaded file if error occurs
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: "Failed to create medicine",
      error: error.message,
    });
  }
};

// Get All Medicines for User
exports.getAllObat = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = { userId: req.userId };
    if (status) {
      filter.status = status;
    }

    const obatList = await Obat.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: obatList.length,
      data: { obatList },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get medicines",
      error: error.message,
    });
  }
};

// Get Single Medicine
exports.getObatById = async (req, res) => {
  try {
    const obat = await Obat.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!obat) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    res.status(200).json({
      success: true,
      data: { obat },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get medicine",
      error: error.message,
    });
  }
};

// Update Medicine
exports.updateObat = async (req, res) => {
  try {
    const {
      namaObat,
      dosis,
      frekuensi,
      waktuKonsumsi,
      tanggalMulai,
      tanggalSelesai,
      catatan,
      status,
      reminderActive,
    } = req.body;

    const obat = await Obat.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!obat) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    // Delete old image if new one is uploaded
    if (req.file && obat.gambarObat) {
      const oldImagePath = path.join(__dirname, "..", obat.gambarObat);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Parse waktuKonsumsi if it's a string
    const parsedWaktu = waktuKonsumsi
      ? typeof waktuKonsumsi === "string"
        ? JSON.parse(waktuKonsumsi)
        : waktuKonsumsi
      : obat.waktuKonsumsi;

    // Update fields
    obat.namaObat = namaObat || obat.namaObat;
    obat.dosis = dosis || obat.dosis;
    obat.frekuensi = frekuensi || obat.frekuensi;
    obat.waktuKonsumsi = parsedWaktu;
    obat.tanggalMulai = tanggalMulai || obat.tanggalMulai;
    obat.tanggalSelesai = tanggalSelesai || obat.tanggalSelesai;
    obat.catatan = catatan !== undefined ? catatan : obat.catatan;
    obat.status = status || obat.status;
    obat.reminderActive =
      reminderActive !== undefined ? reminderActive : obat.reminderActive;

    if (req.file) {
      obat.gambarObat = `/uploads/obat/${req.file.filename}`;
    }

    await obat.save();

    // Recreate notifications if schedule changed
    if (waktuKonsumsi || tanggalMulai || tanggalSelesai) {
      await Notification.deleteMany({ obatId: obat._id, status: "pending" });
      await createNotificationsForObat(obat);
    }

    res.status(200).json({
      success: true,
      message: "Medicine updated successfully",
      data: { obat },
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: "Failed to update medicine",
      error: error.message,
    });
  }
};

// Delete Medicine
exports.deleteObat = async (req, res) => {
  try {
    const obat = await Obat.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!obat) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    // Delete image file
    if (obat.gambarObat) {
      const imagePath = path.join(__dirname, "..", obat.gambarObat);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Delete related notifications
    await Notification.deleteMany({ obatId: obat._id });

    await obat.deleteOne();

    res.status(200).json({
      success: true,
      message: "Medicine deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete medicine",
      error: error.message,
    });
  }
};

// Helper function to create notifications
async function createNotificationsForObat(obat) {
  const notifications = [];
  const startDate = new Date(obat.tanggalMulai);
  const endDate = new Date(obat.tanggalSelesai);

  // Generate notifications for each day and time
  for (
    let date = new Date(startDate);
    date <= endDate;
    date.setDate(date.getDate() + 1)
  ) {
    for (const waktu of obat.waktuKonsumsi) {
      const [hours, minutes] = waktu.split(":");
      const scheduledTime = new Date(date);
      scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Only create notification if it's in the future
      if (scheduledTime > new Date()) {
        notifications.push({
          userId: obat.userId,
          obatId: obat._id,
          title: `Reminder: ${obat.namaObat}`,
          message: `Waktunya minum obat ${obat.namaObat} - ${obat.dosis}`,
          scheduledTime: scheduledTime,
          type: "reminder",
        });
      }
    }
  }

  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }
}
