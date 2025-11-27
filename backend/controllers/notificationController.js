const Notification = require("../models/Notification");
const Obat = require("../models/Obat");
const Family = require("../models/Family");
const User = require("../models/User");
const MedicationLog = require("../models/MedicationLog");
const {
  sendEmail,
  sendMedicationReminder,
  sendMissedMedicationAlert,
  sendWeeklySummary,
  sendTestEmail,
} = require("../utils/emailService");
const cron = require("node-cron");

// Send Test Notification Email
exports.sendTestNotification = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    // Get family emails
    const familyMembers = await Family.find({
      patientId: req.userId,
      isActive: true,
      emailNotifications: true,
    });

    const familyEmails = familyMembers.map((f) => f.email);

    // Add test email
    const testEmails = [user.email, "naufalfaerel@gmail.com", ...familyEmails];

    await sendTestEmail(testEmails.join(","));

    res.status(200).json({
      success: true,
      message: "Test email sent successfully",
      data: {
        recipients: testEmails,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to send test email",
      error: error.message,
    });
  }
};

// Mark Medicine as Taken
exports.markAsTaken = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.userId,
    }).populate("obatId");

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Update notification
    notification.status = "read";
    notification.isTaken = true;
    notification.takenAt = new Date();
    await notification.save();

    // Create medication log
    await MedicationLog.create({
      patientId: req.userId,
      medicationId: notification.obatId._id,
      scheduledTime: notification.scheduledTime,
      takenAt: new Date(),
      status: "taken",
    });

    res.status(200).json({
      success: true,
      message: "Medicine marked as taken",
      data: { notification },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to mark medicine as taken",
      error: error.message,
    });
  }
};

// Send Daily Reminders (Cron Job)
exports.sendDailyReminders = async (req, res) => {
  try {
    const now = new Date();
    // Find notifications that should be sent now (or overdue but not yet sent)
    const notifications = await Notification.find({
      status: "pending",
      sentAt: null,
      isTaken: false,
      scheduledTime: { $lte: now },
    }).populate("userId obatId");

    let sentCount = 0;

    for (const notif of notifications) {
      try {
        // Get family emails
        const familyMembers = await Family.find({
          patientId: notif.userId._id,
          isActive: true,
          emailNotifications: true,
        });

        const familyEmails = familyMembers.map((f) => f.email);

        // Send reminder email to patient + family
        await sendMedicationReminder(notif.userId, notif.obatId, familyEmails);

        // Update notification status
        notif.status = "sent";
        notif.sentAt = new Date();
        await notif.save();

        sentCount++;
      } catch (emailError) {
        console.error("Failed to send reminder:", emailError);
      }
    }

    res.status(200).json({
      success: true,
      message: `Daily reminders processed`,
      data: {
        sent: sentCount,
        total: notifications.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to send daily reminders",
      error: error.message,
    });
  }
};

// Check Missed Medications
exports.checkMissedMedications = async (req, res) => {
  try {
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60000);

    // Find notifications that are overdue
    const missedNotifications = await Notification.find({
      status: { $in: ["pending", "sent"] },
      scheduledTime: {
        $lt: twoHoursAgo,
      },
      isTaken: false,
    }).populate("userId obatId");

    let alertsSent = 0;

    for (const notif of missedNotifications) {
      try {
        // Create missed medication log
        await MedicationLog.create({
          patientId: notif.userId._id,
          medicationId: notif.obatId._id,
          scheduledTime: notif.scheduledTime,
          takenAt: null,
          status: "missed",
        });

        // Get family emails
        const familyMembers = await Family.find({
          patientId: notif.userId._id,
          isActive: true,
          emailNotifications: true,
        });

        const familyEmails = familyMembers.map((f) => f.email);

        // Send missed alert
        await sendMissedMedicationAlert(
          notif.userId,
          {
            ...notif.obatId.toObject(),
            scheduledTime: notif.scheduledTime,
          },
          familyEmails
        );

        // Update notification
        notif.status = "read";
        await notif.save();

        alertsSent++;
      } catch (error) {
        console.error("Failed to send missed alert:", error);
      }
    }

    res.status(200).json({
      success: true,
      message: "Missed medications checked",
      data: {
        alertsSent,
        total: missedNotifications.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to check missed medications",
      error: error.message,
    });
  }
};

// Send Weekly Summary
exports.sendWeeklySummaryEmail = async (req, res) => {
  try {
    const users = await User.find({ role: "patient" });
    let sentCount = 0;

    for (const user of users) {
      try {
        // Calculate adherence for last 7 days
        const startDate = new Date(Date.now() - 7 * 24 * 60 * 60000);
        const adherenceData = await MedicationLog.calculateAdherence(
          user._id,
          startDate,
          new Date()
        );

        // Get family emails who want weekly summary
        const familyMembers = await Family.find({
          patientId: user._id,
          isActive: true,
          weeklySummary: true,
        });

        const familyEmails = familyMembers.map((f) => f.email);

        // Send summary
        await sendWeeklySummary(user, adherenceData, familyEmails);

        sentCount++;
      } catch (error) {
        console.error(`Failed to send weekly summary to ${user.email}:`, error);
      }
    }

    res.status(200).json({
      success: true,
      message: "Weekly summaries sent",
      data: {
        sent: sentCount,
        total: users.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to send weekly summaries",
      error: error.message,
    });
  }
};

// Setup Cron Jobs
exports.setupCronJobs = () => {
  // Check for reminders every minute for near real-time email delivery
  cron.schedule("* * * * *", async () => {
    console.log("🔔 Running medication reminder check...");
    try {
      // Call the controller function programmatically
      const mockReq = {};
      const mockRes = {
        status: () => ({ json: () => {} }),
      };
      await exports.sendDailyReminders(mockReq, mockRes);
    } catch (error) {
      console.error("Cron job error:", error);
    }
  });

  // Check for missed medications every hour
  cron.schedule("0 * * * *", async () => {
    console.log("⚠️ Checking missed medications...");
    try {
      const mockReq = {};
      const mockRes = {
        status: () => ({ json: () => {} }),
      };
      await exports.checkMissedMedications(mockReq, mockRes);
    } catch (error) {
      console.error("Cron job error:", error);
    }
  });

  // Send weekly summary every Monday at 9 AM
  cron.schedule("0 9 * * 1", async () => {
    console.log("📊 Sending weekly summaries...");
    try {
      const mockReq = {};
      const mockRes = {
        status: () => ({ json: () => {} }),
      };
      await exports.sendWeeklySummaryEmail(mockReq, mockRes);
    } catch (error) {
      console.error("Cron job error:", error);
    }
  });

  console.log("✅ Cron jobs initialized");
};

// Add at the beginning after imports
// Get All Notifications for User
exports.getAllNotifications = async (req, res) => {
  try {
    const { status, type, limit = 50 } = req.query;

    const filter = { userId: req.userId };

    if (status) {
      filter.status = status;
    }
    if (type) {
      filter.type = type;
    }

    const notifications = await Notification.find(filter)
      .populate("obatId", "namaObat dosis gambarObat")
      .sort({ scheduledTime: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: { notifications },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get notifications",
      error: error.message,
    });
  }
};
exports.getAllNotifications = async (req, res) => {
  try {
    const { status, type, limit = 50 } = req.query;

    const filter = { userId: req.userId };

    if (status) {
      filter.status = status;
    }
    if (type) {
      filter.type = type;
    }

    const notifications = await Notification.find(filter)
      .populate("obatId", "namaObat dosis gambarObat")
      .sort({ scheduledTime: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: { notifications },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get notifications",
      error: error.message,
    });
  }
};

// Get Upcoming Notifications (Today)
exports.getTodayNotifications = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const notifications = await Notification.find({
      userId: req.userId,
      scheduledTime: {
        $gte: today,
        $lt: tomorrow,
      },
      status: { $in: ["pending", "sent"] },
    })
      .populate("obatId", "namaObat dosis gambarObat")
      .sort({ scheduledTime: 1 });

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: { notifications },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get today notifications",
      error: error.message,
    });
  }
};

// Get Unread Notifications Count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.userId,
      status: { $in: ["pending", "sent"] },
    });

    res.status(200).json({
      success: true,
      data: { unreadCount: count },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get unread count",
      error: error.message,
    });
  }
};

// Mark Notification as Read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    notification.status = "read";
    await notification.save();

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: { notification },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
      error: error.message,
    });
  }
};

// Mark Medicine as Taken
exports.markAsTaken = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    notification.status = "read";
    notification.isTaken = true;
    notification.takenAt = new Date();
    await notification.save();

    res.status(200).json({
      success: true,
      message: "Medicine marked as taken",
      data: { notification },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to mark medicine as taken",
      error: error.message,
    });
  }
};

// Dismiss Notification
exports.dismissNotification = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    notification.status = "dismissed";
    await notification.save();

    res.status(200).json({
      success: true,
      message: "Notification dismissed",
      data: { notification },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to dismiss notification",
      error: error.message,
    });
  }
};

// Mark All as Read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        userId: req.userId,
        status: { $in: ["pending", "sent"] },
      },
      { status: "read" }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to mark all as read",
      error: error.message,
    });
  }
};

// Delete Notification
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete notification",
      error: error.message,
    });
  }
};

// Get Medication History
exports.getMedicationHistory = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {
      userId: req.userId,
      isTaken: true,
    };

    if (startDate && endDate) {
      filter.takenAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const history = await Notification.find(filter)
      .populate("obatId", "namaObat dosis gambarObat")
      .sort({ takenAt: -1 });

    res.status(200).json({
      success: true,
      count: history.length,
      data: { history },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get medication history",
      error: error.message,
    });
  }
};
