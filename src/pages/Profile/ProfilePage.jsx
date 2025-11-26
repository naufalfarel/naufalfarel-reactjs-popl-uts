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

      setFormData((prev) => ({
        ...prev,
        ...p,
        alamat: { ...prev.alamat, ...p.alamat },
        dokter: { ...prev.dokter, ...p.dokter },
        rumahSakit: { ...prev.rumahSakit, ...p.rumahSakit },
        kontakDarurat: { ...prev.kontakDarurat, ...p.kontakDarurat },
      }));

      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
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

  // ================================
  // UPDATE PROFILE
  // ================================
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(`${API_URL}/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      console.log(error);
    }
  };

  // ================================
  // ADD MEDICAL HISTORY
  // backend = POST /profile/medical-history
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
      fetchProfile();
    } catch (error) {
      console.log(error);
    }
  };

  // ================================
  // DELETE MEDICAL HISTORY
  // backend = DELETE /profile/medical-history/:id
  // ================================
  const deleteHistory = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/profile/medical-history/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProfile();
    } catch (error) {
      console.log(error);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Profil Pasien</h1>

        {/* TAB */}
        <div className="flex gap-3 mb-6">
          <button
            className={`px-4 py-2 rounded ${
              activeTab === "personal"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => setActiveTab("personal")}
          >
            Data Personal
          </button>

          <button
            className={`px-4 py-2 rounded ${
              activeTab === "medical" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setActiveTab("medical")}
          >
            Data Medis
          </button>

          <button
            className={`px-4 py-2 rounded ${
              activeTab === "history" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setActiveTab("history")}
          >
            Riwayat Pengobatan
          </button>
        </div>

        {/* PERSONAL TAB */}
        {activeTab === "personal" && (
          <div>
            <h2 className="font-semibold text-xl mb-3">Data Personal</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label>Tanggal Lahir</label>
                <input
                  name="tanggalLahir"
                  type="date"
                  value={formData.tanggalLahir || ""}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                  disabled={!isEditing}
                />
              </div>

              <div>
                <label>Jenis Kelamin</label>
                <select
                  name="jenisKelamin"
                  value={formData.jenisKelamin || ""}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                  disabled={!isEditing}
                >
                  <option value="">Pilih</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
            </div>

            <button
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            >
              {isEditing ? "Simpan" : "Edit Data"}
            </button>
          </div>
        )}

        {/* MEDICAL TAB */}
        {activeTab === "medical" && (
          <div>
            <h2 className="font-semibold text-xl mb-3">Data Medis</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label>Jenis TBC</label>
                <input
                  name="jenisTBC"
                  value={formData.jenisTBC || ""}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                  disabled={!isEditing}
                />
              </div>

              <div>
                <label>Tanggal Diagnosa</label>
                <input
                  name="tanggalDiagnosa"
                  type="date"
                  value={formData.tanggalDiagnosa || ""}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <button
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            >
              {isEditing ? "Simpan" : "Edit Data"}
            </button>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === "history" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-xl">Riwayat Pengobatan</h2>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={() => setShowAddHistory(true)}
              >
                Tambah Riwayat
              </button>
            </div>

            {profile?.riwayatPengobatan?.length === 0 && (
              <p className="text-gray-600">Belum ada riwayat pengobatan.</p>
            )}

            <div className="space-y-4">
              {profile?.riwayatPengobatan?.map((item) => (
                <div key={item._id} className="border p-3 rounded shadow">
                  <p>
                    <strong>Tanggal:</strong> {item.tanggal?.substring(0, 10)}
                  </p>
                  <p>
                    <strong>Keterangan:</strong> {item.keterangan}
                  </p>
                  <p>
                    <strong>Diagnosis:</strong> {item.diagnosis}
                  </p>
                  <p>
                    <strong>Tindakan:</strong> {item.tindakan}
                  </p>
                  <p>
                    <strong>Obat:</strong> {item.obatDiberikan}
                  </p>

                  <button
                    className="mt-2 px-3 py-1 bg-red-500 text-white rounded"
                    onClick={() => deleteHistory(item._id)}
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL ADD HISTORY */}
        {showAddHistory && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow w-96">
              <h3 className="font-bold mb-4 text-lg">
                Tambah Riwayat Pengobatan
              </h3>

              <div className="space-y-3">
                <input
                  type="date"
                  className="w-full border p-2 rounded"
                  value={historyForm.tanggal}
                  onChange={(e) =>
                    setHistoryForm({ ...historyForm, tanggal: e.target.value })
                  }
                />

                <input
                  type="text"
                  placeholder="Keterangan"
                  className="w-full border p-2 rounded"
                  value={historyForm.keterangan}
                  onChange={(e) =>
                    setHistoryForm({
                      ...historyForm,
                      keterangan: e.target.value,
                    })
                  }
                />

                <input
                  type="text"
                  placeholder="Diagnosis"
                  className="w-full border p-2 rounded"
                  value={historyForm.diagnosis}
                  onChange={(e) =>
                    setHistoryForm({
                      ...historyForm,
                      diagnosis: e.target.value,
                    })
                  }
                />

                <input
                  type="text"
                  placeholder="Tindakan"
                  className="w-full border p-2 rounded"
                  value={historyForm.tindakan}
                  onChange={(e) =>
                    setHistoryForm({ ...historyForm, tindakan: e.target.value })
                  }
                />

                <input
                  type="text"
                  placeholder="Obat Diberikan"
                  className="w-full border p-2 rounded"
                  value={historyForm.obatDiberikan}
                  onChange={(e) =>
                    setHistoryForm({
                      ...historyForm,
                      obatDiberikan: e.target.value,
                    })
                  }
                />

                <textarea
                  placeholder="Catatan Dokter"
                  className="w-full border p-2 rounded"
                  value={historyForm.catatanDokter}
                  onChange={(e) =>
                    setHistoryForm({
                      ...historyForm,
                      catatanDokter: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  className="px-4 py-2 bg-gray-300 rounded"
                  onClick={() => setShowAddHistory(false)}
                >
                  Batal
                </button>

                <button
                  className="px-4 py-2 bg-green-600 text-white rounded"
                  onClick={handleAddHistory}
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
