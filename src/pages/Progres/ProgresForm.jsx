import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const ProgresForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split("T")[0],
    beratBadan: "",
    suhuBadan: "",
    tekananDarah: { sistolik: "", diastolik: "" },
    gejala: [],
    tingkatGejala: "ringan",
    catatanHarian: "",
    mood: "baik",
    kepatuhanObat: 100,
  });

  const [foto, setFoto] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const gejalaOptions = [
    { value: "batuk", label: "Batuk" },
    { value: "demam", label: "Demam" },
    { value: "berkeringat_malam", label: "Berkeringat Malam" },
    { value: "penurunan_berat_badan", label: "Penurunan Berat Badan" },
    { value: "sesak_napas", label: "Sesak Napas" },
    { value: "nyeri_dada", label: "Nyeri Dada" },
    { value: "lainnya", label: "Lainnya" },
  ];

  useEffect(() => {
    if (isEdit) {
      loadProgres();
    }
  }, [id]);

  const loadProgres = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/progres/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const progres = response.data.data.progres;
        setFormData({
          tanggal: progres.tanggal.split("T")[0],
          beratBadan: progres.beratBadan,
          suhuBadan: progres.suhuBadan || "",
          tekananDarah: progres.tekananDarah || { sistolik: "", diastolik: "" },
          gejala: progres.gejala || [],
          tingkatGejala: progres.tingkatGejala,
          catatanHarian: progres.catatanHarian || "",
          mood: progres.mood,
          kepatuhanObat: progres.kepatuhanObat,
        });

        if (progres.fotoProgres) {
          setImagePreview(`http://localhost:5000${progres.fotoProgres}`);
        }
      }
    } catch (err) {
      setError("Gagal memuat data progres");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTekananDarahChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      tekananDarah: { ...prev.tekananDarah, [field]: value },
    }));
  };

  const handleGejalaChange = (value) => {
    const currentGejala = formData.gejala;
    if (currentGejala.includes(value)) {
      setFormData((prev) => ({
        ...prev,
        gejala: currentGejala.filter((g) => g !== value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        gejala: [...currentGejala, value],
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Ukuran gambar maksimal 5MB");
        return;
      }
      setFoto(file);
      setImagePreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Validation
      if (!formData.beratBadan) {
        setError("Berat badan wajib diisi");
        setLoading(false);
        return;
      }

      const data = new FormData();
      data.append("tanggal", formData.tanggal);
      data.append("beratBadan", formData.beratBadan);
      if (formData.suhuBadan) data.append("suhuBadan", formData.suhuBadan);
      data.append("tekananDarah", JSON.stringify(formData.tekananDarah));
      data.append("gejala", JSON.stringify(formData.gejala));
      data.append("tingkatGejala", formData.tingkatGejala);
      data.append("catatanHarian", formData.catatanHarian);
      data.append("mood", formData.mood);
      data.append("kepatuhanObat", formData.kepatuhanObat);

      if (foto) {
        data.append("fotoProgres", foto);
      }

      const token = localStorage.getItem("token");
      let response;

      if (isEdit) {
        response = await axios.put(`${API_URL}/progres/${id}`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        response = await axios.post(`${API_URL}/progres`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      if (response.data.success) {
        setSuccess(
          isEdit ? "Progres berhasil diupdate!" : "Progres berhasil dicatat!"
        );
        setTimeout(() => {
          navigate("/progres");
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan progres");
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
              onClick={() => navigate("/progres")}
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
              {isEdit ? "✏️ Edit Progres" : "📊 Catat Progres Harian"}
            </h1>
            <p className="text-gray-600 mt-2">
              Catat kondisi kesehatan Anda hari ini
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
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tanggal */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tanggal <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  name="tanggal"
                  value={formData.tanggal}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Berat Badan */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Berat Badan (kg) <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="beratBadan"
                  value={formData.beratBadan}
                  onChange={handleInputChange}
                  placeholder="Contoh: 65.5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Suhu Badan */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Suhu Badan (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="suhuBadan"
                  value={formData.suhuBadan}
                  onChange={handleInputChange}
                  placeholder="Contoh: 36.5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              {/* Tekanan Darah */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tekanan Darah (mmHg)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    value={formData.tekananDarah.sistolik}
                    onChange={(e) =>
                      handleTekananDarahChange("sistolik", e.target.value)
                    }
                    placeholder="Sistolik (120)"
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    value={formData.tekananDarah.diastolik}
                    onChange={(e) =>
                      handleTekananDarahChange("diastolik", e.target.value)
                    }
                    placeholder="Diastolik (80)"
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Gejala */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gejala yang Dirasakan
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {gejalaOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.gejala.includes(option.value)}
                        onChange={() => handleGejalaChange(option.value)}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tingkat Gejala */}
              {formData.gejala.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tingkat Gejala
                  </label>
                  <select
                    name="tingkatGejala"
                    value={formData.tingkatGejala}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="ringan">Ringan</option>
                    <option value="sedang">Sedang</option>
                    <option value="berat">Berat</option>
                  </select>
                </div>
              )}

              {/* Mood */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mood Hari Ini
                </label>
                <div className="flex gap-4">
                  {[
                    { value: "sangat_baik", emoji: "😊", label: "Sangat Baik" },
                    { value: "baik", emoji: "🙂", label: "Baik" },
                    { value: "cukup", emoji: "😐", label: "Cukup" },
                    { value: "kurang_baik", emoji: "😕", label: "Kurang Baik" },
                    { value: "buruk", emoji: "😢", label: "Buruk" },
                  ].map((mood) => (
                    <button
                      key={mood.value}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, mood: mood.value }))
                      }
                      className={`flex-1 py-3 px-2 rounded-lg border-2 transition ${
                        formData.mood === mood.value
                          ? "border-red-600 bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="text-2xl mb-1">{mood.emoji}</div>
                      <div className="text-xs">{mood.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Kepatuhan Obat */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kepatuhan Minum Obat: {formData.kepatuhanObat}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  name="kepatuhanObat"
                  value={formData.kepatuhanObat}
                  onChange={handleInputChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Catatan Harian */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Catatan Harian
                </label>
                <textarea
                  name="catatanHarian"
                  value={formData.catatanHarian}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Ceritakan kondisi Anda hari ini..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              {/* Foto Progres */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Foto Progres (Opsional)
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
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate("/progres")}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
                >
                  {loading
                    ? "Menyimpan..."
                    : isEdit
                    ? "Update Progres"
                    : "Simpan Progres"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProgresForm;
