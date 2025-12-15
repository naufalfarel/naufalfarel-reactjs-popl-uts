import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { obatService } from "../../services/api";

const ObatList = () => {
  const navigate = useNavigate();
  const [obatList, setObatList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("aktif");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedObat, setSelectedObat] = useState(null);

  useEffect(() => {
    loadObat();
  }, [filter]);

  const loadObat = async () => {
    try {
      const response = await obatService.getAll({ status: filter });
      if (response.data.success) {
        setObatList(response.data.data.obatList);
      }
    } catch (error) {
      console.error("Error loading obat:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await obatService.delete(selectedObat._id);
      if (response.data.success) {
        setObatList(obatList.filter((o) => o._id !== selectedObat._id));
        setShowDeleteModal(false);
        setSelectedObat(null);
      }
    } catch (error) {
      console.error("Error deleting obat:", error);
      alert("Gagal menghapus obat");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      aktif: "bg-green-100 text-green-800",
      selesai: "bg-blue-100 text-blue-800",
      dibatalkan: "bg-red-100 text-red-800",
    };
    return badges[status] || "bg-gray-100 text-gray-800";
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
                💊 Daftar Obat
              </h1>
              <p className="text-gray-600 mt-2">
                Kelola obat dan jadwal konsumsi Anda
              </p>
            </div>
            <button
              onClick={() => navigate("/obat/add")}
              className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              Tambah Obat
            </button>
          </div>

          {/* Filter */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex gap-2">
              {["aktif", "selesai", "dibatalkan"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filter === status
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Obat List */}
          {obatList.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <div className="text-6xl mb-4">💊</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Belum ada obat {filter}
              </h3>
              <p className="text-gray-600 mb-6">
                Mulai tambahkan obat untuk tracking konsumsi Anda
              </p>
              <button
                onClick={() => navigate("/obat/add")}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
              >
                Tambah Obat Pertama
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {obatList.map((obat) => (
                <div
                  key={obat._id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
                >
                  {/* Image placeholder */}
                  <div className="w-full h-48 bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center">
                    <span className="text-6xl">💊</span>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">
                          {obat.namaObat}
                        </h3>
                        <p className="text-gray-600">{obat.dosis}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                          obat.status
                        )}`}
                      >
                        {obat.status}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-2">🔄</span>
                        <span>{obat.frekuensi}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-2">⏰</span>
                        <span>{obat.waktuKonsumsi.join(", ")}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-2">📅</span>
                        <span>
                          {formatDate(obat.tanggalMulai)} -{" "}
                          {formatDate(obat.tanggalSelesai)}
                        </span>
                      </div>
                      {obat.catatan && (
                        <div className="flex items-start text-sm text-gray-600">
                          <span className="mr-2">📝</span>
                          <span className="line-clamp-2">{obat.catatan}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/obat/edit/${obat._id}`)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setSelectedObat(obat);
                          setShowDeleteModal(true);
                        }}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Konfirmasi Hapus
            </h3>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus obat{" "}
              <strong>{selectedObat?.namaObat}</strong>? Semua data terkait akan
              dihapus.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedObat(null);
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ObatList;
