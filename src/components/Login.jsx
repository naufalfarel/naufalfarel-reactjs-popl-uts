import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const checkDatabaseStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/health`);
      return response.data.database?.connected || false;
    } catch (err) {
      console.error("Health check error:", err);
      return false;
    }
  };

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      // Check database status first
      const isDbConnected = await checkDatabaseStatus();
      if (!isDbConnected) {
        setError("Database tidak terhubung. Silakan coba lagi dalam beberapa saat atau hubungi administrator.");
        setLoading(false);
        return;
      }

      // Call login API
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: formData.email,
        password: formData.password,
      }, {
        timeout: 10000, // 10 seconds timeout
      });

      if (response.data.success) {
        // Save token and user to localStorage
        localStorage.setItem("token", response.data.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.data.user));

        // Redirect to dashboard
        navigate("/dashboard");
      } else {
        setError(response.data.message || "Login gagal. Silakan coba lagi.");
      }
    } catch (err) {
      console.error("Login error:", err);
      
      // Handle different error types
      if (!err.response) {
        // No response from server
        if (err.code === "ECONNREFUSED" || err.code === "ERR_NETWORK") {
          setError("Tidak dapat terhubung ke server. Pastikan server backend sedang berjalan.");
        } else if (err.code === "ECONNABORTED" || err.message.includes("timeout")) {
          setError("Request timeout. Server terlalu lama merespons. Silakan coba lagi.");
        } else {
          setError("Terjadi kesalahan koneksi. Silakan coba lagi.");
        }
      } else {
        // Server responded with error
        const status = err.response.status;
        const message = err.response.data?.message || "";
        
        if (status === 503) {
          setError("Database tidak terhubung. Silakan tunggu beberapa saat dan coba lagi.");
        } else if (status === 400) {
          setError(message || "Input tidak valid. Periksa email dan password Anda.");
        } else if (status === 401) {
          setError(message || "Email atau password salah. Silakan periksa kembali.");
        } else if (status === 500) {
          setError("Terjadi kesalahan pada server. Silakan coba lagi nanti.");
        } else {
          setError(message || "Login gagal. Silakan coba lagi.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-red-400 to-red-600 px-4 sm:px-6 lg:px-8">
        <div className="relative py-3 sm:max-w-md sm:mx-auto mt-32">
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
                  Login to Your Account
                </p>
                <span className="m-0 text-sm max-w-[90%] text-center text-gray-600">
                  Get started with our experience and enjoy
                </span>
              </div>

              {/* Error Message */}
              {error && (
                <div className="w-full mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="w-full flex flex-col gap-4">
                <label className="font-semibold text-sm text-gray-600">
                  Email / Username
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="border rounded-lg px-4 py-3 text-sm w-full outline-none shadow focus:ring-2 focus:ring-red-400 transition duration-200"
                  placeholder="Enter your email"
                />
              </div>
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
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleLogin();
                    }
                  }}
                />
              </div>
              <div className="mt-6 w-full">
                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="mb-4 py-2 px-8 bg-red-500 hover:bg-red-700 focus:ring-offset-red-200 text-white w-full transition ease-in duration-200 text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Loading..." : "Login"}
                </button>
                <button
                  onClick={() => navigate("/signin")}
                  className="py-2 px-8 bg-red-500 hover:bg-red-700 focus:ring-offset-red-200 text-white w-full transition ease-in duration-200 text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg cursor-pointer select-none"
                >
                  Sign In
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

export default Login;
