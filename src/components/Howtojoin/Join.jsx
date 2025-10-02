import React from "react";
import HeroImage from "../HeroSection/HeroImage";

const Join = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-transparent to-transparent flex items-center justify-center sm:pt-32 mb-28">
      <div className="max-w-lg mx-auto p-8 bg-white shadow-md rounded-lg">
        <h1 className="text-3xl font-bold text-center text-red-600 mb-6">
          Mengapa Anda Harus Bergabung dengan TabbyCare
        </h1>
        <p className="text-lg text-gray-700 mb-4 text-center">
          TabbyCare adalah aplikasi pendamping digital bagi pasien Tuberkulosis (TBC) 
          yang dirancang untuk membantu mereka lebih disiplin, terarah, dan termotivasi dalam menjalani pengobatan jangka panjang. 
          Melalui fitur pengingat obat, pencatatan progres, jadwal kunjungan, serta edukasi kesehatan, 
          TabbyCare hadir untuk memudahkan pasien menuntaskan terapi dengan dukungan yang menyeluruh.
        </p>
        <ul className="list-disc list-inside text-gray-600 mb-6">
          <li>
            Menjalani terapi lebih disiplin dengan pengingat harian dan check-in obat.
          </li>
          <li>
           Memantau progres pengobatan melalui kalender dan catatan riwayat.
          </li>
          <li>
            Mendapatkan edukasi, tips kesehatan, dan panduan gizi selama pengobatan
          </li>
          <li>
            Terhubung dengan komunitas pasien dan penyintas TBC untuk saling memberi dukungan.
          </li>
        </ul>
        <p className="text-lg text-gray-700 text-center">
          Bersama TabbyCare, kita bisa wujudkan perjalanan pengobatan yang lebih
          disiplin, sehat, dan penuh harapan. Bergabunglah sekarang dan ambil
          peran nyata dalam melawan TBC!
        </p>
      </div>
      <HeroImage></HeroImage>
    </div>
  );
};

export default Join;
