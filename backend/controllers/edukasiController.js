const Edukasi = require("../models/Edukasi");

// Get All Educational Content
exports.getAllEdukasi = async (req, res) => {
  try {
    const { kategori, search, limit = 20 } = req.query;

    const filter = { isActive: true };

    if (kategori) {
      filter.kategori = kategori;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const edukasiList = await Edukasi.find(filter)
      .sort({ publishedAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: edukasiList.length,
      data: { edukasiList },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get educational content",
      error: error.message,
    });
  }
};

// Get Educational Content by ID
exports.getEdukasiById = async (req, res) => {
  try {
    const edukasi = await Edukasi.findById(req.params.id);

    if (!edukasi || !edukasi.isActive) {
      return res.status(404).json({
        success: false,
        message: "Educational content not found",
      });
    }

    // Increment view count
    edukasi.viewCount += 1;
    await edukasi.save();

    res.status(200).json({
      success: true,
      data: { edukasi },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get educational content",
      error: error.message,
    });
  }
};

// Get Educational Content by Category
exports.getEdukasiByKategori = async (req, res) => {
  try {
    const edukasiList = await Edukasi.find({
      kategori: req.params.kategori,
      isActive: true,
    }).sort({ publishedAt: -1 });

    res.status(200).json({
      success: true,
      count: edukasiList.length,
      data: { edukasiList },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get educational content",
      error: error.message,
    });
  }
};

// Get Popular Content
exports.getPopularEdukasi = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const edukasiList = await Edukasi.find({ isActive: true })
      .sort({ viewCount: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: edukasiList.length,
      data: { edukasiList },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get popular content",
      error: error.message,
    });
  }
};

// Seed initial educational content (for admin)
exports.seedEdukasi = async (req, res) => {
  try {
    const initialContent = [
      {
        judul: "Apa itu Tuberkulosis (TBC)?",
        kategori: "tentang_tbc",
        ringkasan:
          "Tuberkulosis adalah penyakit menular yang disebabkan oleh bakteri Mycobacterium tuberculosis.",
        konten: `Tuberkulosis (TBC) adalah penyakit menular yang disebabkan oleh bakteri Mycobacterium tuberculosis. Penyakit ini biasanya menyerang paru-paru, tetapi juga dapat menyerang organ tubuh lainnya.

TBC menyebar melalui udara ketika seseorang yang terinfeksi batuk, bersin, atau berbicara. Gejala umum TBC meliputi:
- Batuk yang berlangsung lebih dari 3 minggu
- Batuk berdarah
- Demam dan berkeringat di malam hari
- Penurunan berat badan
- Kehilangan nafsu makan
- Kelelahan

TBC dapat disembuhkan dengan pengobatan yang tepat dan teratur selama 6-9 bulan. Penting untuk menjalani pengobatan lengkap untuk mencegah resistensi obat.`,
        tags: ["tbc", "pengenalan", "gejala"],
      },
      {
        judul: "Pentingnya Kepatuhan Minum Obat TBC",
        kategori: "pengobatan",
        ringkasan:
          "Kepatuhan minum obat TBC adalah kunci kesembuhan dan mencegah resistensi obat.",
        konten: `Pengobatan TBC memerlukan komitmen jangka panjang, biasanya 6-9 bulan. Kepatuhan minum obat sangat penting karena:

1. **Mencegah Resistensi Obat**: Berhenti atau melewatkan dosis dapat membuat bakteri menjadi resisten terhadap obat.

2. **Menjamin Kesembuhan**: Pengobatan yang tidak lengkap dapat membuat TBC kambuh kembali.

3. **Melindungi Orang Lain**: Pengobatan yang tepat mengurangi risiko penularan.

**Tips Menjaga Kepatuhan:**
- Gunakan alarm atau aplikasi reminder
- Minum obat di waktu yang sama setiap hari
- Libatkan keluarga untuk mengingatkan
- Catat setiap dosis yang diminum
- Konsultasi segera jika ada efek samping`,
        tags: ["pengobatan", "kepatuhan", "tips"],
      },
      {
        judul: "Nutrisi yang Tepat untuk Pasien TBC",
        kategori: "nutrisi",
        ringkasan:
          "Nutrisi yang baik membantu mempercepat penyembuhan TBC dan meningkatkan daya tahan tubuh.",
        konten: `Nutrisi yang baik sangat penting dalam proses penyembuhan TBC. Berikut panduan nutrisi yang direkomendasikan:

**Makanan yang Dianjurkan:**
- Protein tinggi: Telur, ikan, ayam, tahu, tempe
- Karbohidrat kompleks: Nasi merah, roti gandum, oatmeal
- Buah dan sayuran segar: Sumber vitamin dan mineral
- Lemak sehat: Alpukat, kacang-kacangan, minyak zaitun

**Nutrisi Penting:**
- Vitamin D: Membantu sistem imun
- Vitamin C: Antioksidan
- Zinc: Mempercepat penyembuhan
- Vitamin B kompleks: Mendukung metabolisme

**Hindari:**
- Alkohol
- Makanan tinggi gula dan lemak jenuh
- Merokok

**Tips Praktis:**
- Makan 5-6 kali sehari dalam porsi kecil
- Minum air putih 8-10 gelas per hari
- Suplemen jika direkomendasikan dokter`,
        tags: ["nutrisi", "makanan", "vitamin"],
      },
      {
        judul: "Aktivitas Fisik untuk Pasien TBC",
        kategori: "gaya_hidup",
        ringkasan:
          "Olahraga ringan dapat membantu pemulihan TBC, tetapi harus disesuaikan dengan kondisi tubuh.",
        konten: `Aktivitas fisik yang tepat dapat membantu proses penyembuhan TBC dan meningkatkan kualitas hidup.

**Manfaat Olahraga untuk Pasien TBC:**
- Meningkatkan kapasitas paru-paru
- Memperkuat sistem imun
- Mengurangi stres dan depresi
- Meningkatkan nafsu makan
- Menjaga berat badan ideal

**Jenis Olahraga yang Direkomendasikan:**
1. Jalan kaki (15-30 menit)
2. Yoga ringan
3. Stretching
4. Bersepeda santai
5. Berenang (setelah tidak menular)

**Panduan Berolahraga:**
- Mulai dengan intensitas rendah
- Tingkatkan secara bertahap
- Dengarkan tubuh Anda
- Istirahat jika lelah
- Hindari olahraga berat saat fase akut

**Kapan Harus Berhenti:**
- Sesak napas berlebihan
- Pusing atau mual
- Nyeri dada
- Demam

Konsultasikan dengan dokter sebelum memulai program olahraga.`,
        tags: ["olahraga", "aktivitas", "pemulihan"],
      },
      {
        judul: "Cara Mencegah Penularan TBC",
        kategori: "pencegahan",
        ringkasan:
          "Langkah-langkah penting untuk mencegah penularan TBC ke orang lain.",
        konten: `Mencegah penularan TBC sangat penting untuk melindungi keluarga dan orang-orang di sekitar Anda.

**Langkah Pencegahan:**

1. **Etika Batuk:**
   - Tutup mulut saat batuk/bersin
   - Gunakan tisu atau siku bagian dalam
   - Buang tisu bekas ke tempat sampah tertutup

2. **Gunakan Masker:**
   - Pakai masker saat berada di ruang tertutup
   - Ganti masker secara teratur
   - Gunakan hingga dokter menyatakan tidak menular lagi

3. **Ventilasi Udara:**
   - Buka jendela untuk sirkulasi udara
   - Hindari ruangan tertutup dan sesak
   - Jemur kasur dan bantal secara rutin

4. **Kebersihan Diri:**
   - Cuci tangan dengan sabun
   - Jangan berbagi alat makan/minum
   - Pisahkan pakaian untuk dicuci

5. **Isolasi Sementara:**
   - Hindari tempat ramai di 2 minggu pertama
   - Tidur di kamar terpisah jika memungkinkan
   - Batasi kontak dengan anak-anak

**Untuk Keluarga:**
- Periksa kesehatan secara berkala
- Vaksinasi BCG untuk bayi
- Jaga daya tahan tubuh
- Konsultasi jika ada gejala`,
        tags: ["pencegahan", "penularan", "keluarga"],
      },
    ];

    // Check if content already exists
    const existingCount = await Edukasi.countDocuments();
    if (existingCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Educational content already exists",
      });
    }

    await Edukasi.insertMany(initialContent);

    res.status(201).json({
      success: true,
      message: "Educational content seeded successfully",
      count: initialContent.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to seed educational content",
      error: error.message,
    });
  }
};
