import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const EdukasiDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [edukasi, setEdukasi] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEdukasi();
  }, [id]);

  const loadEdukasi = async () => {
    try {
      const response = await axios.get(`${API_URL}/edukasi/${id}`);

      if (response.data.success) {
        const edukasiData = response.data.data.edukasi;
        setEdukasi(edukasiData);

        // Load related articles
        const relatedRes = await axios.get(
          `${API_URL}/edukasi/kategori/${edukasiData.kategori}`
        );
        if (relatedRes.data.success) {
          // Filter out current article and take first 3
          const related = relatedRes.data.data.edukasiList
            .filter((e) => e._id !== id)
            .slice(0, 3);
          setRelatedArticles(related);
        }
      }
    } catch (error) {
      console.error("Error loading edukasi:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (kategori) => {
    const icons = {
      tentang_tbc: "🏥",
      pengobatan: "💊",
      nutrisi: "🥗",
      gaya_hidup: "🏃",
      pencegahan: "🛡️",
      tips_kesehatan: "💡",
    };
    return icons[kategori] || "📖";
  };

  const getCategoryColor = (kategori) => {
    const colors = {
      tentang_tbc: "bg-red-100 text-red-700",
      pengobatan: "bg-blue-100 text-blue-700",
      nutrisi: "bg-green-100 text-green-700",
      gaya_hidup: "bg-purple-100 text-purple-700",
      pencegahan: "bg-yellow-100 text-yellow-700",
      tips_kesehatan: "bg-pink-100 text-pink-700",
    };
    return colors[kategori] || "bg-gray-100 text-gray-700";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
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

  if (!edukasi) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 py-8 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Artikel Tidak Ditemukan
            </h2>
            <button
              onClick={() => navigate("/edukasi")}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
            >
              Kembali ke Edukasi
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate("/edukasi")}
            className="flex items-center text-red-600 hover:text-red-700 font-medium mb-6"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Kembali ke Edukasi
          </button>

          {/* Article Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-pink-500 p-8 text-white">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-5xl">
                  {getCategoryIcon(edukasi.kategori)}
                </span>
                <span
                  className={`px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold`}
                >
                  {edukasi.kategori.replace("_", " ").toUpperCase()}
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-3">{edukasi.judul}</h1>
              <div className="flex items-center gap-4 text-sm text-white/90">
                <span>👤 {edukasi.author || "TabbyCare Team"}</span>
                <span>•</span>
                <span>📅 {formatDate(edukasi.publishedAt)}</span>
                <span>•</span>
                <span>👁️ {edukasi.viewCount} views</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Ringkasan */}
              {edukasi.ringkasan && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-8">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    📝 Ringkasan
                  </h3>
                  <p className="text-blue-800">{edukasi.ringkasan}</p>
                </div>
              )}

              {/* Main Content */}
              <div className="prose max-w-none">
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {edukasi.konten}
                </div>
              </div>

              {/* Tags */}
              {edukasi.tags && edukasi.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t">
                  <h4 className="text-sm font-semibold text-gray-600 mb-3">
                    🏷️ Tags:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {edukasi.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Source Reference */}
              {edukasi.sumberReferensi && (
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-gray-600">
                    <strong>Sumber Referensi:</strong> {edukasi.sumberReferensi}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                📚 Artikel Terkait
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                {relatedArticles.map((article) => (
                  <div
                    key={article._id}
                    onClick={() => navigate(`/edukasi/${article._id}`)}
                    className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition cursor-pointer"
                  >
                    <div className="text-3xl mb-2">
                      {getCategoryIcon(article.kategori)}
                    </div>
                    <h3 className="font-bold text-gray-800 text-sm mb-2 line-clamp-2">
                      {article.judul}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {article.ringkasan}
                    </p>
                    <span className="text-red-600 font-medium text-xs mt-2 inline-block">
                      Baca →
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Box */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-6 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-3">
              💡 Apakah artikel ini bermanfaat?
            </h3>
            <p className="text-green-800 text-sm mb-4">
              Jangan lupa untuk menerapkan tips yang Anda pelajari dan
              konsultasikan dengan dokter jika ada pertanyaan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/edukasi")}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700"
              >
                Baca Artikel Lainnya
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 bg-white text-green-700 border border-green-300 rounded-lg text-sm font-semibold hover:bg-green-50"
              >
                Kembali ke Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EdukasiDetail;
