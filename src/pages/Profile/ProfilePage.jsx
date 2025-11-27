import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [showAddHistory, setShowAddHistory] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [newAlergi, setNewAlergi] = useState("");
  const [newPenyakitPenyerta, setNewPenyakitPenyerta] = useState("");

  const [formData, setFormData] = useState({
    tanggalLahir: "",
    jenisKelamin: "",
    alamat: {
      jalan: "",
      kota: "",
      provinsi: "",
      kodePos: "",
    },
    jenisTBC: "",
    tanggalDiagnosa: "",
    beratBadanAwal: "",
    tingkatKeparahan: "",
    dokter: {
      nama: "",
      spesialis: "",
      rumahSakit: "",
      noTelepon: "",
    },
    rumahSakit: {
      nama: "",
      alamat: "",
      noTelepon: "",
    },
    alergi: [],
    penyakitPenyerta: [],
    riwayatPenyakitKeluarga: "",
    kontakDarurat: {
      nama: "",
      hubungan: "",
      noTelepon: "",
    },
  });

  const [historyForm, setHistoryForm] = useState({
    tanggal: "",
    keterangan: "",
    diagnosis: "",
    tindakan: "",
    obatDiberikan: "",
    catatanDokter: "",
  });

  // Show notification
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  // ================================
  // GET PROFILE
  // ================================
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const p = res.data.data.profile;
      setProfile(p);
      setUser(p.userId);

      // Format dates for input fields
      const formatDate = (date) => {
        if (!date) return "";
        const d = new Date(date);
        return d.toISOString().split("T")[0];
      };

      setFormData((prev) => ({
        ...prev,
        tanggalLahir: formatDate(p.tanggalLahir),
        jenisKelamin: p.jenisKelamin || "",
        alamat: {
          jalan: p.alamat?.jalan || "",
          kota: p.alamat?.kota || "",
          provinsi: p.alamat?.provinsi || "",
          kodePos: p.alamat?.kodePos || "",
        },
        jenisTBC: p.jenisTBC || "",
        tanggalDiagnosa: formatDate(p.tanggalDiagnosa),
        beratBadanAwal: p.beratBadanAwal || "",
        tingkatKeparahan: p.tingkatKeparahan || "",
        dokter: {
          nama: p.dokter?.nama || "",
          spesialis: p.dokter?.spesialis || "",
          rumahSakit: p.dokter?.rumahSakit || "",
          noTelepon: p.dokter?.noTelepon || "",
        },
        rumahSakit: {
          nama: p.rumahSakit?.nama || "",
          alamat: p.rumahSakit?.alamat || "",
          noTelepon: p.rumahSakit?.noTelepon || "",
        },
        alergi: p.alergi || [],
        penyakitPenyerta: p.penyakitPenyerta || [],
        riwayatPenyakitKeluarga: p.riwayatPenyakitKeluarga || "",
        kontakDarurat: {
          nama: p.kontakDarurat?.nama || "",
          hubungan: p.kontakDarurat?.hubungan || "",
          noTelepon: p.kontakDarurat?.noTelepon || "",
        },
      }));

      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
      showNotification("Gagal memuat data profile", "error");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // ================================
  // HANDLE INPUT
  // ================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle array fields (alergi, penyakit penyerta)
  const handleAddAlergi = () => {
    if (newAlergi.trim()) {
      setFormData((prev) => ({
        ...prev,
        alergi: [...prev.alergi, newAlergi.trim()],
      }));
      setNewAlergi("");
    }
  };

  const handleRemoveAlergi = (index) => {
    setFormData((prev) => ({
      ...prev,
      alergi: prev.alergi.filter((_, i) => i !== index),
    }));
  };

  const handleAddPenyakitPenyerta = () => {
    if (newPenyakitPenyerta.trim()) {
      setFormData((prev) => ({
        ...prev,
        penyakitPenyerta: [
          ...prev.penyakitPenyerta,
          newPenyakitPenyerta.trim(),
        ],
      }));
      setNewPenyakitPenyerta("");
    }
  };

  const handleRemovePenyakitPenyerta = (index) => {
    setFormData((prev) => ({
      ...prev,
      penyakitPenyerta: prev.penyakitPenyerta.filter((_, i) => i !== index),
    }));
  };

  // ================================
  // UPDATE PROFILE
  // ================================
  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      await axios.put(`${API_URL}/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIsEditing(false);
      showNotification("Data berhasil disimpan!", "success");
      fetchProfile();
    } catch (error) {
      console.log(error);
      showNotification("Gagal menyimpan data", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchProfile(); // Reset to original data
  };

  // ================================
  // ADD MEDICAL HISTORY
  // ================================
  const handleAddHistory = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(`${API_URL}/profile/medical-history`, historyForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowAddHistory(false);
      setHistoryForm({
        tanggal: "",
        keterangan: "",
        diagnosis: "",
        tindakan: "",
        obatDiberikan: "",
        catatanDokter: "",
      });
      showNotification("Riwayat pengobatan berhasil ditambahkan!", "success");
      fetchProfile();
    } catch (error) {
      console.log(error);
      showNotification("Gagal menambahkan riwayat", "error");
    }
  };

  // ================================
  // DELETE MEDICAL HISTORY
  // ================================
  const deleteHistory = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus riwayat ini?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/profile/medical-history/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showNotification("Riwayat berhasil dihapus", "success");
      fetchProfile();
    } catch (error) {
      console.log(error);
      showNotification("Gagal menghapus riwayat", "error");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat data profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const userInfo = profile?.userId || user;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Profil Pasien
                </h1>
                <p className="text-gray-600 mt-1">
                  Kelola informasi pribadi dan medis Anda
                </p>
              </div>
              {userInfo && (
                <div className="text-right">
                  <p className="text-sm text-gray-500">Nama</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {userInfo.name || userInfo.email}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{userInfo.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Notification */}
          {notification.show && (
            <div
              className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 ${
                notification.type === "success"
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              <span>{notification.type === "success" ? "✓" : "✗"}</span>
              <span>{notification.message}</span>
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="flex border-b border-gray-200">
              <button
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === "personal"
                    ? "text-red-600 border-b-2 border-red-600 bg-red-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
                onClick={() => setActiveTab("personal")}
              >
                <span className="mr-2">👤</span>
                Data Personal
              </button>
              <button
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === "medical"
                    ? "text-red-600 border-b-2 border-red-600 bg-red-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
                onClick={() => setActiveTab("medical")}
              >
                <span className="mr-2">🏥</span>
                Data Medis
              </button>
              <button
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === "history"
                    ? "text-red-600 border-b-2 border-red-600 bg-red-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
                onClick={() => setActiveTab("history")}
              >
                <span className="mr-2">📋</span>
                Riwayat Pengobatan
              </button>
            </div>
          </div>

          {/* PERSONAL TAB */}
          {activeTab === "personal" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Informasi Personal
                </h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <span>✏️</span>
                    Edit Data
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Lahir
                    </label>
                    <input
                      name="tanggalLahir"
                      type="date"
                      value={formData.tanggalLahir || ""}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                        !isEditing
                          ? "bg-gray-100 cursor-not-allowed"
                          : "bg-white"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jenis Kelamin
                    </label>
                    <select
                      name="jenisKelamin"
                      value={formData.jenisKelamin || ""}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                        !isEditing
                          ? "bg-gray-100 cursor-not-allowed"
                          : "bg-white"
                      }`}
                    >
                      <option value="">Pilih Jenis Kelamin</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Alamat
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jalan
                      </label>
                      <input
                        name="alamat.jalan"
                        type="text"
                        value={formData.alamat.jalan || ""}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="Nama jalan, nomor rumah"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                          !isEditing
                            ? "bg-gray-100 cursor-not-allowed"
                            : "bg-white"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kota
                      </label>
                      <input
                        name="alamat.kota"
                        type="text"
                        value={formData.alamat.kota || ""}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="Nama kota"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                          !isEditing
                            ? "bg-gray-100 cursor-not-allowed"
                            : "bg-white"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Provinsi
                      </label>
                      <input
                        name="alamat.provinsi"
                        type="text"
                        value={formData.alamat.provinsi || ""}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="Nama provinsi"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                          !isEditing
                            ? "bg-gray-100 cursor-not-allowed"
                            : "bg-white"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kode Pos
                      </label>
                      <input
                        name="alamat.kodePos"
                        type="text"
                        value={formData.alamat.kodePos || ""}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="Kode pos"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                          !isEditing
                            ? "bg-gray-100 cursor-not-allowed"
                            : "bg-white"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Kontak Darurat
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama
                      </label>
                      <input
                        name="kontakDarurat.nama"
                        type="text"
                        value={formData.kontakDarurat.nama || ""}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="Nama kontak darurat"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                          !isEditing
                            ? "bg-gray-100 cursor-not-allowed"
                            : "bg-white"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hubungan
                      </label>
                      <input
                        name="kontakDarurat.hubungan"
                        type="text"
                        value={formData.kontakDarurat.hubungan || ""}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="Contoh: Suami, Istri, Anak"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                          !isEditing
                            ? "bg-gray-100 cursor-not-allowed"
                            : "bg-white"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        No. Telepon
                      </label>
                      <input
                        name="kontakDarurat.noTelepon"
                        type="text"
                        value={formData.kontakDarurat.noTelepon || ""}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="08xxxxxxxxxx"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                          !isEditing
                            ? "bg-gray-100 cursor-not-allowed"
                            : "bg-white"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <span>💾</span>
                          Simpan Perubahan
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MEDICAL TAB */}
          {activeTab === "medical" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Informasi Medis
                </h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <span>✏️</span>
                    Edit Data
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* TBC Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jenis TBC
                    </label>
                    <select
                      name="jenisTBC"
                      value={formData.jenisTBC || ""}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                        !isEditing
                          ? "bg-gray-100 cursor-not-allowed"
                          : "bg-white"
                      }`}
                    >
                      <option value="">Pilih Jenis TBC</option>
                      <option value="TBC Paru">TBC Paru</option>
                      <option value="TBC Ekstraparu">TBC Ekstraparu</option>
                      <option value="TBC Resisten Obat (MDR-TB)">
                        TBC Resisten Obat (MDR-TB)
                      </option>
                      <option value="TBC Laten">TBC Laten</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Diagnosa
                    </label>
                    <input
                      name="tanggalDiagnosa"
                      type="date"
                      value={formData.tanggalDiagnosa || ""}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                        !isEditing
                          ? "bg-gray-100 cursor-not-allowed"
                          : "bg-white"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Berat Badan Awal (kg)
                    </label>
                    <input
                      name="beratBadanAwal"
                      type="number"
                      value={formData.beratBadanAwal || ""}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Berat badan saat diagnosa"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                        !isEditing
                          ? "bg-gray-100 cursor-not-allowed"
                          : "bg-white"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tingkat Keparahan
                    </label>
                    <select
                      name="tingkatKeparahan"
                      value={formData.tingkatKeparahan || ""}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                        !isEditing
                          ? "bg-gray-100 cursor-not-allowed"
                          : "bg-white"
                      }`}
                    >
                      <option value="">Pilih Tingkat Keparahan</option>
                      <option value="Ringan">Ringan</option>
                      <option value="Sedang">Sedang</option>
                      <option value="Berat">Berat</option>
                    </select>
                  </div>
                </div>

                {/* Doctor Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Informasi Dokter
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Dokter
                      </label>
                      <input
                        name="dokter.nama"
                        type="text"
                        value={formData.dokter.nama || ""}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="Nama lengkap dokter"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                          !isEditing
                            ? "bg-gray-100 cursor-not-allowed"
                            : "bg-white"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Spesialis
                      </label>
                      <input
                        name="dokter.spesialis"
                        type="text"
                        value={formData.dokter.spesialis || ""}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="Spesialisasi dokter"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                          !isEditing
                            ? "bg-gray-100 cursor-not-allowed"
                            : "bg-white"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rumah Sakit
                      </label>
                      <input
                        name="dokter.rumahSakit"
                        type="text"
                        value={formData.dokter.rumahSakit || ""}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="Nama rumah sakit"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                          !isEditing
                            ? "bg-gray-100 cursor-not-allowed"
                            : "bg-white"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        No. Telepon Dokter
                      </label>
                      <input
                        name="dokter.noTelepon"
                        type="text"
                        value={formData.dokter.noTelepon || ""}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="08xxxxxxxxxx"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                          !isEditing
                            ? "bg-gray-100 cursor-not-allowed"
                            : "bg-white"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Hospital Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Informasi Rumah Sakit
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Rumah Sakit
                      </label>
                      <input
                        name="rumahSakit.nama"
                        type="text"
                        value={formData.rumahSakit.nama || ""}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="Nama rumah sakit"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                          !isEditing
                            ? "bg-gray-100 cursor-not-allowed"
                            : "bg-white"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        No. Telepon
                      </label>
                      <input
                        name="rumahSakit.noTelepon"
                        type="text"
                        value={formData.rumahSakit.noTelepon || ""}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="08xxxxxxxxxx"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                          !isEditing
                            ? "bg-gray-100 cursor-not-allowed"
                            : "bg-white"
                        }`}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alamat Rumah Sakit
                      </label>
                      <input
                        name="rumahSakit.alamat"
                        type="text"
                        value={formData.rumahSakit.alamat || ""}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="Alamat lengkap rumah sakit"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                          !isEditing
                            ? "bg-gray-100 cursor-not-allowed"
                            : "bg-white"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Allergies */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Alergi
                  </h3>
                  {isEditing && (
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newAlergi}
                        onChange={(e) => setNewAlergi(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleAddAlergi()
                        }
                        placeholder="Tambah alergi"
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleAddAlergi}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        Tambah
                      </button>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {formData.alergi.length > 0 ? (
                      formData.alergi.map((alergi, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm flex items-center gap-2"
                        >
                          {alergi}
                          {isEditing && (
                            <button
                              onClick={() => handleRemoveAlergi(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              ×
                            </button>
                          )}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">
                        Belum ada alergi yang tercatat
                      </p>
                    )}
                  </div>
                </div>

                {/* Comorbidities */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Penyakit Penyerta
                  </h3>
                  {isEditing && (
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newPenyakitPenyerta}
                        onChange={(e) => setNewPenyakitPenyerta(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleAddPenyakitPenyerta()
                        }
                        placeholder="Tambah penyakit penyerta"
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleAddPenyakitPenyerta}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        Tambah
                      </button>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {formData.penyakitPenyerta.length > 0 ? (
                      formData.penyakitPenyerta.map((penyakit, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm flex items-center gap-2"
                        >
                          {penyakit}
                          {isEditing && (
                            <button
                              onClick={() =>
                                handleRemovePenyakitPenyerta(index)
                              }
                              className="text-yellow-600 hover:text-yellow-800"
                            >
                              ×
                            </button>
                          )}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">
                        Belum ada penyakit penyerta yang tercatat
                      </p>
                    )}
                  </div>
                </div>

                {/* Family History */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Riwayat Penyakit Keluarga
                  </label>
                  <textarea
                    name="riwayatPenyakitKeluarga"
                    value={formData.riwayatPenyakitKeluarga || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows={4}
                    placeholder="Jelaskan riwayat penyakit keluarga yang relevan"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      !isEditing ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                    }`}
                  />
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <span>💾</span>
                          Simpan Perubahan
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* HISTORY TAB */}
          {activeTab === "history" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Riwayat Pengobatan
                </h2>
                <button
                  onClick={() => setShowAddHistory(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <span>➕</span>
                  Tambah Riwayat
                </button>
              </div>

              {!profile?.riwayatPengobatan ||
              profile.riwayatPengobatan.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📋</div>
                  <p className="text-gray-600 text-lg">
                    Belum ada riwayat pengobatan
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Klik tombol "Tambah Riwayat" untuk menambahkan riwayat
                    pengobatan
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {profile.riwayatPengobatan.map((item) => (
                    <div
                      key={item._id}
                      className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                              <span className="text-2xl">📅</span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900">
                                {new Date(item.tanggal).toLocaleDateString(
                                  "id-ID",
                                  {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )}
                              </h3>
                              {item.keterangan && (
                                <p className="text-gray-600">
                                  {item.keterangan}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            {item.diagnosis && (
                              <div>
                                <p className="text-sm font-medium text-gray-500">
                                  Diagnosis
                                </p>
                                <p className="text-gray-900">
                                  {item.diagnosis}
                                </p>
                              </div>
                            )}
                            {item.tindakan && (
                              <div>
                                <p className="text-sm font-medium text-gray-500">
                                  Tindakan
                                </p>
                                <p className="text-gray-900">{item.tindakan}</p>
                              </div>
                            )}
                            {item.obatDiberikan && (
                              <div>
                                <p className="text-sm font-medium text-gray-500">
                                  Obat Diberikan
                                </p>
                                <p className="text-gray-900">
                                  {item.obatDiberikan}
                                </p>
                              </div>
                            )}
                            {item.catatanDokter && (
                              <div className="md:col-span-2">
                                <p className="text-sm font-medium text-gray-500">
                                  Catatan Dokter
                                </p>
                                <p className="text-gray-900">
                                  {item.catatanDokter}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteHistory(item._id)}
                          className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus riwayat"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MODAL ADD HISTORY */}
          {showAddHistory && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">
                    Tambah Riwayat Pengobatan
                  </h3>
                  <button
                    onClick={() => setShowAddHistory(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      value={historyForm.tanggal}
                      onChange={(e) =>
                        setHistoryForm({
                          ...historyForm,
                          tanggal: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Keterangan
                    </label>
                    <input
                      type="text"
                      placeholder="Keterangan kunjungan"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      value={historyForm.keterangan}
                      onChange={(e) =>
                        setHistoryForm({
                          ...historyForm,
                          keterangan: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Diagnosis
                    </label>
                    <input
                      type="text"
                      placeholder="Diagnosis dokter"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      value={historyForm.diagnosis}
                      onChange={(e) =>
                        setHistoryForm({
                          ...historyForm,
                          diagnosis: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tindakan
                    </label>
                    <input
                      type="text"
                      placeholder="Tindakan yang dilakukan"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      value={historyForm.tindakan}
                      onChange={(e) =>
                        setHistoryForm({
                          ...historyForm,
                          tindakan: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Obat Diberikan
                    </label>
                    <input
                      type="text"
                      placeholder="Nama obat yang diberikan"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      value={historyForm.obatDiberikan}
                      onChange={(e) =>
                        setHistoryForm({
                          ...historyForm,
                          obatDiberikan: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catatan Dokter
                    </label>
                    <textarea
                      placeholder="Catatan atau instruksi dari dokter"
                      rows={4}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      value={historyForm.catatanDokter}
                      onChange={(e) =>
                        setHistoryForm({
                          ...historyForm,
                          catatanDokter: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex justify-end gap-3">
                  <button
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setShowAddHistory(false)}
                  >
                    Batal
                  </button>
                  <button
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    onClick={handleAddHistory}
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
