import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { edukasiService } from "../../services/api";

const EdukasiList = () => {
  const navigate = useNavigate();
  const [edukasiList, setEdukasiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedKategori, setSelectedKategori] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [seeding, setSeeding] = useState(false);

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

      const response = await edukasiService.getAll(params);

      if (response.data.success) {
        setEdukasiList(response.data.data.edukasiList || []);
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

  const handleSeedEdukasi = async () => {
    try {
      setSeeding(true);
      const response = await edukasiService.seed();
      if (response.data.success) {
        alert(`Berhasil menambahkan ${response.data.count} artikel edukasi!`);
        loadEdukasi(); // Reload artikel
      } else {
        alert(response.data.message || "Gagal menambahkan artikel");
      }
    } catch (error) {
      console.error("Error seeding edukasi:", error);
      if (error.response?.data?.message) {
        // Jika sudah ada artikel, tanya apakah ingin force seed
        if (
          confirm(
            error.response.data.message +
              "\n\nApakah Anda ingin menambahkan ulang artikel? (Artikel lama akan dihapus)"
          )
        ) {
          try {
            const forceResponse = await edukasiService.seed(true);
            if (forceResponse.data.success) {
              alert(
                `Berhasil menambahkan ${forceResponse.data.count} artikel edukasi!`
              );
              loadEdukasi();
            }
          } catch (forceError) {
            console.error("Error force seeding:", forceError);
            alert("Gagal menambahkan artikel");
          }
        }
      } else {
        alert("Gagal menambahkan artikel");
      }
    } finally {
      setSeeding(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  📚 Edukasi Kesehatan
                </h1>
                <p className="text-gray-600">
                  Artikel, tips, dan panduan lengkap tentang TBC dan kesehatan
                </p>
              </div>
              {edukasiList.length === 0 && !loading && (
                <button
                  onClick={handleSeedEdukasi}
                  disabled={seeding}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {seeding ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Menambahkan...
                    </>
                  ) : (
                    <>
                      <span>📝</span>
                      Tambah Artikel
                    </>
                  )}
                </button>
              )}
            </div>
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
                Belum ada artikel edukasi
              </h3>
              <p className="text-gray-600 mb-6">
                Klik tombol "Tambah Artikel" di atas untuk menambahkan artikel
                edukasi lengkap
              </p>
              <button
                onClick={handleSeedEdukasi}
                disabled={seeding}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
              >
                {seeding ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Menambahkan Artikel...
                  </>
                ) : (
                  <>
                    <span>📝</span>
                    Tambah Artikel Edukasi
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {edukasiList.map((edukasi) => (
                <div
                  key={edukasi._id}
                  onClick={() => navigate(`/edukasi/${edukasi._id}`)}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                >
                  {/* Header Image with Gradient */}
                  <div
                    className={`h-48 ${getCategoryColor(
                      edukasi.kategori
                    )} flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-300`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent"></div>
                    <span className="text-7xl relative z-10 group-hover:scale-110 transition-transform duration-300">
                      {getCategoryIcon(edukasi.kategori)}
                    </span>
                    {/* Badge */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-3 py-1 bg-white/90 backdrop-blur-sm ${getCategoryColor(
                          edukasi.kategori
                        )} text-xs font-bold rounded-full shadow-md`}
                      >
                        {edukasi.kategori
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          {edukasi.viewCount || 0}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {edukasi.author || "TabbyCare Team"}
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-800 text-xl mb-3 line-clamp-2 group-hover:text-red-600 transition-colors">
                      {edukasi.judul}
                    </h3>

                    <p className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                      {edukasi.ringkasan ||
                        "Pelajari lebih lanjut tentang topik ini..."}
                    </p>

                    {/* Tags */}
                    {edukasi.tags && edukasi.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {edukasi.tags.slice(0, 2).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-red-600 font-semibold text-sm group-hover:translate-x-2 transition-transform inline-flex items-center gap-2">
                        Baca Artikel
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info Box */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-6 rounded-xl shadow-md">
            <div className="flex items-start gap-4">
              <div className="text-4xl">💡</div>
              <div className="flex-1">
                <h3 className="font-bold text-blue-900 mb-3 text-lg">
                  Tips Menggunakan Edukasi
                </h3>
                <ul className="text-blue-800 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">✓</span>
                    <span>
                      Baca artikel secara teratur untuk memahami kondisi Anda
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">✓</span>
                    <span>
                      Terapkan tips kesehatan dalam kehidupan sehari-hari
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">✓</span>
                    <span>Konsultasikan dengan dokter jika ada pertanyaan</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">✓</span>
                    <span>Bagikan informasi bermanfaat kepada keluarga</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EdukasiList;
