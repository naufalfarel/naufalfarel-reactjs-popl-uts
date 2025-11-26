import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const EdukasiList = () => {
  const navigate = useNavigate();
  const [edukasiList, setEdukasiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedKategori, setSelectedKategori] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const kategoriOptions = [
    { value: "all", label: "Semua", icon: "📚", color: "bg-gray-100" },
    {
      value: "tentang_tbc",
      label: "Tentang TBC",
      icon: "🏥",
      color: "bg-red-100",
    },
    {
      value: "pengobatan",
      label: "Pengobatan",
      icon: "💊",
      color: "bg-blue-100",
    },
    { value: "nutrisi", label: "Nutrisi", icon: "🥗", color: "bg-green-100" },
    {
      value: "gaya_hidup",
      label: "Gaya Hidup",
      icon: "🏃",
      color: "bg-purple-100",
    },
    {
      value: "pencegahan",
      label: "Pencegahan",
      icon: "🛡️",
      color: "bg-yellow-100",
    },
    {
      value: "tips_kesehatan",
      label: "Tips Kesehatan",
      icon: "💡",
      color: "bg-pink-100",
    },
  ];

  useEffect(() => {
    loadEdukasi();
  }, [selectedKategori, searchQuery]);

  const loadEdukasi = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedKategori !== "all") params.kategori = selectedKategori;
      if (searchQuery) params.search = searchQuery;

      const response = await axios.get(`${API_URL}/edukasi`, { params });

      if (response.data.success) {
        setEdukasiList(response.data.data.edukasiList);
      }
    } catch (error) {
      console.error("Error loading edukasi:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (kategori) => {
    const cat = kategoriOptions.find((k) => k.value === kategori);
    return cat ? cat.icon : "📖";
  };

  const getCategoryColor = (kategori) => {
    const cat = kategoriOptions.find((k) => k.value === kategori);
    return cat ? cat.color : "bg-gray-100";
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              📚 Edukasi Kesehatan
            </h1>
            <p className="text-gray-600">
              Artikel, tips, dan panduan lengkap tentang TBC dan kesehatan
            </p>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari artikel, tips, atau informasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <svg
                className="w-5 h-5 absolute left-4 top-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Category Filter */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-8">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {kategoriOptions.map((kategori) => (
                <button
                  key={kategori.value}
                  onClick={() => setSelectedKategori(kategori.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                    selectedKategori === kategori.value
                      ? "bg-red-600 text-white"
                      : `${kategori.color} text-gray-700 hover:opacity-80`
                  }`}
                >
                  <span>{kategori.icon}</span>
                  {kategori.label}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          ) : edukasiList.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Tidak ada artikel ditemukan
              </h3>
              <p className="text-gray-600">
                Coba kata kunci atau kategori lain
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {edukasiList.map((edukasi) => (
                <div
                  key={edukasi._id}
                  onClick={() => navigate(`/edukasi/${edukasi._id}`)}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer"
                >
                  {/* Header Image */}
                  <div
                    className={`h-40 ${getCategoryColor(
                      edukasi.kategori
                    )} flex items-center justify-center`}
                  >
                    <span className="text-6xl">
                      {getCategoryIcon(edukasi.kategori)}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`px-3 py-1 ${getCategoryColor(
                          edukasi.kategori
                        )} text-xs font-semibold rounded-full`}
                      >
                        {edukasi.kategori.replace("_", " ").toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        👁️ {edukasi.viewCount || 0}
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2">
                      {edukasi.judul}
                    </h3>

                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                      {edukasi.ringkasan}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {edukasi.author || "TabbyCare Team"}
                      </span>
                      <span className="text-red-600 font-medium text-sm">
                        Baca Selengkapnya →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">
              💡 Tips Menggunakan Edukasi
            </h3>
            <ul className="text-blue-800 text-sm space-y-2">
              <li>• Baca artikel secara teratur untuk memahami kondisi Anda</li>
              <li>• Terapkan tips kesehatan dalam kehidupan sehari-hari</li>
              <li>• Konsultasikan dengan dokter jika ada pertanyaan</li>
              <li>• Bagikan informasi bermanfaat kepada keluarga</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EdukasiList;
