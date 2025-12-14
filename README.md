# UTS POPL KLP 8

Anggota Kelompok:

1. Muhammad Nazlul Ramadhyan (2308107010036)
2. Naufal Farrel Syafilan (2308107010058)
3. Muhammad Zikri Yusra (1808107010038)

Link Docker Repository:
https://hub.docker.com/repository/docker/naufalfarelsyafilan/tabbycare/general

## 🚀 Quick Start

### Menjalankan Aplikasi

1. **Backend** (Terminal 1):
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Frontend** (Terminal 2):
   ```bash
   npm install
   npm run dev
   ```

3. **Buka browser**: http://localhost:5173

### Logging (Optional)

Jalankan logging stack:
```bash
docker-compose up -d
```

Akses Grafana: http://localhost:3000 (admin/admin)

Lihat dokumentasi: [LOGGING_SETUP.md](./LOGGING_SETUP.md)