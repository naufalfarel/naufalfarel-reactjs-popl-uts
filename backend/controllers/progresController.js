const Progres = require("../models/Progres");
const path = require("path");
const fs = require("fs");

// Create Progress Entry
exports.createProgres = async (req, res) => {
  try {
    const {
      tanggal,
      beratBadan,
      suhuBadan,
      tekananDarah,
      gejala,
      tingkatGejala,
      catatanHarian,
      mood,
      kepatuhanObat,
    } = req.body;

    const progresData = {
      userId: req.userId,
      tanggal: tanggal || new Date(),
      beratBadan,
      suhuBadan,
      tekananDarah: tekananDarah ? JSON.parse(tekananDarah) : undefined,
      gejala: gejala
        ? typeof gejala === "string"
          ? JSON.parse(gejala)
          : gejala
        : [],
      tingkatGejala,
      catatanHarian,
      mood,
      kepatuhanObat,
      fotoProgres: req.file ? `/uploads/progres/${req.file.filename}` : null,
    };

    const progres = await Progres.create(progresData);

    res.status(201).json({
      success: true,
      message: "Progress recorded successfully",
      data: { progres },
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: "Failed to create progress",
      error: error.message,
    });
  }
};

// Get All Progress for User
exports.getAllProgres = async (req, res) => {
  try {
    const { startDate, endDate, limit = 30 } = req.query;

    const filter = { userId: req.userId };

    if (startDate && endDate) {
      filter.tanggal = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const progresList = await Progres.find(filter)
      .sort({ tanggal: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: progresList.length,
      data: { progresList },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get progress",
      error: error.message,
    });
  }
};

// Get Progress by ID
exports.getProgresById = async (req, res) => {
  try {
    const progres = await Progres.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!progres) {
      return res.status(404).json({
        success: false,
        message: "Progress not found",
      });
    }

    res.status(200).json({
      success: true,
      data: { progres },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get progress",
      error: error.message,
    });
  }
};

// Update Progress
exports.updateProgres = async (req, res) => {
  try {
    const {
      beratBadan,
      suhuBadan,
      tekananDarah,
      gejala,
      tingkatGejala,
      catatanHarian,
      mood,
      kepatuhanObat,
    } = req.body;

    const progres = await Progres.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!progres) {
      return res.status(404).json({
        success: false,
        message: "Progress not found",
      });
    }

    // Delete old image if new one uploaded
    if (req.file && progres.fotoProgres) {
      const oldImagePath = path.join(__dirname, "..", progres.fotoProgres);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update fields
    progres.beratBadan = beratBadan || progres.beratBadan;
    progres.suhuBadan = suhuBadan !== undefined ? suhuBadan : progres.suhuBadan;
    progres.tekananDarah = tekananDarah
      ? JSON.parse(tekananDarah)
      : progres.tekananDarah;
    progres.gejala = gejala
      ? typeof gejala === "string"
        ? JSON.parse(gejala)
        : gejala
      : progres.gejala;
    progres.tingkatGejala = tingkatGejala || progres.tingkatGejala;
    progres.catatanHarian =
      catatanHarian !== undefined ? catatanHarian : progres.catatanHarian;
    progres.mood = mood || progres.mood;
    progres.kepatuhanObat =
      kepatuhanObat !== undefined ? kepatuhanObat : progres.kepatuhanObat;

    if (req.file) {
      progres.fotoProgres = `/uploads/progres/${req.file.filename}`;
    }

    await progres.save();

    res.status(200).json({
      success: true,
      message: "Progress updated successfully",
      data: { progres },
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: "Failed to update progress",
      error: error.message,
    });
  }
};

// Delete Progress
exports.deleteProgres = async (req, res) => {
  try {
    const progres = await Progres.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!progres) {
      return res.status(404).json({
        success: false,
        message: "Progress not found",
      });
    }

    // Delete image
    if (progres.fotoProgres) {
      const imagePath = path.join(__dirname, "..", progres.fotoProgres);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await progres.deleteOne();

    res.status(200).json({
      success: true,
      message: "Progress deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete progress",
      error: error.message,
    });
  }
};

// Get Progress Statistics
exports.getProgresStats = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const progresList = await Progres.find({
      userId: req.userId,
      tanggal: { $gte: startDate },
    }).sort({ tanggal: 1 });

    // Calculate statistics
    const stats = {
      totalEntries: progresList.length,
      averageWeight: 0,
      weightChange: 0,
      averageAdherence: 0,
      commonSymptoms: {},
      moodDistribution: {},
    };

    if (progresList.length > 0) {
      // Average weight
      const totalWeight = progresList.reduce((sum, p) => sum + p.beratBadan, 0);
      stats.averageWeight = (totalWeight / progresList.length).toFixed(1);

      // Weight change
      if (progresList.length >= 2) {
        const firstWeight = progresList[0].beratBadan;
        const lastWeight = progresList[progresList.length - 1].beratBadan;
        stats.weightChange = (lastWeight - firstWeight).toFixed(1);
      }

      // Average adherence
      const totalAdherence = progresList.reduce(
        (sum, p) => sum + p.kepatuhanObat,
        0
      );
      stats.averageAdherence = Math.round(totalAdherence / progresList.length);

      // Common symptoms
      progresList.forEach((p) => {
        p.gejala.forEach((gejala) => {
          stats.commonSymptoms[gejala] =
            (stats.commonSymptoms[gejala] || 0) + 1;
        });
      });

      // Mood distribution
      progresList.forEach((p) => {
        stats.moodDistribution[p.mood] =
          (stats.moodDistribution[p.mood] || 0) + 1;
      });
    }

    res.status(200).json({
      success: true,
      data: { stats, progresList },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get statistics",
      error: error.message,
    });
  }
};
