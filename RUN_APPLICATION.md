# Panduan Menjalankan Aplikasi TabbyCare

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (kembali ke root)
cd ..
npm install
```

### 2. Setup Environment (Backend)

Buat file `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tabbycare
NODE_ENV=development
JWT_SECRET=your-secret-key
```

### 3. Jalankan Aplikasi

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

**Buka browser:** http://localhost:5173

## 📊 Logging (Optional)

Jalankan logging stack:
```bash
docker-compose up -d
```

Akses Grafana: http://localhost:3000 (admin/admin)

## Verifikasi

### 1. Backend API
- Test endpoint: http://localhost:5000
- Harus menampilkan JSON dengan informasi API

### 2. Frontend
- Buka: http://localhost:5173
- Aplikasi harus load tanpa error

### 3. Logs (jika logging stack running)
- Buka Grafana: http://localhost:3000
- Login: admin/admin
- Explore → Query: `{job="backend"}`
- Harus melihat logs dari backend

## Troubleshooting

### Backend tidak bisa connect ke MongoDB

**Error**: `MongoDB Connection Error`

**Solusi**:
1. Pastikan MongoDB running
2. Cek `MONGODB_URI` di file `.env`
3. Untuk MongoDB lokal, pastikan service running:
   ```bash
   # Windows
   services.msc  # Cari MongoDB service
   ```

### Port sudah digunakan

**Error**: `Port 5000 is already in use`

**Solusi**:
1. Ganti port di `.env`: `PORT=5001`
2. Atau stop aplikasi yang menggunakan port tersebut

### Frontend tidak bisa connect ke Backend

**Error**: `Network Error` atau `CORS Error`

**Solusi**:
1. Pastikan backend running di port yang benar
2. Cek file `src/services/api.js` - pastikan base URL benar
3. Backend sudah mengaktifkan CORS, jadi seharusnya tidak ada masalah

### Logs tidak muncul di Grafana

**Solusi**:
1. Pastikan backend sudah running dan menghasilkan logs
2. Cek file `backend/logs/app.log` ada dan berisi data
3. Restart Promtail: `docker-compose restart promtail`
4. Di Grafana, pastikan time range mencakup waktu sekarang

## Scripts yang Tersedia

### Backend
- `npm start` - Menjalankan production mode
- `npm run dev` - Menjalankan development mode dengan auto-reload (nodemon)

### Frontend
- `npm run dev` - Development server (Vite)
- `npm run build` - Build untuk production
- `npm run preview` - Preview production build

## Struktur Port

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Grafana**: http://localhost:3000 (jika logging stack running)
- **Loki**: http://localhost:3100 (jika logging stack running)

## Tips

1. **Gunakan terminal terpisah** untuk backend dan frontend
2. **Jangan tutup terminal** saat aplikasi running
3. **Untuk development**, gunakan `npm run dev` untuk auto-reload
4. **Cek logs** di `backend/logs/app.log` untuk debugging
5. **Gunakan Grafana** untuk monitoring logs secara real-time

