import React from "react";
import HeroImage from "../HeroSection/HeroImage";

const JoinImpactPlastic = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-transparent to-transparent flex items-center justify-center sm:pt-32 mb-28">
      <div className="max-w-lg mx-auto p-8 bg-white shadow-md rounded-lg">
        <h1 className="text-3xl font-bold text-center text-red-600 mb-6">
          Mengapa Anda Harus Bergabung dengan TabbyCare
        </h1>
        <p className="text-lg text-gray-700 mb-4 text-center">
          TabbyCare adalah komunitas yang berkomitmen untuk mendampingi pasien
          Tuberkulosis (TBC) dalam menjalani pengobatan jangka panjang. Dengan
          bergabung, Anda menjadi bagian dari upaya bersama untuk meningkatkan
          kepatuhan pengobatan, mengurangi stigma, dan menciptakan dukungan
          sosial yang positif.
        </p>
        <ul className="list-disc list-inside text-gray-600 mb-6">
          <li>
            Terhubung dengan pasien dan penyintas TBC yang saling memberikan
            dukungan
          </li>
          <li>
            Ikut serta dalam program edukasi dan kegiatan yang mendorong
            kepatuhan terapi
          </li>
          <li>
            Akses ke informasi, tips kesehatan, dan panduan gizi selama
            pengobatan
          </li>
          <li>
            Menjadi bagian dari perubahan positif untuk mengurangi beban TBC di
            masyarakat
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

export default JoinImpactPlastic;
