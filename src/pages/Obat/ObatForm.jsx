import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { obatService } from "../../services/api";

const ObatForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    namaObat: "",
    dosis: "",
    frekuensi: "1x sehari",
    waktuKonsumsi: ["08:00"],
    tanggalMulai: "",
    tanggalSelesai: "",
    catatan: "",
  });

  const [gambar, setGambar] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isEdit) {
      loadObat();
    }
  }, [id]);

  const loadObat = async () => {
    try {
      const response = await obatService.getById(id);
      if (response.data.success) {
        const obat = response.data.data.obat;
        setFormData({
          namaObat: obat.namaObat,
          dosis: obat.dosis,
          frekuensi: obat.frekuensi,
          waktuKonsumsi: obat.waktuKonsumsi,
          tanggalMulai: obat.tanggalMulai.split("T")[0],
          tanggalSelesai: obat.tanggalSelesai.split("T")[0],
          catatan: obat.catatan || "",
        });
        if (obat.gambarObat) {
          setImagePreview(`http://localhost:5000${obat.gambarObat}`);
        }
      }
    } catch (err) {
      setError("Gagal memuat data obat");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Ukuran gambar maksimal 5MB");
        return;
      }
      setGambar(file);
      setImagePreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleAddWaktu = () => {
    setFormData((prev) => ({
      ...prev,
      waktuKonsumsi: [...prev.waktuKonsumsi, "12:00"],
    }));
  };

  const handleRemoveWaktu = (index) => {
    setFormData((prev) => ({
      ...prev,
      waktuKonsumsi: prev.waktuKonsumsi.filter((_, i) => i !== index),
    }));
  };

  const handleWaktuChange = (index, value) => {
    const newWaktu = [...formData.waktuKonsumsi];
    newWaktu[index] = value;
    setFormData((prev) => ({ ...prev, waktuKonsumsi: newWaktu }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Validation
      if (
        !formData.namaObat ||
        !formData.dosis ||
        !formData.tanggalMulai ||
        !formData.tanggalSelesai
      ) {
        setError("Mohon lengkapi semua field yang wajib");
        setLoading(false);
        return;
      }

      const data = new FormData();
      data.append("namaObat", formData.namaObat);
      data.append("dosis", formData.dosis);
      data.append("frekuensi", formData.frekuensi);
      data.append("waktuKonsumsi", JSON.stringify(formData.waktuKonsumsi));
      data.append("tanggalMulai", formData.tanggalMulai);
      data.append("tanggalSelesai", formData.tanggalSelesai);
      data.append("catatan", formData.catatan);

      if (gambar) {
        data.append("gambarObat", gambar);
      }

      let response;
      if (isEdit) {
        response = await obatService.update(id, data);
      } else {
        response = await obatService.create(data);
      }

      if (response.data.success) {
        setSuccess(
          isEdit ? "Obat berhasil diupdate!" : "Obat berhasil ditambahkan!"
        );
        setTimeout(() => {
          navigate("/obat");
        }, 1500);
      } else {
        setError(response.data.message || "Terjadi kesalahan");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan obat");
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
              onClick={() => navigate("/obat")}
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
              {isEdit ? "✏️ Edit Obat" : "💊 Tambah Obat Baru"}
            </h1>
            <p className="text-gray-600 mt-2">
              Isi informasi obat dan atur jadwal reminder
            </p>
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

          {/* Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="space-y-6">
              {/* Nama Obat */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nama Obat <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="namaObat"
                  value={formData.namaObat}
                  onChange={handleInputChange}
                  placeholder="Contoh: Rifampicin"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Dosis */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dosis <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="dosis"
                  value={formData.dosis}
                  onChange={handleInputChange}
                  placeholder="Contoh: 450mg atau 2 tablet"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Frekuensi */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Frekuensi <span className="text-red-600">*</span>
                </label>
                <select
                  name="frekuensi"
                  value={formData.frekuensi}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="1x sehari">1x sehari</option>
                  <option value="2x sehari">2x sehari</option>
                  <option value="3x sehari">3x sehari</option>
                  <option value="sesuai kebutuhan">Sesuai kebutuhan</option>
                </select>
              </div>

              {/* Waktu Konsumsi */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Waktu Konsumsi <span className="text-red-600">*</span>
                </label>
                {formData.waktuKonsumsi.map((waktu, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <input
                      type="time"
                      value={waktu}
                      onChange={(e) => handleWaktuChange(index, e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                    {formData.waktuKonsumsi.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveWaktu(index)}
                        className="px-4 py-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddWaktu}
                  className="text-red-600 font-medium hover:text-red-700"
                >
                  + Tambah Waktu
                </button>
              </div>

              {/* Tanggal Mulai & Selesai */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tanggal Mulai <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    name="tanggalMulai"
                    value={formData.tanggalMulai}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tanggal Selesai <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    name="tanggalSelesai"
                    value={formData.tanggalSelesai}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Gambar Obat */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Foto Obat (Opsional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                {imagePreview && (
                  <div className="mt-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-48 h-48 object-cover rounded-lg border-2 border-gray-200"
                    />
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Format: JPG, PNG, GIF, WebP. Maksimal 5MB
                </p>
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
                  placeholder="Contoh: Diminum sebelum makan, hindari susu"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate("/obat")}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Menyimpan..."
                    : isEdit
                    ? "Update Obat"
                    : "Simpan Obat"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ObatForm;
