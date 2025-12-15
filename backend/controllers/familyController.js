const Family = require("../models/Family");
const User = require("../models/User");
const { sendEmail } = require("../Utils/emailService");

// Add Family Member
exports.addFamily = async (req, res) => {
  try {
    const { name, email, relation, phone } = req.body;
    const patientId = req.userId; // From auth middleware

    // Validation
    if (!name || !email || !relation) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and relation are required",
      });
    }

    // Check if family member already exists
    const existingFamily = await Family.findOne({ patientId, email });
    if (existingFamily) {
      return res.status(400).json({
        success: false,
        message: "Family member with this email already added",
      });
    }

    // Create family member
    const family = await Family.create({
      patientId,
      name,
      email,
      relation,
      phone,
    });

    // Get patient info
    const patient = await User.findById(patientId);

    // Send invitation email
    try {
      await sendEmail({
        to: email,
        subject: "Undangan Pemantau TabbyCare",
        html: `
          <h2>Halo ${name},</h2>
          <p>Anda telah ditambahkan sebagai pemantau kesehatan untuk <strong>${patient.name}</strong> di TabbyCare.</p>
          <p>Relasi: <strong>${relation}</strong></p>
          <p>Anda akan menerima notifikasi mengenai:</p>
          <ul>
            <li>Pengingat minum obat</li>
            <li>Peringatan jika obat terlewat</li>
            <li>Ringkasan mingguan progres kepatuhan</li>
          </ul>
          <p>Terima kasih telah membantu mendukung kesembuhan ${patient.name}!</p>
          <p><em>TabbyCare Team</em></p>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send invitation email:", emailError);
    }

    res.status(201).json({
      success: true,
      message: "Family member added successfully",
      data: { family },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add family member",
      error: error.message,
    });
  }
};

// Get All Family Members
exports.getFamilyMembers = async (req, res) => {
  try {
    const patientId = req.userId;

    const familyMembers = await Family.find({ patientId, isActive: true }).sort(
      { createdAt: -1 }
    );

    res.status(200).json({
      success: true,
      count: familyMembers.length,
      data: { familyMembers },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get family members",
      error: error.message,
    });
  }
};

// Update Family Member
exports.updateFamily = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, relation, phone, emailNotifications, weeklySummary } =
      req.body;

    const family = await Family.findOne({
      _id: id,
      patientId: req.userId,
    });

    if (!family) {
      return res.status(404).json({
        success: false,
        message: "Family member not found",
      });
    }

    // Update fields
    if (name) family.name = name;
    if (email) family.email = email;
    if (relation) family.relation = relation;
    if (phone !== undefined) family.phone = phone;
    if (emailNotifications !== undefined)
      family.emailNotifications = emailNotifications;
    if (weeklySummary !== undefined) family.weeklySummary = weeklySummary;

    await family.save();

    res.status(200).json({
      success: true,
      message: "Family member updated successfully",
      data: { family },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update family member",
      error: error.message,
    });
  }
};

// Delete Family Member
exports.deleteFamily = async (req, res) => {
  try {
    const { id } = req.params;

    const family = await Family.findOne({
      _id: id,
      patientId: req.userId,
    });

    if (!family) {
      return res.status(404).json({
        success: false,
        message: "Family member not found",
      });
    }

    // Soft delete
    family.isActive = false;
    await family.save();

    res.status(200).json({
      success: true,
      message: "Family member removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to remove family member",
      error: error.message,
    });
  }
};

// Get Patient Progress (for family view)
exports.getPatientProgress = async (req, res) => {
  try {
    const { patientId } = req.params;
    const familyEmail = req.user.email; // From auth

    // Verify family member has access
    const familyMember = await Family.findOne({
      patientId,
      email: familyEmail,
      isActive: true,
    });

    if (!familyMember) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. You are not authorized to view this patient data.",
      });
    }

    // Get patient info
    const patient = await User.findById(patientId).select("-password");

    // Get medication adherence
    const MedicationLog = require("../models/MedicationLog");
    const adherence = await MedicationLog.calculateAdherence(patientId);

    // Get recent logs
    const recentLogs = await MedicationLog.find({ patientId })
      .populate("medicationId", "namaObat dosis")
      .sort({ scheduledTime: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        patient: {
          name: patient.name,
          email: patient.email,
        },
        adherence,
        recentLogs,
        familyMember: {
          name: familyMember.name,
          relation: familyMember.relation,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get patient progress",
      error: error.message,
    });
  }
};
