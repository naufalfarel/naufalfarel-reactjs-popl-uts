import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardLayout from "../components/DashboardLayout";
import {
  edukasiService,
  notificationService,
  progresService,
  kunjunganService,
} from "../services/api";

const Dashboard = () => {
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

      // Load all data in parallel
      const [edukasiRes, notifRes, visitsRes, statsRes] = await Promise.all([
        edukasiService
          .getPopular({ limit: 3 })
          .catch(() => ({ data: { data: { edukasiList: [] } } })),
        notificationService
          .getToday()
          .catch(() => ({ data: { data: { notifications: [] } } })),
        kunjunganService
          .getUpcoming()
          .catch(() => ({ data: { data: { upcomingVisits: [] } } })),
        progresService
          .getStats({ days: 7 })
          .catch(() => ({ data: { data: { stats: null } } })),
      ]);

      setEdukasiList(edukasiRes.data.data.edukasiList || []);
      setTodayNotifications(notifRes.data.data.notifications || []);
      setUpcomingVisits(visitsRes.data.data.upcomingVisits || []);
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
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
    hover: {
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 17,
      },
    },
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-pink-50">
        {/* Header with animated background */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative bg-gradient-to-r from-red-600 via-red-500 to-pink-600 text-white py-12 px-4 shadow-xl overflow-hidden"
        >
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                backgroundSize: "40px 40px",
              }}
            ></div>
          </div>

          <div className="max-w-6xl mx-auto relative z-10">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-4xl md:text-5xl font-bold mb-3"
            >
              Selamat Datang, {user?.name || "User"}! 👋
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-red-50 text-lg"
            >
              Mari jaga kesehatan bersama TabbyCare
            </motion.p>
          </div>
        </motion.div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Quick Actions */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8"
          >
            <motion.button
              variants={cardVariants}
              whileHover="hover"
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/obat/add")}
              className="group bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 text-center border border-gray-100 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="text-5xl mb-3 relative z-10"
              >
                💊
              </motion.div>
              <h3 className="font-bold text-gray-800 relative z-10 text-sm md:text-base">
                Tambah Obat
              </h3>
            </motion.button>

            <motion.button
              variants={cardVariants}
              whileHover="hover"
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/progres/add")}
              className="group bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 text-center border border-gray-100 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="text-5xl mb-3 relative z-10"
              >
                📊
              </motion.div>
              <h3 className="font-bold text-gray-800 relative z-10 text-sm md:text-base">
                Catat Progres
              </h3>
            </motion.button>

            <motion.button
              variants={cardVariants}
              whileHover="hover"
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/kunjungan/add")}
              className="group bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 text-center border border-gray-100 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="text-5xl mb-3 relative z-10"
              >
                📅
              </motion.div>
              <h3 className="font-bold text-gray-800 relative z-10 text-sm md:text-base">
                Jadwal Kunjungan
              </h3>
            </motion.button>

            <motion.button
              variants={cardVariants}
              whileHover="hover"
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/notifications")}
              className="group bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 text-center border border-gray-100 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <motion.div
                animate={{ rotate: [0, -15, 15, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                className="text-5xl mb-3 relative z-10"
              >
                🔔
              </motion.div>
              <h3 className="font-bold text-gray-800 relative z-10 text-sm md:text-base">
                Notifikasi
              </h3>
              {todayNotifications.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg"
                >
                  {todayNotifications.length}
                </motion.span>
              )}
            </motion.button>
          </motion.div>

          {/* Stats Summary */}
          {stats && stats.totalEntries > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-6 md:p-8 mb-8 border border-gray-100"
            >
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="text-2xl">📈</span>
                Ringkasan 7 Hari Terakhir
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {[
                  {
                    value: stats.totalEntries,
                    label: "Catatan Progres",
                    color: "from-red-500 to-pink-500",
                    icon: "📝",
                  },
                  {
                    value: `${stats.averageWeight} kg`,
                    label: "Rata-rata BB",
                    color: "from-blue-500 to-cyan-500",
                    icon: "⚖️",
                  },
                  {
                    value: `${stats.averageAdherence}%`,
                    label: "Kepatuhan Obat",
                    color: "from-green-500 to-emerald-500",
                    icon: "✅",
                  },
                  {
                    value: `${stats.weightChange > 0 ? "+" : ""}${
                      stats.weightChange
                    } kg`,
                    label: "Perubahan BB",
                    color: "from-purple-500 to-indigo-500",
                    icon: "📊",
                  },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.1, duration: 0.3 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="text-center p-4 rounded-xl bg-white/50 hover:bg-white transition-all duration-300 border border-gray-100"
                  >
                    <div className="text-2xl mb-2">{stat.icon}</div>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}
                    >
                      {stat.value}
                    </motion.p>
                    <p className="text-sm text-gray-600 font-medium">
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Today's Reminders */}
          {todayNotifications.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-2xl shadow-xl p-6 md:p-8 mb-8 border-l-4 border-amber-500 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full blur-3xl"></div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2 relative z-10">
                <motion.span
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                >
                  🔔
                </motion.span>
                Reminder Hari Ini
              </h2>
              <div className="space-y-4 relative z-10">
                {todayNotifications.slice(0, 3).map((notif, index) => (
                  <motion.div
                    key={notif._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                    whileHover={{ x: 5, scale: 1.02 }}
                    className="bg-white/90 backdrop-blur-sm p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-amber-100"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 text-base">
                          {notif.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-2">
                          {notif.message}
                        </p>
                        <p className="text-xs text-amber-600 font-semibold mt-3 flex items-center gap-1">
                          <span>⏰</span>
                          {formatTime(notif.scheduledTime)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              {todayNotifications.length > 3 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/notifications")}
                  className="mt-6 text-amber-700 font-bold hover:text-amber-800 transition-colors flex items-center gap-2 relative z-10"
                >
                  Lihat semua ({todayNotifications.length})
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </motion.button>
              )}
            </motion.div>
          )}

          {/* Upcoming Visits */}
          {upcomingVisits.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 rounded-2xl shadow-xl p-6 md:p-8 mb-8 border-l-4 border-blue-500 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full blur-3xl"></div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2 relative z-10">
                <span>📅</span>
                Jadwal Kunjungan Mendatang
              </h2>
              <div className="space-y-4 relative z-10">
                {upcomingVisits.slice(0, 2).map((visit, index) => (
                  <motion.div
                    key={visit._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.3 }}
                    whileHover={{ x: 5, scale: 1.02 }}
                    className="bg-white/90 backdrop-blur-sm p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-blue-100"
                  >
                    <h3 className="font-bold text-gray-800 text-base mb-2">
                      {visit.judulKunjungan}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                      <span>📍</span>
                      {visit.lokasi.namaRumahSakit}
                    </p>
                    <p className="text-sm text-blue-600 font-semibold mt-3 flex items-center gap-1">
                      <span>📆</span>
                      {formatDate(visit.tanggalKunjungan)} •{" "}
                      {visit.waktuKunjungan}
                    </p>
                  </motion.div>
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/kunjungan")}
                className="mt-6 text-blue-700 font-bold hover:text-blue-800 transition-colors flex items-center gap-2 relative z-10"
              >
                Lihat semua
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  →
                </motion.span>
              </motion.button>
            </motion.div>
          )}

          {/* Educational Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
                <span>📚</span>
                Edukasi Kesehatan
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/edukasi")}
                className="text-red-600 font-bold hover:text-red-700 transition-colors flex items-center gap-2"
              >
                Lihat Semua
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  →
                </motion.span>
              </motion.button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {edukasiList.map((edukasi, index) => {
                const categoryIcons = {
                  tentang_tbc: "🏥",
                  pengobatan: "💊",
                  nutrisi: "🥗",
                  gaya_hidup: "🏃",
                  pencegahan: "🛡️",
                  tips_kesehatan: "💡",
                };
                const categoryColors = {
                  tentang_tbc: "from-red-400 to-pink-500",
                  pengobatan: "from-blue-400 to-cyan-500",
                  nutrisi: "from-green-400 to-emerald-500",
                  gaya_hidup: "from-purple-400 to-indigo-500",
                  pencegahan: "from-yellow-400 to-amber-500",
                  tips_kesehatan: "from-pink-400 to-rose-500",
                };

                return (
                  <motion.div
                    key={edukasi._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.1, duration: 0.3 }}
                    whileHover={{ y: -10, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/edukasi/${edukasi._id}`)}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group border border-gray-100"
                  >
                    <div
                      className={`h-48 bg-gradient-to-br ${
                        categoryColors[edukasi.kategori] ||
                        "from-gray-400 to-gray-500"
                      } flex items-center justify-center relative overflow-hidden`}
                    >
                      <motion.span
                        className="text-7xl relative z-10"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        {categoryIcons[edukasi.kategori] || "📖"}
                      </motion.span>
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors"></div>
                    </div>
                    <div className="p-5">
                      <div className="inline-block px-3 py-1 bg-gradient-to-r from-red-100 to-pink-100 text-red-700 rounded-full text-xs font-bold mb-3">
                        {edukasi.kategori.replace(/_/g, " ").toUpperCase()}
                      </div>
                      <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 text-base group-hover:text-red-600 transition-colors">
                        {edukasi.judul}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                        {edukasi.ringkasan}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 flex items-center gap-1">
                          👁️ {edukasi.viewCount || 0} views
                        </span>
                        <span className="text-red-600 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                          Baca
                          <motion.span
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            →
                          </motion.span>
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Tips Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl shadow-xl p-6 md:p-8 border-l-4 border-green-500 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/20 rounded-full blur-3xl"></div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2 relative z-10">
              <motion.span
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                💡
              </motion.span>
              Tips Hari Ini
            </h2>
            <ul className="space-y-4 relative z-10">
              {[
                "Minum obat tepat waktu setiap hari untuk hasil terbaik",
                "Konsumsi makanan bergizi tinggi protein",
                "Istirahat cukup 7-8 jam per hari",
                "Jaga ventilasi udara di rumah tetap baik",
              ].map((tip, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + index * 0.1, duration: 0.3 }}
                  whileHover={{ x: 5 }}
                  className="flex items-start bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-green-100 hover:bg-white/80 transition-colors"
                >
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1 + index * 0.1, type: "spring" }}
                    className="text-green-600 mr-3 text-xl flex-shrink-0 mt-0.5"
                  >
                    ✓
                  </motion.span>
                  <p className="text-gray-700 font-medium leading-relaxed">
                    {tip}
                  </p>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
