# Setup Cloudinary untuk Upload File di Vercel

## 🎯 Masalah

Vercel menggunakan **read-only filesystem**, jadi tidak bisa menyimpan file upload ke folder lokal seperti `/uploads`. Semua endpoint yang mencoba upload file akan error 500.

## ✅ Solusi: Cloudinary

Kita sudah mengintegrasikan **Cloudinary** untuk menyimpan file upload. File akan disimpan di cloud dan mendapatkan URL langsung.

## 📋 Langkah Setup

### 1. Daftar Cloudinary (Gratis)

1. Buka: https://cloudinary.com/users/register_free
2. Daftar dengan email
3. Setelah login, buka **Dashboard**
4. Copy **Cloud Name**, **API Key**, dan **API Secret**

### 2. Tambahkan Environment Variables di Vercel

1. Buka project di Vercel Dashboard
2. Klik **Settings** → **Environment Variables**
3. Tambahkan 3 variabel berikut:

```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

4. Klik **Save**
5. **Redeploy** aplikasi

### 3. Untuk Development Lokal

Buat file `backend/.env` dan tambahkan:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 🔧 Cara Kerja

### Sebelum (Error di Vercel):
```javascript
// ❌ Tidak bisa di Vercel
fs.mkdirSync("uploads/obat");
fs.writeFileSync("uploads/obat/image.jpg", buffer);
```

### Sesudah (Bekerja di Vercel):
```javascript
// ✅ Bekerja di Vercel
const result = await uploadToCloudinary(buffer, 'obat');
// result.secure_url = "https://res.cloudinary.com/..."
```

## 📦 Dependencies

Sudah ditambahkan di `backend/package.json`:
- `cloudinary` - SDK untuk Cloudinary
- `multer-storage-cloudinary` - Storage adapter untuk Multer

## 🚀 Fitur

- ✅ Upload otomatis ke Cloudinary jika environment variables ada
- ✅ Fallback ke local storage jika Cloudinary tidak dikonfigurasi (untuk development)
- ✅ Auto-delete file lama saat update/delete
- ✅ Image optimization (auto quality, max 1000x1000)
- ✅ Support format: jpg, jpeg, png, gif, webp

## 📝 File yang Diupdate

1. `backend/utils/cloudinary.js` - Utility untuk upload/delete
2. `backend/middleware/upload.js` - Middleware untuk handle upload
3. `backend/controllers/obatController.js` - Upload gambar obat
4. `backend/controllers/progresController.js` - Upload foto progres

## 🧪 Testing

Setelah setup:

1. **Deploy ke Vercel** dengan environment variables
2. **Test upload** di endpoint:
   - `POST /api/obat` (dengan form-data `gambarObat`)
   - `POST /api/progres` (dengan form-data `fotoProgres`)
3. **Cek response** - harus ada URL Cloudinary di field `gambarObat` atau `fotoProgres`

## ⚠️ Catatan

- **Free tier Cloudinary**: 25GB storage, 25GB bandwidth/month
- File disimpan di folder `tabbycare/obat` dan `tabbycare/progres`
- URL yang dikembalikan adalah `secure_url` (HTTPS)
- File lama otomatis dihapus saat update/delete

## 🔗 Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Multer Cloudinary Storage](https://www.npmjs.com/package/multer-storage-cloudinary)

