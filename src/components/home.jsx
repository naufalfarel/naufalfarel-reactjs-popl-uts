import React, { useState, useEffect } from "react";
import {
  edukasiService,
  notificationService,
  progresService,
  kunjunganService,
} from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [edukasiList, setEdukasiList] = useState([]);
  const [todayNotifications, setTodayNotifications] = useState([]);
  const [upcomingVisits, setUpcomingVisits] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) setUser(JSON.parse(userStr));

      // Load educational content
      const edukasiRes = await edukasiService.getPopular({ limit: 3 });
      setEdukasiList(edukasiRes.data.data.edukasiList);

      // Load today's notifications
      const notifRes = await notificationService.getToday();
      setTodayNotifications(notifRes.data.data.notifications);

      // Load upcoming visits
      const visitsRes = await kunjunganService.getUpcoming();
      setUpcomingVisits(visitsRes.data.data.upcomingVisits);

      // Load progress stats
      const statsRes = await progresService.getStats({ days: 7 });
      setStats(statsRes.data.data.stats);

      setLoading(false);
    } catch (error) {
      console.error("Error loading data:", error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-8 px-4 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Selamat Datang, {user?.name || "User"}! 👋
              </h1>
              <p className="text-red-100">
                Mari jaga kesehatan bersama TabbyCare
              </p>
            </div>
            <button
              onClick={() => navigate("/profile")}
              className="bg-white text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-50 transition"
            >
              Profile
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => navigate("/obat/add")}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition text-center"
          >
            <div className="text-4xl mb-2">💊</div>
            <h3 className="font-semibold text-gray-800">Tambah Obat</h3>
          </button>

          <button
            onClick={() => navigate("/progres")}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition text-center"
          >
            <div className="text-4xl mb-2">📊</div>
            <h3 className="font-semibold text-gray-800">Progres</h3>
          </button>

          <button
            onClick={() => navigate("/kunjungan")}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition text-center"
          >
            <div className="text-4xl mb-2">📅</div>
            <h3 className="font-semibold text-gray-800">Jadwal Kunjungan</h3>
          </button>

          <button
            onClick={() => navigate("/notifications")}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition text-center relative"
          >
            <div className="text-4xl mb-2">🔔</div>
            <h3 className="font-semibold text-gray-800">Notifikasi</h3>
            {todayNotifications.length > 0 && (
              <span className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                {todayNotifications.length}
              </span>
            )}
          </button>
        </div>

        {/* Stats Summary */}
        {stats && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Ringkasan 7 Hari Terakhir
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">
                  {stats.totalEntries}
                </p>
                <p className="text-sm text-gray-600">Catatan Progres</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">
                  {stats.averageWeight} kg
                </p>
                <p className="text-sm text-gray-600">Rata-rata BB</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {stats.averageAdherence}%
                </p>
                <p className="text-sm text-gray-600">Kepatuhan Obat</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">
                  {stats.weightChange > 0 ? "+" : ""}
                  {stats.weightChange} kg
                </p>
                <p className="text-sm text-gray-600">Perubahan BB</p>
              </div>
            </div>
          </div>
        )}

        {/* Today's Reminders */}
        {todayNotifications.length > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl shadow-md p-6 mb-8 border-l-4 border-amber-500">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              🔔 Reminder Hari Ini
            </h2>
            <div className="space-y-3">
              {todayNotifications.slice(0, 3).map((notif) => (
                <div
                  key={notif._id}
                  className="bg-white p-4 rounded-lg shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">
                        {notif.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        ⏰ {formatTime(notif.scheduledTime)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {todayNotifications.length > 3 && (
              <button
                onClick={() => navigate("/notifications")}
                className="mt-4 text-amber-600 font-medium hover:text-amber-700"
              >
                Lihat semua ({todayNotifications.length}) →
              </button>
            )}
          </div>
        )}

        {/* Upcoming Visits */}
        {upcomingVisits.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl shadow-md p-6 mb-8 border-l-4 border-blue-500">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              📅 Jadwal Kunjungan Mendatang
            </h2>
            <div className="space-y-3">
              {upcomingVisits.slice(0, 2).map((visit) => (
                <div
                  key={visit._id}
                  className="bg-white p-4 rounded-lg shadow-sm"
                >
                  <h3 className="font-semibold text-gray-800">
                    {visit.judulKunjungan}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    📍 {visit.lokasi.namaRumahSakit}
                  </p>
                  <p className="text-sm text-blue-600 font-medium mt-2">
                    📆 {formatDate(visit.tanggalKunjungan)} •{" "}
                    {visit.waktuKunjungan}
                  </p>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate("/kunjungan")}
              className="mt-4 text-blue-600 font-medium hover:text-blue-700"
            >
              Lihat semua →
            </button>
          </div>
        )}

        {/* Educational Content */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              📚 Edukasi Kesehatan
            </h2>
            <button
              onClick={() => navigate("/edukasi")}
              className="text-red-600 font-medium hover:text-red-700"
            >
              Lihat Semua →
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {edukasiList.map((edukasi) => (
              <div
                key={edukasi._id}
                onClick={() => navigate(`/edukasi/${edukasi._id}`)}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer"
              >
                <div className="h-40 bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center">
                  <span className="text-6xl">
                    {edukasi.kategori === "tentang_tbc"
                      ? "🏥"
                      : edukasi.kategori === "pengobatan"
                      ? "💊"
                      : edukasi.kategori === "nutrisi"
                      ? "🥗"
                      : edukasi.kategori === "gaya_hidup"
                      ? "🏃"
                      : edukasi.kategori === "pencegahan"
                      ? "🛡️"
                      : "📖"}
                  </span>
                </div>
                <div className="p-4">
                  <div className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium mb-2">
                    {edukasi.kategori.replace("_", " ").toUpperCase()}
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">
                    {edukasi.judul}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                    {edukasi.ringkasan}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>👁️ {edukasi.viewCount} views</span>
                    <span className="text-red-600 font-medium">Baca →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            💡 Tips Hari Ini
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-green-600 mr-3 text-xl">✓</span>
              <p className="text-gray-700">
                Minum obat tepat waktu setiap hari untuk hasil terbaik
              </p>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-3 text-xl">✓</span>
              <p className="text-gray-700">
                Konsumsi makanan bergizi tinggi protein
              </p>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-3 text-xl">✓</span>
              <p className="text-gray-700">Istirahat cukup 7-8 jam per hari</p>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-3 text-xl">✓</span>
              <p className="text-gray-700">
                Jaga ventilasi udara di rumah tetap baik
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
