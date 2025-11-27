import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const NotificationList = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isRealtime, setIsRealtime] = useState(true);
  const [lastSync, setLastSync] = useState(null);
  const POLLING_INTERVAL = 60000;

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  useEffect(() => {
    if (!isRealtime) return;
    const interval = setInterval(() => {
      loadNotifications(false);
    }, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [filter, isRealtime]);

  const loadNotifications = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }
      const token = localStorage.getItem("token");
      const params = filter !== "all" ? { status: filter } : {};

      const response = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      if (response.data.success) {
        setNotifications(response.data.data.notifications);
        setLastSync(new Date());
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsTaken = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/notifications/${id}/taken`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess("✅ Obat berhasil ditandai sudah diminum!");
      loadNotifications();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Gagal menandai obat");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleSendTestEmail = async () => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/notifications/test-email`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setSuccess(
          `✅ Test email berhasil dikirim ke: ${response.data.data.recipients.join(
            ", "
          )}`
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mengirim test email");
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSuccess("");
        setError("");
      }, 5000);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Menunggu",
      },
      sent: { bg: "bg-blue-100", text: "text-blue-800", label: "Terkirim" },
      read: { bg: "bg-green-100", text: "text-green-800", label: "Dibaca" },
      dismissed: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        label: "Diabaikan",
      },
    };
    return badges[status] || badges.pending;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-wrap gap-3 justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                🔔 Notifikasi
              </h1>
              <p className="text-gray-600 mt-2">
                Kelola pengingat email dan catatan konsumsi obat
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => navigate("/family")}
                className="bg-white border border-gray-200 text-gray-700 px-5 py-3 rounded-lg font-semibold hover:bg-gray-50 transition flex items-center gap-2"
              >
                👨‍👩‍👧 Kelola Keluarga
              </button>
              <button
                onClick={handleSendTestEmail}
                className="bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
              >
                🧪 Kirim Test Email
              </button>
            </div>
          </div>

          {/* Realtime status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-wrap gap-4 items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Realtime sync aktif setiap {POLLING_INTERVAL / 1000} detik. Anda
                akan mendapatkan update otomatis tanpa perlu refresh.
              </p>
              {lastSync && (
                <p className="text-xs text-gray-400 mt-1">
                  Terakhir sinkron:{" "}
                  {new Date(lastSync).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </p>
              )}
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <span>Realtime</span>
              <div
                className={`w-12 h-6 rounded-full cursor-pointer transition ${
                  isRealtime ? "bg-green-500" : "bg-gray-300"
                }`}
                onClick={() => setIsRealtime(!isRealtime)}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow transform transition ${
                    isRealtime ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </div>
            </label>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-8">
            <h3 className="font-semibold text-blue-900 mb-2">
              📧 Tentang Notifikasi Email
            </h3>
            <p className="text-blue-800 text-sm mb-3">
              Sistem akan mengirim email otomatis ke Anda dan keluarga yang
              diaktifkan di menu “Manajemen Keluarga” untuk:
            </p>
            <ul className="list-disc list-inside text-blue-800 text-sm space-y-1">
              <li>
                <strong>Pengingat Minum Obat:</strong> Dikirim sesuai jadwal
                yang Anda atur
              </li>
              <li>
                <strong>Peringatan Terlewat:</strong> Dikirim jika Anda
                melewatkan jadwal 2 jam
              </li>
              <li>
                <strong>Ringkasan Mingguan:</strong> Dikirim setiap Senin pagi
                tentang kepatuhan Anda
              </li>
            </ul>
            <p className="text-blue-800 text-sm mt-3">
              💡 <strong>Tip:</strong> Tambahkan keluarga dengan email valid
              agar mereka ikut menerima pengingat dan ringkasan mingguan.
            </p>
          </div>

          {/* Filter */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex gap-2 flex-wrap">
              {["all", "pending", "sent", "read"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filter === status
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status === "all"
                    ? "Semua"
                    : status === "pending"
                    ? "Menunggu"
                    : status === "sent"
                    ? "Terkirim"
                    : "Dibaca"}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <div className="text-6xl mb-4">🔔</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Tidak ada notifikasi
              </h3>
              <p className="text-gray-600 mb-6">
                Notifikasi akan muncul saat Anda menambahkan jadwal obat
              </p>
              <button
                onClick={() => navigate("/obat/add")}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
              >
                Tambah Obat
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notif) => {
                const now = new Date();
                const scheduledAt = new Date(notif.scheduledTime);
                const isDue = scheduledAt <= now;

                return (
                  <div
                    key={notif._id}
                    className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-800">
                            {notif.title}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              getStatusBadge(notif.status).bg
                            } ${getStatusBadge(notif.status).text}`}
                          >
                            {getStatusBadge(notif.status).label}
                          </span>
                          {notif.isTaken && (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                              ✓ Sudah Diminum
                            </span>
                          )}
                        </div>

                        <p className="text-gray-600 mb-3">{notif.message}</p>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>📅 {formatDate(notif.scheduledTime)}</span>
                          <span>⏰ {formatTime(notif.scheduledTime)}</span>
                          {notif.sentAt && (
                            <span className="text-green-600 font-medium">
                              ✉️ dikirim {formatTime(notif.sentAt)}
                            </span>
                          )}
                        </div>

                        {notif.obatId && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <strong>Obat:</strong> {notif.obatId.namaObat} -{" "}
                              {notif.obatId.dosis}
                            </p>
                          </div>
                        )}

                        {notif.takenAt && (
                          <p className="text-xs text-green-600 mt-2">
                            Diminum pada: {formatDate(notif.takenAt)}{" "}
                            {formatTime(notif.takenAt)}
                          </p>
                        )}
                      </div>

                      {!notif.isTaken &&
                        notif.status !== "dismissed" &&
                        (isDue ? (
                          <button
                            onClick={() => handleMarkAsTaken(notif._id)}
                            className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition whitespace-nowrap"
                          >
                            ✓ Sudah Minum
                          </button>
                        ) : (
                          <div className="ml-4 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-50">
                            ⏳ Menunggu jadwal (
                            {formatTime(notif.scheduledTime)})
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 bg-white rounded-xl shadow-md p-6">
            <h3 className="font-bold text-gray-800 mb-4">
              📱 Cara Kerja Notifikasi
            </h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start gap-3">
                <span className="text-2xl">1️⃣</span>
                <p>
                  <strong>Tambah Obat:</strong> Set jadwal minum obat di menu
                  "Obat"
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">2️⃣</span>
                <p>
                  <strong>Notifikasi Otomatis:</strong> Sistem akan mengirim
                  email di waktu yang ditentukan
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">3️⃣</span>
                <p>
                  <strong>Mark as Taken:</strong> Klik "Sudah Minum" untuk
                  mencatat kepatuhan
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">4️⃣</span>
                <p>
                  <strong>Family Alerts:</strong> Keluarga akan diberi tahu jika
                  Anda melewatkan obat
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NotificationList;
