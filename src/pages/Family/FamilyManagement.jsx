import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const FamilyManagement = () => {
  const navigate = useNavigate();
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    relation: "parent",
    phone: "",
    emailNotifications: true,
    weeklySummary: true,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadFamilyMembers();
  }, []);

  const loadFamilyMembers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/family`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setFamilyMembers(response.data.data.familyMembers);
      }
    } catch (error) {
      console.error("Error loading family:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${API_URL}/family`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setSuccess(
          "Anggota keluarga berhasil ditambahkan! Email undangan telah dikirim."
        );
        setShowAddModal(false);
        setFormData({
          name: "",
          email: "",
          relation: "parent",
          phone: "",
          emailNotifications: true,
          weeklySummary: true,
        });
        loadFamilyMembers();
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Gagal menambahkan anggota keluarga"
      );
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm("Apakah Anda yakin ingin menghapus anggota keluarga ini?")
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/family/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess("Anggota keluarga berhasil dihapus");
      loadFamilyMembers();
    } catch (err) {
      setError("Gagal menghapus anggota keluarga");
    }
  };

  const getRelationLabel = (relation) => {
    const labels = {
      parent: "Orang Tua",
      spouse: "Pasangan",
      child: "Anak",
      sibling: "Saudara",
      other: "Lainnya",
    };
    return labels[relation] || relation;
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
                👨‍👩‍👧 Manajemen Keluarga
              </h1>
              <p className="text-gray-600 mt-2">
                Kelola anggota keluarga yang memantau kesehatan Anda
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              Tambah Keluarga
            </button>
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
              ℹ️ Tentang Fitur Pemantau Keluarga
            </h3>
            <p className="text-blue-800 text-sm">
              Anggota keluarga yang ditambahkan akan menerima:
            </p>
            <ul className="list-disc list-inside text-blue-800 text-sm mt-2 space-y-1">
              <li>Notifikasi email saat Anda perlu minum obat</li>
              <li>Peringatan jika Anda melewatkan jadwal minum obat</li>
              <li>Ringkasan mingguan progres kepatuhan Anda</li>
              <li>Akses read-only untuk melihat progres kesehatan Anda</li>
            </ul>
          </div>

          {/* Family Members List */}
          {familyMembers.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Belum ada anggota keluarga
              </h3>
              <p className="text-gray-600 mb-6">
                Tambahkan anggota keluarga untuk membantu memantau pengobatan
                Anda
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
              >
                Tambah Anggota Keluarga
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {familyMembers.map((member) => (
                <div
                  key={member._id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
                >
                  <div className="bg-gradient-to-r from-red-400 to-pink-500 p-6 text-center">
                    <div className="w-20 h-20 bg-white rounded-full mx-auto flex items-center justify-center text-3xl">
                      {member.relation === "parent"
                        ? "👴"
                        : member.relation === "spouse"
                        ? "💑"
                        : member.relation === "child"
                        ? "👶"
                        : member.relation === "sibling"
                        ? "👫"
                        : "👤"}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">
                      {member.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {getRelationLabel(member.relation)}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-2">📧</span>
                        <span className="truncate">{member.email}</span>
                      </div>
                      {member.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="mr-2">📱</span>
                          <span>{member.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Email Notifikasi:</span>
                        <span
                          className={
                            member.emailNotifications
                              ? "text-green-600"
                              : "text-gray-400"
                          }
                        >
                          {member.emailNotifications ? "✓ Aktif" : "✗ Nonaktif"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">
                          Ringkasan Mingguan:
                        </span>
                        <span
                          className={
                            member.weeklySummary
                              ? "text-green-600"
                              : "text-gray-400"
                          }
                        >
                          {member.weeklySummary ? "✓ Aktif" : "✗ Nonaktif"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(member._id)}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Family Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Tambah Anggota Keluarga
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nama Lengkap <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Nama lengkap"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Hubungan <span className="text-red-600">*</span>
                </label>
                <select
                  value={formData.relation}
                  onChange={(e) =>
                    setFormData({ ...formData, relation: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="parent">Orang Tua</option>
                  <option value="spouse">Pasangan</option>
                  <option value="child">Anak</option>
                  <option value="sibling">Saudara</option>
                  <option value="other">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  No. Telepon (Opsional)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="08123456789"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.emailNotifications}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emailNotifications: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-red-600 border-gray-300 rounded"
                  />
                  Aktifkan notifikasi email untuk jadwal minum obat
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.weeklySummary}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        weeklySummary: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-red-600 border-gray-300 rounded"
                  />
                  Kirim ringkasan mingguan ke email anggota keluarga ini
                </label>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({
                    name: "",
                    email: "",
                    relation: "parent",
                    phone: "",
                    emailNotifications: true,
                    weeklySummary: true,
                  });
                  setError("");
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
              >
                Tambah
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default FamilyManagement;
