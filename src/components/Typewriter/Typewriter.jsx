import React, { useState, useEffect } from "react";

const Typewriter = () => {
  const words = ["Hai !", "Selamat Datang di TabbyCare"]; // Daftar kata yang akan ditampilkan
  const [currentWord, setCurrentWord] = useState(""); // Kata yang sedang ditampilkan
  const [isDeleting, setIsDeleting] = useState(false); // Status menghapus atau menambah
  const [loopNum, setLoopNum] = useState(0); // Index kata saat ini
  const [charIndex, setCharIndex] = useState(0); // Index karakter saat ini
  const [typingSpeed, setTypingSpeed] = useState(150); // Kecepatan mengetik

  useEffect(() => {
    const handleType = () => {
      const fullText = words[loopNum % words.length]; // Mengambil kata sesuai index
      if (isDeleting) {
        setCurrentWord(fullText.substring(0, charIndex - 1)); // Menghapus karakter
        setCharIndex((prev) => prev - 1); // Kurangi index karakter
        setTypingSpeed(50); // Kecepatan penghapusan lebih cepat
      } else {
        setCurrentWord(fullText.substring(0, charIndex + 1)); // Menambahkan karakter
        setCharIndex((prev) => prev + 1); // Tambah index karakter
        setTypingSpeed(150); // Kecepatan mengetik lebih lambat
      }

      if (!isDeleting && charIndex === fullText.length) {
        setTimeout(() => setIsDeleting(true), 500); // Jeda sebelum mulai menghapus
      } else if (isDeleting && charIndex === 0) {
        setIsDeleting(false); // Reset ke penambahan karakter
        setLoopNum(loopNum + 1); // Pindah ke kata berikutnya
      }
    };

    const typingTimer = setTimeout(handleType, typingSpeed); // Pengatur waktu mengetik

    return () => clearTimeout(typingTimer); // Membersihkan timer
  }, [charIndex, isDeleting, typingSpeed, loopNum, words]);

  return (
    <div className="w-full h-full flex justify-center items-center">
      <h1 className="text-lg font-bold text-red-600">{currentWord}</h1>
    </div>
  );
};

export default Typewriter;