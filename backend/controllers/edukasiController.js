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
    console.error("Error getting edukasi:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mendapatkan konten edukasi",
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
        message: "Konten edukasi tidak ditemukan",
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
    console.error("Error getting edukasi by id:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mendapatkan konten edukasi",
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
    console.error("Error getting edukasi by kategori:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mendapatkan konten edukasi",
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
    console.error("Error getting popular edukasi:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mendapatkan konten populer",
      error: error.message,
    });
  }
};

// Helper function to get initial content
const getInitialContent = () => {
  return [
    {
      judul: "Apa itu Tuberkulosis (TBC)?",
      kategori: "tentang_tbc",
      ringkasan:
        "Tuberkulosis adalah penyakit menular yang disebabkan oleh bakteri Mycobacterium tuberculosis. Pelajari lebih lanjut tentang penyakit ini.",
      konten: `# Apa itu Tuberkulosis (TBC)?

Tuberkulosis (TBC) adalah penyakit menular yang disebabkan oleh bakteri **Mycobacterium tuberculosis**. Penyakit ini biasanya menyerang paru-paru, tetapi juga dapat menyerang organ tubuh lainnya seperti tulang, kelenjar getah bening, dan otak.

## Bagaimana TBC Menyebar?

TBC menyebar melalui udara ketika seseorang yang terinfeksi:
- Batuk
- Bersin
- Berbicara
- Bernyanyi

Bakteri TBC dapat bertahan di udara selama beberapa jam, terutama di ruangan tertutup dengan ventilasi buruk.

## Gejala Umum TBC

Gejala TBC paru meliputi:
- **Batuk persisten** yang berlangsung lebih dari 3 minggu
- **Batuk berdarah** (hemoptisis)
- **Demam** dan berkeringat di malam hari
- **Penurunan berat badan** yang tidak dapat dijelaskan
- **Kehilangan nafsu makan**
- **Kelelahan** dan kelemahan
- **Nyeri dada** saat bernapas atau batuk

## Faktor Risiko

Orang dengan risiko tinggi terkena TBC:
- Kontak erat dengan penderita TBC aktif
- Sistem imun lemah (HIV, diabetes, kanker)
- Malnutrisi
- Perokok aktif
- Tinggal di lingkungan padat dan tidak sehat
- Pengguna narkoba

## Pengobatan TBC

TBC dapat disembuhkan dengan pengobatan yang tepat dan teratur selama **6-9 bulan**. Penting untuk:
- Minum obat sesuai resep dokter
- Menyelesaikan pengobatan lengkap
- Tidak melewatkan dosis
- Kontrol rutin ke fasilitas kesehatan

## Pencegahan

- Vaksinasi BCG untuk bayi
- Menjaga daya tahan tubuh
- Pola hidup sehat
- Ventilasi udara yang baik
- Etika batuk yang benar`,
      tags: ["tbc", "pengenalan", "gejala", "pencegahan"],
      sumberReferensi: "WHO, Kementerian Kesehatan RI",
    },
    {
      judul: "Pentingnya Kepatuhan Minum Obat TBC",
      kategori: "pengobatan",
      ringkasan:
        "Kepatuhan minum obat TBC adalah kunci kesembuhan dan mencegah resistensi obat. Pelajari strategi untuk tetap konsisten.",
      konten: `# Pentingnya Kepatuhan Minum Obat TBC

Pengobatan TBC memerlukan komitmen jangka panjang, biasanya **6-9 bulan**. Kepatuhan minum obat sangat penting untuk kesembuhan total.

## Mengapa Kepatuhan Penting?

### 1. Mencegah Resistensi Obat
Berhenti atau melewatkan dosis dapat membuat bakteri menjadi **resisten terhadap obat**. Ini berarti:
- Obat tidak lagi efektif
- Perlu pengobatan yang lebih lama dan mahal
- Risiko komplikasi meningkat

### 2. Menjamin Kesembuhan Total
Pengobatan yang tidak lengkap dapat menyebabkan:
- TBC kambuh kembali
- Bakteri menjadi lebih kuat
- Perlu pengobatan ulang yang lebih sulit

### 3. Melindungi Orang Lain
Pengobatan yang tepat dan teratur:
- Mengurangi risiko penularan
- Membuat pasien tidak menular setelah 2-3 minggu pengobatan
- Melindungi keluarga dan masyarakat

## Strategi Menjaga Kepatuhan

### 📱 Gunakan Teknologi
- **Alarm atau aplikasi reminder** (seperti TabbyCare)
- Notifikasi di ponsel
- Kalender pengobatan digital

### ⏰ Rutinitas Harian
- Minum obat di **waktu yang sama setiap hari**
- Kaitkan dengan aktivitas rutin (setelah sarapan, sebelum tidur)
- Siapkan obat di tempat yang mudah terlihat

### 👨‍👩‍👧‍👦 Dukungan Keluarga
- Libatkan keluarga untuk mengingatkan
- Buat sistem "buddy" dengan anggota keluarga
- Komunikasikan pentingnya pengobatan

### 📝 Pencatatan
- Catat setiap dosis yang diminum
- Gunakan kalender atau aplikasi tracking
- Review mingguan bersama keluarga

### 🏥 Dukungan Medis
- Konsultasi segera jika ada efek samping
- Jangan berhenti minum obat tanpa konsultasi dokter
- Ikuti jadwal kontrol rutin

## Mengatasi Hambatan

**Jika lupa minum obat:**
- Minum segera setelah ingat
- Jika sudah mendekati waktu dosis berikutnya, lewati dosis yang terlupa
- Jangan menggandakan dosis
- Hubungi dokter jika sering lupa

**Jika ada efek samping:**
- Jangan berhenti minum obat sendiri
- Segera hubungi dokter atau fasilitas kesehatan
- Catat efek samping yang dialami`,
      tags: ["pengobatan", "kepatuhan", "tips", "strategi"],
      sumberReferensi: "WHO Guidelines for TB Treatment",
    },
    {
      judul: "Nutrisi yang Tepat untuk Pasien TBC",
      kategori: "nutrisi",
      ringkasan:
        "Nutrisi yang baik membantu mempercepat penyembuhan TBC dan meningkatkan daya tahan tubuh. Panduan lengkap nutrisi untuk pasien TBC.",
      konten: `# Nutrisi yang Tepat untuk Pasien TBC

Nutrisi yang baik sangat penting dalam proses penyembuhan TBC. Tubuh membutuhkan nutrisi ekstra untuk melawan infeksi dan memperbaiki jaringan yang rusak.

## Makanan yang Dianjurkan

### 🥚 Protein Tinggi
Protein penting untuk memperbaiki jaringan dan membangun sistem imun:
- **Telur** - sumber protein lengkap
- **Ikan** - salmon, tuna, sarden (omega-3)
- **Ayam** - daging tanpa lemak
- **Tahu dan Tempe** - protein nabati
- **Kacang-kacangan** - almond, kacang tanah

### 🌾 Karbohidrat Kompleks
Memberikan energi berkelanjutan:
- **Nasi merah** - lebih banyak serat
- **Roti gandum** - karbohidrat kompleks
- **Oatmeal** - sarapan sehat
- **Ubi jalar** - kaya beta karoten

### 🥗 Buah dan Sayuran
Sumber vitamin dan mineral:
- **Sayuran hijau** - bayam, kangkung, brokoli
- **Buah jeruk** - vitamin C tinggi
- **Wortel** - vitamin A
- **Tomat** - antioksidan

### 🥑 Lemak Sehat
Mendukung penyerapan vitamin:
- **Alpukat** - lemak tak jenuh tunggal
- **Kacang-kacangan** - omega-3
- **Minyak zaitun** - untuk memasak
- **Ikan berlemak** - omega-3

## Nutrisi Penting untuk TBC

### ☀️ Vitamin D
- **Fungsi**: Meningkatkan sistem imun, membantu penyerapan kalsium
- **Sumber**: Sinar matahari pagi, ikan berlemak, telur, susu
- **Dosis**: Konsultasi dengan dokter

### 🍊 Vitamin C
- **Fungsi**: Antioksidan, memperkuat sistem imun
- **Sumber**: Jeruk, kiwi, stroberi, paprika, brokoli
- **Tips**: Konsumsi buah segar setiap hari

### ⚡ Zinc
- **Fungsi**: Mempercepat penyembuhan, fungsi imun
- **Sumber**: Daging, kacang-kacangan, biji-bijian
- **Penting**: Zinc membantu tubuh melawan infeksi

### 💊 Vitamin B Kompleks
- **Fungsi**: Mendukung metabolisme, produksi energi
- **Sumber**: Biji-bijian, daging, telur, sayuran hijau

## Makanan yang Harus Dihindari

❌ **Alkohol** - Mengganggu fungsi hati dan efektivitas obat
❌ **Makanan tinggi gula** - Menurunkan sistem imun
❌ **Lemak jenuh** - Meningkatkan peradangan
❌ **Makanan olahan** - Kurang nutrisi
❌ **Merokok** - Merusak paru-paru

## Tips Praktis Nutrisi

### 🍽️ Pola Makan
- **Makan 5-6 kali sehari** dalam porsi kecil
- Jangan melewatkan sarapan
- Makan malam 2-3 jam sebelum tidur

### 💧 Hidrasi
- **Minum air putih 8-10 gelas per hari**
- Hindari minuman berkafein berlebihan
- Konsumsi sup atau kaldu untuk nutrisi tambahan

### 💊 Suplemen
- Konsultasi dengan dokter sebelum mengonsumsi suplemen
- Suplemen dapat membantu jika asupan makanan kurang
- Jangan menggantikan makanan dengan suplemen

### 📋 Contoh Menu Sehari

**Sarapan:**
- Oatmeal dengan buah dan kacang
- Telur rebus
- Jus jeruk

**Snack Pagi:**
- Buah segar
- Kacang almond

**Makan Siang:**
- Nasi merah
- Ikan bakar
- Sayuran tumis
- Sup sayuran

**Snack Sore:**
- Yoghurt dengan buah
- Roti gandum dengan selai kacang

**Makan Malam:**
- Nasi merah
- Ayam tanpa kulit
- Salad sayuran
- Sup kaldu

## Catatan Penting

- Konsultasi dengan ahli gizi jika memungkinkan
- Sesuaikan porsi dengan kondisi tubuh
- Pantau berat badan secara rutin
- Jangan diet ketat saat pengobatan TBC`,
      tags: ["nutrisi", "makanan", "vitamin", "diet", "kesehatan"],
      sumberReferensi: "WHO Nutrition Guidelines for TB Patients",
    },
    {
      judul: "Aktivitas Fisik untuk Pasien TBC",
      kategori: "gaya_hidup",
      ringkasan:
        "Olahraga ringan dapat membantu pemulihan TBC dan meningkatkan kualitas hidup. Panduan lengkap aktivitas fisik untuk pasien TBC.",
      konten: `# Aktivitas Fisik untuk Pasien TBC

Aktivitas fisik yang tepat dapat membantu proses penyembuhan TBC dan meningkatkan kualitas hidup secara keseluruhan.

## Manfaat Olahraga untuk Pasien TBC

### 🫁 Meningkatkan Kapasitas Paru-paru
- Memperkuat otot pernapasan
- Meningkatkan efisiensi pertukaran oksigen
- Mengurangi sesak napas

### 💪 Memperkuat Sistem Imun
- Meningkatkan sirkulasi darah
- Memperbaiki fungsi sel imun
- Membantu tubuh melawan infeksi

### 😊 Kesehatan Mental
- Mengurangi stres dan depresi
- Meningkatkan mood
- Meningkatkan kualitas tidur

### 🍽️ Manfaat Lainnya
- Meningkatkan nafsu makan
- Menjaga berat badan ideal
- Meningkatkan energi
- Memperbaiki kualitas hidup

## Jenis Olahraga yang Direkomendasikan

### 🚶 Jalan Kaki
- **Durasi**: 15-30 menit
- **Frekuensi**: 3-5 kali per minggu
- **Intensitas**: Ringan hingga sedang
- **Tips**: Mulai dengan 10 menit, tingkatkan bertahap

### 🧘 Yoga Ringan
- **Manfaat**: Fleksibilitas, relaksasi, pernapasan
- **Durasi**: 20-30 menit
- **Penting**: Hindari pose yang terlalu menantang

### 🤸 Stretching
- **Manfaat**: Meningkatkan fleksibilitas
- **Waktu**: Pagi atau sore hari
- **Durasi**: 10-15 menit

### 🚴 Bersepeda Santai
- **Durasi**: 20-30 menit
- **Intensitas**: Ringan
- **Tips**: Pilih rute datar, hindari tanjakan

### 🏊 Berenang
- **Catatan**: Hanya setelah tidak menular (2-3 minggu pengobatan)
- **Manfaat**: Latihan kardio ringan
- **Durasi**: 20-30 menit

## Panduan Berolahraga

### 📈 Prinsip Bertahap
1. **Mulai dengan intensitas rendah**
2. **Tingkatkan secara bertahap** (10% per minggu)
3. **Dengarkan tubuh Anda**
4. **Istirahat jika lelah**
5. **Hindari olahraga berat saat fase akut**

### ⏰ Waktu Terbaik
- **Pagi hari** (setelah sarapan, 1-2 jam kemudian)
- **Sore hari** (sebelum makan malam)
- **Hindari olahraga** saat cuaca ekstrem

### 💧 Hidrasi
- Minum air sebelum, selama, dan setelah olahraga
- Jangan menunggu sampai haus
- Hindari dehidrasi

## Kapan Harus Berhenti

**Segera hentikan olahraga jika mengalami:**
- ⚠️ Sesak napas berlebihan
- ⚠️ Pusing atau mual
- ⚠️ Nyeri dada
- ⚠️ Demam
- ⚠️ Kelelahan ekstrem
- ⚠️ Detak jantung tidak teratur

## Program Olahraga Bertahap

### Minggu 1-2 (Fase Awal)
- Jalan kaki 10 menit, 3x per minggu
- Stretching ringan 10 menit
- Fokus pada pernapasan dalam

### Minggu 3-4
- Jalan kaki 15 menit, 4x per minggu
- Tambahkan yoga ringan 2x per minggu
- Latihan pernapasan

### Minggu 5-8
- Jalan kaki 20-30 menit, 5x per minggu
- Yoga atau stretching rutin
- Pertimbangkan bersepeda ringan

### Setelah 2 Bulan
- Sesuaikan dengan kondisi tubuh
- Tambahkan variasi aktivitas
- Pertahankan rutinitas

## Tips Penting

✅ **Konsultasikan dengan dokter** sebelum memulai program olahraga
✅ **Mulai perlahan** dan tingkatkan bertahap
✅ **Gunakan pakaian nyaman** dan sepatu yang tepat
✅ **Pemanasan** sebelum olahraga (5 menit)
✅ **Pendinginan** setelah olahraga (5 menit)
✅ **Pantau detak jantung** (jangan melebihi 70% maksimal)
✅ **Istirahat cukup** di antara sesi olahraga

## Olahraga yang Harus Dihindari

❌ Olahraga berat atau kompetitif
❌ Angkat beban berat
❌ Lari jarak jauh
❌ Olahraga kontak fisik
❌ Olahraga di ketinggian

## Catatan Khusus

- **Fase Akut**: Fokus pada istirahat dan pernapasan dalam
- **Fase Pemulihan**: Mulai aktivitas ringan bertahap
- **Setelah Sembuh**: Dapat meningkatkan intensitas dengan konsultasi dokter

Ingat: **Konsultasikan selalu dengan dokter** sebelum memulai atau mengubah program olahraga!`,
      tags: ["olahraga", "aktivitas", "pemulihan", "kebugaran", "gaya_hidup"],
      sumberReferensi: "WHO Physical Activity Guidelines",
    },
    {
      judul: "Cara Mencegah Penularan TBC",
      kategori: "pencegahan",
      ringkasan:
        "Langkah-langkah penting untuk mencegah penularan TBC ke orang lain. Lindungi keluarga dan masyarakat dengan langkah pencegahan yang tepat.",
      konten: `# Cara Mencegah Penularan TBC

Mencegah penularan TBC sangat penting untuk melindungi keluarga dan orang-orang di sekitar Anda. Dengan langkah pencegahan yang tepat, risiko penularan dapat diminimalkan.

## Langkah Pencegahan untuk Pasien TBC

### 1. Etika Batuk yang Benar

**Cara yang Benar:**
- ✅ Tutup mulut dan hidung saat batuk atau bersin
- ✅ Gunakan **tisu** atau **siku bagian dalam**
- ✅ Buang tisu bekas ke **tempat sampah tertutup**
- ✅ Cuci tangan setelah batuk/bersin

**Hindari:**
- ❌ Menutup mulut dengan telapak tangan
- ❌ Membuang tisu sembarangan
- ❌ Batuk/bersin tanpa menutup mulut

### 2. Penggunaan Masker

**Kapan Menggunakan:**
- Saat berada di **ruang tertutup** dengan orang lain
- Saat menggunakan **transportasi umum**
- Saat **berkunjung ke fasilitas kesehatan**
- Saat berada di **tempat ramai**

**Tips:**
- Ganti masker secara teratur (setiap 4-6 jam)
- Gunakan masker medis atau N95
- Pastikan masker menutup mulut dan hidung dengan rapat
- Gunakan hingga dokter menyatakan **tidak menular lagi** (biasanya 2-3 minggu setelah pengobatan)

### 3. Ventilasi Udara yang Baik

**Langkah-langkah:**
- ✅ **Buka jendela** untuk sirkulasi udara
- ✅ Hindari ruangan tertutup dan sesak
- ✅ Gunakan kipas angin atau AC dengan filter
- ✅ **Jemur kasur dan bantal** secara rutin (setiap 2-3 hari)
- ✅ Biarkan sinar matahari masuk ke ruangan

**Mengapa Penting:**
- Bakteri TBC dapat bertahan di udara ruangan tertutup
- Sirkulasi udara mengurangi konsentrasi bakteri
- Sinar matahari membantu membunuh bakteri

### 4. Kebersihan Diri

**Praktik Kebersihan:**
- ✅ **Cuci tangan** dengan sabun dan air mengalir
- ✅ Gunakan hand sanitizer jika tidak ada air
- ✅ **Jangan berbagi** alat makan/minum
- ✅ Pisahkan pakaian untuk dicuci
- ✅ Mandi secara teratur
- ✅ Ganti pakaian setiap hari

**Pencucian Pakaian:**
- Cuci pakaian dengan air panas (60°C)
- Jemur di bawah sinar matahari langsung
- Pisahkan dari pakaian anggota keluarga lain

### 5. Isolasi Sementara

**Selama 2-3 Minggu Pertama Pengobatan:**

- ✅ **Hindari tempat ramai** (mall, pasar, transportasi umum)
- ✅ **Tidur di kamar terpisah** jika memungkinkan
- ✅ **Batasi kontak** dengan anak-anak dan lansia
- ✅ Hindari kontak dekat dengan orang lain
- ✅ Gunakan kamar mandi terpisah jika memungkinkan

**Setelah 2-3 Minggu:**
- Setelah pengobatan efektif, risiko penularan menurun drastis
- Tetap gunakan masker di tempat umum
- Ikuti saran dokter untuk aktivitas normal

## Langkah untuk Keluarga dan Kontak Erat

### 🏥 Pemeriksaan Kesehatan

**Untuk Kontak Erat:**
- Periksa kesehatan **segera** setelah terpapar
- Lakukan **tes TBC** (tes Mantoux atau IGRA)
- **Rontgen dada** jika diperlukan
- **Kontrol ulang** setelah 2-3 bulan

**Gejala yang Harus Diwaspadai:**
- Batuk lebih dari 2 minggu
- Demam tanpa sebab jelas
- Penurunan berat badan
- Berkeringat di malam hari
- Kelelahan

### 💉 Vaksinasi BCG

- **Untuk bayi**: Vaksinasi BCG segera setelah lahir
- **Efektivitas**: Melindungi dari TBC berat pada anak
- **Konsultasi**: Tanyakan ke dokter tentang vaksinasi

### 💪 Menjaga Daya Tahan Tubuh

**Tips untuk Keluarga:**
- Pola makan sehat dan bergizi
- Istirahat cukup (7-8 jam per hari)
- Olahraga ringan teratur
- Kelola stres dengan baik
- Hindari merokok dan alkohol

### 🏠 Kebersihan Rumah

- **Ventilasi**: Pastikan rumah memiliki ventilasi yang baik
- **Pembersihan**: Bersihkan rumah secara rutin
- **Sinar Matahari**: Biarkan sinar matahari masuk
- **Kebersihan**: Cuci tangan sebelum makan dan setelah dari luar

## Infografis: Langkah Pencegahan TBC

### ✅ DO (Lakukan):
1. Pakai masker di tempat umum
2. Tutup mulut saat batuk/bersin
3. Cuci tangan secara teratur
4. Buka jendela untuk ventilasi
5. Jemur kasur dan bantal
6. Minum obat teratur
7. Kontrol rutin ke dokter

### ❌ DON'T (Jangan):
1. Jangan batuk/bersin sembarangan
2. Jangan berbagi alat makan/minum
3. Jangan berada di tempat ramai saat fase menular
4. Jangan berhenti minum obat sendiri
5. Jangan merokok
6. Jangan abaikan gejala pada kontak erat

## Kapan Pasien TBC Tidak Lagi Menular?

**Umumnya setelah:**
- ✅ **2-3 minggu** pengobatan efektif
- ✅ **Tes dahak negatif** (tidak ada bakteri TBC)
- ✅ **Gejala membaik** (tidak batuk, tidak demam)
- ✅ **Dokter menyatakan** tidak menular

**Tetap Perlu:**
- Menyelesaikan pengobatan lengkap (6-9 bulan)
- Kontrol rutin ke dokter
- Tetap menjaga kebersihan

## Catatan Penting

⚠️ **Penting**: Meskipun risiko penularan menurun setelah 2-3 minggu, **tetap selesaikan pengobatan lengkap** untuk mencegah kambuh dan resistensi obat.

💡 **Ingat**: Pencegahan penularan adalah tanggung jawab bersama. Dengan langkah yang tepat, kita dapat melindungi orang yang kita cintai.`,
      tags: ["pencegahan", "penularan", "keluarga", "masker", "kebersihan"],
      sumberReferensi: "WHO TB Prevention Guidelines, Kemenkes RI",
    },
    {
      judul: "Tips Hidup Sehat untuk Pasien TBC",
      kategori: "tips_kesehatan",
      ringkasan:
        "Panduan lengkap tips hidup sehat untuk mendukung proses penyembuhan TBC dan meningkatkan kualitas hidup.",
      konten: `# Tips Hidup Sehat untuk Pasien TBC

Hidup sehat adalah kunci penting dalam proses penyembuhan TBC. Berikut panduan lengkap tips hidup sehat yang dapat Anda terapkan.

## 🍎 Pola Makan Sehat

### Sarapan Sehat
- **Jangan lewatkan sarapan** - memberikan energi untuk hari
- Pilih makanan bergizi: oatmeal, telur, buah
- Minum air putih setelah bangun tidur

### Makan Teratur
- **3 kali makan utama** + 2-3 kali snack sehat
- Porsi kecil tapi sering lebih baik
- Kunyah makanan dengan baik

### Pilih Makanan Sehat
- ✅ Buah dan sayuran segar
- ✅ Protein tanpa lemak
- ✅ Karbohidrat kompleks
- ❌ Hindari makanan olahan
- ❌ Kurangi gula dan garam

## 💤 Istirahat yang Cukup

### Tidur Berkualitas
- **7-8 jam tidur** per malam
- Tidur dan bangun di waktu yang sama
- Kamar tidur gelap, sejuk, dan tenang

### Istirahat Siang
- **Power nap** 20-30 menit jika lelah
- Jangan tidur siang terlalu lama
- Relaksasi sebelum tidur

## 🏃 Aktivitas Fisik Ringan

### Olahraga Teratur
- Jalan kaki 20-30 menit setiap hari
- Yoga atau stretching ringan
- Sesuaikan dengan kondisi tubuh

### Aktivitas Sehari-hari
- Naik tangga jika memungkinkan
- Berdiri dan bergerak setiap jam
- Hindari duduk terlalu lama

## 😊 Kesehatan Mental

### Kelola Stres
- **Meditasi** atau pernapasan dalam
- **Hobi** yang menyenangkan
- **Berbicara** dengan keluarga/teman
- **Menulis jurnal** untuk mengekspresikan perasaan

### Dukungan Sosial
- Jangan isolasi diri
- Bergabung dengan komunitas support
- Berbagi pengalaman dengan pasien lain
- Minta bantuan saat butuh

## 🚭 Hindari Kebiasaan Buruk

### Jangan Merokok
- Merokok memperburuk kondisi paru-paru
- Meningkatkan risiko komplikasi
- Mengganggu efektivitas pengobatan

### Batasi Alkohol
- Alkohol mengganggu fungsi hati
- Dapat berinteraksi dengan obat TBC
- Menurunkan sistem imun

### Hindari Narkoba
- Merusak kesehatan secara keseluruhan
- Menurunkan kepatuhan pengobatan
- Meningkatkan risiko komplikasi

## 💧 Hidrasi yang Cukup

### Minum Air Putih
- **8-10 gelas air** per hari
- Minum sebelum haus
- Bawa botol air saat bepergian

### Pilih Minuman Sehat
- ✅ Air putih
- ✅ Jus buah segar (tanpa gula)
- ✅ Teh herbal
- ❌ Minuman bersoda
- ❌ Minuman berenergi

## 🧘 Relaksasi dan Meditasi

### Teknik Pernapasan
- **Pernapasan dalam** 5-10 menit per hari
- Tarik napas melalui hidung (4 hitungan)
- Tahan (4 hitungan)
- Buang napas melalui mulut (6 hitungan)

### Meditasi
- Mulai dengan 5 menit per hari
- Fokus pada pernapasan
- Gunakan aplikasi meditasi jika perlu

## 📅 Rutinitas Harian

### Jadwal Teratur
- Bangun dan tidur di waktu yang sama
- Makan di waktu yang konsisten
- Minum obat di waktu yang sama
- Olahraga di waktu yang sama

### Manajemen Waktu
- Prioritaskan kesehatan
- Jangan terlalu sibuk
- Luangkan waktu untuk relaksasi
- Istirahat saat lelah

## 🏥 Kontrol Kesehatan Rutin

### Kunjungan Dokter
- Ikuti jadwal kontrol rutin
- Sampaikan semua gejala
- Tanyakan jika ada yang tidak jelas
- Bawa catatan pengobatan

### Pantau Gejala
- Catat gejala harian
- Perhatikan perubahan kondisi
- Laporkan efek samping obat
- Jangan abaikan gejala baru

## 💡 Tips Praktis Harian

### Pagi Hari
- ✅ Minum air putih setelah bangun
- ✅ Sarapan bergizi
- ✅ Minum obat sesuai jadwal
- ✅ Olahraga ringan atau jalan kaki

### Siang Hari
- ✅ Makan siang bergizi
- ✅ Minum air cukup
- ✅ Istirahat sejenak jika lelah
- ✅ Aktivitas ringan

### Malam Hari
- ✅ Makan malam 2-3 jam sebelum tidur
- ✅ Relaksasi sebelum tidur
- ✅ Matikan gadget 1 jam sebelum tidur
- ✅ Tidur di waktu yang sama

## 🎯 Tujuan Hidup Sehat

### Tujuan Jangka Pendek
- Minum obat teratur setiap hari
- Makan 3 kali sehari dengan gizi seimbang
- Olahraga ringan 3x per minggu
- Tidur 7-8 jam per malam

### Tujuan Jangka Panjang
- Menyelesaikan pengobatan lengkap
- Kembali ke aktivitas normal
- Menjaga pola hidup sehat
- Mencegah kambuh

## ⚠️ Tanda Perlu Konsultasi Dokter

Segera hubungi dokter jika mengalami:
- Demam tinggi atau berkepanjangan
- Sesak napas yang memburuk
- Nyeri dada
- Batuk berdarah
- Efek samping obat yang mengganggu
- Gejala baru yang tidak biasa

## 💪 Motivasi

Ingat:
- **Setiap hari adalah langkah menuju kesembuhan**
- **Konsistensi adalah kunci**
- **Anda tidak sendirian**
- **Kesembuhan adalah mungkin**

Dengan menerapkan tips hidup sehat ini, Anda dapat mendukung proses penyembuhan dan meningkatkan kualitas hidup secara keseluruhan.`,
      tags: ["tips_kesehatan", "gaya_hidup", "kesehatan", "rutinitas"],
      sumberReferensi: "WHO Healthy Lifestyle Guidelines",
    },
    {
      judul: "Infografis: Tahapan Pengobatan TBC",
      kategori: "pengobatan",
      ringkasan:
        "Panduan visual tahapan pengobatan TBC dari diagnosis hingga kesembuhan. Infografis lengkap untuk memahami perjalanan pengobatan.",
      konten: `# Infografis: Tahapan Pengobatan TBC

Panduan visual lengkap tentang tahapan pengobatan TBC dari diagnosis hingga kesembuhan.

## 📊 Tahap 1: Diagnosis (Minggu 0)

### Pemeriksaan yang Dilakukan:
- ✅ **Tes Dahak** - untuk mendeteksi bakteri TBC
- ✅ **Rontgen Dada** - melihat kondisi paru-paru
- ✅ **Tes Mantoux** - tes kulit untuk TBC
- ✅ **Tes Darah** - pemeriksaan laboratorium

### Hasil Diagnosis:
- **TBC Aktif**: Bakteri ditemukan, perlu pengobatan
- **TBC Laten**: Bakteri ada tapi tidak aktif
- **Bukan TBC**: Tidak ada infeksi TBC

## 💊 Tahap 2: Fase Intensif (Bulan 1-2)

### Pengobatan:
- **4 jenis obat** setiap hari
- **Durasi**: 2 bulan
- **Tujuan**: Membunuh bakteri aktif

### Obat yang Diberikan:
1. **Rifampisin** - membunuh bakteri
2. **Isoniazid** - mencegah multiplikasi
3. **Pirazinamid** - efektif pada bakteri dalam sel
4. **Etambutol** - mencegah resistensi

### Monitoring:
- ✅ Kontrol setiap 2 minggu
- ✅ Tes dahak bulanan
- ✅ Pantau efek samping
- ✅ Evaluasi respons pengobatan

## 🔄 Tahap 3: Fase Lanjutan (Bulan 3-6/9)

### Pengobatan:
- **2 jenis obat** (Rifampisin + Isoniazid)
- **Durasi**: 4-7 bulan
- **Tujuan**: Membunuh bakteri tersisa

### Frekuensi:
- Setiap hari atau 3x per minggu
- Sesuai rekomendasi dokter

### Monitoring:
- ✅ Kontrol bulanan
- ✅ Tes dahak setiap 2 bulan
- ✅ Evaluasi kesembuhan

## ✅ Tahap 4: Evaluasi Kesembuhan

### Kriteria Sembuh:
- ✅ **Tes dahak negatif** (tidak ada bakteri)
- ✅ **Gejala hilang** (tidak batuk, tidak demam)
- ✅ **Rontgen membaik**
- ✅ **Penyelesaian pengobatan lengkap**

### Setelah Sembuh:
- ✅ Kontrol 6 bulan setelah pengobatan
- ✅ Kontrol 12 bulan setelah pengobatan
- ✅ Tetap jaga kesehatan
- ✅ Pantau gejala kambuh

## 📈 Timeline Pengobatan

Timeline pengobatan TBC:
- Minggu 0: Diagnosis
- Bulan 1-2: Fase Intensif (4 obat)
- Bulan 3-6/9: Fase Lanjutan (2 obat)
- Evaluasi Kesembuhan
- Kontrol Pasca Pengobatan

## ⚠️ Penting Diingat

### Jangan Berhenti Pengobatan Jika:
- ✅ Gejala sudah hilang
- ✅ Merasa sudah sehat
- ✅ Tes dahak negatif
- ✅ Tidak ada efek samping

### Harus Menyelesaikan:
- ✅ **Seluruh durasi pengobatan** (6-9 bulan)
- ✅ **Semua dosis obat**
- ✅ **Kontrol rutin**

## 🎯 Target Pengobatan

### Target Utama:
1. **Membunuh semua bakteri TBC**
2. **Mencegah kambuh**
3. **Mencegah resistensi obat**
4. **Mengembalikan kualitas hidup**

### Indikator Keberhasilan:
- ✅ Tes dahak negatif konsisten
- ✅ Gejala tidak muncul kembali
- ✅ Rontgen menunjukkan perbaikan
- ✅ Kualitas hidup meningkat

## 💡 Tips Selama Pengobatan

### Minggu 1-2:
- Fokus pada adaptasi
- Pantau efek samping
- Jaga pola makan
- Istirahat cukup

### Bulan 1-3:
- Bangun rutinitas minum obat
- Olahraga ringan mulai
- Kontrol rutin
- Dukungan keluarga

### Bulan 4-6:
- Pertahankan konsistensi
- Aktivitas normal bertahap
- Pantau kemajuan
- Persiapan pasca pengobatan

### Setelah Sembuh:
- Tetap jaga kesehatan
- Pola hidup sehat
- Kontrol rutin
- Edukasi keluarga

## 📊 Statistik Pengobatan

### Tingkat Keberhasilan:
- **Pengobatan Lengkap**: 95%+ kesembuhan
- **Pengobatan Tidak Lengkap**: Risiko kambuh tinggi
- **Resistensi Obat**: Perlu pengobatan lebih lama

### Faktor Keberhasilan:
1. **Kepatuhan minum obat** (paling penting)
2. **Nutrisi yang baik**
3. **Istirahat cukup**
4. **Dukungan keluarga**
5. **Kontrol rutin**

## 🎉 Kesembuhan Adalah Mungkin!

Dengan pengobatan yang tepat dan teratur, **TBC dapat disembuhkan**. Kunci utamanya adalah:
- ✅ **Konsistensi**
- ✅ **Kesabaran**
- ✅ **Dukungan**
- ✅ **Kepatuhan**

Ingat: **Setiap hari minum obat adalah langkah menuju kesembuhan!**`,
      tags: ["pengobatan", "infografis", "tahapan", "timeline"],
      sumberReferensi: "WHO TB Treatment Guidelines",
    },
    {
      judul: "Mengenal Gejala dan Tanda TBC",
      kategori: "tentang_tbc",
      ringkasan:
        "Panduan lengkap mengenali gejala dan tanda-tanda TBC. Deteksi dini penting untuk pengobatan yang efektif.",
      konten: `# Mengenal Gejala dan Tanda TBC

Deteksi dini gejala TBC sangat penting untuk pengobatan yang efektif. Kenali gejala dan tanda-tandanya sejak awal.

## 🔍 Gejala Umum TBC Paru

### Gejala Utama (Harus Diwaspadai):

#### 1. Batuk Persisten
- ⚠️ **Batuk lebih dari 3 minggu**
- ⚠️ Batuk kering atau berdahak
- ⚠️ Batuk yang memburuk di pagi hari
- ⚠️ Batuk yang tidak membaik dengan pengobatan biasa

#### 2. Batuk Berdarah (Hemoptisis)
- ⚠️ **Dahak bercampur darah**
- ⚠️ Darah segar atau bercampur dahak
- ⚠️ Dapat terjadi sesekali atau sering
- ⚠️ **Tanda serius** - perlu pemeriksaan segera

#### 3. Demam
- ⚠️ **Demam ringan hingga sedang** (37.5-38.5°C)
- ⚠️ Demam yang hilang timbul
- ⚠️ Terutama di sore/malam hari
- ⚠️ Tidak membaik dengan obat demam biasa

#### 4. Berkeringat di Malam Hari
- ⚠️ **Keringat berlebihan** saat tidur
- ⚠️ Membasahi pakaian dan seprai
- ⚠️ Terjadi meskipun cuaca tidak panas
- ⚠️ Sering disertai demam

### Gejala Tambahan:

#### 5. Penurunan Berat Badan
- ⚠️ **Turun tanpa sebab jelas**
- ⚠️ Tidak ada perubahan pola makan
- ⚠️ Turun lebih dari 5% berat badan dalam 1 bulan
- ⚠️ Badan terasa kurus

#### 6. Kehilangan Nafsu Makan
- ⚠️ Tidak nafsu makan
- ⚠️ Makan sedikit sudah kenyang
- ⚠️ Perubahan rasa makanan
- ⚠️ Mual atau muntah

#### 7. Kelelahan dan Kelemahan
- ⚠️ **Lelah terus-menerus**
- ⚠️ Tidak bertenaga
- ⚠️ Aktivitas ringan terasa berat
- ⚠️ Tidak membaik dengan istirahat

#### 8. Nyeri Dada
- ⚠️ Nyeri saat bernapas dalam
- ⚠️ Nyeri saat batuk
- ⚠️ Rasa sesak di dada
- ⚠️ Nyeri di punggung (jika TBC paru bagian belakang)

#### 9. Sesak Napas
- ⚠️ **Sesak saat aktivitas** ringan
- ⚠️ Napas pendek
- ⚠️ Sulit bernapas dalam
- ⚠️ Memburuk seiring waktu

## 🏥 Gejala TBC Ekstra Paru

TBC juga dapat menyerang organ lain:

### TBC Kelenjar Getah Bening:
- Pembengkakan kelenjar
- Benjolan di leher, ketiak, selangkangan
- Dapat pecah dan mengeluarkan nanah

### TBC Tulang:
- Nyeri tulang
- Bengkak sendi
- Sulit bergerak
- Patah tulang spontan

### TBC Otak (Meningitis TBC):
- Sakit kepala berat
- Leher kaku
- Mual dan muntah
- Penurunan kesadaran

### TBC Usus:
- Nyeri perut
- Diare atau sembelit
- Penurunan berat badan
- Perdarahan usus

## ⚠️ Gejala Darurat (Perlu Penanganan Segera)

Segera ke IGD jika mengalami:
- 🚨 **Batuk berdarah banyak**
- 🚨 Sesak napas berat
- 🚨 Nyeri dada hebat
- 🚨 Penurunan kesadaran
- 🚨 Demam sangat tinggi (>39°C)

## 📋 Checklist Gejala

Gunakan checklist ini untuk evaluasi diri:

### Gejala Utama (Minimal 1):
- [ ] Batuk > 3 minggu
- [ ] Batuk berdarah
- [ ] Demam > 2 minggu
- [ ] Berkeringat malam hari

### Gejala Tambahan (Minimal 2):
- [ ] Penurunan berat badan
- [ ] Kehilangan nafsu makan
- [ ] Kelelahan terus-menerus
- [ ] Nyeri dada
- [ ] Sesak napas

### Faktor Risiko:
- [ ] Kontak dengan penderita TBC
- [ ] Sistem imun lemah (HIV, diabetes)
- [ ] Merokok
- [ ] Malnutrisi
- [ ] Tinggal di lingkungan padat

## 🔬 Pemeriksaan yang Perlu Dilakukan

Jika mengalami gejala di atas:

### 1. Tes Dahak
- **Paling penting** untuk diagnosis
- 3 kali pengambilan sampel
- Deteksi bakteri TBC

### 2. Rontgen Dada
- Melihat kondisi paru-paru
- Menemukan kelainan
- Evaluasi keparahan

### 3. Tes Mantoux
- Tes kulit untuk TBC
- Hasil dalam 48-72 jam
- Indikasi infeksi TBC

### 4. Tes Darah
- Pemeriksaan laboratorium
- Evaluasi kondisi umum
- Deteksi komplikasi

## ⏰ Kapan Harus Ke Dokter?

**Segera periksa jika:**
- ✅ Batuk lebih dari 3 minggu
- ✅ Batuk berdarah (meski sedikit)
- ✅ Demam > 2 minggu tanpa sebab jelas
- ✅ Kombinasi gejala (batuk + demam + turun berat badan)
- ✅ Kontak erat dengan penderita TBC

**Jangan tunda** - deteksi dini penting untuk pengobatan yang efektif!

## 💡 Tips

- **Jangan abaikan gejala** - meski ringan
- **Catat gejala** yang dialami
- **Konsultasi dokter** jika ragu
- **Jujur** saat pemeriksaan
- **Ikuti saran** dokter

## 🎯 Kesimpulan

Mengenali gejala TBC sejak dini adalah langkah penting untuk:
- ✅ Pengobatan yang lebih cepat
- ✅ Hasil pengobatan yang lebih baik
- ✅ Mencegah komplikasi
- ✅ Mencegah penularan

**Ingat**: Jika mengalami gejala yang mencurigakan, segera konsultasi ke fasilitas kesehatan terdekat!`,
      tags: ["tentang_tbc", "gejala", "deteksi", "diagnosis"],
      sumberReferensi: "WHO TB Symptoms Guidelines",
    },
    {
      judul: "Efek Samping Obat TBC dan Cara Mengatasinya",
      kategori: "pengobatan",
      ringkasan:
        "Memahami efek samping obat TBC dan cara mengatasinya dengan tepat. Panduan lengkap untuk mengelola efek samping selama pengobatan.",
      konten: `# Efek Samping Obat TBC dan Cara Mengatasinya

Memahami efek samping obat TBC sangat penting untuk keberhasilan pengobatan. Dengan pengetahuan yang tepat, Anda dapat mengelola efek samping dengan baik.

## Efek Samping Umum Obat TBC

### 1. Mual dan Muntah

**Gejala:**
- Perasaan mual setelah minum obat
- Muntah setelah konsumsi obat
- Kehilangan nafsu makan

**Cara Mengatasi:**
- ✅ Minum obat **setelah makan** (bukan saat perut kosong)
- ✅ Makan makanan ringan sebelum minum obat
- ✅ Minum banyak air putih
- ✅ Hindari makanan pedas dan berlemak
- ✅ Konsultasi dokter jika muntah terus-menerus

### 2. Sakit Perut

**Gejala:**
- Nyeri perut ringan hingga sedang
- Kram perut
- Perut kembung

**Cara Mengatasi:**
- ✅ Makan dalam porsi kecil tapi sering
- ✅ Hindari makanan yang memicu gas
- ✅ Minum air hangat
- ✅ Istirahat setelah makan
- ✅ Konsultasi jika sakit perut hebat

### 3. Perubahan Warna Urin

**Gejala:**
- Urin berwarna oranye/merah
- Ini **NORMAL** dan tidak berbahaya
- Disebabkan oleh Rifampisin

**Cara Mengatasi:**
- ✅ **Tidak perlu khawatir** - ini efek normal
- ✅ Minum banyak air putih
- ✅ Warna akan kembali normal setelah pengobatan selesai

### 4. Kulit Gatal atau Ruam

**Gejala:**
- Gatal-gatal ringan
- Ruam merah di kulit
- Iritasi kulit

**Cara Mengatasi:**
- ✅ Jangan digaruk
- ✅ Gunakan pelembab kulit
- ✅ Mandi dengan air hangat (bukan panas)
- ✅ Gunakan pakaian berbahan katun
- ⚠️ **Segera ke dokter** jika ruam menyebar atau parah

### 5. Sakit Kepala

**Gejala:**
- Sakit kepala ringan hingga sedang
- Pusing
- Rasa tidak nyaman

**Cara Mengatasi:**
- ✅ Istirahat cukup
- ✅ Minum air putih
- ✅ Kompres dingin di dahi
- ✅ Hindari stres
- ✅ Konsultasi jika sakit kepala parah atau terus-menerus

### 6. Nyeri Sendi

**Gejala:**
- Nyeri pada persendian
- Kaku sendi
- Sulit bergerak

**Cara Mengatasi:**
- ✅ Kompres hangat pada sendi yang nyeri
- ✅ Pijat ringan
- ✅ Stretching ringan
- ✅ Istirahat sendi yang nyeri
- ✅ Konsultasi dokter untuk obat pereda nyeri

### 7. Sensitivitas terhadap Sinar Matahari

**Gejala:**
- Kulit mudah terbakar sinar matahari
- Ruam setelah terpapar matahari
- Kulit lebih sensitif

**Cara Mengatasi:**
- ✅ Gunakan **tabir surya** (SPF 30+)
- ✅ Pakai topi dan pakaian tertutup saat di luar
- ✅ Hindari paparan sinar matahari langsung
- ✅ Gunakan payung saat bepergian
- ✅ Batasi waktu di bawah sinar matahari

### 8. Masalah Penglihatan

**Gejala:**
- Penglihatan kabur
- Kesulitan melihat warna
- Nyeri mata

**Cara Mengatasi:**
- ⚠️ **SEGERA KONSULTASI DOKTER** - ini bisa serius
- Jangan abaikan masalah penglihatan
- Mungkin perlu penyesuaian dosis obat
- Jangan berhenti minum obat tanpa konsultasi

## Efek Samping yang Perlu Perhatian Serius

### 🚨 Segera Hubungi Dokter Jika:

1. **Reaksi Alergi Parah**
   - Ruam menyebar ke seluruh tubuh
   - Sulit bernapas
   - Bibir atau lidah bengkak
   - **Ini darurat medis!**

2. **Sakit Perut Hebat**
   - Nyeri perut yang tidak tertahankan
   - Muntah terus-menerus
   - Tidak bisa makan/minum

3. **Masalah Penglihatan**
   - Penglihatan kabur atau hilang
   - Nyeri mata
   - Kesulitan melihat warna

4. **Gejala Hepatitis**
   - Mata atau kulit kuning (jaundice)
   - Urin berwarna gelap
   - Nyeri perut kanan atas
   - Mual dan muntah parah

5. **Demam Tinggi**
   - Demam > 38.5°C
   - Disertai ruam
   - Tidak membaik dengan obat demam

## Tips Mengelola Efek Samping

### 📝 Catat Efek Samping
- Buat catatan harian efek samping yang dialami
- Catat waktu munculnya efek samping
- Catat tingkat keparahan (ringan/sedang/berat)
- Bawa catatan saat kontrol ke dokter

### 💊 Minum Obat dengan Benar
- Minum obat di waktu yang sama setiap hari
- Minum setelah makan untuk mengurangi mual
- Jangan melewatkan dosis
- Jangan menggandakan dosis jika lupa

### 🏥 Komunikasi dengan Dokter
- Laporkan semua efek samping yang dialami
- Jangan malu atau takut melaporkan
- Tanyakan cara mengatasi efek samping
- Ikuti saran dokter dengan tepat

### ⚠️ Jangan Berhenti Minum Obat Sendiri
- **JANGAN** berhenti minum obat karena efek samping
- **JANGAN** mengurangi dosis sendiri
- **JANGAN** mengganti obat tanpa resep dokter
- Selalu konsultasi dokter terlebih dahulu

## Strategi Pencegahan Efek Samping

### 1. Persiapan Sebelum Minum Obat
- Makan makanan ringan
- Minum air putih cukup
- Siapkan obat di tempat yang mudah dijangkau
- Atur alarm pengingat

### 2. Pola Makan Sehat
- Makan makanan bergizi
- Hindari makanan yang memicu efek samping
- Minum banyak air putih
- Makan dalam porsi kecil tapi sering

### 3. Istirahat Cukup
- Tidur 7-8 jam per malam
- Istirahat saat lelah
- Kelola stres dengan baik
- Aktivitas ringan untuk relaksasi

### 4. Dukungan Keluarga
- Minta keluarga mengingatkan minum obat
- Berbagi pengalaman dengan keluarga
- Minta bantuan jika efek samping mengganggu
- Dukungan emosional sangat penting

## Kapan Perlu Penyesuaian Dosis?

Dokter mungkin menyesuaikan dosis jika:
- Efek samping terlalu berat
- Ada masalah dengan organ tertentu (hati, ginjal)
- Interaksi dengan obat lain
- Kondisi kesehatan berubah

**Penting**: Hanya dokter yang boleh menyesuaikan dosis obat!

## Kesimpulan

Efek samping obat TBC adalah hal yang wajar, tetapi dapat dikelola dengan baik. Kunci utamanya adalah:
- ✅ Komunikasi terbuka dengan dokter
- ✅ Mengikuti instruksi dengan tepat
- ✅ Tidak berhenti minum obat sendiri
- ✅ Mencatat dan melaporkan efek samping
- ✅ Menerapkan tips mengatasi efek samping

**Ingat**: Efek samping biasanya akan berkurang setelah beberapa minggu pengobatan. Tetap sabar dan konsisten dalam pengobatan!`,
      tags: ["pengobatan", "efek_samping", "obat", "tips"],
      sumberReferensi: "WHO TB Drug Side Effects Guidelines",
    },
    {
      judul: "Resistensi Obat TBC: Penyebab dan Pencegahan",
      kategori: "pengobatan",
      ringkasan:
        "Memahami resistensi obat TBC, penyebabnya, dan cara mencegahnya. Informasi penting untuk kesembuhan yang berhasil.",
      konten: `# Resistensi Obat TBC: Penyebab dan Pencegahan

Resistensi obat TBC adalah masalah serius yang dapat membuat pengobatan menjadi lebih sulit dan lama. Memahami penyebab dan cara mencegahnya sangat penting.

## Apa itu Resistensi Obat TBC?

Resistensi obat terjadi ketika bakteri TBC menjadi kebal terhadap obat yang digunakan. Ini berarti:
- Obat tidak lagi efektif membunuh bakteri
- Perlu pengobatan yang lebih lama (18-24 bulan)
- Perlu obat yang lebih mahal dan lebih kuat
- Risiko komplikasi meningkat
- Tingkat kesembuhan menurun

## Jenis Resistensi Obat TBC

### 1. Resistensi Obat Tunggal (Single Drug Resistance)
- Bakteri resisten terhadap satu jenis obat
- Masih dapat diobati dengan obat lain
- Relatif lebih mudah diatasi

### 2. Multi-Drug Resistant TB (MDR-TB)
- Bakteri resisten terhadap **minimal 2 obat utama** (Rifampisin dan Isoniazid)
- Perlu pengobatan khusus
- Pengobatan lebih lama (18-24 bulan)
- Obat lebih mahal dan lebih banyak efek samping

### 3. Extensively Drug-Resistant TB (XDR-TB)
- Bakteri resisten terhadap banyak obat
- Termasuk resisten terhadap obat lini kedua
- Sangat sulit diobati
- Tingkat kesembuhan lebih rendah

## Penyebab Resistensi Obat

### 1. Pengobatan Tidak Lengkap
**Penyebab Utama:**
- Berhenti minum obat sebelum selesai
- Melewatkan dosis obat
- Tidak konsisten dalam pengobatan

**Mengapa Terjadi:**
- Bakteri yang tersisa menjadi lebih kuat
- Bakteri belajar melawan obat
- Bakteri berkembang menjadi resisten

### 2. Dosis Tidak Tepat
- Dosis terlalu rendah
- Dosis tidak teratur
- Tidak sesuai dengan berat badan

### 3. Kombinasi Obat Salah
- Tidak minum semua obat yang diresepkan
- Hanya minum satu jenis obat
- Kombinasi obat tidak lengkap

### 4. Obat Palsu atau Kadaluarsa
- Obat tidak berkualitas
- Obat sudah kadaluarsa
- Obat palsu

### 5. Infeksi dari Pasien Lain
- Tertular dari pasien dengan MDR-TB
- Kontak dengan pasien resisten obat
- Tidak menggunakan masker dengan benar

## Cara Mencegah Resistensi Obat

### ✅ 1. Kepatuhan Penuh dalam Pengobatan

**Langkah-langkah:**
- ✅ Minum obat **setiap hari** tanpa melewatkan
- ✅ Minum **semua jenis obat** yang diresepkan
- ✅ Minum di **waktu yang sama** setiap hari
- ✅ **Selesaikan pengobatan lengkap** (6-9 bulan)
- ✅ Jangan berhenti meski sudah merasa sehat

### ✅ 2. Gunakan Sistem Reminder

**Tips:**
- ✅ Gunakan alarm di ponsel
- ✅ Aplikasi reminder (seperti TabbyCare)
- ✅ Kalender pengobatan
- ✅ Minta keluarga mengingatkan
- ✅ Catat setiap dosis yang diminum

### ✅ 3. Komunikasi dengan Dokter

**Penting:**
- ✅ Laporkan jika lupa minum obat
- ✅ Konsultasi jika ada efek samping
- ✅ Jangan mengurangi dosis sendiri
- ✅ Ikuti jadwal kontrol rutin
- ✅ Tanyakan jika ada yang tidak jelas

### ✅ 4. Hindari Berbagi Obat

**Jangan:**
- ❌ Berbagi obat dengan orang lain
- ❌ Minum obat orang lain
- ❌ Memberikan obat ke orang lain
- ❌ Menggunakan resep lama

### ✅ 5. Beli Obat dari Tempat Terpercaya

**Pastikan:**
- ✅ Beli dari apotek resmi
- ✅ Obat memiliki izin edar
- ✅ Obat tidak kadaluarsa
- ✅ Obat dalam kondisi baik
- ✅ Resep dari dokter yang valid

### ✅ 6. Pencegahan Penularan

**Langkah-langkah:**
- ✅ Gunakan masker dengan benar
- ✅ Etika batuk yang tepat
- ✅ Ventilasi udara yang baik
- ✅ Isolasi sementara jika perlu
- ✅ Vaksinasi BCG untuk bayi

## Tanda-tanda Kemungkinan Resistensi Obat

### ⚠️ Waspada Jika:

1. **Gejala Tidak Membaik**
   - Batuk masih ada setelah 2-3 bulan pengobatan
   - Demam masih muncul
   - Berat badan masih turun

2. **Tes Dahak Tetap Positif**
   - Tes dahak masih menunjukkan bakteri
   - Setelah beberapa bulan pengobatan
   - Bakteri tidak berkurang

3. **Gejala Kembali**
   - Gejala hilang lalu muncul lagi
   - TBC kambuh setelah pengobatan
   - Kondisi memburuk

4. **Kontak dengan Pasien MDR-TB**
   - Kontak erat dengan pasien resisten
   - Tinggal bersama pasien MDR-TB
   - Tidak menggunakan proteksi

## Jika Terdiagnosis MDR-TB

### Jangan Panik!
- MDR-TB masih dapat diobati
- Perlu pengobatan khusus dan lebih lama
- Perlu dukungan lebih intensif
- Tetap ada harapan kesembuhan

### Langkah-langkah:
1. ✅ Ikuti pengobatan dengan ketat
2. ✅ Konsultasi dengan dokter spesialis
3. ✅ Dukungan keluarga sangat penting
4. ✅ Jaga pola hidup sehat
5. ✅ Pantau perkembangan pengobatan

## Statistik Resistensi Obat

### Data Global:
- Sekitar 3-4% kasus TBC baru adalah MDR-TB
- Sekitar 20% kasus TBC kambuh adalah MDR-TB
- Pengobatan MDR-TB membutuhkan waktu 18-24 bulan
- Tingkat kesembuhan MDR-TB: 50-70%

### Faktor Risiko:
1. Pengobatan TBC sebelumnya yang tidak lengkap
2. Kontak dengan pasien MDR-TB
3. Tinggal di daerah dengan prevalensi MDR-TB tinggi
4. Sistem imun lemah (HIV, diabetes)

## Kesimpulan

Resistensi obat TBC adalah masalah serius yang dapat dicegah. Kunci pencegahannya adalah:
- ✅ **Kepatuhan penuh** dalam pengobatan
- ✅ **Selesaikan pengobatan lengkap**
- ✅ **Jangan melewatkan dosis**
- ✅ **Komunikasi dengan dokter**
- ✅ **Pencegahan penularan**

**Ingat**: Setiap dosis yang terlewat meningkatkan risiko resistensi. Kepatuhan adalah kunci kesembuhan!`,
      tags: ["pengobatan", "resistensi_obat", "mdr_tb", "pencegahan"],
      sumberReferensi: "WHO MDR-TB Guidelines",
    },
    {
      judul: "Menu Sehat Harian untuk Pasien TBC",
      kategori: "nutrisi",
      ringkasan:
        "Panduan lengkap menu sehat harian untuk pasien TBC. Contoh menu praktis dan mudah dibuat untuk mendukung penyembuhan.",
      konten: `# Menu Sehat Harian untuk Pasien TBC

Menu sehat harian sangat penting untuk mendukung proses penyembuhan TBC. Berikut panduan lengkap menu praktis yang mudah dibuat.

## Prinsip Menu Sehat TBC

### 1. Gizi Seimbang
- Karbohidrat: 50-60% dari total kalori
- Protein: 15-20% dari total kalori
- Lemak: 20-30% dari total kalori
- Vitamin dan mineral: Cukup

### 2. Makan Teratur
- 3 kali makan utama
- 2-3 kali snack sehat
- Jarak makan: 3-4 jam
- Porsi kecil tapi sering

### 3. Variasi Makanan
- Kombinasi berbagai jenis makanan
- Warna-warni (sayuran dan buah)
- Sumber protein bervariasi
- Karbohidrat kompleks

## Menu Sehat Harian

### 🌅 SARAPAN (06:00 - 08:00)

**Pilihan 1: Oatmeal Sehat**
- Oatmeal 1 mangkuk
- Susu rendah lemak 200ml
- Pisang 1 buah (potong)
- Kacang almond 1 sendok makan
- Madu 1 sendok teh (opsional)

**Pilihan 2: Nasi Tim Ayam**
- Nasi putih 1 piring kecil
- Ayam rebus tanpa kulit 1 potong
- Sayur bening bayam
- Telur rebus 1 butir
- Buah jeruk 1 buah

**Pilihan 3: Roti Gandum**
- Roti gandum 2 lembar
- Telur dadar 1 butir
- Keju rendah lemak 1 slice
- Tomat dan selada
- Jus jeruk 1 gelas

### 🍎 SNACK PAGI (10:00)

**Pilihan:**
- Buah apel 1 buah
- Kacang almond 10-15 butir
- Yoghurt rendah lemak 1 cup
- Smoothie buah (pisang + stroberi)

### 🍽️ MAKAN SIANG (12:00 - 13:00)

**Pilihan 1: Nasi + Ikan + Sayur**
- Nasi merah 1 piring
- Ikan bakar/rebus 1 potong (salmon/tuna)
- Sayur tumis (brokoli + wortel)
- Sup sayuran
- Buah pepaya 1 potong

**Pilihan 2: Nasi + Ayam + Sayur**
- Nasi putih 1 piring
- Ayam tanpa kulit (rebus/bakar) 1 potong
- Sayur lodeh (labu siam + kacang panjang)
- Tahu goreng 2 potong
- Buah pisang 1 buah

**Pilihan 3: Nasi + Tempe + Sayur**
- Nasi merah 1 piring
- Tempe goreng 2 potong
- Sayur bayam bening
- Sup kaldu ayam
- Buah jeruk 1 buah

### 🥤 SNACK SORE (15:00 - 16:00)

**Pilihan:**
- Roti gandum dengan selai kacang
- Buah pisang 1 buah
- Kacang rebus 1 mangkuk kecil
- Yoghurt dengan buah
- Smoothie sayuran hijau

### 🍛 MAKAN MALAM (18:00 - 19:00)

**Pilihan 1: Nasi + Ikan + Sayur**
- Nasi putih 1 piring kecil
- Ikan goreng/rebus 1 potong
- Sayur tumis (kangkung + tauge)
- Sup bening
- Buah apel 1 buah

**Pilihan 2: Nasi + Telur + Sayur**
- Nasi merah 1 piring kecil
- Telur balado 1 butir
- Sayur bening (bayam/kangkung)
- Tahu goreng 2 potong
- Buah jeruk 1 buah

**Pilihan 3: Nasi + Ayam + Sayur**
- Nasi putih 1 piring kecil
- Ayam rebus tanpa kulit 1 potong
- Sayur lodeh
- Sup kaldu
- Buah pepaya 1 potong

### 🌙 SNACK MALAM (21:00 - opsional)

**Jika masih lapar:**
- Susu hangat 1 gelas
- Roti gandum 1 lembar
- Buah pisang 1 buah kecil
- Kacang rebus sedikit

## Tips Menyiapkan Menu

### 💡 Tips Praktis:

1. **Siapkan Bahan Sebelumnya**
   - Belanja bahan seminggu sekali
   - Cuci dan potong sayuran
   - Simpan di kulkas dengan rapi

2. **Masak dalam Porsi Besar**
   - Masak untuk 2-3 hari
   - Simpan di kulkas
   - Panaskan saat akan makan

3. **Gunakan Bahan Segar**
   - Pilih sayuran dan buah segar
   - Daging/fish yang masih segar
   - Hindari makanan olahan

4. **Variasi Menu**
   - Ganti menu setiap hari
   - Kombinasi berbagai protein
   - Variasi sayuran

5. **Hidrasi Cukup**
   - Minum air putih 8-10 gelas
   - Jus buah segar (tanpa gula)
   - Sup dan kaldu

## Contoh Menu Mingguan

### Senin:
- Pagi: Oatmeal + buah
- Siang: Nasi + ikan + sayur
- Malam: Nasi + ayam + sayur

### Selasa:
- Pagi: Nasi tim + telur
- Siang: Nasi + tempe + sayur
- Malam: Nasi + ikan + sayur

### Rabu:
- Pagi: Roti gandum + telur
- Siang: Nasi + ayam + sayur
- Malam: Nasi + tahu + sayur

### Kamis:
- Pagi: Oatmeal + buah
- Siang: Nasi + ikan + sayur
- Malam: Nasi + tempe + sayur

### Jumat:
- Pagi: Nasi tim + ayam
- Siang: Nasi + ikan + sayur
- Malam: Nasi + telur + sayur

### Sabtu:
- Pagi: Roti gandum + keju
- Siang: Nasi + ayam + sayur
- Malam: Nasi + ikan + sayur

### Minggu:
- Pagi: Oatmeal + buah
- Siang: Nasi + tempe + sayur
- Malam: Nasi + ayam + sayur

## Makanan yang Harus Dihindari

### ❌ Hindari:
- Makanan tinggi gula (permen, kue manis)
- Makanan olahan (sosis, nugget)
- Makanan tinggi garam
- Makanan berlemak jenuh
- Minuman bersoda
- Alkohol
- Makanan pedas berlebihan

## Suplemen (Jika Diperlukan)

### Konsultasi dengan Dokter:
- Vitamin D
- Vitamin C
- Zinc
- Multivitamin
- Probiotik

**Penting**: Jangan minum suplemen tanpa konsultasi dokter!

## Tips Khusus

### Untuk Nafsu Makan Rendah:
- Makan dalam porsi kecil tapi sering
- Pilih makanan favorit
- Buat makanan menarik (warna, bentuk)
- Makan bersama keluarga
- Ciptakan suasana makan yang nyaman

### Untuk Mual:
- Makan makanan hambar (nasi putih, roti)
- Hindari makanan berbau kuat
- Makan perlahan
- Minum air putih sedikit-sedikit
- Hindari makanan berlemak

### Untuk Kelelahan:
- Siapkan makanan sebelumnya
- Gunakan makanan siap saji sehat
- Minta bantuan keluarga
- Pilih makanan mudah dimasak

## Kesimpulan

Menu sehat harian adalah bagian penting dari pengobatan TBC. Dengan menu yang tepat:
- ✅ Mendukung proses penyembuhan
- ✅ Meningkatkan sistem imun
- ✅ Memperbaiki kondisi tubuh
- ✅ Meningkatkan energi
- ✅ Mempercepat pemulihan

**Ingat**: Konsultasi dengan ahli gizi jika memungkinkan untuk menu yang lebih personal!`,
      tags: ["nutrisi", "menu", "makanan", "diet", "resep"],
      sumberReferensi: "WHO Nutrition Guidelines, Kemenkes RI",
    },
    {
      judul: "Mengelola Stres dan Kesehatan Mental saat Pengobatan TBC",
      kategori: "gaya_hidup",
      ringkasan:
        "Panduan lengkap mengelola stres dan menjaga kesehatan mental selama pengobatan TBC. Tips praktis untuk kesejahteraan emosional.",
      konten: `# Mengelola Stres dan Kesehatan Mental saat Pengobatan TBC

Pengobatan TBC tidak hanya mempengaruhi fisik, tetapi juga kesehatan mental. Mengelola stres dan menjaga kesehatan mental sangat penting untuk kesembuhan.

## Dampak TBC pada Kesehatan Mental

### Emosi yang Sering Dialami:
- 😰 **Cemas** tentang kondisi kesehatan
- 😔 **Sedih** karena harus berobat lama
- 😡 **Marah** karena terkena penyakit
- 😰 **Takut** akan masa depan
- 😞 **Stres** karena pengobatan
- 😔 **Depresi** karena isolasi sosial
- 😰 **Khawatir** tentang penularan ke keluarga

### Faktor Pemicu Stres:
- Pengobatan jangka panjang (6-9 bulan)
- Efek samping obat
- Isolasi sosial
- Stigma dari masyarakat
- Masalah finansial
- Khawatir menulari keluarga
- Perubahan gaya hidup

## Tanda-tanda Stres Berlebihan

### Tanda Fisik:
- Sakit kepala
- Sulit tidur
- Kelelahan
- Nyeri otot
- Perubahan nafsu makan
- Masalah pencernaan

### Tanda Emosional:
- Mudah marah
- Perasaan sedih terus-menerus
- Cemas berlebihan
- Sulit berkonsentrasi
- Kehilangan minat pada aktivitas
- Perasaan putus asa

### Tanda Perilaku:
- Menarik diri dari orang lain
- Menghindari aktivitas
- Perubahan pola makan
- Perubahan pola tidur
- Menghindari pengobatan
- Penyalahgunaan zat

## Strategi Mengelola Stres

### 1. Teknik Relaksasi

#### Pernapasan Dalam:
- Tarik napas melalui hidung (4 hitungan)
- Tahan napas (4 hitungan)
- Buang napas melalui mulut (6 hitungan)
- Ulangi 5-10 kali
- Lakukan 2-3 kali sehari

#### Meditasi:
- Duduk atau berbaring nyaman
- Fokus pada pernapasan
- Biarkan pikiran mengalir
- Mulai dengan 5 menit, tingkatkan bertahap
- Gunakan aplikasi meditasi jika perlu

#### Progressive Muscle Relaxation:
- Tegangkan dan rilekskan otot secara bergantian
- Mulai dari jari kaki hingga kepala
- Tahan 5 detik, rileks 10 detik
- Lakukan 10-15 menit

### 2. Aktivitas Fisik Ringan

**Manfaat:**
- Meningkatkan mood
- Mengurangi stres
- Meningkatkan energi
- Meningkatkan kualitas tidur

**Aktivitas yang Direkomendasikan:**
- Jalan kaki 20-30 menit
- Yoga ringan
- Stretching
- Tai chi
- Bersepeda santai

### 3. Dukungan Sosial

#### Keluarga:
- Berbicara dengan keluarga tentang perasaan
- Minta dukungan emosional
- Libatkan keluarga dalam pengobatan
- Buat jadwal aktivitas bersama

#### Teman:
- Tetap berkomunikasi dengan teman
- Berbagi pengalaman
- Minta dukungan
- Jangan isolasi diri

#### Komunitas:
- Bergabung dengan support group TBC
- Berbagi pengalaman dengan pasien lain
- Dapatkan tips dan dukungan
- Kurangi perasaan sendirian

### 4. Hobi dan Aktivitas Menyenangkan

**Pilih Aktivitas yang Disukai:**
- Membaca buku
- Menulis jurnal
- Mendengarkan musik
- Menonton film
- Berkebun
- Memasak
- Kerajinan tangan
- Bermain game

**Manfaat:**
- Mengalihkan pikiran dari stres
- Memberikan rasa pencapaian
- Meningkatkan mood
- Mengurangi kecemasan

### 5. Manajemen Waktu

**Tips:**
- Buat jadwal harian
- Prioritaskan aktivitas penting
- Luangkan waktu untuk relaksasi
- Jangan terlalu sibuk
- Istirahat saat lelah

### 6. Pola Tidur yang Baik

**Tips:**
- Tidur 7-8 jam per malam
- Tidur dan bangun di waktu yang sama
- Hindari gadget sebelum tidur
- Ciptakan lingkungan tidur nyaman
- Relaksasi sebelum tidur

## Mengatasi Perasaan Negatif

### Mengatasi Kecemasan:

**Teknik:**
- ✅ Identifikasi sumber kecemasan
- ✅ Tarik napas dalam
- ✅ Fokus pada hal yang bisa dikontrol
- ✅ Lakukan aktivitas yang menenangkan
- ✅ Konsultasi jika kecemasan berlebihan

### Mengatasi Kesedihan:

**Teknik:**
- ✅ Terima perasaan sedih
- ✅ Berbicara dengan orang terpercaya
- ✅ Lakukan aktivitas yang menyenangkan
- ✅ Ingat bahwa kesedihan akan berlalu
- ✅ Fokus pada hal positif

### Mengatasi Kemarahan:

**Teknik:**
- ✅ Identifikasi pemicu kemarahan
- ✅ Tarik napas dalam
- ✅ Hitung sampai 10
- ✅ Alihkan perhatian
- ✅ Ekspresikan dengan cara sehat

## Kapan Perlu Bantuan Profesional?

### Segera Cari Bantuan Jika:

1. **Pikiran Bunuh Diri**
   - Memikirkan untuk bunuh diri
   - Merasa tidak ada harapan
   - Merasa beban bagi orang lain
   - **SEGERA HUBUNGI BANTUAN DARURAT**

2. **Depresi Berat**
   - Perasaan sedih terus-menerus (>2 minggu)
   - Kehilangan minat pada semua aktivitas
   - Perubahan berat badan drastis
   - Sulit tidur atau tidur berlebihan

3. **Kecemasan Berat**
   - Serangan panik
   - Kecemasan yang mengganggu aktivitas
   - Fobia yang parah
   - Gangguan kecemasan umum

4. **Perubahan Perilaku Drastis**
   - Menarik diri total
   - Menghindari pengobatan
   - Perubahan kepribadian
   - Perilaku berisiko

## Dukungan Profesional

### Jenis Bantuan:
- **Konseling**: Berbicara dengan konselor
- **Terapi**: Terapi kognitif-perilaku (CBT)
- **Obat**: Antidepresan atau antiansietas (jika diperlukan)
- **Support Group**: Kelompok dukungan TBC

### Di Mana Mencari Bantuan:
- Puskesmas atau rumah sakit
- Psikolog atau psikiater
- Layanan konseling online
- Hotline kesehatan mental
- Support group TBC

## Tips Praktis Harian

### Pagi Hari:
- ✅ Bangun dengan pikiran positif
- ✅ Lakukan pernapasan dalam
- ✅ Minum air putih
- ✅ Sarapan bergizi
- ✅ Rencanakan hari dengan baik

### Siang Hari:
- ✅ Istirahat sejenak
- ✅ Aktivitas ringan
- ✅ Berbicara dengan orang lain
- ✅ Makan siang bergizi

### Malam Hari:
- ✅ Relaksasi sebelum tidur
- ✅ Hindari stres sebelum tidur
- ✅ Matikan gadget
- ✅ Tidur cukup

## Kesimpulan

Kesehatan mental sama pentingnya dengan kesehatan fisik dalam pengobatan TBC. Dengan mengelola stres dan menjaga kesehatan mental:
- ✅ Meningkatkan kualitas hidup
- ✅ Meningkatkan kepatuhan pengobatan
- ✅ Mempercepat proses penyembuhan
- ✅ Mengurangi risiko komplikasi
- ✅ Meningkatkan kesejahteraan secara keseluruhan

**Ingat**: Tidak apa-apa untuk merasa sedih atau cemas. Yang penting adalah bagaimana kita mengelolanya. Jangan ragu untuk mencari bantuan jika diperlukan!`,
      tags: ["gaya_hidup", "kesehatan_mental", "stres", "depresi", "kecemasan"],
      sumberReferensi: "WHO Mental Health Guidelines",
    },
    {
      judul: "Vaksinasi BCG: Perlindungan terhadap TBC",
      kategori: "pencegahan",
      ringkasan:
        "Informasi lengkap tentang vaksinasi BCG untuk melindungi dari TBC. Pentingnya vaksinasi dan siapa yang perlu mendapatkannya.",
      konten: `# Vaksinasi BCG: Perlindungan terhadap TBC

Vaksinasi BCG adalah salah satu cara penting untuk mencegah TBC, terutama pada anak-anak. Memahami vaksinasi BCG sangat penting untuk perlindungan optimal.

## Apa itu Vaksin BCG?

BCG (Bacillus Calmette-Guérin) adalah vaksin yang digunakan untuk mencegah TBC. Vaksin ini:
- Terbuat dari bakteri TBC yang dilemahkan
- Diberikan melalui suntikan
- Efektif mencegah TBC berat pada anak
- Termasuk dalam program imunisasi dasar

## Siapa yang Perlu Vaksinasi BCG?

### ✅ Wajib Diberikan:

1. **Bayi Baru Lahir**
   - Diberikan segera setelah lahir
   - Idealnya dalam 24 jam pertama
   - Sebelum pulang dari rumah sakit

2. **Anak di Bawah 1 Tahun**
   - Jika belum mendapat vaksinasi
   - Sebelum usia 1 tahun
   - Tanpa perlu tes Mantoux

3. **Anak 1-5 Tahun**
   - Jika belum pernah vaksinasi
   - Perlu tes Mantoux terlebih dahulu
   - Jika tes negatif, bisa divaksinasi

### ⚠️ Perlu Pertimbangan:

1. **Anak di Atas 5 Tahun**
   - Biasanya tidak perlu vaksinasi
   - Kecuali ada indikasi khusus
   - Konsultasi dengan dokter

2. **Dewasa**
   - Tidak rutin diberikan
   - Hanya untuk kondisi tertentu
   - Konsultasi dengan dokter

## Manfaat Vaksinasi BCG

### 1. Mencegah TBC Berat pada Anak
- ✅ Mencegah TBC meningitis (radang selaput otak)
- ✅ Mencegah TBC milier (TBC menyebar)
- ✅ Mencegah TBC berat lainnya
- ✅ Efektivitas: 70-80% untuk TBC berat

### 2. Mencegah TBC Paru pada Anak
- ✅ Memberikan perlindungan parsial
- ✅ Mengurangi risiko TBC paru
- ✅ Efektivitas: 50-60% untuk TBC paru

### 3. Perlindungan Jangka Panjang
- ✅ Perlindungan bertahan 10-15 tahun
- ✅ Mengurangi risiko seumur hidup
- ✅ Terutama efektif pada anak

## Efektivitas Vaksin BCG

### Tingkat Perlindungan:
- **TBC Meningitis**: 70-80% efektif
- **TBC Milier**: 70-80% efektif
- **TBC Paru**: 50-60% efektif
- **TBC pada Dewasa**: 0-20% efektif

### Faktor yang Mempengaruhi:
- Usia saat vaksinasi (lebih muda lebih baik)
- Kualitas vaksin
- Teknik penyuntikan
- Status gizi
- Lingkungan

## Kapan Vaksinasi BCG Diberikan?

### Waktu Ideal:
- ✅ **Segera setelah lahir** (0-2 bulan)
- ✅ Sebelum kontak dengan penderita TBC
- ✅ Sebelum terpapar bakteri TBC

### Jika Terlambat:
- ✅ Masih bisa diberikan sebelum usia 1 tahun
- ✅ Setelah usia 1 tahun perlu tes Mantoux
- ✅ Konsultasi dengan dokter

## Prosedur Vaksinasi BCG

### 1. Sebelum Vaksinasi:
- Pemeriksaan kesehatan bayi/anak
- Pastikan tidak ada kontraindikasi
- Tidak perlu puasa

### 2. Saat Vaksinasi:
- Suntikan di lengan kanan atas
- Dosis: 0.05ml untuk bayi <1 tahun
- Dosis: 0.1ml untuk anak >1 tahun
- Teknik intradermal (di dalam kulit)

### 3. Setelah Vaksinasi:
- Tidak perlu perawatan khusus
- Bisa mandi seperti biasa
- Pantau reaksi vaksinasi

## Reaksi Vaksinasi BCG

### Reaksi Normal:

1. **2-3 Minggu Setelah Vaksinasi:**
   - Benjolan kecil di tempat suntikan
   - Kemerahan ringan
   - **Ini normal dan diharapkan**

2. **4-6 Minggu Setelah Vaksinasi:**
   - Benjolan membesar
   - Terbentuk pustula (berisi nanah)
   - Bisa pecah dan mengeluarkan nanah

3. **6-12 Minggu Setelah Vaksinasi:**
   - Luka mengering
   - Terbentuk koreng
   - Akan sembuh dengan sendirinya

4. **Setelah Sembuh:**
   - Terbentuk bekas luka (scar)
   - Bekas luka kecil (5-10mm)
   - **Ini tanda vaksinasi berhasil**

### Perawatan Reaksi:
- ✅ **Jangan** diolesi salep atau obat
- ✅ **Jangan** ditutup plester
- ✅ Biarkan terbuka dan kering
- ✅ Bisa mandi seperti biasa
- ✅ Jika pecah, bersihkan dengan air bersih

### Kapan Perlu Ke Dokter:
- ⚠️ Reaksi sangat besar (>1cm)
- ⚠️ Demam tinggi (>38.5°C)
- ⚠️ Nanah banyak dan tidak sembuh
- ⚠️ Kelenjar getah bening membesar
- ⚠️ Reaksi tidak normal

## Kontraindikasi Vaksinasi BCG

### ❌ Tidak Boleh Diberikan Jika:

1. **Sistem Imun Lemah:**
   - HIV positif (pada bayi)
   - Kanker
   - Pengobatan imunosupresan
   - Penyakit imunodefisiensi

2. **Kehamilan:**
   - Tidak diberikan pada ibu hamil
   - Bisa diberikan setelah melahirkan

3. **Infeksi Aktif:**
   - Demam tinggi
   - Infeksi berat
   - TBC aktif

4. **Reaksi Alergi:**
   - Alergi terhadap komponen vaksin
   - Reaksi alergi berat sebelumnya

## Vaksinasi BCG dan Tes Mantoux

### Hubungan:
- Vaksinasi BCG dapat membuat tes Mantoux positif
- Ini **tidak berarti** terkena TBC
- Perlu evaluasi lebih lanjut
- Konsultasi dengan dokter

### Interpretasi:
- Tes Mantoux positif + gejala TBC = perlu pemeriksaan lebih lanjut
- Tes Mantoux positif + tidak ada gejala = biasanya normal
- Dokter akan menilai berdasarkan konteks

## Vaksinasi BCG di Indonesia

### Program Nasional:
- ✅ Termasuk dalam imunisasi dasar
- ✅ Diberikan gratis di puskesmas
- ✅ Wajib untuk semua bayi
- ✅ Diberikan segera setelah lahir

### Tempat Vaksinasi:
- Rumah sakit
- Puskesmas
- Posyandu
- Klinik kesehatan
- Dokter praktik

## FAQ tentang Vaksinasi BCG

### 1. Apakah vaksin BCG aman?
✅ Ya, vaksin BCG sangat aman dan telah digunakan puluhan tahun.

### 2. Apakah vaksin BCG 100% efektif?
❌ Tidak, tetapi memberikan perlindungan signifikan terhadap TBC berat.

### 3. Apakah perlu vaksinasi ulang?
❌ Biasanya tidak perlu, kecuali ada indikasi khusus.

### 4. Apakah vaksin BCG menyebabkan TBC?
❌ Tidak, vaksin menggunakan bakteri yang dilemahkan.

### 5. Apakah vaksin BCG untuk dewasa?
❌ Biasanya tidak, hanya untuk kondisi tertentu.

## Kesimpulan

Vaksinasi BCG adalah cara penting untuk mencegah TBC, terutama pada anak-anak. Dengan vaksinasi BCG:
- ✅ Mencegah TBC berat pada anak
- ✅ Mengurangi risiko seumur hidup
- ✅ Perlindungan jangka panjang
- ✅ Gratis dan mudah didapat

**Ingat**: Vaksinasi BCG adalah langkah pertama dalam pencegahan TBC. Lengkapi dengan pola hidup sehat dan pengobatan yang tepat jika terkena TBC!`,
      tags: ["pencegahan", "vaksinasi", "bcg", "imunisasi", "anak"],
      sumberReferensi: "WHO BCG Vaccination Guidelines, IDAI",
    },
    {
      judul: "Stigma TBC: Mengatasi dan Menghadapinya",
      kategori: "tips_kesehatan",
      ringkasan:
        "Memahami stigma TBC dan cara mengatasinya. Panduan untuk menghadapi stigma dan mengurangi dampaknya pada kehidupan.",
      konten: `# Stigma TBC: Mengatasi dan Menghadapinya

Stigma terhadap TBC masih menjadi masalah di masyarakat. Memahami dan mengatasi stigma sangat penting untuk kesejahteraan pasien dan keluarga.

## Apa itu Stigma TBC?

Stigma adalah pandangan negatif, prasangka, atau diskriminasi terhadap seseorang karena kondisi kesehatannya. Stigma TBC dapat terjadi karena:
- Ketidaktahuan tentang TBC
- Ketakutan akan penularan
- Mitos dan kesalahpahaman
- Stereotip negatif
- Diskriminasi sosial

## Dampak Stigma TBC

### Dampak pada Pasien:
- 😔 Perasaan malu dan bersalah
- 😰 Isolasi sosial
- 😞 Depresi dan kecemasan
- 😡 Marah dan frustrasi
- 😰 Menghindari pengobatan
- 😔 Menurunkan kualitas hidup

### Dampak pada Keluarga:
- 😰 Dijauhi oleh tetangga
- 😞 Kesulitan sosial
- 😰 Masalah ekonomi
- 😔 Stres dan kecemasan
- 😰 Diskriminasi

## Bentuk Stigma TBC

### 1. Stigma dari Masyarakat:
- Dijauhi oleh tetangga
- Dikucilkan dari komunitas
- Dihindari di tempat umum
- Prasangka negatif

### 2. Stigma di Tempat Kerja:
- Dipecat atau diisolasi
- Dikucilkan oleh rekan kerja
- Kesulitan mencari kerja
- Diskriminasi pekerjaan

### 3. Stigma di Sekolah:
- Dikucilkan oleh teman
- Kesulitan belajar
- Diskriminasi pendidikan
- Isolasi sosial

### 4. Stigma dalam Keluarga:
- Dikucilkan oleh keluarga
- Perlakuan berbeda
- Isolasi dalam rumah
- Stres keluarga

## Cara Mengatasi Stigma

### 1. Edukasi dan Informasi

**Untuk Diri Sendiri:**
- ✅ Pelajari tentang TBC dengan benar
- ✅ Pahami bahwa TBC dapat disembuhkan
- ✅ Ketahui bahwa TBC tidak menular setelah pengobatan efektif
- ✅ Percaya diri dengan pengetahuan yang benar

**Untuk Orang Lain:**
- ✅ Berbagi informasi yang benar tentang TBC
- ✅ Jelaskan bahwa TBC dapat disembuhkan
- ✅ Jelaskan bahwa setelah 2-3 minggu pengobatan, risiko penularan sangat rendah
- ✅ Koreksi mitos dan kesalahpahaman

### 2. Komunikasi Terbuka

**Tips:**
- ✅ Berbicara jujur tentang kondisi
- ✅ Jelaskan bahwa sedang dalam pengobatan
- ✅ Jelaskan bahwa TBC dapat disembuhkan
- ✅ Minta dukungan, bukan simpati

### 3. Bergabung dengan Support Group

**Manfaat:**
- ✅ Berbagi pengalaman dengan pasien lain
- ✅ Dapatkan dukungan emosional
- ✅ Pelajari cara mengatasi stigma
- ✅ Kurangi perasaan sendirian

### 4. Fokus pada Pengobatan

**Strategi:**
- ✅ Fokus pada kesembuhan
- ✅ Ikuti pengobatan dengan baik
- ✅ Jaga kesehatan dengan baik
- ✅ Buktikan bahwa TBC dapat disembuhkan

### 5. Dukungan Keluarga

**Penting:**
- ✅ Libatkan keluarga dalam pengobatan
- ✅ Minta dukungan keluarga
- ✅ Berbicara dengan keluarga tentang stigma
- ✅ Buat keluarga memahami kondisi

## Menghadapi Stigma di Tempat Kerja

### Jika Dikucilkan:
- ✅ Jelaskan bahwa TBC dapat disembuhkan
- ✅ Berikan informasi yang benar
- ✅ Tunjukkan bahwa sedang dalam pengobatan
- ✅ Minta dukungan atasan

### Jika Dipecat:
- ✅ Ketahui hak-hak Anda
- ✅ Konsultasi dengan lembaga hukum
- ✅ Cari bantuan dari organisasi TBC
- ✅ Laporkan diskriminasi

## Menghadapi Stigma di Sekolah

### Untuk Anak:
- ✅ Berikan informasi yang benar
- ✅ Jelaskan bahwa TBC dapat disembuhkan
- ✅ Minta dukungan guru
- ✅ Libatkan orang tua

### Untuk Orang Tua:
- ✅ Komunikasi dengan sekolah
- ✅ Berikan informasi yang benar
- ✅ Minta dukungan sekolah
- ✅ Pastikan anak mendapat dukungan

## Mengurangi Stigma di Masyarakat

### Langkah-langkah:
- ✅ Edukasi masyarakat tentang TBC
- ✅ Berbagi informasi yang benar
- ✅ Menjadi contoh positif
- ✅ Dukung kampanye anti-stigma
- ✅ Berbicara terbuka tentang TBC

## Dukungan Emosional

### Jika Merasa Tertekan:
- ✅ Berbicara dengan konselor
- ✅ Bergabung dengan support group
- ✅ Minta dukungan keluarga
- ✅ Lakukan aktivitas yang menyenangkan
- ✅ Jaga kesehatan mental

### Jika Merasa Sendirian:
- ✅ Ingat bahwa Anda tidak sendirian
- ✅ Banyak pasien TBC yang berhasil sembuh
- ✅ Bergabung dengan komunitas
- ✅ Cari dukungan online
- ✅ Berbicara dengan pasien lain

## Tips Praktis

### 1. Percaya Diri:
- ✅ Percaya bahwa TBC dapat disembuhkan
- ✅ Percaya pada pengobatan
- ✅ Percaya pada diri sendiri
- ✅ Jangan biarkan stigma mengalahkan Anda

### 2. Tetap Positif:
- ✅ Fokus pada hal positif
- ✅ Ingat bahwa kesembuhan adalah mungkin
- ✅ Rayakan kemajuan kecil
- ✅ Jaga semangat

### 3. Jaga Privasi:
- ✅ Tidak perlu memberitahu semua orang
- ✅ Pilih dengan siapa berbagi
- ✅ Lindungi privasi Anda
- ✅ Kontrol informasi yang dibagikan

### 4. Cari Bantuan:
- ✅ Jangan ragu mencari bantuan
- ✅ Konsultasi dengan konselor
- ✅ Bergabung dengan support group
- ✅ Minta dukungan profesional

## Kesimpulan

Stigma TBC adalah masalah nyata, tetapi dapat diatasi. Dengan edukasi, komunikasi, dan dukungan:
- ✅ Mengurangi dampak stigma
- ✅ Meningkatkan kualitas hidup
- ✅ Meningkatkan kepatuhan pengobatan
- ✅ Meningkatkan kesembuhan
- ✅ Mengurangi isolasi sosial

**Ingat**: TBC adalah penyakit yang dapat disembuhkan. Jangan biarkan stigma menghentikan Anda dari kesembuhan. Anda berhak mendapat dukungan dan perawatan yang baik!`,
      tags: ["tips_kesehatan", "stigma", "kesehatan_mental", "dukungan"],
      sumberReferensi: "WHO TB Stigma Guidelines",
    },
    {
      judul: "TBC pada Anak: Gejala, Diagnosis, dan Pengobatan",
      kategori: "tentang_tbc",
      ringkasan:
        "Panduan lengkap tentang TBC pada anak-anak, termasuk gejala khas, cara diagnosis, dan pengobatan khusus untuk anak.",
      konten: `# TBC pada Anak: Gejala, Diagnosis, dan Pengobatan

TBC pada anak memiliki karakteristik yang berbeda dengan TBC pada dewasa. Memahami perbedaan ini sangat penting untuk diagnosis dan pengobatan yang tepat.

## Mengapa TBC pada Anak Berbeda?

### Karakteristik Khusus:
- **Sulit didiagnosis** - gejala tidak spesifik
- **TBC ekstra paru lebih sering** - seperti TBC kelenjar, TBC tulang
- **Risiko komplikasi lebih tinggi** - terutama TBC milier dan meningitis
- **Gejala tidak khas** - bisa seperti penyakit biasa lainnya

## Gejala TBC pada Anak

### Gejala Umum:
- ⚠️ **Demam berkepanjangan** (>2 minggu)
- ⚠️ **Batuk persisten** (>3 minggu)
- ⚠️ **Penurunan berat badan** atau tidak naik berat badan
- ⚠️ **Berkeringat di malam hari**
- ⚠️ **Lesu dan tidak aktif** seperti biasanya
- ⚠️ **Nafsu makan menurun**

### Gejala TBC Ekstra Paru pada Anak:

**TBC Kelenjar Getah Bening:**
- Pembengkakan kelenjar di leher, ketiak, atau selangkangan
- Benjolan yang tidak sakit
- Dapat pecah dan mengeluarkan nanah

**TBC Meningitis:**
- Sakit kepala berat
- Muntah
- Leher kaku
- Penurunan kesadaran
- Kejang
- **SANGAT BERBAHAYA** - bisa menyebabkan kematian atau cacat

**TBC Tulang:**
- Nyeri tulang atau sendi
- Bengkak pada sendi
- Sulit berjalan atau bergerak
- Patah tulang

**TBC Milier:**
- TBC menyebar ke seluruh tubuh
- Gejala berat
- **SANGAT BERBAHAYA**

## Diagnosis TBC pada Anak

### 1. Pemeriksaan Fisik
- Dokter akan memeriksa gejala
- Memeriksa pembengkakan kelenjar
- Mendengarkan paru-paru
- Memeriksa berat badan dan tinggi badan

### 2. Tes Mantoux
- Tes kulit untuk mendeteksi infeksi TBC
- Hasil dalam 48-72 jam
- Positif jika ada benjolan >10mm (atau >5mm pada risiko tinggi)

### 3. Foto Rontgen Dada
- Melihat kondisi paru-paru
- Mencari kelainan yang menunjukkan TBC

### 4. Tes Dahak
- Lebih sulit pada anak karena sulit mengeluarkan dahak
- Dilakukan jika memungkinkan
- Kadang perlu menggunakan cara khusus (gastric lavage)

### 5. Tes Darah (IGRA)
- Alternatif tes Mantoux
- Lebih akurat pada beberapa kasus

### 6. Tes Lainnya
- Biopsi kelenjar (jika ada pembengkakan)
- Pungsi lumbal (untuk TBC meningitis)
- Pemeriksaan cairan sendi (untuk TBC tulang)

## Faktor Risiko TBC pada Anak

### Anak Berisiko Tinggi:
- ✅ Kontak erat dengan penderita TBC aktif
- ✅ Anak dengan HIV
- ✅ Malnutrisi
- ✅ Anak di bawah 5 tahun
- ✅ Tidak mendapat vaksinasi BCG
- ✅ Tinggal di lingkungan padat
- ✅ Kondisi yang menurunkan sistem imun

## Pengobatan TBC pada Anak

### Prinsip Pengobatan:
- ✅ **Sama dengan dewasa** - menggunakan obat yang sama
- ✅ **Dosis disesuaikan** dengan berat badan anak
- ✅ **Durasi sama** - 6-9 bulan
- ✅ **DOT (Directly Observed Therapy)** - sangat penting
- ✅ **Monitoring ketat** - karena risiko efek samping

### Obat yang Digunakan:
1. **Rifampisin**
2. **Isoniazid**
3. **Pirazinamid**
4. **Etambutol** (atau Streptomisin untuk kasus tertentu)

### Dosis Berdasarkan Berat Badan:
- Dosis dihitung per kg berat badan
- Harus tepat untuk efektivitas dan keamanan
- Dokter akan menghitung dosis dengan cermat

### Fase Pengobatan:
- **Fase Intensif**: 2 bulan (4 obat)
- **Fase Lanjutan**: 4-7 bulan (2 obat)

## Masalah Khusus pada Pengobatan Anak

### 1. Kesulitan Minum Obat
**Solusi:**
- ✅ Hancurkan tablet dan campur dengan makanan/susu
- ✅ Gunakan bentuk sirup jika tersedia
- ✅ Berikan setelah makan
- ✅ Jelaskan pentingnya minum obat dengan bahasa sederhana
- ✅ Berikan pujian setelah minum obat

### 2. Efek Samping
**Yang Harus Diwaspadai:**
- ⚠️ Mual dan muntah
- ⚠️ Ruam kulit
- ⚠️ Perubahan warna urin (normal - oranye/merah)
- ⚠️ Masalah penglihatan (langsung ke dokter)
- ⚠️ Demam tinggi (langsung ke dokter)

### 3. Monitoring Pertumbuhan
- ✅ Pantau berat badan setiap bulan
- ✅ Pantau tinggi badan
- ✅ Pastikan nutrisi cukup
- ✅ Konsultasi ahli gizi jika perlu

## Nutrisi untuk Anak dengan TBC

### Makanan Penting:
- ✅ **Protein tinggi** - telur, ikan, ayam, tahu, tempe
- ✅ **Karbohidrat** - nasi, kentang, ubi
- ✅ **Buah dan sayur** - untuk vitamin dan mineral
- ✅ **Susu** - untuk kalsium dan protein
- ✅ **Camilan sehat** - buah, kacang, yoghurt

### Tips Makan:
- Makan dalam porsi kecil tapi sering
- Buat makanan menarik (warna, bentuk)
- Makan bersama keluarga
- Hindari makanan yang membuat mual

## Vaksinasi BCG

### Pentingnya BCG:
- ✅ **Mencegah TBC berat** pada anak
- ✅ Khususnya TBC meningitis dan TBC milier
- ✅ Diberikan segera setelah lahir
- ✅ **Wajib** untuk semua bayi di Indonesia

### Jika Belum Vaksinasi:
- Bisa diberikan sebelum usia 1 tahun
- Setelah 1 tahun perlu tes Mantoux dulu
- Konsultasi dengan dokter

## Pencegahan Penularan pada Anak

### Jika Anak Terkena TBC:
- ✅ Isolasi sementara (2-3 minggu pertama)
- ✅ Gunakan masker saat kontak dengan orang lain
- ✅ Ventilasi ruangan yang baik
- ✅ Kontak erat perlu diperiksa
- ✅ Vaksinasi BCG untuk bayi di rumah

### Melindungi Anak dari TBC:
- ✅ Vaksinasi BCG segera setelah lahir
- ✅ Hindari kontak dengan penderita TBC aktif
- ✅ Pola hidup sehat dan gizi baik
- ✅ Ventilasi rumah yang baik
- ✅ Edukasi keluarga tentang TBC

## Kapan Harus Ke Dokter?

**Segera ke dokter jika anak:**
- 🚨 Demam >2 minggu tanpa sebab jelas
- 🚨 Batuk >3 minggu
- 🚨 Penurunan berat badan atau tidak naik berat badan
- 🚨 Kontak erat dengan penderita TBC
- 🚨 Gejala TBC meningitis (sakit kepala, muntah, kejang)
- 🚨 Pembengkakan kelenjar yang tidak sembuh
- 🚨 Lesu dan tidak aktif seperti biasanya

## Kesimpulan

TBC pada anak adalah kondisi serius yang memerlukan:
- ✅ Diagnosis yang tepat dan cepat
- ✅ Pengobatan yang sesuai dan teratur
- ✅ Monitoring ketat
- ✅ Dukungan keluarga
- ✅ Nutrisi yang baik

**Ingat**: TBC pada anak dapat disembuhkan dengan pengobatan yang tepat. Deteksi dini sangat penting untuk hasil yang baik!`,
      tags: ["tentang_tbc", "anak", "diagnosis", "pengobatan", "gejala"],
      sumberReferensi: "WHO TB Guidelines for Children, IDAI",
    },
    {
      judul: "Panduan Lengkap Interaksi Obat TBC dengan Makanan",
      kategori: "pengobatan",
      ringkasan:
        "Panduan lengkap tentang interaksi obat TBC dengan makanan, minuman, dan suplemen. Ketahui apa yang boleh dan tidak boleh dikonsumsi saat pengobatan TBC.",
      konten: `# Panduan Lengkap Interaksi Obat TBC dengan Makanan

Memahami interaksi obat TBC dengan makanan sangat penting untuk efektivitas pengobatan dan keamanan. Beberapa makanan dan minuman dapat mempengaruhi penyerapan dan kerja obat TBC.

## Interaksi Obat TBC dengan Makanan

### Rifampisin

**Cara Minum:**
- ✅ **Boleh diminum sebelum atau sesudah makan**
- ✅ Lebih baik dengan perut kosong (1 jam sebelum makan atau 2 jam sesudah makan) untuk penyerapan optimal
- ⚠️ Jika menyebabkan mual, boleh diminum setelah makan ringan

**Interaksi dengan Makanan:**
- ❌ **Hindari alkohol** - meningkatkan risiko kerusakan hati
- ⚠️ Makanan berlemak tinggi dapat sedikit menurunkan penyerapan

**Interaksi dengan Minuman:**
- ❌ **Jangan minum dengan susu** - dapat mengurangi penyerapan
- ✅ Lebih baik dengan air putih

### Isoniazid

**Cara Minum:**
- ✅ **Lebih baik dengan perut kosong** (1 jam sebelum makan atau 2 jam sesudah makan)
- ⚠️ Jika menyebabkan mual, boleh diminum setelah makan ringan

**Interaksi dengan Makanan:**
- ❌ **Hindari makanan tinggi tiramin** (dapat menyebabkan reaksi seperti sakit kepala, tekanan darah tinggi):
  - Keju tua
  - Daging asap/daging olahan
  - Ikan asin
  - Wine/anggur
  - Kacang fava
- ❌ **Hindari alkohol** - meningkatkan risiko kerusakan hati

**Interaksi dengan Suplemen:**
- ✅ **Perlu suplemen Vitamin B6** (Pyridoxine) - untuk mencegah neuropati
- ✅ Dosis biasanya 25-50mg per hari
- ✅ Konsultasi dengan dokter

### Pirazinamid

**Cara Minum:**
- ✅ **Boleh diminum dengan atau tanpa makanan**
- ✅ Lebih baik setelah makan untuk mengurangi mual

**Interaksi dengan Makanan:**
- ⚠️ Makanan berlemak tinggi dapat meningkatkan penyerapan
- ❌ **Hindari alkohol** - meningkatkan risiko kerusakan hati

**Efek Samping yang Perlu Diwaspadai:**
- ⚠️ Peningkatan kadar asam urat (dapat menyebabkan nyeri sendi)
- ✅ Minum banyak air putih
- ✅ Hindari makanan tinggi purin jika nyeri sendi terjadi

### Etambutol

**Cara Minum:**
- ✅ **Boleh diminum dengan atau tanpa makanan**
- ✅ Lebih baik dengan makanan untuk mengurangi gangguan lambung

**Interaksi dengan Makanan:**
- ⚠️ **Aluminum antasida** dapat mengurangi penyerapan - minum dengan jarak 2 jam

**Efek Samping Penting:**
- ⚠️ Dapat menyebabkan masalah penglihatan (buta warna, penglihatan kabur)
- ✅ Segera ke dokter jika terjadi masalah penglihatan
- ✅ Pemeriksaan mata rutin dianjurkan

## Interaksi dengan Minuman

### Alkohol

**PENTING - JANGAN MINUM ALKOHOL:**
- ❌ **Meningkatkan risiko kerusakan hati** - semua obat TBC dapat menyebabkan kerusakan hati
- ❌ Alkohol juga dapat merusak hati
- ❌ Kombinasi keduanya sangat berbahaya
- ❌ Dapat menyebabkan hepatitis yang fatal

### Susu

**Rifampisin:**
- ❌ **Jangan minum dengan susu** - mengurangi penyerapan obat
- ✅ Beri jarak minimal 2 jam antara minum susu dan obat

**Obat TBC Lainnya:**
- ⚠️ Lebih baik tidak diminum bersamaan dengan susu
- ✅ Beri jarak minimal 1 jam

### Teh dan Kopi

- ⚠️ **Kafein dapat berinteraksi** dengan beberapa obat
- ⚠️ Dapat meningkatkan efek samping (sakit kepala, jantung berdebar)
- ✅ Minum secukupnya, jangan berlebihan
- ✅ Lebih baik dengan air putih

### Jus Buah

- ⚠️ Beberapa jus dapat mempengaruhi penyerapan obat
- ✅ Lebih baik minum air putih saat minum obat
- ✅ Jus boleh diminum dengan jarak 1-2 jam

## Interaksi dengan Suplemen

### Vitamin dan Mineral

**Vitamin B6 (Pyridoxine):**
- ✅ **WAJIB** untuk pasien yang minum Isoniazid
- ✅ Mencegah neuropati perifer (kesemutan, mati rasa)
- ✅ Dosis: 25-50mg per hari
- ✅ Konsultasi dengan dokter

**Vitamin D:**
- ✅ Boleh dikonsumsi jika diperlukan
- ✅ Bermanfaat untuk kesehatan tulang dan sistem imun
- ✅ Konsultasi dengan dokter untuk dosis

**Zinc:**
- ✅ Boleh dikonsumsi jika diperlukan
- ✅ Dapat membantu sistem imun
- ⚠️ Jangan berlebihan - konsultasi dengan dokter

**Multivitamin:**
- ✅ Boleh dikonsumsi jika diperlukan
- ⚠️ Pastikan tidak mengandung zat yang berinteraksi
- ✅ Konsultasi dengan dokter

**Suplemen Herbal:**
- ⚠️ **Hati-hati** - banyak suplemen herbal yang dapat berinteraksi dengan obat
- ✅ Konsultasi dengan dokter sebelum mengonsumsi
- ❌ Jangan mengonsumsi tanpa izin dokter

## Interaksi dengan Obat Lain

### Antasida
- ⚠️ Dapat mengurangi penyerapan beberapa obat TBC
- ✅ Beri jarak minimal 2 jam antara minum antasida dan obat TBC

### Antikoagulan (Pengencer Darah)
- ⚠️ Rifampisin dapat mengurangi efektivitas obat pengencer darah
- ✅ Konsultasi dengan dokter jika minum obat pengencer darah

### Kontrasepsi Hormonal
- ⚠️ Rifampisin dapat mengurangi efektivitas pil KB
- ✅ Gunakan metode kontrasepsi tambahan
- ✅ Konsultasi dengan dokter

### Obat Diabetes
- ⚠️ Beberapa obat TBC dapat mempengaruhi gula darah
- ✅ Pantau gula darah lebih ketat
- ✅ Konsultasi dengan dokter

### Obat untuk HIV
- ⚠️ Interaksi kompleks antara obat TBC dan ARV
- ✅ Harus di bawah pengawasan dokter spesialis
- ✅ Perlu penyesuaian dosis

## Tips Praktis

### 1. Waktu Minum Obat

**Rekomendasi:**
- ✅ Minum di **waktu yang sama setiap hari**
- ✅ Lebih baik **pagi hari** setelah bangun tidur (dengan perut kosong)
- ✅ Atau **malam hari** sebelum tidur (2 jam setelah makan malam)

**Jika Menyebabkan Mual:**
- ✅ Minum setelah makan ringan (roti, biskuit)
- ✅ Jangan makan makanan berat sebelum minum obat

### 2. Cara Minum Obat

**Yang Benar:**
- ✅ Minum dengan **air putih** (1 gelas penuh)
- ✅ Jangan dihancurkan kecuali diinstruksikan dokter
- ✅ Telan utuh (kecuali jika sulit, konsultasi dokter)

**Yang Salah:**
- ❌ Minum dengan susu, teh, atau kopi
- ❌ Menghancurkan tablet tanpa konsultasi dokter
- ❌ Minum dengan sedikit air

### 3. Jeda dengan Makanan/Minuman Lain

**Rekomendasi:**
- ✅ **Susu**: Beri jarak minimal 2 jam
- ✅ **Teh/Kopi**: Beri jarak minimal 1 jam
- ✅ **Antasida**: Beri jarak minimal 2 jam
- ✅ **Suplemen**: Beri jarak minimal 1 jam

### 4. Catat dan Konsultasi

- ✅ Catat semua obat dan suplemen yang dikonsumsi
- ✅ Konsultasi dengan dokter sebelum minum obat/suplemen baru
- ✅ Laporkan efek samping yang dialami
- ✅ Jangan minum obat/suplemen tanpa resep dokter

## Contoh Jadwal Minum Obat

### Jadwal Pagi (Setelah Bangun Tidur):
1. Bangun tidur
2. Minum obat TBC dengan air putih (dengan perut kosong)
3. Tunggu 1 jam
4. Sarapan
5. Minum suplemen Vitamin B6 setelah sarapan (jika diresepkan)

### Jadwal Malam (Sebelum Tidur):
1. Makan malam (selesai 2 jam sebelum tidur)
2. Minum obat TBC dengan air putih
3. Tidur

## Kesimpulan

Interaksi obat TBC dengan makanan dan minuman perlu diperhatikan untuk:
- ✅ **Efektivitas pengobatan** yang optimal
- ✅ **Keamanan** - menghindari efek samping yang berbahaya
- ✅ **Kesembuhan** yang lebih cepat

**Penting:**
- ✅ Minum obat dengan air putih
- ✅ Hindari alkohol
- ✅ Konsultasi dengan dokter untuk suplemen
- ✅ Catat dan laporkan efek samping
- ✅ Jangan minum obat/suplemen baru tanpa konsultasi dokter

**Ingat**: Konsultasi selalu dengan dokter atau apoteker jika ada pertanyaan tentang interaksi obat!`,
      tags: ["pengobatan", "interaksi_obat", "makanan", "nutrisi", "tips"],
      sumberReferensi: "WHO TB Drug Interaction Guidelines, Pharmacopeia",
    },
    {
      judul: "Pentingnya Pemeriksaan Kontrol Rutin selama Pengobatan TBC",
      kategori: "pengobatan",
      ringkasan:
        "Mengapa pemeriksaan kontrol rutin sangat penting selama pengobatan TBC dan apa saja yang diperiksa. Panduan lengkap untuk pasien dan keluarga.",
      konten: `# Pentingnya Pemeriksaan Kontrol Rutin selama Pengobatan TBC

Pemeriksaan kontrol rutin adalah bagian penting dari pengobatan TBC. Kontrol rutin membantu memastikan pengobatan berjalan dengan baik dan mendeteksi masalah sejak dini.

## Mengapa Kontrol Rutin Penting?

### 1. Memantau Respons Pengobatan
- ✅ Menilai apakah gejala membaik
- ✅ Menilai apakah pengobatan efektif
- ✅ Mendeteksi jika pengobatan tidak efektif sejak dini

### 2. Memantau Efek Samping
- ✅ Mendeteksi efek samping obat
- ✅ Mencegah komplikasi serius
- ✅ Menyesuaikan dosis jika diperlukan

### 3. Memastikan Kepatuhan
- ✅ Menilai apakah pasien minum obat teratur
- ✅ Memberikan motivasi dan dukungan
- ✅ Mengatasi hambatan dalam pengobatan

### 4. Mencegah Resistensi Obat
- ✅ Memastikan pengobatan efektif
- ✅ Mendeteksi resistensi sejak dini
- ✅ Mencegah perkembangan MDR-TB

### 5. Evaluasi Kesembuhan
- ✅ Menentukan kapan pasien sembuh
- ✅ Memutuskan kapan pengobatan selesai
- ✅ Memberikan pedoman pasca pengobatan

## Jadwal Kontrol Rutin

### Fase Intensif (Bulan 1-2):

**Kontrol Mingguan (2 Minggu Pertama):**
- ✅ Kontrol setelah 2 minggu pengobatan
- ✅ Evaluasi efek samping
- ✅ Motivasi dan dukungan
- ✅ Konseling tentang pengobatan

**Kontrol Bulanan:**
- ✅ Kontrol setiap bulan
- ✅ Tes dahak bulanan
- ✅ Evaluasi respons pengobatan
- ✅ Pemeriksaan fisik

### Fase Lanjutan (Bulan 3-6/9):

**Kontrol Bulanan:**
- ✅ Kontrol setiap bulan
- ✅ Tes dahak setiap 2 bulan
- ✅ Evaluasi respons pengobatan
- ✅ Motivasi dan dukungan

### Setelah Selesai Pengobatan:

**Kontrol Pasca Pengobatan:**
- ✅ Kontrol 1 bulan setelah selesai pengobatan
- ✅ Kontrol 3 bulan setelah selesai
- ✅ Kontrol 6 bulan setelah selesai
- ✅ Kontrol 12 bulan setelah selesai

## Pemeriksaan yang Dilakukan

### 1. Anamnesis (Wawancara)

**Pertanyaan tentang Gejala:**
- ✅ Apakah batuk sudah berkurang?
- ✅ Apakah demam sudah hilang?
- ✅ Apakah nafsu makan sudah membaik?
- ✅ Apakah berat badan sudah naik?
- ✅ Apakah masih ada gejala lain?

**Pertanyaan tentang Pengobatan:**
- ✅ Apakah minum obat teratur?
- ✅ Apakah ada dosis yang terlewat?
- ✅ Apakah ada kesulitan minum obat?
- ✅ Bagaimana cara mengingat minum obat?

**Pertanyaan tentang Efek Samping:**
- ✅ Apakah ada efek samping yang dialami?
- ✅ Apakah efek samping mengganggu?
- ✅ Bagaimana mengatasi efek samping?

### 2. Pemeriksaan Fisik

**Yang Diperiksa:**
- ✅ **Berat badan** - harus naik atau stabil
- ✅ **Tinggi badan** (untuk anak)
- ✅ **Tekanan darah** - normal
- ✅ **Detak jantung** - normal
- ✅ **Suhu tubuh** - normal (tidak demam)
- ✅ **Pernapasan** - normal, tidak sesak
- ✅ **Paru-paru** - mendengarkan suara napas
- ✅ **Kelenjar getah bening** - memeriksa pembengkakan
- ✅ **Mata** (untuk pasien yang minum Etambutol) - memeriksa penglihatan

### 3. Tes Dahak

**Frekuensi:**
- ✅ **Bulanan** selama fase intensif
- ✅ **Setiap 2 bulan** selama fase lanjutan
- ✅ **Setelah selesai pengobatan** (1, 3, 6, 12 bulan)

**Tujuan:**
- ✅ Menilai apakah masih ada bakteri TBC
- ✅ Menilai efektivitas pengobatan
- ✅ Menentukan apakah sudah sembuh
- ✅ Mendeteksi resistensi obat

**Hasil:**
- ✅ **Negatif**: Tidak ada bakteri - pengobatan efektif
- ⚠️ **Positif**: Masih ada bakteri - perlu evaluasi lebih lanjut

### 4. Foto Rontgen Dada

**Frekuensi:**
- ✅ **Awal pengobatan** - baseline
- ✅ **Setelah 2 bulan** - evaluasi awal
- ✅ **Setelah 6 bulan** - evaluasi tengah
- ✅ **Setelah selesai pengobatan** - evaluasi akhir
- ✅ **Jika ada masalah** - sesuai kebutuhan

**Tujuan:**
- ✅ Menilai perbaikan paru-paru
- ✅ Mencari kelainan baru
- ✅ Evaluasi kesembuhan

### 5. Pemeriksaan Laboratorium

**Pemeriksaan Darah:**
- ✅ **Hitung darah lengkap** - memantau kondisi umum
- ✅ **Fungsi hati** - penting karena obat TBC dapat mempengaruhi hati
- ✅ **Fungsi ginjal** - memantau kesehatan ginjal
- ✅ **Gula darah** (jika diabetes)

**Frekuensi:**
- ✅ **Awal pengobatan** - baseline
- ✅ **Setelah 1 bulan** - skrining efek samping
- ✅ **Jika ada gejala** - sesuai kebutuhan
- ✅ **Setelah selesai pengobatan** - evaluasi akhir

### 6. Pemeriksaan Khusus

**Untuk Pasien dengan Efek Samping:**
- ✅ **Pemeriksaan mata** - jika minum Etambutol dan ada keluhan penglihatan
- ✅ **Pemeriksaan pendengaran** - jika minum Streptomisin
- ✅ **Pemeriksaan hati** - jika ada gejala hepatitis

**Untuk Pasien dengan Komplikasi:**
- ✅ **CT Scan** - jika diperlukan evaluasi lebih detail
- ✅ **Bronkoskopi** - jika diperlukan evaluasi saluran napas
- ✅ **Biopsi** - jika diperlukan konfirmasi

## Persiapan untuk Kontrol

### Sebelum Kontrol:

**Siapkan:**
- ✅ **Catatan pengobatan** - catat dosis yang diminum setiap hari
- ✅ **Catatan gejala** - catat gejala yang dialami
- ✅ **Catatan efek samping** - catat efek samping yang dialami
- ✅ **Pertanyaan** - tulis pertanyaan yang ingin ditanyakan
- ✅ **Obat yang masih tersisa** - bawa untuk evaluasi
- ✅ **Hasil pemeriksaan sebelumnya** - bawa untuk perbandingan

**Untuk Tes Dahak:**
- ✅ Bawa wadah untuk dahak (disediakan di fasilitas kesehatan)
- ✅ Dahak diambil pagi hari (sebelum sarapan, sebelum sikat gigi)
- ✅ Kumpulkan dahak dari dalam paru-paru (bukan air liur)

### Saat Kontrol:

- ✅ **Datang tepat waktu**
- ✅ **Bawa semua dokumen**
- ✅ **Sampaikan semua keluhan** dengan jujur
- ✅ **Tanyakan jika ada yang tidak jelas**
- ✅ **Catat instruksi dokter**

## Indikator Pengobatan Berhasil

### Gejala yang Membaik:
- ✅ Batuk berkurang atau hilang
- ✅ Demam hilang
- ✅ Nafsu makan membaik
- ✅ Berat badan naik
- ✅ Kekuatan fisik membaik
- ✅ Tidak ada gejala baru

### Hasil Pemeriksaan yang Baik:
- ✅ **Tes dahak negatif** (tidak ada bakteri)
- ✅ **Foto rontgen membaik** (kerusakan paru-paru berkurang)
- ✅ **Berat badan naik** atau stabil
- ✅ **Pemeriksaan fisik normal**
- ✅ **Pemeriksaan laboratorium normal**

### Kepatuhan yang Baik:
- ✅ Minum obat setiap hari tanpa terlewat
- ✅ Datang kontrol rutin
- ✅ Mengikuti instruksi dokter

## Tanda Pengobatan Tidak Berhasil

### Gejala yang Memburuk:
- ⚠️ Batuk masih ada atau memburuk setelah 2 bulan
- ⚠️ Demam masih ada
- ⚠️ Berat badan tidak naik atau turun
- ⚠️ Gejala baru muncul

### Hasil Pemeriksaan yang Tidak Baik:
- ⚠️ **Tes dahak masih positif** setelah 2 bulan
- ⚠️ **Foto rontgen tidak membaik** atau memburuk
- ⚠️ **Efek samping berat** yang tidak bisa diatasi

**Jika terjadi, dokter akan:**
- ⚠️ Mengevaluasi kepatuhan pasien
- ⚠️ Menilai kemungkinan resistensi obat
- ⚠️ Mempertimbangkan perubahan pengobatan
- ⚠️ Melakukan tes tambahan

## Tips untuk Kontrol yang Optimal

### 1. Catat Semua yang Penting
- ✅ Buat catatan harian pengobatan
- ✅ Catat gejala yang dialami
- ✅ Catat efek samping
- ✅ Catat pertanyaan untuk dokter

### 2. Jujur dengan Dokter
- ✅ Laporkan jika ada dosis yang terlewat
- ✅ Laporkan semua efek samping
- ✅ Sampaikan kesulitan dalam pengobatan
- ✅ Jangan menyembunyikan masalah

### 3. Aktif Bertanya
- ✅ Tanyakan jika ada yang tidak jelas
- ✅ Tanyakan tentang efek samping
- ✅ Tanyakan tentang perbaikan kondisi
- ✅ Tanyakan tentang hal yang perlu dilakukan

### 4. Ikuti Instruksi Dokter
- ✅ Minum obat sesuai resep
- ✅ Ikuti jadwal kontrol
- ✅ Ikuti diet dan gaya hidup yang disarankan
- ✅ Lakukan pemeriksaan yang diminta

### 5. Jangan Putus Kontrol
- ✅ Kontrol rutin sangat penting
- ✅ Jangan skip kontrol meski merasa sudah sehat
- ✅ Jangan berhenti minum obat sendiri
- ✅ Selesaikan pengobatan lengkap

## Kesimpulan

Pemeriksaan kontrol rutin adalah kunci keberhasilan pengobatan TBC. Dengan kontrol rutin:
- ✅ Pengobatan dapat dipantau dengan baik
- ✅ Masalah dapat dideteksi sejak dini
- ✅ Efek samping dapat ditangani dengan cepat
- ✅ Kesembuhan dapat tercapai
- ✅ Resistensi obat dapat dicegah

**Ingat**: Kontrol rutin adalah investasi untuk kesembuhan. Jangan lewatkan kontrol meskipun merasa sudah sehat!`,
      tags: ["pengobatan", "kontrol", "pemeriksaan", "monitoring", "kesehatan"],
      sumberReferensi: "WHO TB Treatment Monitoring Guidelines, Kemenkes RI",
    },
  ];
};

// Auto-seed function (called on server start)
exports.seedEdukasiData = async () => {
  try {
    const existingCount = await Edukasi.countDocuments();

    if (existingCount > 0) {
      console.log(
        `✅ Edukasi content already exists (${existingCount} articles)`
      );
      return {
        success: true,
        count: existingCount,
        message: "Content already exists",
      };
    }

    const initialContent = getInitialContent();
    await Edukasi.insertMany(initialContent);

    console.log(
      `✅ Successfully seeded ${initialContent.length} edukasi articles`
    );
    return {
      success: true,
      count: initialContent.length,
      message: "Content seeded successfully",
    };
  } catch (error) {
    console.error("❌ Error auto-seeding edukasi:", error);
    return { success: false, error: error.message };
  }
};

// Seed initial educational content (deprecated - kept for backward compatibility but should not be used)
exports.seedEdukasi = async (req, res) => {
  try {
    const initialContent = getInitialContent();
    const existingCount = await Edukasi.countDocuments();
    const forceSeed = req.query.force === "true" || req.body.force === true;

    if (existingCount > 0 && !forceSeed) {
      return res.status(400).json({
        success: false,
        message:
          "Konten edukasi sudah ada. Konten otomatis tersedia saat server start.",
        existingCount: existingCount,
      });
    }

    // If force seed, delete existing content first
    if (forceSeed && existingCount > 0) {
      await Edukasi.deleteMany({});
      console.log(`Deleted ${existingCount} existing edukasi documents`);
    }

    await Edukasi.insertMany(initialContent);

    res.status(201).json({
      success: true,
      message: "Konten edukasi berhasil ditambahkan",
      count: initialContent.length,
    });
  } catch (error) {
    console.error("Error seeding edukasi:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menambahkan konten edukasi",
      error: error.message,
    });
  }
};
