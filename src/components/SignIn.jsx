import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const SignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async () => {
    setError("");

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError("Mohon lengkapi semua field");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Password tidak cocok");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    setLoading(true);

    try {
      // Call register API
      const response = await axios.post(`${API_URL}/auth/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (response.data.success) {
        // Save token and user to localStorage
        localStorage.setItem("token", response.data.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.data.user));

        // Redirect to dashboard
        navigate("/dashboard");
      } else {
        setError(response.data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        err.response?.data?.message ||
          "Registration failed. Email mungkin sudah terdaftar."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-red-400 to-red-600 px-4 sm:px-6 lg:px-8">
        <div className="relative py-3 sm:max-w-md sm:mx-auto mt-28">
          <div className="min-h-96 px-12 py-8 mt-4 text-left bg-white rounded-2xl shadow-lg">
            <div className="flex flex-col justify-center items-center h-full select-none">
              <div className="flex flex-col items-center justify-center gap-4 mb-8">
                <a
                  href="https://amethgalarcio.web.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src="logo arkana (1).png" className="w-36" alt="Logo" />
                </a>
                <p className="m-0 text-2xl font-bold text-gray-800">
                  Daftar Akunmu
                </p>
                <span className="m-0 text-sm max-w-[90%] text-center text-gray-600">
                  Selamat Datang! Masukkan Info Login Akunmu
                </span>
              </div>

              {/* Error Message */}
              {error && (
                <div className="w-full mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Name Field */}
              <div className="w-full flex flex-col gap-4 mb-4">
                <label className="font-semibold text-sm text-gray-600">
                  Nama Lengkap
                </label>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="border rounded-lg px-4 py-3 text-sm w-full outline-none shadow focus:ring-2 focus:ring-red-400 transition duration-200"
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              {/* Email Field */}
              <div className="w-full flex flex-col gap-4">
                <label className="font-semibold text-sm text-gray-600">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="border rounded-lg px-4 py-3 text-sm w-full outline-none shadow focus:ring-2 focus:ring-red-400 transition duration-200"
                  placeholder="Email"
                />
              </div>

              {/* Password Field */}
              <div className="w-full flex flex-col gap-4 mt-4">
                <label className="font-semibold text-sm text-gray-600">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="border rounded-lg px-4 py-3 text-sm w-full outline-none shadow focus:ring-2 focus:ring-red-400 transition duration-200"
                  placeholder="••••••••"
                />
              </div>

              {/* Confirm Password Field */}
              <div className="w-full flex flex-col gap-4 mt-4">
                <label className="font-semibold text-sm text-gray-600">
                  Konfirmasi Password
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="border rounded-lg px-4 py-3 text-sm w-full outline-none shadow focus:ring-2 focus:ring-red-400 transition duration-200"
                  placeholder="••••••••"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleRegister();
                    }
                  }}
                />
              </div>

              {/* Buttons */}
              <div className="mt-6 w-full">
                <button
                  onClick={handleRegister}
                  disabled={loading}
                  className="mb-4 py-2 px-8 bg-red-500 hover:bg-red-700 focus:ring-offset-red-200 text-white w-full transition ease-in duration-200 text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Loading..." : "Registration"}
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="py-2 px-8 bg-red-500 hover:bg-red-700 focus:ring-offset-red-200 text-white w-full transition ease-in duration-200 text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg cursor-pointer select-none"
                >
                  Login
                </button>
              </div>

              {/* Back to Home Link */}
              <div className="mt-4 text-center w-full">
                <button
                  onClick={() => navigate("/")}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  ← Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignIn;
