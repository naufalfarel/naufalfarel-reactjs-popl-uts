import React from "react";

const About = () => {
  return (
    <div className="relative bg-gradient-to-b from-red-50 via-white to-white-50 py-16 px-4 sm:px-6 lg:px-8 sm:pt-32">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-5xl font-extrabold text-red-900 mb-8">
          Tentang Misi Kami
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed mb-6">
          Misi kami adalah meningkatkan kesadaran global tentang dampak serius
          Tuberkulosis (TBC) terhadap kesehatan dan kehidupan masyarakat. Setiap
          tahunnya, jutaan orang terdiagnosis TBC dan ribuan jiwa meninggal
          akibat penyakit yang sebenarnya dapat disembuhkan. Kami percaya sudah
          saatnya mengambil langkah nyata untuk mendukung pasien dan memberantas
          TBC.
        </p>
        <p className="text-xl text-gray-600 leading-relaxed mb-12">
          Dengan berbagi pengetahuan, menyediakan pendampingan digital, serta
          membangun dukungan keluarga dan komunitas, TabbyCare hadir untuk
          meningkatkan kepatuhan terapi, mengurangi stigma, dan membantu pasien
          meraih kualitas hidup yang lebih baik.
        </p>
      </div>

      {/* Dokumentasi Gambar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <div className="relative">
          <img
            className="w-full h-64 object-cover rounded-lg shadow-lg"
            src="/minumobat.png"
            alt="Kepatuhan minum obat TBC"
          />
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded">
            Kepatuhan minum obat TBC
          </div>
        </div>

        <div className="relative">
          <img
            className="w-full h-64 object-cover rounded-lg shadow-lg"
            src="/obat.jpeg"
            alt="upload foto obat TBC"
          />
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded">
            upload foto obat TBC
          </div>
        </div>

        <div className="relative">
          <img
            className="w-full h-64 object-cover rounded-lg shadow-lg"
            src="/dukungankomunitas.jpeg"
            alt="Dukungan komunitas TBC"
          />
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded">
            Dukungan komunitas TBC
          </div>
        </div>

        <div className="relative">
          <img
            className="w-full h-64 object-cover rounded-lg shadow-lg"
            src="/stopstigmatbc.png"
            alt="Mengurangi stigma TBC"
          />
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded">
            Mengurangi stigma TBC
          </div>
        </div>

        <div className="relative">
          <img
            className="w-full h-64 object-cover rounded-lg shadow-lg"
            src="/konsultasidigital.jpeg"
            alt="Konsultasi kesehatan digital"
          />
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded">
            Konsultasi kesehatan digital
          </div>
        </div>

        <div className="relative">
          <img
            className="w-full h-64 object-cover rounded-lg shadow-lg"
            src="/harapansembuh.jpeg"
            alt="Harapan menuju kesembuhan"
          />
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded">
            Harapan menuju kesembuhan
          </div>
        </div>
      </div>

      <div className="text-center mt-16">
        <p className="text-xl font-semibold text-gray-700">
          Bersama TabbyCare, kita bisa wujudkan dunia bebas TBC.
        </p>
      </div>
    </div>
  );
};

export default About;
