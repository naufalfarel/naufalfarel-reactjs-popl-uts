import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const ProgresList = () => {
  const navigate = useNavigate();
  const [progresList, setProgresList] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30");

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [progresRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/progres`, { headers, params: { limit: 30 } }),
        axios.get(`${API_URL}/progres/stats`, {
          headers,
          params: { days: dateRange },
        }),
      ]);

      setProgresList(progresRes.data.data.progresList);
      setStats(statsRes.data.data.stats);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus catatan progres ini?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/progres/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProgresList(progresList.filter((p) => p._id !== id));
      loadData();
    } catch (error) {
      alert("Gagal menghapus progres");
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getMoodEmoji = (mood) => {
    const emojis = {
      sangat_baik: "😊",
      baik: "🙂",
      cukup: "😐",
      kurang_baik: "😕",
      buruk: "😢",
    };
    return emojis[mood] || "😐";
  };

  const getMoodLabel = (mood) => {
    const labels = {
      sangat_baik: "Sangat Baik",
      baik: "Baik",
      cukup: "Cukup",
      kurang_baik: "Kurang Baik",
      buruk: "Buruk",
    };
    return labels[mood] || mood;
  };

  const getGejalaLabel = (gejala) => {
    const labels = {
      batuk: "Batuk",
      demam: "Demam",
      berkeringat_malam: "Berkeringat Malam",
      penurunan_berat_badan: "Penurunan BB",
      sesak_napas: "Sesak Napas",
      nyeri_dada: "Nyeri Dada",
      lainnya: "Lainnya",
    };
    return labels[gejala] || gejala;
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
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                📊 Progres Kesehatan
              </h1>
              <p className="text-gray-600 mt-2">
                Pantau perkembangan kesehatan Anda
              </p>
            </div>
            <button
              onClick={() => navigate("/progres/add")}
              className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              Catat Progres
            </button>
          </div>

          {/* Stats Cards */}
          {stats && stats.totalEntries > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-sm text-gray-600 mb-2">Total Catatan</div>
                <div className="text-3xl font-bold text-red-600">
                  {stats.totalEntries}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-sm text-gray-600 mb-2">Rata-rata BB</div>
                <div className="text-3xl font-bold text-blue-600">
                  {stats.averageWeight} kg
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-sm text-gray-600 mb-2">Perubahan BB</div>
                <div
                  className={`text-3xl font-bold ${
                    stats.weightChange >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stats.weightChange > 0 ? "+" : ""}
                  {stats.weightChange} kg
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-sm text-gray-600 mb-2">Kepatuhan Obat</div>
                <div className="text-3xl font-bold text-purple-600">
                  {stats.averageAdherence}%
                </div>
              </div>
            </div>
          )}

          {/* Date Range Filter */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <label className="text-sm font-semibold text-gray-700 mr-4">
              Periode:
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            >
              <option value="7">7 Hari Terakhir</option>
              <option value="30">30 Hari Terakhir</option>
              <option value="90">90 Hari Terakhir</option>
            </select>
          </div>

          {/* Progress List */}
          {progresList.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Belum ada catatan progres
              </h3>
              <p className="text-gray-600 mb-6">
                Mulai catat progres kesehatan Anda setiap hari
              </p>
              <button
                onClick={() => navigate("/progres/add")}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
              >
                Catat Progres Pertama
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {progresList.map((progres) => (
                <div
                  key={progres._id}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="text-4xl">
                          {getMoodEmoji(progres.mood)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">
                            {formatDate(progres.tanggal)}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {getMoodLabel(progres.mood)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-600">Berat Badan</p>
                          <p className="text-lg font-semibold text-gray-800">
                            {progres.beratBadan} kg
                          </p>
                        </div>

                        {progres.suhuBadan && (
                          <div>
                            <p className="text-xs text-gray-600">Suhu Badan</p>
                            <p className="text-lg font-semibold text-gray-800">
                              {progres.suhuBadan}°C
                            </p>
                          </div>
                        )}

                        {progres.tekananDarah?.sistolik && (
                          <div>
                            <p className="text-xs text-gray-600">
                              Tekanan Darah
                            </p>
                            <p className="text-lg font-semibold text-gray-800">
                              {progres.tekananDarah.sistolik}/
                              {progres.tekananDarah.diastolik}
                            </p>
                          </div>
                        )}

                        <div>
                          <p className="text-xs text-gray-600">
                            Kepatuhan Obat
                          </p>
                          <p className="text-lg font-semibold text-green-600">
                            {progres.kepatuhanObat}%
                          </p>
                        </div>
                      </div>

                      {progres.gejala.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-600 mb-2">Gejala:</p>
                          <div className="flex flex-wrap gap-2">
                            {progres.gejala.map((g, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs"
                              >
                                {getGejalaLabel(g)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {progres.catatanHarian && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-700">
                            {progres.catatanHarian}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => navigate(`/progres/edit/${progres._id}`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(progres._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProgresList;
