import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { kunjunganService } from "../../services/api";

const KunjunganList = () => {
  const navigate = useNavigate();
  const [kunjunganList, setKunjunganList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, scheduled, completed, cancelled, missed
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedKunjungan, setSelectedKunjungan] = useState(null);

  useEffect(() => {
    loadKunjungan();
  }, [filter]);

  const loadKunjungan = async () => {
    try {
      setLoading(true);
      const params = filter !== "all" ? { status: filter } : {};
      const response = await kunjunganService.getAll(params);
      if (response.data.success) {
        setKunjunganList(response.data.data.kunjunganList || []);
      }
    } catch (error) {
      console.error("Error loading kunjungan:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await kunjunganService.delete(selectedKunjungan._id);
      if (response.data.success) {
        setKunjunganList(
          kunjunganList.filter((k) => k._id !== selectedKunjungan._id)
        );
        setShowDeleteModal(false);
        setSelectedKunjungan(null);
      }
    } catch (error) {
      console.error("Error deleting kunjungan:", error);
      alert("Gagal menghapus kunjungan");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString, waktuString) => {
    const date = new Date(dateString);
    return `${formatDate(dateString)} • ${waktuString}`;
  };

  const getStatusBadge = (status) => {
    const badges = {
      scheduled: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      missed: "bg-gray-100 text-gray-800",
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status) => {
    const labels = {
      scheduled: "Terjadwal",
      completed: "Selesai",
      cancelled: "Dibatalkan",
      missed: "Terlewat",
    };
    return labels[status] || status;
  };

  const getJenisKunjunganLabel = (jenis) => {
    const labels = {
      kontrol_rutin: "Kontrol Rutin",
      pemeriksaan_lab: "Pemeriksaan Lab",
      konsultasi: "Konsultasi",
      vaksinasi: "Vaksinasi",
      lainnya: "Lainnya",
    };
    return labels[jenis] || jenis;
  };

  const isUpcoming = (tanggalKunjungan, waktuKunjungan) => {
    const [hours, minutes] = waktuKunjungan.split(":");
    const visitDate = new Date(tanggalKunjungan);
    visitDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return visitDate > new Date();
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
                📅 Jadwal Kunjungan
              </h1>
              <p className="text-gray-600 mt-2">
                Kelola jadwal kunjungan medis Anda ke rumah sakit
              </p>
            </div>
            <button
              onClick={() => navigate("/kunjungan/add")}
              className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              Jadwalkan Kunjungan
            </button>
          </div>

          {/* Filter */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex gap-2 flex-wrap">
              {[
                { value: "all", label: "Semua" },
                { value: "scheduled", label: "Terjadwal" },
                { value: "completed", label: "Selesai" },
                { value: "cancelled", label: "Dibatalkan" },
                { value: "missed", label: "Terlewat" },
              ].map((status) => (
                <button
                  key={status.value}
                  onClick={() => setFilter(status.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filter === status.value
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* Kunjungan List */}
          {kunjunganList.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <div className="text-6xl mb-4">🏥</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Belum ada kunjungan{" "}
                {filter !== "all" ? getStatusLabel(filter) : ""}
              </h3>
              <p className="text-gray-600 mb-6">
                Mulai jadwalkan kunjungan medis Anda ke rumah sakit
              </p>
              <button
                onClick={() => navigate("/kunjungan/add")}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
              >
                Jadwalkan Kunjungan Pertama
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {kunjunganList.map((kunjungan) => (
                <div
                  key={kunjungan._id}
                  className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition ${
                    isUpcoming(
                      kunjungan.tanggalKunjungan,
                      kunjungan.waktuKunjungan
                    ) && kunjungan.status === "scheduled"
                      ? "ring-2 ring-blue-400"
                      : ""
                  }`}
                >
                  {/* Header with Status */}
                  <div className="bg-gradient-to-r from-red-500 to-pink-500 p-4 text-white">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-1">
                          {kunjungan.judulKunjungan}
                        </h3>
                        <p className="text-sm opacity-90">
                          {getJenisKunjunganLabel(kunjungan.jenisKunjungan)}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                          kunjungan.status
                        )} bg-white`}
                      >
                        {getStatusLabel(kunjungan.status)}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="space-y-3 mb-4">
                      {/* Date & Time */}
                      <div className="flex items-center text-sm text-gray-700">
                        <span className="mr-3 text-xl">📆</span>
                        <div>
                          <div className="font-semibold">
                            {formatDateTime(
                              kunjungan.tanggalKunjungan,
                              kunjungan.waktuKunjungan
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Location */}
                      {kunjungan.lokasi && (
                        <div className="flex items-start text-sm text-gray-700">
                          <span className="mr-3 text-xl">📍</span>
                          <div>
                            <div className="font-semibold">
                              {kunjungan.lokasi.namaRumahSakit}
                            </div>
                            {kunjungan.lokasi.alamat && (
                              <div className="text-gray-600 text-xs mt-1">
                                {kunjungan.lokasi.alamat}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Doctor */}
                      {kunjungan.dokter && kunjungan.dokter.nama && (
                        <div className="flex items-center text-sm text-gray-700">
                          <span className="mr-3 text-xl">👨‍⚕️</span>
                          <div>
                            <div className="font-semibold">
                              {kunjungan.dokter.nama}
                            </div>
                            {kunjungan.dokter.spesialis && (
                              <div className="text-gray-600 text-xs">
                                {kunjungan.dokter.spesialis}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {kunjungan.catatan && (
                        <div className="flex items-start text-sm text-gray-700">
                          <span className="mr-3 text-xl">📝</span>
                          <div className="line-clamp-2">
                            {kunjungan.catatan}
                          </div>
                        </div>
                      )}

                      {/* Reminder */}
                      {kunjungan.reminderBefore && (
                        <div className="flex items-center text-sm text-gray-700">
                          <span className="mr-3 text-xl">⏰</span>
                          <div>
                            Reminder {kunjungan.reminderBefore} jam sebelum
                            kunjungan
                          </div>
                        </div>
                      )}

                      {/* Visit Result */}
                      {kunjungan.hasilKunjungan &&
                        kunjungan.status === "completed" && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="text-xs font-semibold text-gray-600 mb-2">
                              Hasil Kunjungan:
                            </div>
                            {kunjungan.hasilKunjungan.diagnosa && (
                              <div className="text-sm text-gray-700 mb-1">
                                <span className="font-semibold">Diagnosa:</span>{" "}
                                {kunjungan.hasilKunjungan.diagnosa}
                              </div>
                            )}
                            {kunjungan.hasilKunjungan.tindakan && (
                              <div className="text-sm text-gray-700 mb-1">
                                <span className="font-semibold">Tindakan:</span>{" "}
                                {kunjungan.hasilKunjungan.tindakan}
                              </div>
                            )}
                          </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          navigate(`/kunjungan/edit/${kunjungan._id}`)
                        }
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                      >
                        Edit
                      </button>
                      {kunjungan.status === "scheduled" && (
                        <button
                          onClick={() =>
                            navigate(
                              `/kunjungan/edit/${kunjungan._id}?tab=hasil`
                            )
                          }
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
                        >
                          Hasil
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedKunjungan(kunjungan);
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
              Apakah Anda yakin ingin menghapus kunjungan{" "}
              <strong>{selectedKunjungan?.judulKunjungan}</strong>? Semua data
              terkait akan dihapus.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedKunjungan(null);
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

export default KunjunganList;
