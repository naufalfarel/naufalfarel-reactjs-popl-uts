import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { kunjunganService } from "../../services/api";

const KunjunganForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = !!id;
  const showHasilTab = searchParams.get("tab") === "hasil";

  const [activeTab, setActiveTab] = useState(showHasilTab ? "hasil" : "detail");
  const [formData, setFormData] = useState({
    judulKunjungan: "",
    tanggalKunjungan: "",
    waktuKunjungan: "",
    lokasi: {
      namaRumahSakit: "",
      alamat: "",
    },
    dokter: {
      nama: "",
      spesialis: "",
    },
    jenisKunjungan: "kontrol_rutin",
    catatan: "",
    reminderBefore: 24,
  });

  const [hasilFormData, setHasilFormData] = useState({
    diagnosa: "",
    tindakan: "",
    resepObat: "",
    catatanDokter: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isEdit) {
      loadKunjungan();
    }
  }, [id]);

  const loadKunjungan = async () => {
    try {
      const response = await kunjunganService.getById(id);
      if (response.data.success) {
        const kunjungan = response.data.data.kunjungan;
        setFormData({
          judulKunjungan: kunjungan.judulKunjungan || "",
          tanggalKunjungan: kunjungan.tanggalKunjungan
            ? new Date(kunjungan.tanggalKunjungan).toISOString().split("T")[0]
            : "",
          waktuKunjungan: kunjungan.waktuKunjungan || "",
          lokasi: kunjungan.lokasi || { namaRumahSakit: "", alamat: "" },
          dokter: kunjungan.dokter || { nama: "", spesialis: "" },
          jenisKunjungan: kunjungan.jenisKunjungan || "kontrol_rutin",
          catatan: kunjungan.catatan || "",
          reminderBefore: kunjungan.reminderBefore || 24,
        });
        if (kunjungan.hasilKunjungan) {
          setHasilFormData({
            diagnosa: kunjungan.hasilKunjungan.diagnosa || "",
            tindakan: kunjungan.hasilKunjungan.tindakan || "",
            resepObat: kunjungan.hasilKunjungan.resepObat || "",
            catatanDokter: kunjungan.hasilKunjungan.catatanDokter || "",
          });
        }
      }
    } catch (err) {
      setError("Gagal memuat data kunjungan");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLokasiChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      lokasi: { ...prev.lokasi, [name]: value },
    }));
  };

  const handleDokterChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      dokter: { ...prev.dokter, [name]: value },
    }));
  };

  const handleHasilChange = (e) => {
    const { name, value } = e.target;
    setHasilFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Validation
      if (
        !formData.judulKunjungan ||
        !formData.tanggalKunjungan ||
        !formData.waktuKunjungan ||
        !formData.lokasi.namaRumahSakit
      ) {
        setError("Mohon lengkapi semua field yang wajib");
        setLoading(false);
        return;
      }

      const data = {
        ...formData,
        lokasi: formData.lokasi,
        dokter: formData.dokter.nama ? formData.dokter : undefined,
      };

      let response;
      if (isEdit) {
        response = await kunjunganService.update(id, data);
      } else {
        response = await kunjunganService.create(data);
      }

      if (response.data.success) {
        setSuccess(
          isEdit
            ? "Kunjungan berhasil diupdate!"
            : "Kunjungan berhasil ditambahkan!"
        );
        setTimeout(() => {
          navigate("/kunjungan");
        }, 1500);
      } else {
        setError(response.data.message || "Terjadi kesalahan");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan kunjungan");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitHasil = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await kunjunganService.updateHasil(id, hasilFormData);

      if (response.data.success) {
        setSuccess("Hasil kunjungan berhasil diupdate!");
        setTimeout(() => {
          navigate("/kunjungan");
        }, 1500);
      } else {
        setError(response.data.message || "Terjadi kesalahan");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Gagal menyimpan hasil kunjungan"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate("/kunjungan")}
              className="flex items-center text-red-600 hover:text-red-700 font-medium mb-4"
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
              Kembali
            </button>
            <h1 className="text-3xl font-bold text-gray-800">
              {isEdit && activeTab === "hasil"
                ? "📋 Hasil Kunjungan"
                : isEdit
                ? "✏️ Edit Kunjungan"
                : "📅 Jadwalkan Kunjungan Baru"}
            </h1>
            <p className="text-gray-600 mt-2">
              {isEdit && activeTab === "hasil"
                ? "Catat hasil kunjungan medis Anda"
                : "Isi informasi kunjungan medis ke rumah sakit"}
            </p>
          </div>

          {/* Tabs (only show if editing) */}
          {isEdit && (
            <div className="bg-white rounded-lg shadow-md p-2 mb-6 flex gap-2">
              <button
                onClick={() => setActiveTab("detail")}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === "detail"
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Detail Kunjungan
              </button>
              <button
                onClick={() => setActiveTab("hasil")}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === "hasil"
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Hasil Kunjungan
              </button>
            </div>
          )}

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

          {/* Form */}
          {activeTab === "hasil" ? (
            /* Hasil Kunjungan Form */
            <div className="bg-white rounded-xl shadow-lg p-6">
              <form onSubmit={handleSubmitHasil}>
                <div className="space-y-6">
                  {/* Diagnosa */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Diagnosa <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      name="diagnosa"
                      value={hasilFormData.diagnosa}
                      onChange={handleHasilChange}
                      rows="3"
                      placeholder="Masukkan diagnosa dari dokter"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Tindakan */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tindakan
                    </label>
                    <textarea
                      name="tindakan"
                      value={hasilFormData.tindakan}
                      onChange={handleHasilChange}
                      rows="3"
                      placeholder="Tindakan medis yang dilakukan"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  {/* Resep Obat */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Resep Obat
                    </label>
                    <textarea
                      name="resepObat"
                      value={hasilFormData.resepObat}
                      onChange={handleHasilChange}
                      rows="3"
                      placeholder="Daftar resep obat yang diberikan"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  {/* Catatan Dokter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Catatan Dokter
                    </label>
                    <textarea
                      name="catatanDokter"
                      value={hasilFormData.catatanDokter}
                      onChange={handleHasilChange}
                      rows="4"
                      placeholder="Catatan tambahan dari dokter"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => navigate("/kunjungan")}
                      className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Menyimpan..." : "Simpan Hasil"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            /* Detail Kunjungan Form */
            <div className="bg-white rounded-xl shadow-lg p-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* Judul Kunjungan */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Judul Kunjungan <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="judulKunjungan"
                      value={formData.judulKunjungan}
                      onChange={handleInputChange}
                      placeholder="Contoh: Kontrol TB Bulanan"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Tanggal & Waktu */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tanggal Kunjungan{" "}
                        <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="date"
                        name="tanggalKunjungan"
                        value={formData.tanggalKunjungan}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Waktu Kunjungan <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="time"
                        name="waktuKunjungan"
                        value={formData.waktuKunjungan}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  {/* Jenis Kunjungan */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Jenis Kunjungan <span className="text-red-600">*</span>
                    </label>
                    <select
                      name="jenisKunjungan"
                      value={formData.jenisKunjungan}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="kontrol_rutin">Kontrol Rutin</option>
                      <option value="pemeriksaan_lab">Pemeriksaan Lab</option>
                      <option value="konsultasi">Konsultasi</option>
                      <option value="vaksinasi">Vaksinasi</option>
                      <option value="lainnya">Lainnya</option>
                    </select>
                  </div>

                  {/* Lokasi - Nama Rumah Sakit */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nama Rumah Sakit <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="namaRumahSakit"
                      value={formData.lokasi.namaRumahSakit}
                      onChange={handleLokasiChange}
                      placeholder="Contoh: RS Persahabatan"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Lokasi - Alamat */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Alamat Rumah Sakit
                    </label>
                    <textarea
                      name="alamat"
                      value={formData.lokasi.alamat}
                      onChange={handleLokasiChange}
                      rows="2"
                      placeholder="Alamat lengkap rumah sakit"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  {/* Dokter - Nama */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nama Dokter
                    </label>
                    <input
                      type="text"
                      name="nama"
                      value={formData.dokter.nama}
                      onChange={handleDokterChange}
                      placeholder="Nama dokter (opsional)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  {/* Dokter - Spesialis */}
                  {formData.dokter.nama && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Spesialis Dokter
                      </label>
                      <input
                        type="text"
                        name="spesialis"
                        value={formData.dokter.spesialis}
                        onChange={handleDokterChange}
                        placeholder="Contoh: Spesialis Paru"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                  )}

                  {/* Reminder */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Reminder Sebelum Kunjungan (jam)
                    </label>
                    <select
                      name="reminderBefore"
                      value={formData.reminderBefore}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value={1}>1 jam sebelum</option>
                      <option value={2}>2 jam sebelum</option>
                      <option value={6}>6 jam sebelum</option>
                      <option value={12}>12 jam sebelum</option>
                      <option value={24}>24 jam sebelum (1 hari)</option>
                      <option value={48}>48 jam sebelum (2 hari)</option>
                    </select>
                  </div>

                  {/* Catatan */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Catatan (Opsional)
                    </label>
                    <textarea
                      name="catatan"
                      value={formData.catatan}
                      onChange={handleInputChange}
                      rows="4"
                      placeholder="Catatan tambahan tentang kunjungan ini"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => navigate("/kunjungan")}
                      className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading
                        ? "Menyimpan..."
                        : isEdit
                        ? "Update Kunjungan"
                        : "Simpan Kunjungan"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default KunjunganForm;
