import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { edukasiService } from "../../services/api";

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
      const response = await edukasiService.getById(id);

      if (response.data.success) {
        const edukasiData = response.data.data.edukasi;
        setEdukasi(edukasiData);

        // Load related articles
        const relatedRes = await edukasiService.getByKategori(
          edukasiData.kategori
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
              <div className="prose prose-lg max-w-none">
                <div className="text-gray-700 leading-relaxed article-content">
                  {(() => {
                    const lines = edukasi.konten.split("\n");
                    const elements = [];
                    let inList = false;
                    let listItems = [];
                    let listType = null; // 'ul' or 'ol'

                    const processInlineFormatting = (text) => {
                      return text
                        .replace(
                          /\*\*(.+?)\*\*/g,
                          '<strong class="font-bold text-gray-800">$1</strong>'
                        )
                        .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>');
                    };

                    const closeList = () => {
                      if (listItems.length > 0) {
                        const ListTag = listType === "ol" ? "ol" : "ul";
                        elements.push(
                          React.createElement(
                            ListTag,
                            {
                              key: `list-${elements.length}`,
                              className: "mb-4 ml-6 space-y-2",
                            },
                            listItems
                          )
                        );
                        listItems = [];
                        inList = false;
                        listType = null;
                      }
                    };

                    lines.forEach((line, index) => {
                      const trimmedLine = line.trim();

                      // Headers
                      if (trimmedLine.match(/^#{1,6}\s/)) {
                        closeList();
                        const level = trimmedLine.match(/^#+/)[0].length;
                        const text = trimmedLine.replace(/^#+\s/, "");
                        const processedText = processInlineFormatting(text);
                        const HeadingTag = `h${level}`;
                        elements.push(
                          React.createElement(
                            HeadingTag,
                            {
                              key: index,
                              className: `font-bold text-gray-800 mt-8 mb-4 ${
                                level === 1
                                  ? "text-3xl"
                                  : level === 2
                                  ? "text-2xl"
                                  : level === 3
                                  ? "text-xl"
                                  : "text-lg"
                              }`,
                            },
                            text
                          )
                        );
                        return;
                      }

                      // Bullet points
                      if (trimmedLine.match(/^-\s/)) {
                        if (!inList || listType !== "ul") {
                          closeList();
                          inList = true;
                          listType = "ul";
                        }
                        const text = trimmedLine.replace(/^-\s/, "");
                        const processedText = processInlineFormatting(text);
                        listItems.push(
                          <li
                            key={`li-${index}`}
                            className="mb-2"
                            dangerouslySetInnerHTML={{ __html: processedText }}
                          />
                        );
                        return;
                      }

                      // Numbered lists
                      if (trimmedLine.match(/^\d+\.\s/)) {
                        if (!inList || listType !== "ol") {
                          closeList();
                          inList = true;
                          listType = "ol";
                        }
                        const text = trimmedLine.replace(/^\d+\.\s/, "");
                        const processedText = processInlineFormatting(text);
                        listItems.push(
                          <li
                            key={`li-${index}`}
                            className="mb-2"
                            dangerouslySetInnerHTML={{ __html: processedText }}
                          />
                        );
                        return;
                      }

                      // Close list if we hit a non-list item
                      if (inList && trimmedLine) {
                        closeList();
                      }

                      // Checkmarks
                      if (trimmedLine.match(/^✅\s/)) {
                        const text = trimmedLine.replace(/^✅\s/, "");
                        const processedText = processInlineFormatting(text);
                        elements.push(
                          <div
                            key={index}
                            className="flex items-start gap-2 mb-3"
                          >
                            <span className="text-green-600 mt-1 text-xl">
                              ✓
                            </span>
                            <span
                              dangerouslySetInnerHTML={{
                                __html: processedText,
                              }}
                            />
                          </div>
                        );
                        return;
                      }

                      // X marks
                      if (trimmedLine.match(/^❌\s/)) {
                        const text = trimmedLine.replace(/^❌\s/, "");
                        const processedText = processInlineFormatting(text);
                        elements.push(
                          <div
                            key={index}
                            className="flex items-start gap-2 mb-3"
                          >
                            <span className="text-red-600 mt-1 text-xl">✗</span>
                            <span
                              dangerouslySetInnerHTML={{
                                __html: processedText,
                              }}
                            />
                          </div>
                        );
                        return;
                      }

                      // Warning
                      if (trimmedLine.match(/^⚠️\s/)) {
                        const text = trimmedLine.replace(/^⚠️\s/, "");
                        const processedText = processInlineFormatting(text);
                        elements.push(
                          <div
                            key={index}
                            className="flex items-start gap-2 mb-3 bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500"
                          >
                            <span className="text-yellow-600 mt-1 text-xl">
                              ⚠
                            </span>
                            <span
                              className="font-medium"
                              dangerouslySetInnerHTML={{
                                __html: processedText,
                              }}
                            />
                          </div>
                        );
                        return;
                      }

                      // Alert
                      if (trimmedLine.match(/^🚨\s/)) {
                        const text = trimmedLine.replace(/^🚨\s/, "");
                        const processedText = processInlineFormatting(text);
                        elements.push(
                          <div
                            key={index}
                            className="flex items-start gap-2 mb-3 bg-red-50 p-4 rounded-lg border-l-4 border-red-500"
                          >
                            <span className="text-red-600 mt-1 text-xl">
                              🚨
                            </span>
                            <span
                              className="font-bold"
                              dangerouslySetInnerHTML={{
                                __html: processedText,
                              }}
                            />
                          </div>
                        );
                        return;
                      }

                      // Empty line
                      if (!trimmedLine) {
                        elements.push(<br key={index} />);
                        return;
                      }

                      // Regular paragraph
                      const processedLine =
                        processInlineFormatting(trimmedLine);
                      elements.push(
                        <p
                          key={index}
                          className="mb-4 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: processedLine }}
                        />
                      );
                    });

                    // Close any remaining list
                    closeList();

                    return elements;
                  })()}
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
          <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-l-4 border-green-500 p-8 rounded-xl shadow-lg">
            <div className="flex items-start gap-4 mb-4">
              <div className="text-4xl">💡</div>
              <div className="flex-1">
                <h3 className="font-bold text-green-900 mb-2 text-lg">
                  Apakah artikel ini bermanfaat?
                </h3>
                <p className="text-green-800 text-sm mb-6 leading-relaxed">
                  Jangan lupa untuk menerapkan tips yang Anda pelajari dan
                  konsultasikan dengan dokter jika ada pertanyaan. Pengetahuan
                  yang baik adalah langkah pertama menuju kesembuhan.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate("/edukasi")}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition shadow-md hover:shadow-lg flex items-center gap-2"
                  >
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
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    Baca Artikel Lainnya
                  </button>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="px-6 py-3 bg-white text-green-700 border-2 border-green-300 rounded-lg text-sm font-semibold hover:bg-green-50 transition shadow-md hover:shadow-lg flex items-center gap-2"
                  >
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
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                    Kembali ke Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EdukasiDetail;
