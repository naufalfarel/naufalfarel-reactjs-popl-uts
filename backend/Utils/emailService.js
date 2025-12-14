const nodemailer = require("nodemailer");

let cachedTransporter = null;

// Create transporter
const createTransporter = () => {
  if (cachedTransporter) return cachedTransporter;

  // Prefer custom SMTP if provided
  if (process.env.MAIL_HOST && process.env.MAIL_USER) {
    console.log("📧 Using custom SMTP configuration");
    cachedTransporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT) || 587,
      secure: process.env.MAIL_SECURE === "true",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
    return cachedTransporter;
  }

  // Development: Mailtrap
  if (
    process.env.NODE_ENV === "development" &&
    process.env.MAILTRAP_USER &&
    process.env.MAILTRAP_PASS
  ) {
    console.log("📧 Using Mailtrap for development");
    cachedTransporter = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });
    return cachedTransporter;
  }

  // Production: Gmail SMTP
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error(
      "❌ Email credentials not configured. Please set EMAIL_USER and EMAIL_PASSWORD in .env file."
    );
    throw new Error("Email configuration missing");
  }

  console.log("📧 Using Gmail SMTP for:", process.env.EMAIL_USER);
  cachedTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  return cachedTransporter;
};

// Verify email configuration
const verifyConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("✅ Email service is ready to send messages");
    return true;
  } catch (error) {
    console.error("❌ Email service verification failed:", error.message);
    return false;
  }
};

// Send Email Function
exports.sendEmail = async ({ to, subject, text, html }) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `TabbyCare <${process.env.EMAIL_USER || "noreply@tabbycare.com"}>`,
      to,
      subject,
      text,
      html,
    };

    console.log(`📧 Sending email to: ${to}`);
    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email send failed:", error.message);

    // More detailed error logging
    if (error.code === "EAUTH") {
      console.error(
        "❌ Authentication failed. Check EMAIL_USER and EMAIL_PASSWORD"
      );
    } else if (error.code === "ESOCKET") {
      console.error("❌ Network error. Check your internet connection");
    }

    throw error;
  }
};

// Send Medication Reminder
exports.sendMedicationReminder = async (
  patient,
  medication,
  familyEmails = []
) => {
  const recipients = [patient.email, ...familyEmails].filter(Boolean).join(",");

  if (!recipients) {
    console.warn("⚠️ No recipients for medication reminder");
    return { success: false, message: "No recipients" };
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #e53e3e 0%, #ec4899 100%); padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🔔 Pengingat Minum Obat</h1>
        </div>
        
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #333333; margin-bottom: 20px;">
            Halo <strong>${patient.name}</strong>,
          </p>
          
          <p style="font-size: 16px; color: #333333; margin-bottom: 20px;">
            Waktunya minum obat Anda:
          </p>
          
          <div style="background: #fff5f5; padding: 20px; border-left: 4px solid #e53e3e; margin: 20px 0; border-radius: 4px;">
            <h2 style="margin: 0 0 15px 0; color: #e53e3e; font-size: 20px;">💊 ${
              medication.namaObat
            }</h2>
            <p style="margin: 8px 0; color: #555555;"><strong>Dosis:</strong> ${
              medication.dosis
            }</p>
            <p style="margin: 8px 0; color: #555555;"><strong>Waktu:</strong> ${new Date().toLocaleTimeString(
              "id-ID",
              { hour: "2-digit", minute: "2-digit" }
            )}</p>
          </div>
          
          <div style="background: #f0fdf4; padding: 15px; border-radius: 4px; border-left: 4px solid #10b981; margin: 20px 0;">
            <p style="margin: 0; color: #065f46; font-size: 14px;">
              <strong>💡 Tips:</strong> Jangan lupa menandai sudah diminum di aplikasi TabbyCare!
            </p>
          </div>
          
          <p style="color: #999999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eeeeee;">
            Email ini dikirim otomatis oleh TabbyCare.<br>
            Jika Anda ingin berhenti menerima notifikasi, silakan atur di pengaturan aplikasi.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    return await this.sendEmail({
      to: recipients,
      subject: `🔔 Pengingat: ${medication.namaObat}`,
      html,
    });
  } catch (error) {
    console.error("Failed to send medication reminder:", error.message);
    throw error;
  }
};

// Send Missed Medication Alert
exports.sendMissedMedicationAlert = async (
  patient,
  medication,
  familyEmails = []
) => {
  const recipients = [patient.email, ...familyEmails].filter(Boolean).join(",");

  if (!recipients) {
    console.warn("⚠️ No recipients for missed medication alert");
    return { success: false, message: "No recipients" };
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%); padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">⚠️ Peringatan: Obat Terlewat</h1>
        </div>
        
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #333333; margin-bottom: 20px;">
            Halo <strong>${patient.name}</strong>,
          </p>
          
          <p style="font-size: 16px; color: #333333; margin-bottom: 20px;">
            Kami mendeteksi Anda melewatkan jadwal minum obat:
          </p>
          
          <div style="background: #fffbeb; padding: 20px; border-left: 4px solid #d97706; margin: 20px 0; border-radius: 4px;">
            <h2 style="margin: 0 0 15px 0; color: #d97706; font-size: 20px;">💊 ${
              medication.namaObat
            }</h2>
            <p style="margin: 8px 0; color: #555555;"><strong>Dosis:</strong> ${
              medication.dosis
            }</p>
            <p style="margin: 8px 0; color: #555555;"><strong>Jadwal:</strong> ${new Date(
              medication.scheduledTime
            ).toLocaleString("id-ID")}</p>
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #92400e; font-weight: bold;">⚠️ Apa yang harus dilakukan?</p>
            <ul style="margin: 0; padding-left: 20px; color: #92400e;">
              <li style="margin: 5px 0;">Segera minum obat jika belum terlalu terlambat</li>
              <li style="margin: 5px 0;">Konsultasi dengan dokter jika sering melewatkan jadwal</li>
              <li style="margin: 5px 0;">Aktifkan reminder di aplikasi TabbyCare</li>
            </ul>
          </div>
          
          <div style="background: #fee2e2; padding: 15px; border-radius: 4px; border-left: 4px solid #ef4444; margin: 20px 0;">
            <p style="margin: 0; color: #991b1b;">
              <strong>❗ Penting:</strong> Kepatuhan minum obat sangat penting untuk kesembuhan Anda!
            </p>
          </div>
          
          <p style="color: #999999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eeeeee;">
            Email ini dikirim ke Anda dan keluarga yang terdaftar sebagai pemantau.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    return await this.sendEmail({
      to: recipients,
      subject: `⚠️ Peringatan: ${patient.name} melewatkan obat`,
      html,
    });
  } catch (error) {
    console.error("Failed to send missed medication alert:", error.message);
    throw error;
  }
};

// Send Weekly Summary
exports.sendWeeklySummary = async (
  patient,
  adherenceData,
  familyEmails = []
) => {
  const recipients = [patient.email, ...familyEmails].filter(Boolean).join(",");

  if (!recipients) {
    console.warn("⚠️ No recipients for weekly summary");
    return { success: false, message: "No recipients" };
  }

  const adherenceRate = adherenceData.adherenceRate || 0;
  const adherenceColor =
    adherenceRate >= 80
      ? "#10b981"
      : adherenceRate >= 60
      ? "#f59e0b"
      : "#ef4444";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #e53e3e 0%, #ec4899 100%); padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">📊 Ringkasan Mingguan TabbyCare</h1>
        </div>
        
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #333333; margin-bottom: 20px;">
            Halo <strong>${patient.name}</strong>,
          </p>
          
          <p style="font-size: 16px; color: #333333; margin-bottom: 20px;">
            Berikut adalah ringkasan kepatuhan minum obat Anda minggu ini:
          </p>
          
          <div style="background: #f9fafb; padding: 25px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 20px 0; color: #374151; text-align: center;">Statistik Kepatuhan</h3>
            
            <table width="100%" cellpadding="10" cellspacing="0" style="text-align: center;">
              <tr>
                <td style="width: 33%;">
                  <div style="font-size: 36px; font-weight: bold; color: ${adherenceColor}; margin-bottom: 5px;">${adherenceRate}%</div>
                  <div style="color: #6b7280; font-size: 13px;">Tingkat Kepatuhan</div>
                </td>
                <td style="width: 33%;">
                  <div style="font-size: 36px; font-weight: bold; color: #10b981; margin-bottom: 5px;">${
                    adherenceData.taken || 0
                  }</div>
                  <div style="color: #6b7280; font-size: 13px;">Dosis Diminum</div>
                </td>
                <td style="width: 33%;">
                  <div style="font-size: 36px; font-weight: bold; color: #ef4444; margin-bottom: 5px;">${
                    adherenceData.missed || 0
                  }</div>
                  <div style="color: #6b7280; font-size: 13px;">Dosis Terlewat</div>
                </td>
              </tr>
            </table>
          </div>

          ${
            adherenceRate >= 80
              ? `
          <div style="background: #d1fae5; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #065f46;">
              <strong>🎉 Hebat!</strong> Kepatuhan Anda sangat baik. Terus pertahankan!
            </p>
          </div>
          `
              : adherenceRate >= 60
              ? `
          <div style="background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #92400e;">
              <strong>⚠️ Perhatian!</strong> Tingkatkan kepatuhan Anda agar pengobatan lebih efektif.
            </p>
          </div>
          `
              : `
          <div style="background: #fee2e2; padding: 15px; border-left: 4px solid #ef4444; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #991b1b;">
              <strong>❗ Penting!</strong> Kepatuhan Anda rendah. Silakan konsultasi dengan dokter.
            </p>
          </div>
          `
          }

          <div style="background: #f0fdf4; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #065f46; font-weight: bold;">💡 Tips:</p>
            <ul style="margin: 0; padding-left: 20px; color: #065f46;">
              <li style="margin: 5px 0;">Aktifkan reminder di aplikasi</li>
              <li style="margin: 5px 0;">Letakkan obat di tempat yang mudah terlihat</li>
              <li style="margin: 5px 0;">Minta bantuan keluarga untuk mengingatkan</li>
            </ul>
          </div>

          <p style="font-size: 16px; color: #333333; text-align: center; font-weight: bold; margin: 20px 0;">
            Semangat untuk pengobatan Anda! 💪
          </p>
          
          <p style="color: #999999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eeeeee;">
            Email ini dikirim setiap minggu. Anda dapat mengatur notifikasi di aplikasi TabbyCare.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    return await this.sendEmail({
      to: recipients,
      subject: `📊 Ringkasan Mingguan - Kepatuhan ${adherenceRate}%`,
      html,
    });
  } catch (error) {
    console.error("Failed to send weekly summary:", error.message);
    throw error;
  }
};

// Send Test Email
exports.sendTestEmail = async (toEmail) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🧪 Test Email - TabbyCare</h1>
        </div>
        
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #333333; margin-bottom: 20px;">
            Halo!
          </p>
          
          <p style="font-size: 16px; color: #333333; margin-bottom: 20px;">
            Ini adalah test email dari TabbyCare untuk memastikan sistem notifikasi berfungsi dengan baik.
          </p>
          
          <div style="background: #f0fdf4; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #065f46; font-size: 16px;">
              <strong>✅ Berhasil!</strong> Email notifikasi Anda sudah terkonfigurasi dengan benar.
            </p>
          </div>
          
          <div style="background: #eff6ff; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #1e40af; font-weight: bold;">📧 Anda akan menerima notifikasi untuk:</p>
            <ul style="margin: 0; padding-left: 20px; color: #1e40af;">
              <li style="margin: 5px 0;">Pengingat minum obat</li>
              <li style="margin: 5px 0;">Peringatan obat terlewat</li>
              <li style="margin: 5px 0;">Ringkasan mingguan</li>
            </ul>
          </div>
          
          <p style="font-size: 14px; color: #666666; margin-top: 20px; text-align: center;">
            <em>TabbyCare Team</em>
          </p>
          
          <p style="color: #999999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eeeeee;">
            Dikirim pada: ${new Date().toLocaleString("id-ID")}<br>
            Email ini adalah test otomatis dari sistem TabbyCare.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    return await this.sendEmail({
      to: toEmail,
      subject: "🧪 Test Email - TabbyCare Notification System",
      html,
    });
  } catch (error) {
    console.error("Failed to send test email:", error.message);
    throw error;
  }
};

// Export verify function
exports.verifyConnection = verifyConnection;

// Initialize and verify on module load
if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  verifyConnection().catch((err) => {
    console.error("Email service initialization failed:", err.message);
  });
}
