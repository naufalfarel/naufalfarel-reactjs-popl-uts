const Progres = require("../models/Progres");
const path = require("path");
const fs = require("fs");
const { bufferToBase64, isBase64DataUrl } = require("../Utils/cloudinary");

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

    // Handle file upload
    let fotoProgres = null;
    if (req.file) {
      console.log("📤 File received:", {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        hasBuffer: !!req.file.buffer,
        hasPath: !!req.file.path,
      });

      if (req.file.buffer) {
        // Memory storage - convert to base64 (Vercel)
        console.log("📦 Converting to base64...");
        try {
          fotoProgres = bufferToBase64(req.file.buffer, req.file.mimetype);
          console.log("✅ File converted to base64 successfully");
        } catch (uploadError) {
          console.error("❌ Error converting to base64:", uploadError);
          return res.status(500).json({
            success: false,
            message: "Failed to process image",
            error: process.env.NODE_ENV === "development" || process.env.VERCEL_ENV !== "production"
              ? uploadError.message
              : "Upload failed. Please try again.",
          });
        }
      } else if (req.file.path) {
        // Disk storage (local development)
        fotoProgres = `/uploads/progres/${req.file.filename}`;
        console.log("📁 Using local file path:", fotoProgres);
      } else {
        console.error("❌ File object missing both buffer and path");
        return res.status(400).json({
          success: false,
          message: "Invalid file upload. File data is missing.",
        });
      }
    } else {
      console.log("ℹ️ No file uploaded");
    }

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
      fotoProgres,
    };

    const progres = await Progres.create(progresData);

    res.status(201).json({
      success: true,
      message: "Progress recorded successfully",
      data: { progres },
    });
  } catch (error) {
    // Delete uploaded file if error occurs (only for disk storage)
    if (req.file && req.file.path && !req.file.buffer) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error("Error deleting file:", unlinkError);
      }
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

    // Delete old image if new one uploaded (only for local file system)
    if (req.file && progres.fotoProgres && !isBase64DataUrl(progres.fotoProgres) && req.file.path) {
      try {
        // Local file system only
        const oldImagePath = path.join(__dirname, "..", progres.fotoProgres);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
          console.log("🗑️ Old local file deleted:", oldImagePath);
        }
      } catch (deleteError) {
        console.error("Error deleting old file:", deleteError);
        // Continue with update even if deletion fails
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
      console.log("📤 File received for update:", {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        hasBuffer: !!req.file.buffer,
        hasPath: !!req.file.path,
      });

      if (req.file.buffer) {
        // Memory storage - convert to base64 (Vercel)
        console.log("📦 Converting to base64...");
        try {
          progres.fotoProgres = bufferToBase64(req.file.buffer, req.file.mimetype);
          console.log("✅ File converted to base64 successfully");
        } catch (uploadError) {
          console.error("❌ Error converting to base64:", uploadError);
          return res.status(500).json({
            success: false,
            message: "Failed to process image",
            error: process.env.NODE_ENV === "development" || process.env.VERCEL_ENV !== "production"
              ? uploadError.message
              : "Upload failed. Please try again.",
          });
        }
      } else if (req.file.path) {
        // Disk storage (local development)
        progres.fotoProgres = `/uploads/progres/${req.file.filename}`;
        console.log("📁 Using local file path:", progres.fotoProgres);
      } else {
        console.error("❌ File object missing both buffer and path");
        return res.status(400).json({
          success: false,
          message: "Invalid file upload. File data is missing.",
        });
      }
    }

    await progres.save();

    res.status(200).json({
      success: true,
      message: "Progress updated successfully",
      data: { progres },
    });
  } catch (error) {
    // Delete uploaded file if error occurs (only for disk storage)
    if (req.file && req.file.path && !req.file.buffer) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error("Error deleting file:", unlinkError);
      }
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

    // Delete image (only for local file system, base64 is in MongoDB)
    if (progres.fotoProgres && !isBase64DataUrl(progres.fotoProgres)) {
      try {
        // Local file system only
        const imagePath = path.join(__dirname, "..", progres.fotoProgres);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log("🗑️ Local file deleted:", imagePath);
        }
      } catch (deleteError) {
        console.error("Error deleting file:", deleteError);
        // Continue with deletion even if file delete fails
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
