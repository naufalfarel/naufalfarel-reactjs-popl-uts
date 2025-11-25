const nodemailer = require("nodemailer");

// Create transporter
const createTransporter = () => {
  // For development: use Mailtrap or Gmail
  if (process.env.NODE_ENV === "development" && process.env.MAILTRAP_USER) {
    return nodemailer.createTransporter({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });
  }

  // For production: use Gmail SMTP
  return nodemailer.createTransporter({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD, // Use App Password for Gmail
    },
  });
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

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email send failed:", error);
    throw error;
  }
};

// Send Medication Reminder
exports.sendMedicationReminder = async (
  patient,
  medication,
  familyEmails = []
) => {
  const recipients = [patient.email, ...familyEmails].join(",");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e53e3e;">🔔 Pengingat Minum Obat</h2>
      <p>Halo <strong>${patient.name}</strong>,</p>
      <p>Waktunya minum obat:</p>
      <div style="background: #fff5f5; padding: 15px; border-left: 4px solid #e53e3e; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0;">💊 ${medication.namaObat}</h3>
        <p style="margin: 5px 0;"><strong>Dosis:</strong> ${
          medication.dosis
        }</p>
        <p style="margin: 5px 0;"><strong>Waktu:</strong> ${new Date().toLocaleTimeString(
          "id-ID",
          { hour: "2-digit", minute: "2-digit" }
        )}</p>
      </div>
      <p><em>Jangan lupa menandai sudah diminum di aplikasi TabbyCare!</em></p>
      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        Email ini dikirim otomatis oleh TabbyCare.<br>
        Jika Anda ingin berhenti menerima notifikasi, silakan atur di pengaturan aplikasi.
      </p>
    </div>
  `;

  return await this.sendEmail({
    to: recipients,
    subject: `🔔 Pengingat: ${medication.namaObat}`,
    html,
  });
};

// Send Missed Medication Alert
exports.sendMissedMedicationAlert = async (
  patient,
  medication,
  familyEmails = []
) => {
  const recipients = [patient.email, ...familyEmails].join(",");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #d97706;">⚠️ Peringatan: Obat Terlewat</h2>
      <p>Halo <strong>${patient.name}</strong>,</p>
      <p>Kami mendeteksi Anda melewatkan jadwal minum obat:</p>
      <div style="background: #fffbeb; padding: 15px; border-left: 4px solid #d97706; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0;">💊 ${medication.namaObat}</h3>
        <p style="margin: 5px 0;"><strong>Dosis:</strong> ${
          medication.dosis
        }</p>
        <p style="margin: 5px 0;"><strong>Jadwal:</strong> ${new Date(
          medication.scheduledTime
        ).toLocaleString("id-ID")}</p>
      </div>
      <p><strong>Apa yang harus dilakukan?</strong></p>
      <ul>
        <li>Segera minum obat jika belum terlalu terlambat</li>
        <li>Konsultasi dengan dokter jika sering melewatkan jadwal</li>
        <li>Aktifkan reminder di aplikasi TabbyCare</li>
      </ul>
      <p style="color: #d97706;"><em>Kepatuhan minum obat sangat penting untuk kesembuhan Anda!</em></p>
      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        Email ini dikirim ke Anda dan keluarga yang terdaftar sebagai pemantau.
      </p>
    </div>
  `;

  return await this.sendEmail({
    to: recipients,
    subject: `⚠️ Peringatan: ${patient.name} melewatkan obat`,
    html,
  });
};

// Send Weekly Summary
exports.sendWeeklySummary = async (
  patient,
  adherenceData,
  familyEmails = []
) => {
  const recipients = [patient.email, ...familyEmails].join(",");

  const adherenceRate = adherenceData.adherenceRate || 0;
  const adherenceColor =
    adherenceRate >= 80
      ? "#10b981"
      : adherenceRate >= 60
      ? "#f59e0b"
      : "#ef4444";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e53e3e;">📊 Ringkasan Mingguan TabbyCare</h2>
      <p>Halo <strong>${patient.name}</strong>,</p>
      <p>Berikut adalah ringkasan kepatuhan minum obat Anda minggu ini:</p>
      
      <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 15px 0; color: #374151;">Statistik Kepatuhan</h3>
        
        <div style="display: flex; justify-content: space-around; text-align: center;">
          <div>
            <p style="font-size: 32px; font-weight: bold; color: ${adherenceColor}; margin: 0;">${adherenceRate}%</p>
            <p style="color: #6b7280; margin: 5px 0;">Tingkat Kepatuhan</p>
          </div>
          <div>
            <p style="font-size: 32px; font-weight: bold; color: #10b981; margin: 0;">${
              adherenceData.taken || 0
            }</p>
            <p style="color: #6b7280; margin: 5px 0;">Dosis Diminum</p>
          </div>
          <div>
            <p style="font-size: 32px; font-weight: bold; color: #ef4444; margin: 0;">${
              adherenceData.missed || 0
            }</p>
            <p style="color: #6b7280; margin: 5px 0;">Dosis Terlewat</p>
          </div>
        </div>
      </div>

      ${
        adherenceRate >= 80
          ? `
        <div style="background: #d1fae5; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0;">
          <p style="margin: 0; color: #065f46;">
            <strong>🎉 Hebat!</strong> Kepatuhan Anda sangat baik. Terus pertahankan!
          </p>
        </div>
      `
          : adherenceRate >= 60
          ? `
        <div style="background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
          <p style="margin: 0; color: #92400e;">
            <strong>⚠️ Perhatian!</strong> Tingkatkan kepatuhan Anda agar pengobatan lebih efektif.
          </p>
        </div>
      `
          : `
        <div style="background: #fee2e2; padding: 15px; border-left: 4px solid #ef4444; margin: 20px 0;">
          <p style="margin: 0; color: #991b1b;">
            <strong>❗ Penting!</strong> Kepatuhan Anda rendah. Silakan konsultasi dengan dokter.
          </p>
        </div>
      `
      }

      <p><strong>Tips:</strong></p>
      <ul>
        <li>Aktifkan reminder di aplikasi</li>
        <li>Letakkan obat di tempat yang mudah terlihat</li>
        <li>Minta bantuan keluarga untuk mengingatkan</li>
      </ul>

      <p>Semangat untuk pengobatan Anda! 💪</p>
      
      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        Email ini dikirim setiap minggu. Anda dapat mengatur notifikasi di aplikasi TabbyCare.
      </p>
    </div>
  `;

  return await this.sendEmail({
    to: recipients,
    subject: `📊 Ringkasan Mingguan - Kepatuhan ${adherenceRate}%`,
    html,
  });
};

// Send Test Email
exports.sendTestEmail = async (toEmail) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e53e3e;">🧪 Test Email - TabbyCare</h2>
      <p>Halo!</p>
      <p>Ini adalah test email dari TabbyCare untuk memastikan sistem notifikasi berfungsi dengan baik.</p>
      <div style="background: #f0fdf4; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0;">
        <p style="margin: 0; color: #065f46;">
          <strong>✅ Berhasil!</strong> Email notifikasi Anda sudah terkonfigurasi dengan benar.
        </p>
      </div>
      <p>Anda akan menerima notifikasi untuk:</p>
      <ul>
        <li>Pengingat minum obat</li>
        <li>Peringatan obat terlewat</li>
        <li>Ringkasan mingguan</li>
      </ul>
      <p><em>TabbyCare Team</em></p>
    </div>
  `;

  return await this.sendEmail({
    to: toEmail,
    subject: "🧪 Test Email - TabbyCare Notification System",
    html,
  });
};
