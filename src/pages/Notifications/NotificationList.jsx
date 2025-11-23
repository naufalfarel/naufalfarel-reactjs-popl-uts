import React from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { useNavigate } from "react-router-dom";

const NotificationList = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            🔔 Notifikasi
          </h1>
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">
              Halaman Notifikasi (Coming Soon)
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
            >
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NotificationList;
